use std::{collections::BTreeMap, path::PathBuf};

use serde::{Deserialize, Serialize};
use serde_json::Value;

use crate::persistence::TuiType;

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GlobalConfig {
    pub version: i64,
    pub locale: String,
    pub ui: UiConfig,
    pub notifications: NotificationConfig,
    pub telemetry: TelemetryConfig,
    #[serde(default)]
    pub remote_access: RemoteAccessConfig,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UiConfig {
    pub theme: String,
    pub density: String,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct NotificationConfig {
    pub afk_timeout_seconds: i64,
    pub desktop_enabled: bool,
    pub sound_enabled: bool,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TelemetryConfig {
    pub enabled: bool,
    pub retention_days: i64,
}

#[derive(Clone, Debug, Default, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RemoteAccessConfig {
    pub enabled: bool,
    pub lan_enabled: bool,
    pub lan_bind_address: String,
    pub relay_enabled: bool,
    pub relay_endpoint: String,
    pub pairing_pin_ttl_seconds: i64,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PerTuiConfig {
    pub tui: TuiType,
    pub enabled: bool,
    pub adapter_mode: String,
    pub binary_path: String,
    pub default_model: Option<String>,
    pub default_working_dir: Option<String>,
    #[serde(default)]
    pub args: Vec<String>,
    #[serde(default)]
    pub env: BTreeMap<String, String>,
    pub permission_policy: PermissionPolicy,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PermissionPolicy {
    pub mode: String,
    pub allow_network: Option<bool>,
    pub allow_shell: Option<bool>,
    pub allow_file_write: Option<bool>,
}

#[derive(Clone, Debug, Default, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ProjectConfig {
    pub version: Option<i64>,
    #[serde(default)]
    pub providers: BTreeMap<String, ProviderOverride>,
    #[serde(default)]
    pub models: BTreeMap<String, String>,
    #[serde(default)]
    pub agents: BTreeMap<String, AgentOverride>,
    #[serde(default)]
    pub tools: BTreeMap<String, ToolOverride>,
}

#[derive(Clone, Debug, Default, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ProviderOverride {
    pub enabled: Option<bool>,
    pub base_url: Option<String>,
    pub default_model: Option<String>,
    #[serde(default)]
    pub env: BTreeMap<String, String>,
}

#[derive(Clone, Debug, Default, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AgentOverride {
    pub model: Option<String>,
    pub system_prompt: Option<String>,
    #[serde(default)]
    pub tool_access: Vec<String>,
    pub steps_limit: Option<i64>,
    pub permissions: Option<PermissionPolicy>,
}

#[derive(Clone, Debug, Default, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ToolOverride {
    pub enabled: Option<bool>,
    pub permission: Option<String>,
    pub timeout_ms: Option<i64>,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum ProviderAuthType {
    Oauth,
    Apikey,
    Env,
    AwsChain,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ProviderAuthConfig {
    pub provider_id: String,
    pub auth_type: ProviderAuthType,
    pub apikey: Option<ApiKeyAuthConfig>,
    pub base_url: Option<String>,
    pub health_check_url: Option<String>,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ApiKeyAuthConfig {
    pub keychain_service: String,
    pub env_var: Option<String>,
    pub header_name: String,
    pub header_prefix: String,
}

#[derive(Clone, Debug, Default, PartialEq, Eq)]
pub struct RuntimeOverrides {
    pub remote_access_enabled: Option<bool>,
    pub relay_endpoint: Option<String>,
    pub provider_default_models: BTreeMap<String, String>,
}

#[derive(Clone, Debug, Default)]
pub struct RuntimeResolutionRequest {
    pub tui: Option<TuiType>,
    pub session_id: Option<String>,
    pub working_dir: Option<PathBuf>,
    pub runtime_overrides: RuntimeOverrides,
}

#[derive(Clone, Debug, Default, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ResolvedProviderConfig {
    pub enabled: Option<bool>,
    pub base_url: Option<String>,
    pub default_model: Option<String>,
    #[serde(default)]
    pub env: BTreeMap<String, String>,
}

#[derive(Clone, Debug, PartialEq)]
pub struct ResolvedConfig {
    pub global: GlobalConfig,
    pub per_tui: Option<PerTuiConfig>,
    pub project: Option<ProjectConfig>,
    pub settings: BTreeMap<String, Value>,
    pub providers: BTreeMap<String, ResolvedProviderConfig>,
    pub logging_level: String,
    pub transcript_format: String,
}

impl Default for GlobalConfig {
    fn default() -> Self {
        Self {
            version: 1,
            locale: "en-US".to_string(),
            ui: UiConfig {
                theme: "system".to_string(),
                density: "comfortable".to_string(),
            },
            notifications: NotificationConfig {
                afk_timeout_seconds: 300,
                desktop_enabled: true,
                sound_enabled: true,
            },
            telemetry: TelemetryConfig {
                enabled: false,
                retention_days: 30,
            },
            remote_access: RemoteAccessConfig {
                enabled: false,
                lan_enabled: false,
                lan_bind_address: "0.0.0.0".to_string(),
                relay_enabled: false,
                relay_endpoint: "relay.lunaria.app".to_string(),
                pairing_pin_ttl_seconds: 120,
            },
        }
    }
}
