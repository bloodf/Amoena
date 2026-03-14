use std::sync::Arc;

use lunaria_desktop::{
    persistence::{
        repositories::{
            memory_tiers::MemoryTierRepository,
            observations::ObservationRepository,
            pending_approvals::PendingApprovalRepository, sessions::SessionRepository,
            tool_executions::ToolExecutionRepository,
        },
        Database, MemoryTierRecord, ObservationCategory, ObservationRecord, PendingApprovalStatus,
        SessionMode, SessionRecord, SessionStatus, SessionType, ToolPermissionDecision, TuiType,
    },
    tools::{
        effective_permission_mode, parse_permission_ceiling, parse_permission_mode, PermissionBroker,
        PendingApprovalDecision, PermissionResolution, ToolExecutionContext, ToolExecutionOutcome,
        ToolExecutor, ToolInput, ToolPermissionMode, ToolRegistry,
    },
};
use serde_json::json;
use tempfile::TempDir;

fn setup() -> (TempDir, Arc<Database>, ToolExecutor) {
    let tempdir = TempDir::new().expect("tempdir should be created");
    let database = Arc::new(
        Database::open(tempdir.path().join("lunaria.sqlite"))
            .expect("database should be created"),
    );
    let executor = ToolExecutor::new(
        ToolExecutionRepository::new(database.clone()),
        PendingApprovalRepository::new(database.clone()),
        MemoryTierRepository::new(database.clone()),
        PermissionBroker::new(),
    );
    SessionRepository::new(database.clone())
        .insert(&SessionRecord {
            id: "session-1".to_string(),
            parent_session_id: None,
            session_type: SessionType::Primary,
            session_mode: SessionMode::Native,
            tui_type: TuiType::Native,
            provider_id: None,
            model_id: None,
            working_dir: tempdir.path().display().to_string(),
            compaction_count: 0,
            context_token_count: 0,
            workspace_id: None,
            created_at: "2026-03-12T00:00:00Z".to_string(),
            updated_at: "2026-03-12T00:00:00Z".to_string(),
            status: SessionStatus::Created,
            metadata: json!({}),
        })
        .expect("test session should insert");
    SessionRepository::new(database.clone())
        .insert(&SessionRecord {
            id: "session-approval".to_string(),
            parent_session_id: None,
            session_type: SessionType::Primary,
            session_mode: SessionMode::Native,
            tui_type: TuiType::Native,
            provider_id: None,
            model_id: None,
            working_dir: tempdir.path().display().to_string(),
            compaction_count: 0,
            context_token_count: 0,
            workspace_id: None,
            created_at: "2026-03-12T00:00:00Z".to_string(),
            updated_at: "2026-03-12T00:00:00Z".to_string(),
            status: SessionStatus::Created,
            metadata: json!({}),
        })
        .expect("approval test session should insert");

    (tempdir, database, executor)
}

#[tokio::test]
async fn tool_registry_validates_required_schema_fields() {
    let registry = ToolRegistry::new();

    registry
        .validate_args("echo", &json!({ "text": "ok" }))
        .expect("echo args should validate");
    let error = registry
        .validate_args("Read", &json!({}))
        .expect_err("missing path should fail validation");
    assert!(error.to_string().contains("missing required field path"));
}

#[test]
fn permission_resolution_honors_aliases_and_persona_ceiling() {
    let metadata = json!({
        "permissions": {
            "mode": "auto-safe",
            "tools": {
                "Bash": "yolo"
            }
        }
    });

    let read_mode = effective_permission_mode(
        &metadata,
        "Read",
        true,
        &lunaria_desktop::tools::ToolLevel::ReadOnly,
        &parse_permission_ceiling(Some("admin")),
    )
    .expect("read permission should resolve");
    assert_eq!(read_mode, ToolPermissionMode::Allow);

    let bash_denied = effective_permission_mode(
        &metadata,
        "Bash",
        false,
        &lunaria_desktop::tools::ToolLevel::ShellAccess,
        &parse_permission_ceiling(Some("read_write")),
    )
    .expect("bash permission should resolve");
    assert_eq!(bash_denied, ToolPermissionMode::Deny);

    assert_eq!(
        parse_permission_mode("manual", false).expect("manual alias should parse"),
        ToolPermissionMode::Ask
    );
}

