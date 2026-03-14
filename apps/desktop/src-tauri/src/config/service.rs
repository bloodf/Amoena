use std::{
    collections::BTreeMap,
    fs,
    path::Path,
    sync::Arc,
};

use anyhow::{Context, Result};
use serde::{de::DeserializeOwned, Serialize};
use serde_json::Value;

use crate::{
    config::{
        ApiKeyAuthConfig, GlobalConfig, PerTuiConfig, ProjectConfig, ProviderAuthConfig,
        ProviderAuthType, ResolvedConfig, ResolvedProviderConfig, RuntimePaths,
        RuntimeResolutionRequest, SecretStore,
    },
    persistence::{
        repositories::settings::SettingsRepository, Database, SettingRecord, SettingScope, TuiType,
    },
};

pub struct ConfigService {
    db: Arc<Database>,
    paths: RuntimePaths,
    settings: SettingsRepository,
    secret_store: Arc<dyn SecretStore>,
}

impl ConfigService {
    pub fn new(
        paths: RuntimePaths,
        db: Arc<Database>,
        secret_store: Arc<dyn SecretStore>,
    ) -> Self {
        let settings = SettingsRepository::new(db.clone());

        Self {
            db,
            paths,
            settings,
            secret_store,
        }
    }

    pub fn put_setting<T: Serialize>(
        &self,
        key: &str,
        scope: SettingScope,
        scope_ref: Option<String>,
        value: &T,
    ) -> Result<()> {
        self.settings.upsert(&SettingRecord {
            key: key.to_string(),
            value: serde_json::to_value(value).context("failed to serialize setting value")?,
            scope,
            scope_ref,
            updated_at: crate::persistence::repositories::clock::utc_now(),
        })
    }

    pub fn get_setting<T: DeserializeOwned>(
        &self,
        key: &str,
        scope: SettingScope,
        scope_ref: Option<&str>,
    ) -> Result<Option<T>> {
        self.settings
            .get(key, scope, scope_ref)?
            .map(|record| serde_json::from_value(record.value).context("failed to deserialize setting value"))
            .transpose()
    }

    pub fn resolve(&self, request: RuntimeResolutionRequest) -> Result<ResolvedConfig> {
        let mut global = self.load_global_config()?;
        let per_tui = if let Some(tui) = request.tui.as_ref() {
            self.load_per_tui_config(tui)?
        } else {
            None
        };
        let project = if let Some(working_dir) = request.working_dir.as_ref() {
            self.load_project_config(working_dir)?
        } else {
            None
        };

        let settings = self.load_setting_overrides(
            request.tui.as_ref(),
            request.session_id.as_deref(),
        )?;

        apply_global_setting_overrides(&mut global, &settings);

        if let Some(enabled) = request.runtime_overrides.remote_access_enabled {
            global.remote_access.enabled = enabled;
        }

        if let Some(relay_endpoint) = &request.runtime_overrides.relay_endpoint {
            global.remote_access.relay_endpoint = relay_endpoint.clone();
        }

        let mut providers = project
            .as_ref()
            .map(|config| {
                config
                    .providers
                    .iter()
                    .map(|(provider_id, override_config)| {
                        (
                            provider_id.clone(),
                            ResolvedProviderConfig {
                                enabled: override_config.enabled,
                                base_url: override_config.base_url.clone(),
                                default_model: override_config.default_model.clone(),
                                env: override_config.env.clone(),
                            },
                        )
                    })
                    .collect::<BTreeMap<_, _>>()
            })
            .unwrap_or_default();

        for (provider_id, model_id) in &request.runtime_overrides.provider_default_models {
            providers
                .entry(provider_id.clone())
                .or_default()
                .default_model = Some(model_id.clone());
        }

        let transcript_format = settings
            .get("session.transcript_format")
            .and_then(|value| value.as_str())
            .unwrap_or("jsonl")
            .to_string();
        let logging_level = settings
            .get("logging.level")
            .and_then(|value| value.as_str())
            .unwrap_or("info")
            .to_string();

        Ok(ResolvedConfig {
            global,
            per_tui,
            project,
            settings,
            providers,
            logging_level,
            transcript_format,
        })
    }

    pub fn store_provider_api_key(&self, provider_id: &str, api_key: &str) -> Result<()> {
        let keychain_service = format!("lunaria.provider.{provider_id}");
        self.secret_store
            .set_secret(&keychain_service, "api_key", api_key)?;

        let config = ProviderAuthConfig {
            provider_id: provider_id.to_string(),
            auth_type: ProviderAuthType::Apikey,
            apikey: Some(ApiKeyAuthConfig {
                keychain_service,
                env_var: None,
                header_name: "Authorization".to_string(),
                header_prefix: "Bearer".to_string(),
            }),
            base_url: None,
            health_check_url: None,
        };

        write_json(
            &self.paths.provider_auth_config_path(provider_id),
            &config,
        )
    }

