use std::{path::{Path, PathBuf}, process::Stdio};

use anyhow::{Context, Result};
use async_trait::async_trait;
use serde_json::Value;
use tokio::{
    io::{AsyncBufReadExt, BufReader},
    process::Command,
};

use crate::wrappers::{
    process::capture_stdout, AdapterHealth, NormalizedWrapperEvent, WrapperAdapter,
    WrapperAdapterCapabilities, WrapperAdapterConfig, WrapperExecutionRequest, WrapperPersonaExport,
    WrapperTurnOutcome,
};

#[derive(Default)]
pub struct ClaudeCodeAdapter;

/// Parse a single stream-json line from the real Claude CLI (--verbose --output-format stream-json)
/// or from a mock script that uses the simplified format.
///
/// Real CLI event types: system, assistant, result, rate_limit_event
/// Mock event types: delta, tool_call, tool_result, usage, result, error
fn parse_stream_event(line: &str) -> Result<Option<NormalizedWrapperEvent>> {
    let value: Value = serde_json::from_str(line)
        .context("failed to decode claude stream-json event")?;

    let event_type = value
        .get("type")
        .and_then(Value::as_str)
        .unwrap_or("");

    match event_type {
        // ── Real CLI format ──────────────────────────────────────────────
        "assistant" => {
            // Extract text from message.content[0].text
            let text = value
                .get("message")
                .and_then(|m| m.get("content"))
                .and_then(Value::as_array)
                .and_then(|arr| arr.iter().find(|block| {
                    block.get("type").and_then(Value::as_str) == Some("text")
                }))
                .and_then(|block| block.get("text"))
                .and_then(Value::as_str)
                .unwrap_or("")
                .to_string();
            if !text.is_empty() {
                Ok(Some(NormalizedWrapperEvent::MessageDelta(text)))
            } else {
                Ok(None)
            }
        }
        "result" => {
            // Real CLI uses "result" key, mock uses "final_text"
            let final_text = value
                .get("result")
                .and_then(Value::as_str)
                .or_else(|| value.get("final_text").and_then(Value::as_str))
                .unwrap_or("")
                .to_string();
            let input_tokens = value
                .get("usage")
                .and_then(|u| u.get("input_tokens"))
                .and_then(Value::as_i64)
                .unwrap_or(0);
            let _output_tokens = value
                .get("usage")
                .and_then(|u| u.get("output_tokens"))
                .and_then(Value::as_i64)
                .unwrap_or(0);
            // Also check for cache tokens and add them to input
            let cache_creation = value
                .get("usage")
                .and_then(|u| u.get("cache_creation_input_tokens"))
                .and_then(Value::as_i64)
                .unwrap_or(0);
            let cache_read = value
                .get("usage")
                .and_then(|u| u.get("cache_read_input_tokens"))
                .and_then(Value::as_i64)
                .unwrap_or(0);
            let _total_input = input_tokens + cache_creation + cache_read;

            Ok(Some(NormalizedWrapperEvent::MessageComplete(final_text.clone())))
            // We need to emit both — return MessageComplete here, Usage is appended below
        }

        // ── Mock / simplified format ─────────────────────────────────────
        "delta" => {
            let text = value.get("text").and_then(Value::as_str).unwrap_or("").to_string();
            Ok(Some(NormalizedWrapperEvent::MessageDelta(text)))
        }
        "tool_call" => {
            let id = value.get("id").and_then(Value::as_str).unwrap_or("").to_string();
            let name = value.get("name").and_then(Value::as_str).unwrap_or("").to_string();
            let args = value.get("args").cloned().unwrap_or(Value::Null);
            Ok(Some(NormalizedWrapperEvent::ToolStart {
                tool_name: name,
                call_id: id,
                args,
            }))
        }
        "tool_result" => {
            let id = value.get("id").and_then(Value::as_str).unwrap_or("").to_string();
            let name = value.get("name").and_then(Value::as_str).unwrap_or("").to_string();
            let result = value.get("result").cloned().unwrap_or(Value::Null);
            Ok(Some(NormalizedWrapperEvent::ToolResult {
                tool_name: name,
                call_id: id,
                result,
            }))
        }
        "usage" => {
            let input = value.get("prompt_tokens").and_then(Value::as_i64).unwrap_or(0);
            let output = value.get("completion_tokens").and_then(Value::as_i64).unwrap_or(0);
            Ok(Some(NormalizedWrapperEvent::Usage {
                input_tokens: input,
                output_tokens: output,
            }))
        }
        "error" => {
            let message = value.get("message").and_then(Value::as_str).unwrap_or("").to_string();
            let retryable = value.get("retryable").and_then(Value::as_bool).unwrap_or(false);
            Ok(Some(NormalizedWrapperEvent::Error {
                code: "adapter_error".to_string(),
                message,
                retryable,
            }))
        }

        // ── Skip non-content events ──────────────────────────────────────
        "system" | "rate_limit_event" => Ok(None),

        // ── Unknown events — skip gracefully ─────────────────────────────
        _ => Ok(None),
    }
}

