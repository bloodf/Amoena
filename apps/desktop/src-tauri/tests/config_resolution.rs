use std::{path::Path, sync::Arc};

use lunaria_desktop::{
    config::{
        ConfigService, GlobalConfig, KeyringSecretStore, MemorySecretStore, PerTuiConfig,
        PermissionPolicy, ProjectConfig, RuntimeOverrides, RuntimePaths, RuntimeResolutionRequest,
    },
    persistence::{Database, SettingScope, TuiType},
};
use serde_json::json;
use tempfile::TempDir;

fn setup() -> (TempDir, Arc<Database>, RuntimePaths) {
    let tempdir = TempDir::new().expect("tempdir should be created");
    let state_root = tempdir.path().join(".lunaria");
    let database = Arc::new(
        Database::open(state_root.join("lunaria.sqlite"))
            .expect("database should be created"),
    );
    let paths = RuntimePaths::new(state_root);

    (tempdir, database, paths)
}

fn write_json(path: &Path, value: &impl serde::Serialize) {
    if let Some(parent) = path.parent() {
        std::fs::create_dir_all(parent).expect("parent dir should be created");
    }
    std::fs::write(path, serde_json::to_string_pretty(value).expect("json should serialize"))
        .expect("json file should be written");
}

#[test]
fn resolve_configuration_uses_deterministic_precedence() {
    let (tempdir, database, paths) = setup();
    let project_root = tempdir.path().join("project");
    std::fs::create_dir_all(&project_root).expect("project dir should exist");

    write_json(
        &paths.global_config_path,
        &GlobalConfig {
            remote_access: lunaria_desktop::config::RemoteAccessConfig {
                enabled: false,
                lan_enabled: false,
                lan_bind_address: "0.0.0.0".to_string(),
                relay_enabled: false,
                relay_endpoint: "relay.from.global".to_string(),
                pairing_pin_ttl_seconds: 120,
            },
            ..GlobalConfig::default()
        },
    );
    write_json(
        &paths.tui_config_path("native"),
        &PerTuiConfig {
            tui: TuiType::Native,
            enabled: true,
            adapter_mode: "structured".to_string(),
            binary_path: "/usr/bin/native".to_string(),
            default_model: Some("per-tui-model".to_string()),
            default_working_dir: None,
            args: vec![],
            env: Default::default(),
            permission_policy: PermissionPolicy {
                mode: "default".to_string(),
                allow_network: Some(false),
                allow_shell: Some(false),
                allow_file_write: Some(true),
            },
        },
    );
    write_json(
        &paths.project_config_path(&project_root),
        &ProjectConfig {
            providers: [(
                "anthropic".to_string(),
                lunaria_desktop::config::ProviderOverride {
                    enabled: Some(true),
                    base_url: Some("https://project.example".to_string()),
                    default_model: Some("project-model".to_string()),
                    env: Default::default(),
                },
            )]
            .into_iter()
            .collect(),
            ..ProjectConfig::default()
        },
    );

    let service = ConfigService::new(paths, database, Arc::new(MemorySecretStore::new()));
    service
        .put_setting("remote_access.enabled", SettingScope::Global, None, &true)
        .expect("setting should be written");
    service
        .put_setting(
            "remote_access.relay.endpoint",
            SettingScope::Global,
            None,
            &"relay.from.settings".to_string(),
        )
        .expect("setting should be written");

    let resolved = service
        .resolve(RuntimeResolutionRequest {
            tui: Some(TuiType::Native),
            working_dir: Some(project_root),
            runtime_overrides: RuntimeOverrides {
                remote_access_enabled: Some(false),
                relay_endpoint: None,
                provider_default_models: [(
                    "anthropic".to_string(),
                    "runtime-model".to_string(),
                )]
                .into_iter()
                .collect(),
            },
            ..RuntimeResolutionRequest::default()
        })
        .expect("config should resolve");

    assert!(!resolved.global.remote_access.enabled);
    assert_eq!(resolved.global.remote_access.relay_endpoint, "relay.from.settings");
    assert_eq!(
        resolved
            .per_tui
            .as_ref()
            .and_then(|config| config.default_model.as_deref()),
        Some("per-tui-model")
    );
    assert_eq!(
        resolved
            .providers
            .get("anthropic")
            .and_then(|provider| provider.default_model.as_deref()),
        Some("runtime-model")
    );
}

#[test]
fn provider_secrets_do_not_leak_into_sqlite_or_json_files() {
    let (_tempdir, database, paths) = setup();
    let service = ConfigService::new(paths.clone(), database.clone(), Arc::new(MemorySecretStore::new()));

    service
        .store_provider_api_key("anthropic", "super-secret")
        .expect("provider secret should be stored");

    assert_eq!(
        service
            .read_provider_api_key("anthropic")
            .expect("provider secret should be readable"),
        Some("super-secret".to_string())
    );

    let provider_file = std::fs::read_to_string(paths.provider_auth_config_path("anthropic"))
        .expect("provider config should exist");
    assert!(
        !provider_file.contains("super-secret"),
        "provider auth config must not contain raw secrets"
    );

    let stored_secrets = database
        .read(|connection| {
            let count: i64 = connection.query_row(
                "SELECT COUNT(*) FROM settings WHERE value LIKE '%super-secret%'",
                [],
                |row| row.get(0),
            )?;
            Ok(count)
        })
        .expect("settings table should be readable");

    assert_eq!(stored_secrets, 0, "sqlite settings must not contain raw provider secrets");
}

#[test]
fn structured_settings_round_trip_without_losing_shape() {
    let (_tempdir, database, paths) = setup();
    let service = ConfigService::new(paths, database, Arc::new(KeyringSecretStore::default()));

    service
        .put_setting(
            "notifications.mutedTypes",
            SettingScope::PerSession,
            Some("session-123".to_string()),
            &json!(["permission_request", "task_complete"]),
        )
        .expect("structured setting should be written");

    let round_trip: serde_json::Value = service
        .get_setting(
            "notifications.mutedTypes",
            SettingScope::PerSession,
            Some("session-123"),
        )
        .expect("structured setting should be readable")
        .expect("structured setting should exist");

    assert_eq!(round_trip, json!(["permission_request", "task_complete"]));
}
