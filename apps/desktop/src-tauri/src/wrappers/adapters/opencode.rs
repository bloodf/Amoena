use std::path::Path;
use std::process::Stdio;

use anyhow::{Context, Result};
use async_trait::async_trait;
use serde_json::Value;
use tokio::io::{AsyncBufReadExt, BufReader};
use tokio::process::Command;

use crate::wrappers::{
    process::capture_stdout, AdapterHealth, NormalizedWrapperEvent, WrapperAdapter,
    WrapperAdapterCapabilities, WrapperAdapterConfig, WrapperExecutionRequest,
    WrapperPersonaExport, WrapperTurnOutcome,
};

#[derive(Default)]
pub struct OpenCodeAdapter;

#[async_trait]
impl WrapperAdapter for OpenCodeAdapter {
    fn kind(&self) -> &'static str {
        "opencode"
    }

    fn capabilities(&self) -> WrapperAdapterCapabilities {
        WrapperAdapterCapabilities {
            adapter_kind: self.kind().to_string(),
            transport: "rest-sse".to_string(),
            supports_interrupt: true,
            supports_persona_export: false,
            supports_tools: true,
            degraded_features: vec!["persona-export".to_string()],
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

    async fn export_persona(
        &self,
        _persona_path: &Path,
        _target_dir: &Path,
    ) -> Result<Option<WrapperPersonaExport>> {
        Ok(None)
    }

    async fn execute_turn(&self, request: WrapperExecutionRequest) -> Result<WrapperTurnOutcome> {
        let is_real_cli = request.adapter_config.executable == "opencode"
            && request.adapter_config.args.first().map(|a| a.as_str()) != Some("run");

        let mut command = Command::new(&request.adapter_config.executable);

        if is_real_cli {
            // Real OpenCode CLI: `opencode run "message"`
            command
                .args(&request.adapter_config.args)
                .arg("run")
                .arg(&request.prompt);
        } else {
            // Mock script: `bun mock-script.ts --prompt "text"`
            command
                .args(&request.adapter_config.args)
                .arg("--prompt")
                .arg(&request.prompt);
        }

        command
            .stdout(Stdio::piped())
            .stderr(Stdio::piped())
            .current_dir(&request.working_dir);

        for (key, value) in &request.adapter_config.env {
            command.env(key, value);
        }

        let mut child = command
            .spawn()
            .with_context(|| format!("failed to spawn {}", request.adapter_config.executable))?;
        let stdout = child.stdout.take().context("opencode adapter stdout missing")?;
        let mut lines = BufReader::new(stdout).lines();
        let mut events = Vec::new();
        let mut full_text = String::new();

        while let Some(line) =
            lines.next_line().await.context("failed to read opencode output")?
        {
            if line.trim().is_empty() {
                continue;
            }

            // Try JSON format (mock scripts use tagged JSON)
            if let Ok(value) = serde_json::from_str::<Value>(&line) {
                let event_type = value.get("type").and_then(Value::as_str).unwrap_or("");
                match event_type {
                    "delta" => {
                        let text = value.get("text").and_then(Value::as_str).unwrap_or("").to_string();
                        events.push(NormalizedWrapperEvent::MessageDelta(text));
                    }
                    "usage" => {
                        let input = value.get("inputTokens").and_then(Value::as_i64).unwrap_or(0);
                        let output = value.get("outputTokens").and_then(Value::as_i64).unwrap_or(0);
                        events.push(NormalizedWrapperEvent::Usage {
                            input_tokens: input,
                            output_tokens: output,
                        });
                    }
                    "result" => {
                        let text = value.get("finalText").and_then(Value::as_str).unwrap_or("").to_string();
                        events.push(NormalizedWrapperEvent::MessageComplete(text));
                    }
                    _ => {}
                }
            } else {
                // Plain text output from real CLI
                full_text.push_str(&line);
                full_text.push('\n');
                events.push(NormalizedWrapperEvent::MessageDelta(line.clone()));
            }
        }

        let output = child.wait_with_output().await.context("failed to await opencode child")?;
        if !output.status.success() {
            let stderr = String::from_utf8_lossy(&output.stderr);
            anyhow::bail!(
                "opencode adapter exited with status {} — stderr: {}",
                output.status,
                stderr.chars().take(500).collect::<String>()
            );
        }

        // If we collected plain text (real CLI mode), emit MessageComplete
        if !full_text.is_empty()
            && !events
                .iter()
                .any(|e| matches!(e, NormalizedWrapperEvent::MessageComplete(_)))
        {
            let trimmed = full_text.trim().to_string();
            events.push(NormalizedWrapperEvent::MessageComplete(trimmed));
            events.push(NormalizedWrapperEvent::Usage {
                input_tokens: 0,
                output_tokens: 0,
            });
        }

        Ok(WrapperTurnOutcome { events })
    }
}
