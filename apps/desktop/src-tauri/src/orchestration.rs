use std::{
    path::{Path, PathBuf},
    sync::Arc,
};

use anyhow::{anyhow, Context, Result};
use serde_json::json;
use uuid::Uuid;

use crate::{
    persistence::{
        repositories::{
            agent_messages::AgentMessageRepository, agent_profiles::AgentProfileRepository,
            agent_teams::AgentTeamRepository, agents::AgentRepository, clock::utc_now,
            mailbox_flags::MailboxFlagRepository,
        },
        AgentLifecycleStatus, AgentMessageRecord, AgentMode, AgentProfileRecord, AgentRecord,
        AgentTeamRecord, Database, MailboxFlagRecord, MailboxFlagStatus, MailboxMessageType,
        TeamLifecycleStatus,
    },
    persona::PersonaProfile,
    tools::{parse_permission_ceiling, PermissionCeiling, ToolRegistry},
};

#[derive(Clone, Debug)]
pub struct SpawnSubagentRequest {
    pub session_id: String,
    pub parent_agent_id: String,
    pub persona_id: Option<String>,
    pub agent_type: String,
    pub model: String,
    pub requested_tools: Vec<String>,
    pub steps_limit: Option<i64>,
}

#[derive(Clone, Debug)]
pub struct CreateTeamRequest {
    pub name: String,
    pub division_requirements: serde_json::Value,
    pub threshold: f64,
    pub shared_task_list_path: Option<String>,
}

#[derive(Clone, Debug)]
pub struct SendMailboxRequest {
    pub session_id: String,
    pub team_id: String,
    pub from_agent_id: String,
    pub to_agent_id: Option<String>,
    pub content: String,
    pub message_type: MailboxMessageType,
    pub metadata: serde_json::Value,
}

pub struct OrchestrationService {
    agent_profiles: AgentProfileRepository,
    agents: AgentRepository,
    teams: AgentTeamRepository,
    messages: AgentMessageRepository,
    flags: MailboxFlagRepository,
}

impl OrchestrationService {
    pub fn new(database: Arc<Database>) -> Self {
        Self {
            agent_profiles: AgentProfileRepository::new(database.clone()),
            agents: AgentRepository::new(database.clone()),
            teams: AgentTeamRepository::new(database.clone()),
            messages: AgentMessageRepository::new(database.clone()),
            flags: MailboxFlagRepository::new(database),
        }
    }

    pub fn create_primary_agent(
        &self,
        session_id: &str,
        persona_path: &Path,
        model: &str,
    ) -> Result<AgentRecord> {
        let persona = PersonaProfile::load(persona_path)?;
        let now = utc_now();
        let agent = AgentRecord {
            id: Uuid::new_v4().to_string(),
            session_id: session_id.to_string(),
            parent_agent_id: None,
            agent_type: persona.name.clone(),
            mode: AgentMode::Primary,
            model: model.to_string(),
            system_prompt: Some(persona.body.clone()),
            tool_access: persona.tools.clone(),
            permission_config: json!({ "permissionLevel": persona.permissions }),
            status: AgentLifecycleStatus::Active,
            steps_limit: None,
            division: Some(persona.division.clone()),
            collaboration_style: Some(persona.collaboration_style.clone()),
            communication_preference: Some(persona.communication_preference.clone()),
            decision_weight: Some(persona.decision_weight),
        };
        self.agents.insert(&agent)?;
        self.agent_profiles.upsert(&AgentProfileRecord {
            id: agent.id.clone(),
            name: persona.name,
            division: persona.division,
            system_prompt: persona.body,
            tool_access: persona.tools,
            permission_config: json!({ "permissionLevel": persona.permissions }),
            collaboration_style: persona.collaboration_style,
            communication_preference: persona.communication_preference,
            decision_weight: persona.decision_weight,
            created_at: now.clone(),
            updated_at: now,
        })?;
        Ok(agent)
    }