    pub fn read_provider_api_key(&self, provider_id: &str) -> Result<Option<String>> {
        let Some(config) = self.load_provider_auth_config(provider_id)? else {
            return Ok(None);
        };
        let Some(api_key) = config.apikey else {
            return Ok(None);
        };

        self.secret_store
            .get_secret(&api_key.keychain_service, "api_key")
    }

    pub fn load_provider_auth_config(&self, provider_id: &str) -> Result<Option<ProviderAuthConfig>> {
        read_json_optional(&self.paths.provider_auth_config_path(provider_id))
    }

    fn load_global_config(&self) -> Result<GlobalConfig> {
        Ok(read_json_optional::<GlobalConfig>(&self.paths.global_config_path)?
            .unwrap_or_default())
    }

    fn load_per_tui_config(&self, tui: &TuiType) -> Result<Option<PerTuiConfig>> {
        read_json_optional(&self.paths.tui_config_path(tui.as_str()))
    }

    fn load_project_config(&self, working_dir: &Path) -> Result<Option<ProjectConfig>> {
        read_json_optional(&self.paths.project_config_path(working_dir))
    }

    fn load_setting_overrides(
        &self,
        tui: Option<&TuiType>,
        session_id: Option<&str>,
    ) -> Result<BTreeMap<String, Value>> {
        let mut resolved = BTreeMap::new();

        resolved.extend(self.load_settings_for_scope(SettingScope::Global, None)?);

        if let Some(tui) = tui {
            resolved.extend(self.load_settings_for_scope(
                SettingScope::PerTui,
                Some(tui.as_str()),
            )?);
        }

        if let Some(session_id) = session_id {
            resolved.extend(self.load_settings_for_scope(
                SettingScope::PerSession,
                Some(session_id),
            )?);
        }

        Ok(resolved)
    }

    fn load_settings_for_scope(
        &self,
        scope: SettingScope,
        scope_ref: Option<&str>,
    ) -> Result<BTreeMap<String, Value>> {
        self.db.read(|connection| {
            let mut query = String::from(
                "SELECT key, value FROM settings WHERE scope = ?1 AND ((scope_ref IS NULL AND ?2 IS NULL) OR scope_ref = ?2)",
            );
            query.push_str(" ORDER BY key ASC");

            let mut statement = connection
                .prepare(&query)
                .context("failed to prepare scoped settings query")?;

            let rows = statement
                .query_map(
                    rusqlite::params![scope.as_str(), scope_ref],
                    |row| Ok((row.get::<_, String>(0)?, row.get::<_, String>(1)?)),
                )
                .context("failed to query scoped settings")?
                .collect::<rusqlite::Result<Vec<_>>>()
                .context("failed to collect scoped settings")?;

            let mut settings = BTreeMap::new();
            for (key, value) in rows {
                let decoded_value = serde_json::from_str(&value)
                    .with_context(|| format!("failed to decode setting value for {key}"))?;
                settings.insert(
                    key,
                    decoded_value,
                );
            }

            Ok(settings)
        })
    }
}

fn apply_global_setting_overrides(global: &mut GlobalConfig, settings: &BTreeMap<String, Value>) {
    if let Some(value) = settings
        .get("remote_access.enabled")
        .and_then(|value| value.as_bool())
    {
        global.remote_access.enabled = value;
    }

    if let Some(value) = settings
        .get("remote_access.lan.enabled")
        .and_then(|value| value.as_bool())
    {
        global.remote_access.lan_enabled = value;
    }

    if let Some(value) = settings
        .get("remote_access.lan.bind_address")
        .and_then(|value| value.as_str())
    {
        global.remote_access.lan_bind_address = value.to_string();
    }

    if let Some(value) = settings
        .get("remote_access.relay.enabled")
        .and_then(|value| value.as_bool())
    {
        global.remote_access.relay_enabled = value;
    }

    if let Some(value) = settings
        .get("remote_access.relay.endpoint")
        .and_then(|value| value.as_str())
    {
        global.remote_access.relay_endpoint = value.to_string();
    }
}

fn read_json_optional<T: DeserializeOwned>(path: &Path) -> Result<Option<T>> {
    if !path.exists() {
        return Ok(None);
    }

    let contents = fs::read_to_string(path)
        .with_context(|| format!("failed to read config file {}", path.display()))?;
    let parsed = serde_json::from_str(&contents)
        .with_context(|| format!("failed to deserialize config file {}", path.display()))?;

    Ok(Some(parsed))
}

fn write_json<T: Serialize>(path: &Path, value: &T) -> Result<()> {
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent)
            .with_context(|| format!("failed to create config directory {}", parent.display()))?;
    }

    let contents = serde_json::to_string_pretty(value).context("failed to serialize config file")?;
    fs::write(path, contents).with_context(|| format!("failed to write config file {}", path.display()))
}
