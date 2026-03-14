use std::{collections::BTreeMap, path::PathBuf};

use anyhow::Result;
use async_trait::async_trait;
use serde::{Deserialize, Serialize};
use serde_json::Value;

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct WrapperAdapterCapabilities {
    pub adapter_kind: String,
    pub transport: String,
    pub supports_interrupt: bool,
    pub supports_persona_export: bool,
    pub supports_tools: bool,
    pub degraded_features: Vec<String>,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AdapterHealth {
    pub adapter_kind: String,
    pub status: String,
    pub version: Option<String>,
    pub executable: String,
}

#[derive(Clone, Debug, Default, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct WrapperAdapterConfig {
    pub executable: String,
    #[serde(default)]
    pub args: Vec<String>,
    #[serde(default)]
    pub env: BTreeMap<String, String>,
}

#[derive(Clone, Debug)]
pub struct WrapperPersonaExport {
    pub path: PathBuf,
}

#[derive(Clone, Debug)]
pub struct WrapperExecutionRequest {
    pub session_id: String,
    pub working_dir: PathBuf,
    pub prompt: String,
    pub persona_path: PathBuf,
    pub adapter_config: WrapperAdapterConfig,
}

#[derive(Clone, Debug, PartialEq)]
pub enum NormalizedWrapperEvent {
    MessageDelta(String),
    MessageComplete(String),
    ToolStart {
        tool_name: String,
        call_id: String,
        args: Value,
    },
    ToolResult {
        tool_name: String,
        call_id: String,
        result: Value,
    },
    Usage {
        input_tokens: i64,
        output_tokens: i64,
    },
    Error {
        code: String,
        message: String,
        retryable: bool,
    },
}

#[derive(Clone, Debug)]
pub struct WrapperTurnOutcome {
    pub events: Vec<NormalizedWrapperEvent>,
}

#[async_trait]
pub trait WrapperAdapter: Send + Sync {
    fn kind(&self) -> &'static str;

    fn capabilities(&self) -> WrapperAdapterCapabilities;

    async fn health_check(&self, config: &WrapperAdapterConfig) -> Result<AdapterHealth>;

    async fn export_persona(&self, persona_path: &std::path::Path, target_dir: &std::path::Path)
        -> Result<Option<WrapperPersonaExport>>;

    async fn execute_turn(&self, request: WrapperExecutionRequest) -> Result<WrapperTurnOutcome>;
}
