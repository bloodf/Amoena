use std::{fs, path::PathBuf, sync::Arc};

use lunaria_desktop::{
    persistence::{Database, WorkspaceStatus},
    workspaces::{WorkspaceCapability, WorkspaceCreateRequest, WorkspaceManager},
};
use tempfile::TempDir;

fn setup() -> (TempDir, Arc<Database>, WorkspaceManager) {
    let tempdir = TempDir::new().expect("tempdir should be created");
    let database = Arc::new(
        Database::open(tempdir.path().join("lunaria.sqlite"))
            .expect("database should be created"),
    );
    let manager = WorkspaceManager::new(database.clone(), tempdir.path().join("managed-workspaces"));
    (tempdir, database, manager)
}

#[test]
fn workspace_record_creation_persists_agent_attribution() {
    let (tempdir, _database, manager) = setup();
    let project = tempdir.path().join("project");
    fs::create_dir_all(&project).expect("project dir should exist");
    fs::write(project.join("README.md"), "hello").expect("fixture file should write");

    let workspace = manager
        .create(WorkspaceCreateRequest {
            project_path: project.clone(),
            agent_id: Some("agent-123".to_string()),
            persona_name: Some("Aria".to_string()),
        })
        .expect("workspace should create");

    assert!(PathBuf::from(&workspace.clone_path).exists());
    assert_eq!(workspace.agent_id.as_deref(), Some("agent-123"));
    assert_eq!(workspace.persona_name.as_deref(), Some("Aria"));
    assert_eq!(workspace.status, WorkspaceStatus::Active);
}

#[test]
fn capability_detection_prefers_git_or_full_fallback() {
    let (tempdir, _database, manager) = setup();
    let plain_project = tempdir.path().join("plain");
    fs::create_dir_all(&plain_project).expect("plain project dir should exist");

    let plain_capability = manager.detect_capability(&plain_project);
    assert!(
        matches!(plain_capability, WorkspaceCapability::Cow | WorkspaceCapability::Full),
        "non-git projects should use cow when available and full copy otherwise"
    );

    let git_project = tempdir.path().join("git-project");
    fs::create_dir_all(&git_project).expect("git project dir should exist");
    std::process::Command::new("git")
        .arg("-C")
        .arg(&git_project)
        .arg("init")
        .status()
        .expect("git init should run");

    let capability = manager.detect_capability(&git_project);
    assert!(
        matches!(capability, WorkspaceCapability::Cow | WorkspaceCapability::Worktree),
        "git project should prefer cow or worktree over full copy"
    );
}

#[test]
fn archive_and_destroy_persist_lifecycle_state_and_summary() {
    let (tempdir, _database, manager) = setup();
    let project = tempdir.path().join("project");
    fs::create_dir_all(&project).expect("project dir should exist");
    fs::write(project.join("file.txt"), "hello").expect("fixture file should write");

    let workspace = manager
        .create(WorkspaceCreateRequest {
            project_path: project.clone(),
            agent_id: None,
            persona_name: None,
        })
        .expect("workspace should create");

    let archived = manager
        .archive(
            &workspace.id,
            serde_json::json!({
                "filesChanged": ["file.txt"],
                "testsAdded": 1,
                "testsPassed": 3,
                "keyDecisions": ["Used workspace manager"],
                "lessonsLearned": ["Keep work isolated"],
                "suggestedNextSteps": ["Create merge review"]
            }),
        )
        .expect("workspace should archive");
    assert_eq!(archived.status, WorkspaceStatus::Archived);
    assert_eq!(archived.run_summary["testsPassed"].as_i64(), Some(3));

    let destroyed = manager.destroy(&workspace.id).expect("workspace should destroy");
    assert_eq!(destroyed.status, WorkspaceStatus::Deleted);
    assert!(!PathBuf::from(&destroyed.clone_path).exists());
}
