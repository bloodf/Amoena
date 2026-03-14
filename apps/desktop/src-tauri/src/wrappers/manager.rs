use std::{collections::HashMap, path::Path, sync::Arc};

use anyhow::{anyhow, Result};
use serde_json::Value;

use crate::wrappers::{
    adapters::{ClaudeCodeAdapter, CodexAdapter, GeminiAdapter, OpenCodeAdapter},
    AdapterHealth, WrapperAdapter, WrapperAdapterCapabilities, WrapperAdapterConfig,
    WrapperExecutionRequest, WrapperPersonaExport, WrapperTurnOutcome,
};

pub struct WrapperManager {
    adapters: HashMap<String, Arc<dyn WrapperAdapter>>,
}

impl WrapperManager {
    pub fn new() -> Self {
        let adapters: HashMap<String, Arc<dyn WrapperAdapter>> = [
            ("claude-code".to_string(), Arc::new(ClaudeCodeAdapter::default()) as Arc<dyn WrapperAdapter>),
            ("opencode".to_string(), Arc::new(OpenCodeAdapter::default()) as Arc<dyn WrapperAdapter>),
            ("codex".to_string(), Arc::new(CodexAdapter::default()) as Arc<dyn WrapperAdapter>),
            ("gemini".to_string(), Arc::new(GeminiAdapter::default()) as Arc<dyn WrapperAdapter>),
        ]
        .into_iter()
        .collect();

        Self { adapters }
    }

    pub fn capabilities(&self) -> Vec<WrapperAdapterCapabilities> {
        let mut capabilities = self
            .adapters
            .values()
            .map(|adapter| adapter.capabilities())
            .collect::<Vec<_>>();
        capabilities.sort_by(|left, right| left.adapter_kind.cmp(&right.adapter_kind));
        capabilities
    }

    pub async fn health_check(
        &self,
        kind: &str,
        config: &WrapperAdapterConfig,
    ) -> Result<AdapterHealth> {
        self.adapter(kind)?.health_check(config).await
    }

    pub async fn export_persona(
        &self,
        kind: &str,
        persona_path: &Path,
        target_dir: &Path,
    ) -> Result<Option<WrapperPersonaExport>> {
        self.adapter(kind)?
            .export_persona(persona_path, target_dir)
            .await
    }

    pub async fn execute_turn(&self, kind: &str, request: WrapperExecutionRequest) -> Result<WrapperTurnOutcome> {
        self.adapter(kind)?.execute_turn(request).await
    }

    pub fn config_from_metadata(metadata: &Value) -> WrapperAdapterConfig {
        metadata
            .get("wrapper")
            .cloned()
            .map(|value| serde_json::from_value(value).expect("wrapper metadata should decode"))
            .unwrap_or_default()
    }

    fn adapter(&self, kind: &str) -> Result<Arc<dyn WrapperAdapter>> {
        self.adapters
            .get(kind)
            .cloned()
            .ok_or_else(|| anyhow!("unknown wrapper adapter: {kind}"))
    }
}

impl Default for WrapperManager {
    fn default() -> Self {
        Self::new()
    }
}