    pub fn spawn_subagent(&self, request: SpawnSubagentRequest) -> Result<AgentRecord> {
        let parent = self
            .agents
            .get(&request.parent_agent_id)?
            .ok_or_else(|| anyhow!("parent agent {} not found", request.parent_agent_id))?;
        let persona = self.resolve_persona(request.persona_id.as_deref())?;

        let effective_tools = if request.requested_tools.is_empty() {
            intersect_tools(&parent.tool_access, &persona.tool_access)
        } else {
            intersect_tools(
                &intersect_tools(&parent.tool_access, &persona.tool_access),
                &request.requested_tools,
            )
        };

        let parent_ceiling = parse_permission_ceiling(
            parent
                .permission_config
                .get("permissionLevel")
                .and_then(serde_json::Value::as_str),
        );
        let persona_ceiling = parse_permission_ceiling(
            persona
                .permission_config
                .get("permissionLevel")
                .and_then(serde_json::Value::as_str),
        );
        let effective_ceiling = min_ceiling(parent_ceiling, persona_ceiling);
        let registry = ToolRegistry::new();
        let effective_tools = effective_tools
            .into_iter()
            .filter(|tool_name| {
                registry
                    .get(tool_name)
                    .map(|definition| tool_allowed_by_ceiling(&definition.required_level, &effective_ceiling))
                    .unwrap_or(false)
            })
            .collect::<Vec<_>>();

        let agent = AgentRecord {
            id: Uuid::new_v4().to_string(),
            session_id: request.session_id,
            parent_agent_id: Some(parent.id),
            agent_type: request.agent_type,
            mode: AgentMode::Subagent,
            model: request.model,
            system_prompt: Some(persona.system_prompt.clone()),
            tool_access: effective_tools,
            permission_config: json!({
                "permissionLevel": ceiling_label(&effective_ceiling)
            }),
            status: AgentLifecycleStatus::Preparing,
            steps_limit: request.steps_limit,
            division: Some(persona.division.clone()),
            collaboration_style: Some(persona.collaboration_style.clone()),
            communication_preference: Some(persona.communication_preference.clone()),
            decision_weight: Some(persona.decision_weight),
        };
        self.agents.insert(&agent)?;

        Ok(agent)
    }

    pub fn create_team(&self, request: CreateTeamRequest) -> Result<AgentTeamRecord> {
        let team = AgentTeamRecord {
            id: Uuid::new_v4().to_string(),
            name: request.name,
            shared_task_list_path: request.shared_task_list_path,
            status: TeamLifecycleStatus::Assembling,
            division_requirements: request.division_requirements,
            threshold: request.threshold,
        };
        self.teams.insert(&team)?;
        Ok(team)
    }

    pub fn send_mailbox_message(&self, request: SendMailboxRequest) -> Result<AgentMessageRecord> {
        let sender = self
            .agents
            .get(&request.from_agent_id)?
            .ok_or_else(|| anyhow!("agent {} not found", request.from_agent_id))?;

        let message = AgentMessageRecord {
            id: Uuid::new_v4().to_string(),
            team_id: request.team_id.clone(),
            from_agent_id: request.from_agent_id,
            to_agent_id: request.to_agent_id,
            content: request.content,
            message_type: request.message_type,
            collaboration_style: sender
                .collaboration_style
                .clone()
                .unwrap_or_else(|| "cooperative".to_string()),
            decision_weight: sender.decision_weight.unwrap_or(0.5),
            metadata: request.metadata,
            created_at: utc_now(),
            read_at: None,
        };
        self.messages.insert(&message)?;

        if message.collaboration_style == "critical" {
            self.flags.insert(&MailboxFlagRecord {
                id: Uuid::new_v4().to_string(),
                message_id: message.id.clone(),
                team_id: request.team_id,
                session_id: request.session_id,
                flag_type: "concern".to_string(),
                status: MailboxFlagStatus::Open,
                created_at: utc_now(),
                resolved_at: None,
            })?;
        }

        Ok(message)
    }

    pub fn evaluate_consensus(
        &self,
        team_id: &str,
        request_message_id: &str,
    ) -> Result<Option<bool>> {
        if !self.flags.list_open_for_team(team_id)?.is_empty() {
            return Ok(None);
        }

        let messages = self.messages.list_for_team(team_id)?;
        let request_message = messages
            .iter()
            .find(|message| message.id == request_message_id)
            .ok_or_else(|| anyhow!("decision request {} not found", request_message_id))?;
        if request_message.message_type != MailboxMessageType::DecisionRequest {
            anyhow::bail!("message {} is not a decision request", request_message_id);
        }

        let mut approve = 0.0;
        let mut total = 0.0;
        for message in messages
            .iter()
            .filter(|message| message.message_type == MailboxMessageType::DecisionResponse)
            .filter(|message| {
                message
                    .metadata
                    .get("requestMessageId")
                    .and_then(serde_json::Value::as_str)
                    == Some(request_message_id)
            })
        {
            let decision = message
                .metadata
                .get("decision")
                .and_then(serde_json::Value::as_str)
                .unwrap_or("abstain");
            if decision == "abstain" {
                continue;
            }
            total += message.decision_weight;
            if decision == "approve" {
                approve += message.decision_weight;
            }
        }

        if total == 0.0 {
            return Ok(None);
        }

        let threshold = self
            .teams
            .get(team_id)?
            .ok_or_else(|| anyhow!("team {} not found", team_id))?
            .threshold;

        Ok(Some((approve / total) > threshold))
    }

