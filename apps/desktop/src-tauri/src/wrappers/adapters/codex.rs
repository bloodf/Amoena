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
pub struct CodexAdapter;

#[async_trait]
impl WrapperAdapter for CodexAdapter {
    fn kind(&self) -> &'static str {
        "codex"
    }

    fn capabilities(&self) -> WrapperAdapterCapabilities {
        WrapperAdapterCapabilities {
            adapter_kind: self.kind().to_string(),
            transport: "json-rpc".to_string(),
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
        let is_real_cli = request.adapter_config.executable == "codex"
            && request.adapter_config.args.first().map(|a| a.as_str()) != Some("run");

        let mut command = Command::new(&request.adapter_config.executable);

        if is_real_cli {
            // Codex requires a git repo — initialize one if missing
            if !request.working_dir.join(".git").exists() {
                let _ = std::process::Command::new("git")
                    .args(["init", "-q"])
                    .current_dir(&request.working_dir)
                    .status();
            }
            // Real Codex CLI: `codex exec --full-auto [options] "prompt"`
            command
                .arg("exec")
                .arg("--full-auto")
                .args(&request.adapter_config.args)
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
        let stdout = child.stdout.take().context("codex adapter stdout missing")?;
        let mut lines = BufReader::new(stdout).lines();
        let mut events = Vec::new();
        let mut full_text = String::new();

        while let Some(line) =
            lines.next_line().await.context("failed to read codex output")?
        {
            if line.trim().is_empty() {
                continue;
            }

            // Try JSON-RPC format (mock scripts)
            if let Ok(value) = serde_json::from_str::<Value>(&line) {
                let method = value
                    .get("method")
                    .and_then(Value::as_str)
                    .unwrap_or("");
                let params = value.get("params").cloned().unwrap_or(Value::Null);
                match method {
                    "message.delta" => events.push(NormalizedWrapperEvent::MessageDelta(
                        params["text"].as_str().unwrap_or_default().to_string(),
                    )),
                    "usage" => events.push(NormalizedWrapperEvent::Usage {
                        input_tokens: params["inputTokens"].as_i64().unwrap_or_default(),
                        output_tokens: params["outputTokens"].as_i64().unwrap_or_default(),
                    }),
                    "message.complete" => events.push(NormalizedWrapperEvent::MessageComplete(
                        params["finalText"].as_str().unwrap_or_default().to_string(),
                    )),
                    _ => {}
                }
            } else {
                // Plain text output from real CLI
                full_text.push_str(&line);
                full_text.push('\n');
                events.push(NormalizedWrapperEvent::MessageDelta(line.clone()));
            }
        }

        let output = child.wait_with_output().await.context("failed to await codex child")?;
        if !output.status.success() {
            let stderr = String::from_utf8_lossy(&output.stderr);
            anyhow::bail!(
                "codex adapter exited with status {} — stderr: {}",
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
