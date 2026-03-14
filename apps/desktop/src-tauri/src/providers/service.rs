use std::{
    collections::BTreeMap,
    sync::Arc,
};

use anyhow::{Context, Result};
use reqwest::Url;
use serde::{Deserialize, Serialize};
use uuid::Uuid;

use crate::{
    config::ConfigService,
    persistence::{
        repositories::{clock::utc_now, providers::ProviderRepository},
        AuthStatus, CredentialType, Database, ProviderAuthType, ProviderCredentialRecord,
        ProviderModelRecord, ProviderRecord, ProviderType,
    },
    providers::local::{LlamaCppDetector, LmStudioDetector, LocalProviderDetector, OllamaDetector},
};

pub trait EnvironmentReader: Send + Sync {
    fn get_var(&self, key: &str) -> Option<String>;
}

#[derive(Default)]
pub struct StaticEnvironment {
    values: BTreeMap<String, String>,
}

impl StaticEnvironment {
    pub fn from(values: impl IntoIterator<Item = (String, String)>) -> Self {
        Self {
            values: values.into_iter().collect(),
        }
    }
}

impl EnvironmentReader for StaticEnvironment {
    fn get_var(&self, key: &str) -> Option<String> {
        self.values.get(key).cloned()
    }
}

pub struct SystemEnvironment;

impl EnvironmentReader for SystemEnvironment {
    fn get_var(&self, key: &str) -> Option<String> {
        std::env::var(key).ok()
    }
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ProviderSummary {
    pub id: String,
    pub name: String,
    pub provider_type: String,
    pub auth_type: String,
    pub auth_status: String,
    pub auth_source: Option<String>,
    pub availability_status: String,
    pub base_url: Option<String>,
    pub model_count: i64,
}

#[derive(Clone, Debug)]
pub struct DetectedProvider {
    pub id: String,
    pub name: String,
    pub npm_package: Option<String>,
    pub base_url: String,
    pub discovery_status: ProviderDiscoveryStatus,
    pub models: Vec<DetectedProviderModel>,
}

#[derive(Clone, Debug)]
pub struct DetectedProviderModel {
    pub model_id: String,
    pub display_name: String,
}

#[derive(Clone, Debug, PartialEq, Eq)]
pub enum ProviderDiscoveryStatus {
    Reachable,
    Unknown,
}

pub struct ProviderRegistryService {
    repo: ProviderRepository,
    config_service: Arc<ConfigService>,
    env: Arc<dyn EnvironmentReader>,
    detectors: Vec<Arc<dyn LocalProviderDetector>>,
}

impl ProviderRegistryService {
    pub fn new(
        db: Arc<Database>,
        config_service: Arc<ConfigService>,
        env: Arc<dyn EnvironmentReader>,
        detectors: Vec<Arc<dyn LocalProviderDetector>>,
    ) -> Self {
        let detectors = if detectors.is_empty() {
            vec![
                Arc::new(OllamaDetector::new("http://127.0.0.1:11434")) as Arc<dyn LocalProviderDetector>,
                Arc::new(LmStudioDetector::new("http://127.0.0.1:1234")) as Arc<dyn LocalProviderDetector>,
                Arc::new(LlamaCppDetector::new("http://127.0.0.1:8080")) as Arc<dyn LocalProviderDetector>,
            ]
        } else {
            detectors
        };

        Self {
            repo: ProviderRepository::new(db),
            config_service,
            env,
            detectors,
        }
    }

    pub async fn refresh_catalog(&self) -> Result<()> {
        for provider in bundled_cloud_providers() {
            let auth_state = self.resolve_auth_state(&provider.id)?;
            let now = utc_now();
            self.repo.upsert_provider(&ProviderRecord {
                id: provider.id.clone(),
                name: provider.name.clone(),
                npm_package: provider.npm_package.clone(),
                provider_type: ProviderType::Cloud,
                base_url: provider.base_url.clone(),
                auth_type: provider.auth_type.clone(),
                auth_status: auth_state.status.clone(),
                model_count: provider.models.len() as i64,
                last_refreshed_at: Some(now.clone()),
                created_at: now.clone(),
            })?;
            self.repo.replace_models(&provider.id, &provider.models)?;
        }

        for detector in &self.detectors {
            if let Some(detected) = detector.detect().await? {
                let now = utc_now();
                let models = detected
                    .models
                    .iter()
                    .map(|model| ProviderModelRecord {
                        provider_id: detected.id.clone(),
                        model_id: model.model_id.clone(),
                        display_name: model.display_name.clone(),
                        context_window: None,
                        input_cost_per_million: None,
                        output_cost_per_million: None,
                        supports_vision: false,
                        supports_tools: true,
                        supports_reasoning: false,
                        reasoning_modes: vec!["off".to_string()],
                        reasoning_effort_supported: false,
                        reasoning_effort_values: vec![],
                        reasoning_token_budget_supported: false,
                        discovered_at: now.clone(),
                        refreshed_at: now.clone(),
                    })
                    .collect::<Vec<_>>();

                self.repo.upsert_provider(&ProviderRecord {
                    id: detected.id.clone(),
                    name: detected.name.clone(),
                    npm_package: detected.npm_package.clone(),
                    provider_type: ProviderType::Local,
                    base_url: Some(detected.base_url.clone()),
                    auth_type: ProviderAuthType::None,
                    auth_status: AuthStatus::Connected,
                    model_count: models.len() as i64,
                    last_refreshed_at: Some(now.clone()),
                    created_at: now,
                })?;
                self.repo.replace_models(&detected.id, &models)?;
            }
        }

        Ok(())
    }