    pub fn list_mailbox(&self, team_id: &str) -> Result<Vec<AgentMessageRecord>> {
        self.messages.list_for_team(team_id)
    }

    pub fn list_open_flags(&self, team_id: &str) -> Result<Vec<MailboxFlagRecord>> {
        self.flags.list_open_for_team(team_id)
    }

    fn resolve_persona(&self, persona_id: Option<&str>) -> Result<AgentProfileRecord> {
        if let Some(persona_id) = persona_id {
            if let Some(record) = self.agent_profiles.get(persona_id)? {
                return Ok(record);
            }
        }

        let persona_id = persona_id.unwrap_or("agent-orchestrator");
        let profile = resolve_bundled_persona(persona_id)?;

        Ok(AgentProfileRecord {
            id: persona_id.to_string(),
            name: profile.name,
            division: profile.division,
            system_prompt: profile.body,
            tool_access: profile.tools,
            permission_config: json!({ "permissionLevel": profile.permissions }),
            collaboration_style: profile.collaboration_style,
            communication_preference: profile.communication_preference,
            decision_weight: profile.decision_weight,
            created_at: utc_now(),
            updated_at: utc_now(),
        })
    }
}

fn resolve_bundled_persona(persona_id: &str) -> Result<PersonaProfile> {
    let resources_dir = PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .join("..")
        .join("resources")
        .join("agent-personas");

    for division in std::fs::read_dir(&resources_dir)
        .with_context(|| format!("failed to read personas dir {}", resources_dir.display()))?
    {
        let division = division?;
        if !division.file_type()?.is_dir() {
            continue;
        }

        for entry in std::fs::read_dir(division.path())? {
            let entry = entry?;
            let path = entry.path();
            if path.extension().and_then(|ext| ext.to_str()) != Some("md") {
                continue;
            }
            let stem = path.file_stem().and_then(|stem| stem.to_str()).unwrap_or_default();
            if stem == persona_id {
                return PersonaProfile::load(path);
            }
        }
    }

    anyhow::bail!("persona {persona_id} not found")
}

fn intersect_tools(left: &[String], right: &[String]) -> Vec<String> {
    left.iter()
        .filter(|tool| right.iter().any(|candidate| candidate == *tool))
        .cloned()
        .collect()
}

fn min_ceiling(
    left: crate::tools::PermissionCeiling,
    right: crate::tools::PermissionCeiling,
) -> crate::tools::PermissionCeiling {
    use crate::tools::PermissionCeiling;

    let rank = |value: &PermissionCeiling| match value {
        PermissionCeiling::ReadOnly => 0,
        PermissionCeiling::ReadWrite => 1,
        PermissionCeiling::ShellAccess => 2,
        PermissionCeiling::Admin => 3,
    };

    if rank(&left) <= rank(&right) {
        left
    } else {
        right
    }
}

fn ceiling_label(value: &crate::tools::PermissionCeiling) -> &'static str {
    match value {
        crate::tools::PermissionCeiling::ReadOnly => "read_only",
        crate::tools::PermissionCeiling::ReadWrite => "read_write",
        crate::tools::PermissionCeiling::ShellAccess => "shell_access",
        crate::tools::PermissionCeiling::Admin => "admin",
    }
}

fn tool_allowed_by_ceiling(
    required_level: &crate::tools::ToolLevel,
    ceiling: &PermissionCeiling,
) -> bool {
    match (required_level, ceiling) {
        (crate::tools::ToolLevel::ReadOnly, _) => true,
        (crate::tools::ToolLevel::ReadWrite, PermissionCeiling::ReadWrite)
        | (crate::tools::ToolLevel::ReadWrite, PermissionCeiling::ShellAccess)
        | (crate::tools::ToolLevel::ReadWrite, PermissionCeiling::Admin) => true,
        (crate::tools::ToolLevel::ShellAccess, PermissionCeiling::ShellAccess)
        | (crate::tools::ToolLevel::ShellAccess, PermissionCeiling::Admin) => true,
        (crate::tools::ToolLevel::Admin, PermissionCeiling::Admin) => true,
        _ => false,
    }
}
