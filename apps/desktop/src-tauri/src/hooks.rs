use std::{path::Path, sync::Arc, time::Duration};

use anyhow::{Context, Result};
use reqwest::Client;
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use tokio::{process::Command, time::timeout};
use uuid::Uuid;

use crate::persistence::{repositories::hooks::HookRepository, Database, HookHandlerType, HookRecord};

#[derive(Clone, Debug, PartialEq, Eq)]
pub enum HookEvent {
    SessionStart,
    SessionEnd,
    UserPromptSubmit,
    PreToolUse,
    PostToolUse,
    PostToolUseFailure,
    PermissionRequest,
    SubagentStart,
    SubagentStop,
    Stop,
    Notification,
    TeammateIdle,
    TaskCompleted,
    InstructionsLoaded,
    ConfigChange,
    WorktreeCreate,
    WorktreeRemove,
    PreCompact,
    MemoryObserve,
    MemoryInject,
    AutopilotStoryStart,
    AutopilotStoryComplete,
    ProviderSwitch,
    ErrorUnhandled,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct HookInvocationResult {
    pub hook_id: String,
    pub event_name: String,
    pub status: String,
    pub output: Option<String>,
    pub error: Option<String>,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ClaudeHookImport {
    pub event: String,
    pub command: String,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct OpenCodeHookImport {
    pub event: String,
    pub command: String,
}

pub struct HookEngine {
    repo: HookRepository,
    http: Client,
}

impl HookEngine {
    pub fn new(database: Arc<Database>) -> Self {
        Self {
            repo: HookRepository::new(database),
            http: Client::new(),
        }
    }

    pub fn register(&self, hook: HookRecord) -> Result<()> {
        self.repo.upsert(&hook)
    }

    pub fn list(&self) -> Result<Vec<HookRecord>> {
        self.repo.list()
    }

    pub fn delete(&self, id: &str) -> Result<()> {
        self.repo.delete(id)
    }

    pub async fn fire(&self, event: HookEvent, payload: Value) -> Result<Vec<HookInvocationResult>> {
        let hooks = self.repo.list_by_event(event.as_str())?;
        let mut results = Vec::new();

        for hook in hooks.into_iter().filter(|hook| hook.enabled) {
            results.push(self.run_hook(&hook, payload.clone()).await);
        }

        Ok(results)
    }

    async fn run_hook(&self, hook: &HookRecord, payload: Value) -> HookInvocationResult {
        match hook.handler_type {
            HookHandlerType::Command => {
                let command = hook
                    .handler_config
                    .get("command")
                    .and_then(Value::as_str)
                    .unwrap_or("");
                let child = Command::new("zsh")
                    .arg("-lc")
                    .arg(command)
                    .output();
                match timeout(Duration::from_millis(hook.timeout_ms as u64), child).await {
                    Ok(Ok(output)) => HookInvocationResult {
                        hook_id: hook.id.clone(),
                        event_name: hook.event_name.clone(),
                        status: if output.status.success() { "ok" } else { "failed" }.to_string(),
                        output: Some(String::from_utf8_lossy(&output.stdout).trim().to_string()),
                        error: if output.status.success() {
                            None
                        } else {
                            Some(String::from_utf8_lossy(&output.stderr).trim().to_string())
                        },
                    },
                    Ok(Err(error)) => failure_result(hook, error.to_string()),
                    Err(_) => failure_result(hook, "hook timed out".to_string()),
                }
            }
            HookHandlerType::Http => {
                let url = hook
                    .handler_config
                    .get("url")
                    .and_then(Value::as_str)
                    .unwrap_or("");
                match timeout(
                    Duration::from_millis(hook.timeout_ms as u64),
                    self.http.post(url).json(&payload).send(),
                )
                .await
                {
                    Ok(Ok(response)) => HookInvocationResult {
                        hook_id: hook.id.clone(),
                        event_name: hook.event_name.clone(),
                        status: if response.status().is_success() { "ok" } else { "failed" }.to_string(),
                        output: Some(response.status().to_string()),
                        error: None,
                    },
                    Ok(Err(error)) => failure_result(hook, error.to_string()),
                    Err(_) => failure_result(hook, "hook timed out".to_string()),
                }
            }
            HookHandlerType::Prompt => HookInvocationResult {
                hook_id: hook.id.clone(),
                event_name: hook.event_name.clone(),
                status: "ok".to_string(),
                output: hook
                    .handler_config
                    .get("text")
                    .and_then(Value::as_str)
                    .map(str::to_string),
                error: None,
            },
            HookHandlerType::Agent => HookInvocationResult {
                hook_id: hook.id.clone(),
                event_name: hook.event_name.clone(),
                status: "ok".to_string(),
                output: hook
                    .handler_config
                    .get("agentType")
                    .and_then(Value::as_str)
                    .map(str::to_string),
                error: None,
            },
        }
    }

    pub fn import_claude_hooks(&self, path: &Path) -> Result<Vec<HookRecord>> {
        let hooks: Vec<ClaudeHookImport> = serde_json::from_str(
            &std::fs::read_to_string(path)
                .with_context(|| format!("failed to read {}", path.display()))?,
        )
        .context("failed to parse Claude hooks.json")?;

        hooks.into_iter()
            .map(|hook| Ok(HookRecord {
                id: Uuid::new_v4().to_string(),
                event_name: normalize_event_name(&hook.event),
                handler_type: HookHandlerType::Command,
                handler_config: json!({ "command": hook.command }),
                matcher_regex: None,
                enabled: true,
                priority: 100,
                timeout_ms: 30_000,
            }))
            .collect()
    }

    pub fn import_opencode_hooks(&self, path: &Path) -> Result<Vec<HookRecord>> {
        #[derive(Deserialize)]
        struct OpenCodeConfig {
            #[serde(default)]
            hooks: Vec<OpenCodeHookImport>,
        }

        let config: OpenCodeConfig = serde_json::from_str(
            &std::fs::read_to_string(path)
                .with_context(|| format!("failed to read {}", path.display()))?,
        )
        .context("failed to parse opencode.json")?;

        config
            .hooks
            .into_iter()
            .map(|hook| Ok(HookRecord {
                id: Uuid::new_v4().to_string(),
                event_name: normalize_event_name(&hook.event),
                handler_type: HookHandlerType::Command,
                handler_config: json!({ "command": hook.command }),
                matcher_regex: None,
                enabled: true,
                priority: 100,
                timeout_ms: 30_000,
            }))
            .collect()
    }
}

impl HookEvent {
    pub fn from_str(s: &str) -> Option<Self> {
        match s {
            "SessionStart" => Some(HookEvent::SessionStart),
            "SessionEnd" => Some(HookEvent::SessionEnd),
            "UserPromptSubmit" => Some(HookEvent::UserPromptSubmit),
            "PreToolUse" => Some(HookEvent::PreToolUse),
            "PostToolUse" => Some(HookEvent::PostToolUse),
            "PostToolUseFailure" => Some(HookEvent::PostToolUseFailure),
            "PermissionRequest" => Some(HookEvent::PermissionRequest),
            "SubagentStart" => Some(HookEvent::SubagentStart),
            "SubagentStop" => Some(HookEvent::SubagentStop),
            "Stop" => Some(HookEvent::Stop),
            "Notification" => Some(HookEvent::Notification),
            "TeammateIdle" => Some(HookEvent::TeammateIdle),
            "TaskCompleted" => Some(HookEvent::TaskCompleted),
            "InstructionsLoaded" => Some(HookEvent::InstructionsLoaded),
            "ConfigChange" => Some(HookEvent::ConfigChange),
            "WorktreeCreate" => Some(HookEvent::WorktreeCreate),
            "WorktreeRemove" => Some(HookEvent::WorktreeRemove),
            "PreCompact" => Some(HookEvent::PreCompact),
            "MemoryObserve" => Some(HookEvent::MemoryObserve),
            "MemoryInject" => Some(HookEvent::MemoryInject),
            "AutopilotStoryStart" => Some(HookEvent::AutopilotStoryStart),
            "AutopilotStoryComplete" => Some(HookEvent::AutopilotStoryComplete),
            "ProviderSwitch" => Some(HookEvent::ProviderSwitch),
            "ErrorUnhandled" => Some(HookEvent::ErrorUnhandled),
            _ => None,
        }
    }

    pub fn as_str(&self) -> &'static str {
        match self {
            HookEvent::SessionStart => "SessionStart",
            HookEvent::SessionEnd => "SessionEnd",
            HookEvent::UserPromptSubmit => "UserPromptSubmit",
            HookEvent::PreToolUse => "PreToolUse",
            HookEvent::PostToolUse => "PostToolUse",
            HookEvent::PostToolUseFailure => "PostToolUseFailure",
            HookEvent::PermissionRequest => "PermissionRequest",
            HookEvent::SubagentStart => "SubagentStart",
            HookEvent::SubagentStop => "SubagentStop",
            HookEvent::Stop => "Stop",
            HookEvent::Notification => "Notification",
            HookEvent::TeammateIdle => "TeammateIdle",
            HookEvent::TaskCompleted => "TaskCompleted",
            HookEvent::InstructionsLoaded => "InstructionsLoaded",
            HookEvent::ConfigChange => "ConfigChange",
            HookEvent::WorktreeCreate => "WorktreeCreate",
            HookEvent::WorktreeRemove => "WorktreeRemove",
            HookEvent::PreCompact => "PreCompact",
            HookEvent::MemoryObserve => "MemoryObserve",
            HookEvent::MemoryInject => "MemoryInject",
            HookEvent::AutopilotStoryStart => "AutopilotStoryStart",
            HookEvent::AutopilotStoryComplete => "AutopilotStoryComplete",
            HookEvent::ProviderSwitch => "ProviderSwitch",
            HookEvent::ErrorUnhandled => "ErrorUnhandled",
        }
    }
}

fn failure_result(hook: &HookRecord, error: String) -> HookInvocationResult {
    HookInvocationResult {
        hook_id: hook.id.clone(),
        event_name: hook.event_name.clone(),
        status: "failed".to_string(),
        output: None,
        error: Some(error),
    }
}

fn normalize_event_name(value: &str) -> String {
    match value {
        "pre_tool_use" => HookEvent::PreToolUse.as_str().to_string(),
        "post_tool_use" => HookEvent::PostToolUse.as_str().to_string(),
        "session_start" => HookEvent::SessionStart.as_str().to_string(),
        "session_end" => HookEvent::SessionEnd.as_str().to_string(),
        other => other.to_string(),
    }
}