    pub fn list_providers(&self) -> Result<Vec<ProviderSummary>> {
        let providers = self.repo.list_providers()?;

        providers
            .into_iter()
            .map(|provider| {
                let auth_state = self.resolve_auth_state(&provider.id)?;
                let availability_status = if provider.provider_type == ProviderType::Local {
                    "reachable".to_string()
                } else {
                    "unknown".to_string()
                };

                Ok(ProviderSummary {
                    id: provider.id,
                    name: provider.name,
                    provider_type: provider.provider_type.as_str().to_string(),
                    auth_type: provider.auth_type.as_str().to_string(),
                    auth_status: if provider.provider_type == ProviderType::Cloud {
                        auth_state.status.as_str().to_string()
                    } else {
                        provider.auth_status.as_str().to_string()
                    },
                    auth_source: auth_state.source,
                    availability_status,
                    base_url: provider.base_url,
                    model_count: provider.model_count,
                })
            })
            .collect()
    }

    pub fn list_models(&self, provider_id: &str) -> Result<Vec<ProviderModelRecord>> {
        self.repo.list_models(provider_id)
    }

    pub async fn store_api_key(&self, provider_id: &str, api_key: &str) -> Result<()> {
        let provider = self
            .repo
            .get_provider(provider_id)?
            .expect("provider must exist before storing api key");
        validate_provider_api_key(&provider, api_key).await?;

        self.config_service.store_provider_api_key(provider_id, api_key)?;
        let auth_config = self
            .config_service
            .load_provider_auth_config(provider_id)?
            .expect("provider auth config should exist after storing api key");
        let keychain_ref = auth_config
            .apikey
            .as_ref()
            .expect("apikey config should be present")
            .keychain_service
            .clone();

        self.repo.upsert_credential(&ProviderCredentialRecord {
            id: Uuid::new_v4().to_string(),
            provider_id: provider_id.to_string(),
            credential_type: CredentialType::ApiKey,
            keychain_ref,
            expires_at: None,
            refresh_token_ref: None,
            created_at: utc_now(),
        })?;
        self.repo.upsert_provider(&ProviderRecord {
            auth_status: AuthStatus::Connected,
            ..provider
        })?;

        Ok(())
    }

    pub fn read_api_key(&self, provider_id: &str) -> Result<Option<String>> {
        if let Some(api_key) = self.config_service.read_provider_api_key(provider_id)? {
            return Ok(Some(api_key));
        }

        if let Some(auth_config) = self.config_service.load_provider_auth_config(provider_id)? {
            if let Some(apikey) = auth_config.apikey {
                if let Some(env_var) = apikey.env_var {
                    if let Some(value) = self.env.get_var(&env_var) {
                        return Ok(Some(value));
                    }
                }
            }
        }

        for env_var in default_env_vars(provider_id) {
            if let Some(value) = self.env.get_var(env_var) {
                return Ok(Some(value));
            }
        }

        Ok(None)
    }

