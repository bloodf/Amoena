use std::{
    collections::HashMap,
    path::PathBuf,
    sync::{Arc, Mutex},
    time::Instant,
};

use anyhow::{Context, Result};
use serde_json::{json, Value};
use tokio::{process::Command, sync::oneshot, time::{timeout, Duration}};
use uuid::Uuid;

use crate::{
    persistence::{
        repositories::{
            clock::utc_now, pending_approvals::PendingApprovalRepository,
            memory_tiers::MemoryTierRepository,
            tool_executions::ToolExecutionRepository,
        },
        PendingApprovalRecord, PendingApprovalStatus, ToolExecutionRecord, ToolPermissionDecision,
    },
    tools::{
        permissions::{effective_permission_mode, parse_permission_ceiling, PermissionCeiling, ToolPermissionMode},
        registry::ToolRegistry,
    },
};

#[derive(Clone)]
pub struct PermissionBroker {
    waiters: Arc<Mutex<HashMap<String, oneshot::Sender<PermissionResolution>>>>,
    queued: Arc<Mutex<HashMap<String, PermissionResolution>>>,
}

#[derive(Clone, Debug)]
pub struct ToolInput {
    pub tool_name: String,
    pub args: Value,
}

#[derive(Clone, Debug)]
pub struct ToolExecutionContext {
    pub session_id: String,
    pub working_dir: PathBuf,
    pub session_metadata: Value,
    pub persona_ceiling: PermissionCeiling,
    pub agent_id: Option<String>,
}

#[derive(Clone, Debug)]
pub enum ToolExecutionOutcome {
    Completed {
        output: Value,
        permission_decision: ToolPermissionDecision,
        duration_ms: i64,
    },
    Pending(PendingApprovalCreated),
}

#[derive(Clone, Debug)]
pub struct PendingApprovalCreated {
    pub request_id: String,
    pub tool_name: String,
    pub input: Value,
}

#[derive(Clone, Debug)]
pub struct PermissionResolution {
    pub decision: PendingApprovalDecision,
    pub reason: Option<String>,
}

#[derive(Clone, Debug, PartialEq, Eq)]
pub enum PendingApprovalDecision {
    Approved,
    Denied,
}

pub struct ToolExecutor {
    registry: ToolRegistry,
    audits: ToolExecutionRepository,
    approvals: PendingApprovalRepository,
    memory_tiers: MemoryTierRepository,
    permission_broker: PermissionBroker,
}

impl ToolExecutor {
    pub fn new(
        audits: ToolExecutionRepository,
        approvals: PendingApprovalRepository,
        memory_tiers: MemoryTierRepository,
        permission_broker: PermissionBroker,
    ) -> Self {
        Self {
            registry: ToolRegistry::new(),
            audits,
            approvals,
            memory_tiers,
            permission_broker,
        }
    }

    pub fn registry(&self) -> &ToolRegistry {
        &self.registry
    }