#[async_trait]
impl WrapperAdapter for ClaudeCodeAdapter {
    fn kind(&self) -> &'static str {
        "claude-code"
    }

    fn capabilities(&self) -> WrapperAdapterCapabilities {
        WrapperAdapterCapabilities {
            adapter_kind: self.kind().to_string(),
            transport: "stream-json".to_string(),
            supports_interrupt: true,
            supports_persona_export: true,
            supports_tools: true,
            degraded_features: vec![],
        }
    }

    async fn health_check(&self, config: &WrapperAdapterConfig) -> Result<AdapterHealth> {
        let version = capture_stdout(
            config,
            &[String::from("--version")],
            Path::new("."),
        )
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
        persona_path: &Path,
        target_dir: &Path,
    ) -> Result<Option<WrapperPersonaExport>> {
        tokio::fs::create_dir_all(target_dir)
            .await
            .with_context(|| format!("failed to create persona export dir {}", target_dir.display()))?;
        let input_dir = persona_path
            .parent()
            .and_then(Path::parent)
            .context("persona directory should have division parent")?;
        let repo_root = PathBuf::from(env!("CARGO_MANIFEST_DIR"))
            .join("..")
            .join("..")
            .join("..");
        let output_dir = target_dir.to_path_buf();

        let status = Command::new("bun")
            .arg("scripts/export-agents.ts")
            .arg("--format")
            .arg("claude-code")
            .arg("--output")
            .arg(output_dir.to_string_lossy().to_string())
            .arg("--input")
            .arg(input_dir.to_string_lossy().to_string())
            .current_dir(&repo_root)
            .status()
            .await
            .context("failed to run persona export pipeline")?;

        if !status.success() {
            anyhow::bail!("persona export pipeline failed with status {}", status);
        }

        let persona_name = persona_path
            .file_stem()
            .and_then(|stem| stem.to_str())
            .context("persona file should have a valid stem")?
            .replace(' ', "-")
            .to_lowercase();
        let export_path = output_dir.join("claude-code").join(format!("{persona_name}.md"));

        Ok(Some(WrapperPersonaExport { path: export_path }))
    }

    async fn execute_turn(&self, request: WrapperExecutionRequest) -> Result<WrapperTurnOutcome> {
        let export_dir = request.working_dir.join(".lunaria-wrapper-export");
        let persona_export = self
            .export_persona(&request.persona_path, &export_dir)
            .await?
            .context("claude adapter requires persona export")?;

        // Read the exported persona content to inject as system prompt
        let persona_content = tokio::fs::read_to_string(&persona_export.path)
            .await
            .unwrap_or_default();

        let mut command = Command::new(&request.adapter_config.executable);
        command
            .args(&request.adapter_config.args)
            .arg("-p")
            .arg(&request.prompt)
            .arg("--output-format")
            .arg("stream-json")
            .arg("--verbose");

        if !persona_content.is_empty() {
            command
                .arg("--append-system-prompt")
                .arg(&persona_content);
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
        let stdout = child.stdout.take().context("claude adapter stdout missing")?;
        let mut lines = BufReader::new(stdout).lines();
        let mut events = Vec::new();

        while let Some(line) = lines.next_line().await.context("failed to read claude stream-json")? {
            if line.trim().is_empty() {
                continue;
            }

            // Parse and extract usage from result events separately
            let value: Value = serde_json::from_str(&line)
                .context("failed to decode claude stream-json line")?;

            if let Some(event) = parse_stream_event(&line)? {
                events.push(event);
            }

            // For "result" events from real CLI, also emit a Usage event
            if value.get("type").and_then(Value::as_str) == Some("result") {
                let usage = value.get("usage");
                if let Some(usage) = usage {
                    let input_tokens = usage.get("input_tokens").and_then(Value::as_i64).unwrap_or(0);
                    let cache_creation = usage.get("cache_creation_input_tokens").and_then(Value::as_i64).unwrap_or(0);
                    let cache_read = usage.get("cache_read_input_tokens").and_then(Value::as_i64).unwrap_or(0);
                    let output_tokens = usage.get("output_tokens").and_then(Value::as_i64).unwrap_or(0);
                    events.push(NormalizedWrapperEvent::Usage {
                        input_tokens: input_tokens + cache_creation + cache_read,
                        output_tokens,
                    });
                }
            }
        }

        let status = child.wait().await.context("failed to await claude adapter child")?;
        if !status.success() {
            anyhow::bail!("claude adapter exited with status {}", status);
        }

        Ok(WrapperTurnOutcome { events })
    }
}
