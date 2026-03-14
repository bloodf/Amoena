use std::sync::Arc;

use lunaria_desktop::{
    memory::{MemoryService, ObservationInput, ObservationSource},
    persistence::{
        repositories::sessions::SessionRepository, Database, ObservationCategory, SessionMode,
        SessionRecord, SessionStatus, SessionType, TuiType,
    },
};
use tempfile::TempDir;

fn setup() -> (TempDir, Arc<Database>, MemoryService, SessionRecord) {
    let tempdir = TempDir::new().expect("tempdir should be created");
    let database = Arc::new(
        Database::open(tempdir.path().join("lunaria.sqlite"))
            .expect("database should be created"),
    );
    let memory = MemoryService::new(database.clone());
    let session = SessionRecord {
        id: "session-memory".to_string(),
        parent_session_id: None,
        session_type: SessionType::Primary,
        session_mode: SessionMode::Native,
        tui_type: TuiType::Native,
        provider_id: None,
        model_id: Some("gpt-5-mini".to_string()),
        working_dir: tempdir.path().display().to_string(),
        compaction_count: 0,
        context_token_count: 0,
        workspace_id: Some("workspace-memory".to_string()),
        created_at: "2026-03-12T00:00:00Z".to_string(),
        updated_at: "2026-03-12T00:00:00Z".to_string(),
        status: SessionStatus::Created,
        metadata: serde_json::json!({}),
    };
    SessionRepository::new(database.clone())
        .insert(&session)
        .expect("test session should insert");

    (tempdir, database, memory, session)
}

#[test]
fn captures_runtime_activity_with_uri_category_and_tiers() {
    let (_tempdir, _database, memory, session) = setup();
    let observation = memory
        .capture(ObservationInput {
            session_id: session.id.clone(),
            title: "echo tool".to_string(),
            narrative: "echo returned the current workspace id".to_string(),
            source: ObservationSource::ToolResult {
                tool_name: "echo".to_string(),
            },
            facts: vec!["workspace id returned".to_string()],
            files_read: vec![],
            files_modified: vec![],
            prompt_number: 1,
        })
        .expect("observation capture should succeed")
        .expect("observation should be created");

    assert_eq!(observation.category, ObservationCategory::ToolUsage);
    assert_eq!(observation.uri, format!("lunaria://memory/{}/{}", "workspace-memory", observation.id));

    let results = memory
        .search("workspace", Some(ObservationCategory::ToolUsage))
        .expect("search should succeed");
    assert_eq!(results.len(), 1);
    assert!(results[0].tiers.is_some());
    assert!(results[0].tiers.as_ref().unwrap().l0_summary.contains("tool_usage"));
}

#[test]
fn deduplication_suppresses_hash_and_semantic_duplicates() {
    let (_tempdir, _database, memory, session) = setup();
    let first = memory
        .capture(ObservationInput {
            session_id: session.id.clone(),
            title: "user preference".to_string(),
            narrative: "The user prefers TypeScript strict mode".to_string(),
            source: ObservationSource::Manual,
            facts: vec![],
            files_read: vec![],
            files_modified: vec![],
            prompt_number: 0,
        })
        .expect("first observation should capture")
        .expect("first observation should create");
    let duplicate = memory
        .capture(ObservationInput {
            session_id: session.id.clone(),
            title: "user preference".to_string(),
            narrative: "The user prefers TypeScript strict mode".to_string(),
            source: ObservationSource::Manual,
            facts: vec![],
            files_read: vec![],
            files_modified: vec![],
            prompt_number: 0,
        })
        .expect("duplicate capture should succeed");
    let semantic_duplicate = memory
        .capture(ObservationInput {
            session_id: session.id.clone(),
            title: "typescript preference".to_string(),
            narrative: "User prefers strict mode in TypeScript".to_string(),
            source: ObservationSource::Manual,
            facts: vec![],
            files_read: vec![],
            files_modified: vec![],
            prompt_number: 0,
        })
        .expect("semantic duplicate capture should succeed");

    assert!(duplicate.is_none(), "exact duplicate should be suppressed");
    assert_eq!(
        semantic_duplicate.as_ref().map(|record| record.id.as_str()),
        Some(first.id.as_str()),
        "semantic duplicate should reuse the recent observation"
    );
}

#[test]
fn manual_observe_can_override_category_and_search_filters() {
    let (_tempdir, _database, memory, session) = setup();
    let observation = memory
        .observe_manual(
            &session.id,
            "skill: shell",
            "Can safely use shell pipelines for workspace diagnostics",
            Some(ObservationCategory::Skill),
        )
        .expect("manual observation should succeed")
        .expect("manual observation should create");

    assert_eq!(observation.category, ObservationCategory::Skill);

    let results = memory
        .search("shell", Some(ObservationCategory::Skill))
        .expect("search should succeed");
    assert_eq!(results.len(), 1);
    assert_eq!(results[0].observation.id, observation.id);
}