    pub async fn execute(
        &self,
        context: &ToolExecutionContext,
        input: ToolInput,
    ) -> Result<ToolExecutionOutcome> {
        self.registry.validate_args(&input.tool_name, &input.args)?;
        let definition = self
            .registry
            .get(&input.tool_name)
            .ok_or_else(|| anyhow::anyhow!("unknown tool {}", input.tool_name))?;
        let mode = effective_permission_mode(
            &context.session_metadata,
            &input.tool_name,
            definition.is_read_only,
            &definition.required_level,
            &context.persona_ceiling,
        )?;

        match mode {
            ToolPermissionMode::Deny => {
                self.audits.insert(&ToolExecutionRecord {
                    id: Uuid::new_v4().to_string(),
                    session_id: context.session_id.clone(),
                    agent_id: context.agent_id.clone(),
                    tool_name: input.tool_name,
                    input: input.args,
                    output: None,
                    permission_decision: ToolPermissionDecision::Denied,
                    duration_ms: 0,
                })?;
                anyhow::bail!("tool denied by permission policy");
            }
            ToolPermissionMode::Ask => {
                let request_id = Uuid::new_v4().to_string();
                self.approvals.insert(&PendingApprovalRecord {
                    id: request_id.clone(),
                    session_id: context.session_id.clone(),
                    tool_name: input.tool_name.clone(),
                    input: input.args.clone(),
                    status: PendingApprovalStatus::Pending,
                    created_at: utc_now(),
                    resolved_at: None,
                    decision_reason: None,
                })?;

                Ok(ToolExecutionOutcome::Pending(PendingApprovalCreated {
                    request_id,
                    tool_name: input.tool_name,
                    input: input.args,
                }))
            }
            ToolPermissionMode::Allow => {
                let start = Instant::now();
                let output = run_builtin(&context.working_dir, &input.tool_name, &input.args, &self.memory_tiers).await?;
                let duration_ms = start.elapsed().as_millis() as i64;
                let permission_decision = if definition.requires_permission {
                    ToolPermissionDecision::AutoApproved
                } else {
                    ToolPermissionDecision::Allowed
                };
                self.audits.insert(&ToolExecutionRecord {
                    id: Uuid::new_v4().to_string(),
                    session_id: context.session_id.clone(),
                    agent_id: context.agent_id.clone(),
                    tool_name: input.tool_name,
                    input: input.args,
                    output: Some(output.clone()),
                    permission_decision: permission_decision.clone(),
                    duration_ms,
                })?;

                Ok(ToolExecutionOutcome::Completed {
                    output,
                    permission_decision,
                    duration_ms,
                })
            }
        }
    }

    pub async fn await_and_execute(
        &self,
        context: &ToolExecutionContext,
        approval: PendingApprovalCreated,
    ) -> Result<ToolExecutionOutcome> {
        let resolution = self
            .permission_broker
            .wait_for(&approval.request_id)
            .await?;
        let status = match resolution.decision {
            PendingApprovalDecision::Approved => PendingApprovalStatus::Approved,
            PendingApprovalDecision::Denied => PendingApprovalStatus::Denied,
        };
        self.approvals.update_resolution(
            &approval.request_id,
            status.clone(),
            resolution.reason.clone(),
            utc_now(),
        )?;

        match resolution.decision {
            PendingApprovalDecision::Denied => {
                self.audits.insert(&ToolExecutionRecord {
                    id: Uuid::new_v4().to_string(),
                    session_id: context.session_id.clone(),
                    agent_id: context.agent_id.clone(),
                    tool_name: approval.tool_name.clone(),
                    input: approval.input.clone(),
                    output: None,
                    permission_decision: ToolPermissionDecision::Denied,
                    duration_ms: 0,
                })?;
                anyhow::bail!("tool denied by user");
            }
            PendingApprovalDecision::Approved => {
                let start = Instant::now();
                let output =
                    run_builtin(&context.working_dir, &approval.tool_name, &approval.input, &self.memory_tiers).await?;
                let duration_ms = start.elapsed().as_millis() as i64;
                self.audits.insert(&ToolExecutionRecord {
                    id: Uuid::new_v4().to_string(),
                    session_id: context.session_id.clone(),
                    agent_id: context.agent_id.clone(),
                    tool_name: approval.tool_name,
                    input: approval.input,
                    output: Some(output.clone()),
                    permission_decision: ToolPermissionDecision::UserApproved,
                    duration_ms,
                })?;

                Ok(ToolExecutionOutcome::Completed {
                    output,
                    permission_decision: ToolPermissionDecision::UserApproved,
                    duration_ms,
                })
            }
        }
    }

    pub fn approvals(&self) -> &PendingApprovalRepository {
        &self.approvals
    }

    pub fn audits(&self) -> &ToolExecutionRepository {
        &self.audits
    }

    pub fn resolve_approval(
        &self,
        request_id: &str,
        resolution: PermissionResolution,
    ) -> Result<()> {
        self.permission_broker.resolve(request_id, resolution)
    }