#[tokio::test]
async fn tool_execution_audits_are_persisted() {
    let (tempdir, _database, executor) = setup();

    let outcome = executor
        .execute(
            &ToolExecutionContext {
                session_id: "session-1".to_string(),
                working_dir: tempdir.path().to_path_buf(),
                session_metadata: json!({
                    "permissions": {
                        "mode": "allow"
                    }
                }),
                persona_ceiling: parse_permission_ceiling(Some("admin")),
                agent_id: None,
            },
            ToolInput {
                tool_name: "echo".to_string(),
                args: json!({ "text": "audit" }),
            },
        )
        .await
        .expect("echo tool should execute");

    match outcome {
        ToolExecutionOutcome::Completed {
            output,
            permission_decision,
            ..
        } => {
            assert_eq!(output["text"].as_str(), Some("audit"));
            assert_eq!(permission_decision, ToolPermissionDecision::Allowed);
        }
        ToolExecutionOutcome::Pending(_) => panic!("echo tool should not require approval"),
    }

    let records = executor
        .audits()
        .list_by_session("session-1")
        .expect("tool execution audits should list");
    assert_eq!(records.len(), 1);
    assert_eq!(records[0].tool_name, "echo");
}

#[tokio::test]
async fn pending_approval_is_persisted_and_resolved() {
    let (tempdir, _database, executor) = setup();
    let context = ToolExecutionContext {
        session_id: "session-approval".to_string(),
        working_dir: tempdir.path().to_path_buf(),
        session_metadata: json!({
            "permissions": {
                "mode": "manual"
            }
        }),
        persona_ceiling: parse_permission_ceiling(Some("admin")),
        agent_id: None,
    };

    let pending = executor
        .execute(
            &context,
            ToolInput {
                tool_name: "Bash".to_string(),
                args: json!({ "command": "printf approval" }),
            },
        )
        .await
        .expect("bash tool should create pending approval");

    let pending = match pending {
        ToolExecutionOutcome::Pending(pending) => pending,
        ToolExecutionOutcome::Completed { .. } => panic!("bash should require approval"),
    };

    let stored = executor
        .approvals()
        .get(&pending.request_id)
        .expect("pending approval should load")
        .expect("pending approval should exist");
    assert_eq!(stored.status, PendingApprovalStatus::Pending);

    executor
        .resolve_approval(
            &pending.request_id,
            PermissionResolution {
                decision: PendingApprovalDecision::Approved,
                reason: Some("approved in test".to_string()),
            },
        )
        .expect("approval should resolve");

    let outcome = executor
        .await_and_execute(&context, pending)
        .await
        .expect("approved tool should execute");
    match outcome {
        ToolExecutionOutcome::Completed {
            permission_decision,
            ..
        } => assert_eq!(permission_decision, ToolPermissionDecision::UserApproved),
        ToolExecutionOutcome::Pending(_) => panic!("approved tool should complete"),
    }
}

#[tokio::test]
async fn memory_expand_returns_requested_tier_content() {
    let (tempdir, database, executor) = setup();
    ObservationRepository::new(database.clone())
        .insert(&ObservationRecord {
            id: "obs-1".to_string(),
            session_id: "session-1".to_string(),
            uri: "lunaria://memory/session-1/obs-1".to_string(),
            parent_uri: "lunaria://memory/session-1".to_string(),
            observation_type: "manual".to_string(),
            category: ObservationCategory::Skill,
            title: "memory expand".to_string(),
            subtitle: None,
            facts: vec![],
            narrative: Some("full expanded memory".to_string()),
            concepts: vec![],
            files_read: vec![],
            files_modified: vec![],
            content_hash: "hash".to_string(),
            prompt_number: 0,
            discovery_tokens: 0,
            created_at: "2026-03-12T00:00:00Z".to_string(),
        })
        .expect("observation should insert");
    MemoryTierRepository::new(database.clone())
        .upsert(&MemoryTierRecord {
            observation_id: "obs-1".to_string(),
            l0_summary: "obs".to_string(),
            l1_summary: "short summary".to_string(),
            l2_content: "full expanded memory".to_string(),
            l0_tokens: 1,
            l1_tokens: 2,
            l2_tokens: 3,
            generated_at: "2026-03-12T00:00:00Z".to_string(),
            model: "deterministic-fallback".to_string(),
        })
        .expect("memory tiers should insert");

    let outcome = executor
        .execute(
            &ToolExecutionContext {
                session_id: "session-1".to_string(),
                working_dir: tempdir.path().to_path_buf(),
                session_metadata: json!({ "permissions": { "mode": "allow" } }),
                persona_ceiling: parse_permission_ceiling(Some("admin")),
                agent_id: None,
            },
            ToolInput {
                tool_name: "MemoryExpand".to_string(),
                args: json!({ "observationId": "obs-1", "tier": "l2" }),
            },
        )
        .await
        .expect("MemoryExpand should execute");

    match outcome {
        ToolExecutionOutcome::Completed { output, .. } => {
            assert_eq!(output["content"].as_str(), Some("full expanded memory"));
        }
        ToolExecutionOutcome::Pending(_) => panic!("MemoryExpand should not require approval"),
    }
}