    fn resolve_auth_state(&self, provider_id: &str) -> Result<ResolvedAuthState> {
        if let Some(auth_config) = self.config_service.load_provider_auth_config(provider_id)? {
            if let Some(apikey) = auth_config.apikey {
                if self
                    .config_service
                    .read_provider_api_key(provider_id)?
                    .is_some()
                {
                    return Ok(ResolvedAuthState {
                        status: AuthStatus::Connected,
                        source: Some("keychain".to_string()),
                    });
                }

                if let Some(env_var) = apikey.env_var {
                    if self.env.get_var(&env_var).is_some() {
                        return Ok(ResolvedAuthState {
                            status: AuthStatus::Connected,
                            source: Some("env".to_string()),
                        });
                    }
                }
            }
        }

        let env_vars = default_env_vars(provider_id);
        for env_var in env_vars {
            if self.env.get_var(env_var).is_some() {
                return Ok(ResolvedAuthState {
                    status: AuthStatus::Connected,
                    source: Some("env".to_string()),
                });
            }
        }

        Ok(ResolvedAuthState {
            status: AuthStatus::Disconnected,
            source: None,
        })
    }
}

struct ResolvedAuthState {
    status: AuthStatus,
    source: Option<String>,
}

#[derive(Clone)]
struct CloudProviderDefinition {
    id: String,
    name: String,
    npm_package: Option<String>,
    base_url: Option<String>,
    auth_type: ProviderAuthType,
    models: Vec<ProviderModelRecord>,
}

fn bundled_cloud_providers() -> Vec<CloudProviderDefinition> {
    vec![
        CloudProviderDefinition {
            id: "anthropic".to_string(),
            name: "Anthropic".to_string(),
            npm_package: Some("@ai-sdk/anthropic".to_string()),
            base_url: None,
            auth_type: ProviderAuthType::Apikey,
            models: vec![
                bundled_model("anthropic", "claude-sonnet-4-20250514", "Claude Sonnet 4", true),
                bundled_model("anthropic", "claude-opus-4-20250514", "Claude Opus 4", true),
            ],
        },
        CloudProviderDefinition {
            id: "openai".to_string(),
            name: "OpenAI".to_string(),
            npm_package: Some("@ai-sdk/openai".to_string()),
            base_url: None,
            auth_type: ProviderAuthType::Apikey,
            models: vec![
                bundled_model("openai", "gpt-5", "GPT-5", true),
                bundled_model("openai", "gpt-5-mini", "GPT-5 Mini", true),
            ],
        },
        CloudProviderDefinition {
            id: "google".to_string(),
            name: "Google AI".to_string(),
            npm_package: Some("@ai-sdk/google".to_string()),
            base_url: None,
            auth_type: ProviderAuthType::Apikey,
            models: vec![
                bundled_model("google", "gemini-2.5-pro", "Gemini 2.5 Pro", true),
                bundled_model("google", "gemini-2.5-flash", "Gemini 2.5 Flash", true),
            ],
        },
    ]
}

fn bundled_model(
    provider_id: &str,
    model_id: &str,
    display_name: &str,
    supports_reasoning: bool,
) -> ProviderModelRecord {
    let now = utc_now();

    ProviderModelRecord {
        provider_id: provider_id.to_string(),
        model_id: model_id.to_string(),
        display_name: display_name.to_string(),
        context_window: None,
        input_cost_per_million: None,
        output_cost_per_million: None,
        supports_vision: true,
        supports_tools: true,
        supports_reasoning,
        reasoning_modes: vec!["off".to_string(), "auto".to_string(), "on".to_string()],
        reasoning_effort_supported: supports_reasoning,
        reasoning_effort_values: if supports_reasoning {
            vec!["low".to_string(), "medium".to_string(), "high".to_string()]
        } else {
            vec![]
        },
        reasoning_token_budget_supported: false,
        discovered_at: now.clone(),
        refreshed_at: now,
    }
}

fn default_env_vars(provider_id: &str) -> &'static [&'static str] {
    match provider_id {
        "anthropic" => &["ANTHROPIC_API_KEY"],
        "openai" => &["OPENAI_API_KEY"],
        "google" => &["GOOGLE_API_KEY", "GEMINI_API_KEY"],
        _ => &[],
    }
}

async fn validate_provider_api_key(provider: &ProviderRecord, api_key: &str) -> Result<()> {
    let client = reqwest::Client::new();
    let base_url = provider_base_url(provider);

    let response = match provider.id.as_str() {
        "anthropic" => {
            let url = base_url
                .join("v1/models")
                .context("failed to construct anthropic validation url")?;
            client
                .get(url)
                .header("x-api-key", api_key)
                .header("anthropic-version", "2023-06-01")
                .send()
                .await
                .context("failed to validate anthropic api key")?
        }
        "openai" => {
            let url = base_url
                .join("v1/models")
                .context("failed to construct openai validation url")?;
            client
                .get(url)
                .bearer_auth(api_key)
                .send()
                .await
                .context("failed to validate openai api key")?
        }
        "google" => {
            let mut url = base_url
                .join("v1/models")
                .context("failed to construct google validation url")?;
            url.query_pairs_mut().append_pair("key", api_key);
            client
                .get(url)
                .send()
                .await
                .context("failed to validate google api key")?
        }
        other => anyhow::bail!("provider {other} does not support API key validation"),
    };

    response
        .error_for_status()
        .map(|_| ())
        .with_context(|| format!("provider {} rejected api key", provider.id))
}

fn provider_base_url(provider: &ProviderRecord) -> Url {
    let fallback = match provider.id.as_str() {
        "anthropic" => "https://api.anthropic.com/",
        "openai" => "https://api.openai.com/",
        "google" => "https://generativelanguage.googleapis.com/",
        _ => "http://127.0.0.1/",
    };

    Url::parse(provider.base_url.as_deref().unwrap_or(fallback))
        .expect("provider base url should be valid")
}