    pub fn persona_ceiling_from_metadata(metadata: &Value) -> PermissionCeiling {
        let value = metadata
            .get("persona")
            .and_then(|persona| persona.get("permissions"))
            .and_then(Value::as_str);
        parse_permission_ceiling(value)
    }
}

impl PermissionBroker {
    pub fn new() -> Self {
        Self {
            waiters: Arc::new(Mutex::new(HashMap::new())),
            queued: Arc::new(Mutex::new(HashMap::new())),
        }
    }

    pub async fn wait_for(&self, request_id: &str) -> Result<PermissionResolution> {
        if let Some(resolution) = self
            .queued
            .lock()
            .expect("permission broker queued mutex poisoned")
            .remove(request_id)
        {
            return Ok(resolution);
        }

        let (sender, receiver) = oneshot::channel();
        self.waiters
            .lock()
            .expect("permission broker mutex poisoned")
            .insert(request_id.to_string(), sender);

        timeout(Duration::from_secs(30), receiver)
            .await
            .context("timed out waiting for permission resolution")?
            .context("permission resolution sender dropped")
    }

    pub fn resolve(&self, request_id: &str, resolution: PermissionResolution) -> Result<()> {
        let sender = self
            .waiters
            .lock()
            .expect("permission broker mutex poisoned")
            .remove(request_id);

        if let Some(sender) = sender {
            sender
                .send(resolution)
                .map_err(|_| anyhow::anyhow!("failed to deliver permission resolution"))
        } else {
            self.queued
                .lock()
                .expect("permission broker queued mutex poisoned")
                .insert(request_id.to_string(), resolution);
            Ok(())
        }
    }
}

impl Default for PermissionBroker {
    fn default() -> Self {
        Self::new()
    }
}

async fn run_builtin(
    working_dir: &PathBuf,
    tool_name: &str,
    args: &Value,
    memory_tiers: &MemoryTierRepository,
) -> Result<Value> {
    match tool_name {
        "echo" => Ok(json!({
            "text": args.get("text").and_then(Value::as_str).unwrap_or_default()
        })),
        "Read" => {
            let path = args
                .get("path")
                .and_then(Value::as_str)
                .ok_or_else(|| anyhow::anyhow!("Read tool requires path"))?;
            let content = tokio::fs::read_to_string(path)
                .await
                .with_context(|| format!("failed to read file {}", path))?;
            Ok(json!({ "content": content }))
        }
        "Bash" => {
            let command = args
                .get("command")
                .and_then(Value::as_str)
                .ok_or_else(|| anyhow::anyhow!("Bash tool requires command"))?;
            let output = Command::new("zsh")
                .arg("-lc")
                .arg(command)
                .current_dir(working_dir)
                .output()
                .await
                .with_context(|| format!("failed to execute shell command {command}"))?;
            Ok(json!({
                "stdout": String::from_utf8_lossy(&output.stdout).to_string(),
                "stderr": String::from_utf8_lossy(&output.stderr).to_string(),
                "status": output.status.code().unwrap_or_default(),
            }))
        }
        "MemoryExpand" => {
            let observation_id = args
                .get("observationId")
                .and_then(Value::as_str)
                .ok_or_else(|| anyhow::anyhow!("MemoryExpand requires observationId"))?;
            let tier = args
                .get("tier")
                .and_then(Value::as_str)
                .ok_or_else(|| anyhow::anyhow!("MemoryExpand requires tier"))?;
            let record = memory_tiers
                .get(observation_id)?
                .ok_or_else(|| anyhow::anyhow!("memory tiers for {} not found", observation_id))?;
            let content = match tier {
                "l1" => record.l1_summary,
                "l2" => record.l2_content,
                _ => anyhow::bail!("unsupported memory tier: {tier}"),
            };
            Ok(json!({ "content": content, "tier": tier }))
        }
        other => anyhow::bail!("unsupported builtin tool: {other}"),
    }
}
