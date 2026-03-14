use std::path::Path;

use anyhow::{Context, Result};
use async_trait::async_trait;
use serde::Deserialize;

use crate::wrappers::{
    process::{capture_stdout, run_lines}, AdapterHealth, NormalizedWrapperEvent, WrapperAdapter, WrapperAdapterCapabilities,
    WrapperAdapterConfig, WrapperExecutionRequest, WrapperPersonaExport, WrapperTurnOutcome,
};

#[derive(Default)]
pub struct GeminiAdapter;

#[derive(Deserialize)]
struct GeminiEvent {
    class: String,
    text: Option<String>,
    #[serde(rename = "promptTokens")]
    prompt_tokens: Option<i64>,
    #[serde(rename = "completionTokens")]
    completion_tokens: Option<i64>,
}

#[async_trait]
impl WrapperAdapter for GeminiAdapter {
    fn kind(&self) -> &'static str {
        "gemini"
    }

    fn capabilities(&self) -> WrapperAdapterCapabilities {
        WrapperAdapterCapabilities {
            adapter_kind: self.kind().to_string(),
            transport: "pty-stream-json".to_string(),
            supports_interrupt: true,
            supports_persona_export: false,
            supports_tools: false,
            degraded_features: vec!["persona-export".to_string(), "tool-calls".to_string()],
        }
    }

    async fn health_check(&self, config: &WrapperAdapterConfig) -> Result<AdapterHealth> {
        let version = capture_stdout(config, &[String::from("--version")], Path::new("."))
            .await
            .ok();
        Ok(AdapterHealth {
            adapter_kind: self.kind().to_string(),
            status: "ok".to_string(),
            version,
            executable: config.executable.clone(),
        })
    }

    async fn export_persona(&self, _persona_path: &Path, _target_dir: &Path) -> Result<Option<WrapperPersonaExport>> {
        Ok(None)
    }

    async fn execute_turn(&self, _request: WrapperExecutionRequest) -> Result<WrapperTurnOutcome> {
        let request = _request;
        let lines = run_lines(
            &request.adapter_config,
            &["--prompt".to_string(), request.prompt.clone()],
            &request.working_dir,
        )
        .await?;
        let mut events = Vec::new();

        for line in lines {
            let event: GeminiEvent =
                serde_json::from_str(&line).context("failed to decode gemini mock event")?;
            match event.class.as_str() {
                "message" => events.push(NormalizedWrapperEvent::MessageDelta(
                    event.text.unwrap_or_default(),
                )),
                "result" => {
                    let text = event.text.unwrap_or_default();
                    events.push(NormalizedWrapperEvent::Usage {
                        input_tokens: event.prompt_tokens.unwrap_or_default(),
                        output_tokens: event.completion_tokens.unwrap_or_default(),
                    });
                    events.push(NormalizedWrapperEvent::MessageComplete(text));
                }
                _ => {}
            }
        }

        Ok(WrapperTurnOutcome { events })
    }
}
