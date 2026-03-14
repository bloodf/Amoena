use std::{fs, sync::Arc};

use lunaria_desktop::{
    persistence::{Database, WorkspaceMergeReviewStatus},
    workspace_reviews::WorkspaceReviewManager,
    workspaces::{WorkspaceCreateRequest, WorkspaceManager},
};
use tempfile::TempDir;

fn setup() -> (TempDir, Arc<Database>, WorkspaceManager, WorkspaceReviewManager) {
    let tempdir = TempDir::new().expect("tempdir should be created");
    let database = Arc::new(
        Database::open(tempdir.path().join("lunaria.sqlite"))
            .expect("database should be created"),
    );
    let root = tempdir.path().join("managed-workspaces");
    let workspaces = WorkspaceManager::new(database.clone(), root.clone());
    let reviews = WorkspaceReviewManager::new(database.clone(), root);
    (tempdir, database, workspaces, reviews)
}

#[test]
fn merge_review_records_diff_and_consensus_metadata() {
    let (tempdir, _database, workspaces, reviews) = setup();
    let project = tempdir.path().join("project");
    fs::create_dir_all(&project).expect("project should exist");
    fs::write(project.join("file.txt"), "base").expect("file should write");

    let workspace = workspaces
        .create(WorkspaceCreateRequest {
            project_path: project.clone(),
            agent_id: Some("agent-1".to_string()),
            persona_name: Some("Aria".to_string()),
        })
        .expect("workspace should create");
    fs::write(
        std::path::PathBuf::from(&workspace.clone_path).join("file.txt"),
        "changed",
    )
    .expect("workspace file should write");

    let review = reviews
        .prepare_review(
            &workspace.id,
            &project,
            serde_json::json!([{ "persona_name": "Aria", "agent_id": "agent-1", "collaborationStyle": "supportive", "decisionWeight": 0.8 }]),
        )
        .expect("review should prepare");

    assert_eq!(review.changed_files, 1);
    assert_eq!(review.team_consensus_score, 0.8);
    assert_eq!(review.status, WorkspaceMergeReviewStatus::Pending);
}

#[test]
fn conflicts_and_low_consensus_block_apply_back() {
    let (tempdir, _database, workspaces, reviews) = setup();
    let project = tempdir.path().join("project");
    fs::create_dir_all(&project).expect("project should exist");
    fs::write(project.join("conflict.txt"), "<<<<<<< ours").expect("target conflict should write");

    let workspace = workspaces
        .create(WorkspaceCreateRequest {
            project_path: project.clone(),
            agent_id: Some("agent-1".to_string()),
            persona_name: Some("Nexus".to_string()),
        })
        .expect("workspace should create");
    fs::write(
        std::path::PathBuf::from(&workspace.clone_path).join("conflict.txt"),
        "<<<<<<< theirs",
    )
    .expect("workspace conflict should write");

    let archived = workspaces
        .archive(
            &workspace.id,
            serde_json::json!({ "keyDecisions": ["risky choice"] }),
        )
        .expect("workspace should archive");
    let review = reviews
        .prepare_review(
            &workspace.id,
            &project,
            serde_json::json!([{ "persona_name": "Nexus", "agent_id": "agent-1", "collaborationStyle": "directive", "decisionWeight": 0.5 }]),
        )
        .expect("review should prepare");

    assert_eq!(archived.status, lunaria_desktop::persistence::WorkspaceStatus::Archived);
    assert_eq!(review.status, WorkspaceMergeReviewStatus::Blocked);
    assert!(reviews.apply_review(&review.id, vec!["risky choice".to_string()]).is_err());
}

#[test]
fn orphan_scan_reports_missing_and_untracked_workspaces() {
    let (tempdir, _database, workspaces, reviews) = setup();
    let project = tempdir.path().join("project");
    fs::create_dir_all(&project).expect("project should exist");
    fs::write(project.join("file.txt"), "base").expect("file should write");

    let workspace = workspaces
        .create(WorkspaceCreateRequest {
            project_path: project.clone(),
            agent_id: None,
            persona_name: None,
        })
        .expect("workspace should create");
    fs::remove_dir_all(&workspace.clone_path).expect("workspace dir should remove");
    fs::create_dir_all(tempdir.path().join("managed-workspaces/orphan-dir"))
        .expect("orphan dir should create");

    let orphan_report = reviews.scan_orphans().expect("orphan scan should succeed");
    assert!(orphan_report
        .missing_paths
        .iter()
        .any(|path| path == &workspace.clone_path));
    assert!(orphan_report
        .untracked_paths
        .iter()
        .any(|path: &String| path.ends_with("orphan-dir")));
}
