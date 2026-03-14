use std::{fs, sync::Arc};

use lunaria_desktop::{
    orchestration::{CreateTeamRequest, OrchestrationService, SendMailboxRequest, SpawnSubagentRequest},
    persona::PersonaProfile,
    persistence::{
        repositories::{agent_profiles::AgentProfileRepository, agents::AgentRepository, sessions::SessionRepository},
        AgentLifecycleStatus, AgentMode, AgentProfileRecord, Database, MailboxMessageType,
        SessionMode, SessionRecord, SessionStatus, SessionType, TuiType,
    },
};
use serde_json::json;
use tempfile::TempDir;

fn setup() -> (TempDir, Arc<Database>, OrchestrationService, SessionRecord) {
    let tempdir = TempDir::new().expect("tempdir should be created");
    let database = Arc::new(
        Database::open(tempdir.path().join("lunaria.sqlite"))
            .expect("database should be created"),
    );
    let service = OrchestrationService::new(database.clone());
    let session = SessionRecord {
        id: "session-orchestrate".to_string(),
        parent_session_id: None,
        session_type: SessionType::Primary,
        session_mode: SessionMode::Native,
        tui_type: TuiType::Native,
        provider_id: None,
        model_id: Some("gpt-5-mini".to_string()),
        working_dir: tempdir.path().display().to_string(),
        compaction_count: 0,
        context_token_count: 0,
        workspace_id: None,
        created_at: "2026-03-12T00:00:00Z".to_string(),
        updated_at: "2026-03-12T00:00:00Z".to_string(),
        status: SessionStatus::Created,
        metadata: json!({}),
    };
    SessionRepository::new(database.clone())
        .insert(&session)
        .expect("test session should insert");

    (tempdir, database, service, session)
}

#[test]
fn subagent_spawn_inherits_constrained_scope() {
    let (tempdir, database, service, session) = setup();
    let persona_path = tempdir.path().join("parent-persona.md");
    fs::write(
        &persona_path,
        r#"---
name: "Parent"
description: "Parent persona"
division: "engineering"
tools: ["Read", "Write", "Bash", "Agent"]
permissions: "shell_access"
---

Parent prompt.
"#,
    )
    .expect("parent persona should write");
    let parent = service
        .create_primary_agent(&session.id, &persona_path, "gpt-5-mini")
        .expect("primary agent should be created");

    let child_persona = tempdir.path().join("child-persona.md");
    fs::write(
        &child_persona,
        r#"---
name: "Child"
description: "Child persona"
division: "qa"
tools: ["Read", "Bash", "Agent"]
permissions: "read_only"
---

Child prompt.
"#,
    )
    .expect("child persona should write");
    let child_profile = PersonaProfile::load(&child_persona).expect("child persona should load");
    AgentProfileRepository::new(database.clone())
        .upsert(&AgentProfileRecord {
            id: "child-persona".to_string(),
            name: child_profile.name,
            division: child_profile.division,
            system_prompt: child_profile.body,
            tool_access: child_profile.tools,
            permission_config: json!({ "permissionLevel": child_profile.permissions }),
            collaboration_style: child_profile.collaboration_style,
            communication_preference: child_profile.communication_preference,
            decision_weight: child_profile.decision_weight,
            created_at: "2026-03-12T00:00:00Z".to_string(),
            updated_at: "2026-03-12T00:00:00Z".to_string(),
        })
        .expect("child profile should persist");

    let child = service
        .spawn_subagent(SpawnSubagentRequest {
            session_id: session.id.clone(),
            parent_agent_id: parent.id.clone(),
            persona_id: Some("child-persona".to_string()),
            agent_type: "reviewer".to_string(),
            model: "gpt-5-mini".to_string(),
            requested_tools: vec!["Read".to_string(), "Bash".to_string()],
            steps_limit: Some(5),
        })
        .expect("child agent should spawn");

    assert_eq!(child.mode, AgentMode::Subagent);
    assert_eq!(child.parent_agent_id.as_deref(), Some(parent.id.as_str()));
    assert_eq!(child.tool_access, vec!["Read".to_string()]);
    assert_eq!(
        child.permission_config["permissionLevel"].as_str(),
        Some("read_only")
    );

    let stored = AgentRepository::new(database)
        .get(&child.id)
        .expect("stored child should load")
        .expect("stored child should exist");
    assert_eq!(stored.division.as_deref(), Some("qa"));
    assert_eq!(stored.status, AgentLifecycleStatus::Preparing);
}

