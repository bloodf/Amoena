use std::sync::Arc;

use lunaria_desktop::{
    ai_worker::{BunWorkerBridge, BunWorkerConfig},
    memory::{MemoryService, ObservationInput, ObservationSource, RetrievalScope},
    persistence::{
        repositories::sessions::SessionRepository, Database, SessionMode, SessionRecord,
        SessionStatus, SessionType, TuiType,
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
        id: "session-hybrid".to_string(),
        parent_session_id: None,
        session_type: SessionType::Primary,
        session_mode: SessionMode::Native,
        tui_type: TuiType::Native,
        provider_id: None,
        model_id: Some("gpt-5-mini".to_string()),
        working_dir: tempdir.path().display().to_string(),
        compaction_count: 0,
        context_token_count: 0,
        workspace_id: Some("workspace-hybrid".to_string()),
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

fn enable_mock_worker() {
    unsafe {
        std::env::set_var("LUNARIA_ENABLE_MOCK_PROVIDER", "1");
    }
}

#[tokio::test]
async fn embeddings_and_hybrid_search_are_deterministic() {
    enable_mock_worker();
    let (_tempdir, _database, memory, session) = setup();
    let worker = BunWorkerBridge::new(BunWorkerConfig::default())
        .await
        .expect("worker should start");
    let first = memory
        .capture(ObservationInput {
            session_id: session.id.clone(),
            title: "Rust ownership".to_string(),
            narrative: "Rust ownership rules prevent borrow checker issues".to_string(),
            source: ObservationSource::AssistantResponse,
            facts: vec![],
            files_read: vec![],
            files_modified: vec![],
            prompt_number: 1,
        })
        .expect("first observation should capture")
        .expect("first observation should create");
    let second = memory
        .capture(ObservationInput {
            session_id: session.id.clone(),
            title: "Git worktree".to_string(),
            narrative: "Git worktrees isolate parallel feature work".to_string(),
            source: ObservationSource::AssistantResponse,
            facts: vec![],
            files_read: vec![],
            files_modified: vec![],
            prompt_number: 2,
        })
        .expect("second observation should capture")
        .expect("second observation should create");

    let first_embedding = memory
        .embed_observation(&worker, &first, None)
        .await
        .expect("first embedding should persist");
    assert_eq!(first_embedding.model, "text-embedding-3-small");
    assert_eq!(first_embedding.vector.len(), 1536);
    memory
        .embed_observation(&worker, &second, None)
        .await
        .expect("second embedding should persist");

    let results = memory
        .hybrid_search(&worker, None, "ownership", None)
        .await
        .expect("hybrid search should succeed");

    assert_eq!(results[0].observation.id, first.id);
}

#[tokio::test]
async fn injection_bundle_uses_scope_classification_and_l0_budget() {
    enable_mock_worker();
    let (_tempdir, _database, memory, session) = setup();
    let worker = BunWorkerBridge::new(BunWorkerConfig::default())
        .await
        .expect("worker should start");
    let observation = memory
        .capture(ObservationInput {
            session_id: session.id.clone(),
            title: "Workspace rule".to_string(),
            narrative: "Project workspaces should remain isolated during parallel execution".to_string(),
            source: ObservationSource::AssistantResponse,
            facts: vec![],
            files_read: vec![],
            files_modified: vec![],
            prompt_number: 1,
        })
        .expect("observation should capture")
        .expect("observation should create");
    memory
        .embed_observation(&worker, &observation, None)
        .await
        .expect("embedding should persist");

    let bundle = memory
        .injection_bundle(&worker, None, "workspace isolation", 3)
        .await
        .expect("injection bundle should build");

    assert_eq!(bundle.scope, RetrievalScope::Workspace);
    assert_eq!(bundle.summaries.len(), 1);
    assert!(bundle.token_budget_used > 0);
}