#[test]
fn mailbox_messages_persist_and_critical_messages_raise_flags() {
    let (tempdir, _database, service, session) = setup();
    let parent_persona = tempdir.path().join("agent-orchestrator.md");
    fs::write(
        &parent_persona,
        r#"---
name: "Agent Orchestrator"
description: "Directive orchestrator"
division: "ai"
tools: ["Read", "Write", "Bash", "Agent"]
permissions: "admin"
collaborationStyle: "critical"
communicationPreference: "structured"
decisionWeight: 0.9
---

Critical prompt.
"#,
    )
    .expect("critical persona should write");
    let primary = service
        .create_primary_agent(&session.id, &parent_persona, "gpt-5-mini")
        .expect("primary should be created");
    let team = service
        .create_team(CreateTeamRequest {
            name: "red-team".to_string(),
            division_requirements: json!({ "engineering": 1, "qa": 1 }),
            threshold: 0.6,
            shared_task_list_path: None,
        })
        .expect("team should be created");

    let message = service
        .send_mailbox_message(SendMailboxRequest {
            session_id: session.id.clone(),
            team_id: team.id.clone(),
            from_agent_id: primary.id.clone(),
            to_agent_id: None,
            content: "This blocks release".to_string(),
            message_type: MailboxMessageType::Message,
            metadata: json!({}),
        })
        .expect("mailbox message should send");

    let mailbox = service
        .list_mailbox(&team.id)
        .expect("mailbox should list");
    assert_eq!(mailbox.len(), 1);
    assert_eq!(mailbox[0].content, "This blocks release");
    assert_eq!(mailbox[0].collaboration_style, "critical");

    let flags = service.list_open_flags(&team.id).expect("flags should list");
    assert_eq!(flags.len(), 1);
    assert_eq!(flags[0].message_id, message.id);
}

#[test]
fn unresolved_critical_flags_block_consensus_until_resolved() {
    let (tempdir, _database, service, session) = setup();
    let critical_persona = tempdir.path().join("critical-agent.md");
    fs::write(
        &critical_persona,
        r#"---
name: "Critical"
description: "Critical reviewer"
division: "qa"
tools: ["Read", "Agent"]
permissions: "read_only"
collaborationStyle: "critical"
communicationPreference: "structured"
decisionWeight: 0.8
---

Critical reviewer.
"#,
    )
    .expect("critical persona should write");
    let supportive_persona = tempdir.path().join("supportive-agent.md");
    fs::write(
        &supportive_persona,
        r#"---
name: "Supportive"
description: "Supportive builder"
division: "engineering"
tools: ["Read", "Write", "Agent"]
permissions: "read_write"
collaborationStyle: "supportive"
communicationPreference: "structured"
decisionWeight: 0.4
---

Supportive builder.
"#,
    )
    .expect("supportive persona should write");

    let critical = service
        .create_primary_agent(&session.id, &critical_persona, "gpt-5-mini")
        .expect("critical agent should create");
    let supportive = service
        .create_primary_agent(&session.id, &supportive_persona, "gpt-5-mini")
        .expect("supportive agent should create");
    let team = service
        .create_team(CreateTeamRequest {
            name: "consensus".to_string(),
            division_requirements: json!({}),
            threshold: 0.6,
            shared_task_list_path: None,
        })
        .expect("team should create");

    service
        .send_mailbox_message(SendMailboxRequest {
            session_id: session.id.clone(),
            team_id: team.id.clone(),
            from_agent_id: critical.id.clone(),
            to_agent_id: None,
            content: "I have a blocking concern".to_string(),
            message_type: MailboxMessageType::Message,
            metadata: json!({}),
        })
        .expect("critical message should send");

    let request_message = service
        .send_mailbox_message(SendMailboxRequest {
            session_id: session.id.clone(),
            team_id: team.id.clone(),
            from_agent_id: supportive.id.clone(),
            to_agent_id: None,
            content: "Approve merge?".to_string(),
            message_type: MailboxMessageType::DecisionRequest,
            metadata: json!({}),
        })
        .expect("decision request should send");
    service
        .send_mailbox_message(SendMailboxRequest {
            session_id: session.id.clone(),
            team_id: team.id.clone(),
            from_agent_id: supportive.id.clone(),
            to_agent_id: Some(critical.id.clone()),
            content: "approve".to_string(),
            message_type: MailboxMessageType::DecisionResponse,
            metadata: json!({ "requestMessageId": request_message.id, "decision": "approve" }),
        })
        .expect("decision response should send");

    assert_eq!(
        service
            .evaluate_consensus(&team.id, &request_message.id)
            .expect("consensus should evaluate"),
        None,
        "unresolved critical flags should block consensus"
    );
}
