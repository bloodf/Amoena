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

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

#[test]
fn workspace_create_clone_archive_destroy() {
    let (tempdir, _database, manager) = setup();
    let project = tempdir.path().join("project");
    fs::create_dir_all(&project).expect("project dir should be created");
    fs::write(project.join("file.txt"), "hello").expect("fixture file should write");

    let workspace = manager
        .create(WorkspaceCreateRequest {
            project_path: project.clone(),
            agent_id: None,
            persona_name: None,
        })
        .expect("workspace should create");

    assert_eq!(workspace.status, WorkspaceStatus::Active);
    assert!(
        PathBuf::from(&workspace.clone_path).exists(),
        "clone_path should exist after creation"
    );

    let archived = manager
        .archive(
            &workspace.id,
            serde_json::json!({
                "filesChanged": ["file.txt"],
                "testsAdded": 0,
                "testsPassed": 0,
                "keyDecisions": ["lifecycle test"],
                "lessonsLearned": [],
                "suggestedNextSteps": []
            }),
        )
        .expect("workspace should archive");

    assert_eq!(archived.status, WorkspaceStatus::Archived);

    let destroyed = manager.destroy(&workspace.id).expect("workspace should destroy");

    assert_eq!(destroyed.status, WorkspaceStatus::Deleted);
    assert!(
        !PathBuf::from(&destroyed.clone_path).exists(),
        "clone_path should be removed after destroy"
    );
}

#[test]
fn workspace_list_filters_by_status() {
    let (tempdir, _database, manager) = setup();

    let make_project = |name: &str| -> PathBuf {
        let dir = tempdir.path().join(name);
        fs::create_dir_all(&dir).expect("project dir should be created");
        fs::write(dir.join("readme.txt"), name).expect("fixture file should write");
        dir
    };

    let project1 = make_project("project1");
    let project2 = make_project("project2");
    let project3 = make_project("project3");

    let ws1 = manager
        .create(WorkspaceCreateRequest {
            project_path: project1,
            agent_id: None,
            persona_name: None,
        })
        .expect("workspace 1 should create");

    let ws2 = manager
        .create(WorkspaceCreateRequest {
            project_path: project2,
            agent_id: None,
            persona_name: None,
        })
        .expect("workspace 2 should create");

    manager
        .create(WorkspaceCreateRequest {
            project_path: project3,
            agent_id: None,
            persona_name: None,
        })
        .expect("workspace 3 should create");

    manager
        .archive(
            &ws1.id,
            serde_json::json!({
                "filesChanged": [],
                "testsAdded": 0,
                "testsPassed": 0,
                "keyDecisions": [],
                "lessonsLearned": [],
                "suggestedNextSteps": []
            }),
        )
        .expect("workspace 1 should archive");

    manager.destroy(&ws2.id).expect("workspace 2 should destroy");

    let all = manager.list().expect("list should succeed");

    assert_eq!(all.len(), 3, "list should return all 3 workspaces");

    let find = |id: &str| {
        all.iter()
            .find(|w| w.id == id)
            .expect("workspace should be found in list")
    };

    assert_eq!(find(&ws1.id).status, WorkspaceStatus::Archived);
    assert_eq!(find(&ws2.id).status, WorkspaceStatus::Deleted);
}

#[test]
fn workspace_state_persists_across_reinstantiation() {
    let tempdir = TempDir::new().expect("tempdir should be created");
    let db_path = tempdir.path().join("lunaria.sqlite");
    let managed_root = tempdir.path().join("managed-workspaces");

    let workspace_id = {
        let database = Arc::new(
            Database::open(db_path.clone()).expect("database should be created"),
        );
        let manager = WorkspaceManager::new(database.clone(), managed_root.clone());

        let project = tempdir.path().join("project");
        fs::create_dir_all(&project).expect("project dir should be created");
        fs::write(project.join("file.txt"), "data").expect("fixture file should write");

        manager
            .create(WorkspaceCreateRequest {
                project_path: project,
                agent_id: None,
                persona_name: None,
            })
            .expect("workspace should create")
            .id
    };

    // Drop the first manager by letting it go out of scope, then open a new one.
    let database2 = Arc::new(
        Database::open(db_path).expect("database should reopen"),
    );
    let manager2 = WorkspaceManager::new(database2, managed_root);

    let all = manager2.list().expect("list on new manager should succeed");

    assert!(
        all.iter().any(|w| w.id == workspace_id),
        "workspace created before reinstantiation should appear in list"
    );
}

#[test]
fn workspace_git_worktree_detection() {
    let (tempdir, _database, manager) = setup();
    let git_project = tempdir.path().join("git-project");
    fs::create_dir_all(&git_project).expect("git project dir should be created");

    std::process::Command::new("git")
        .args(["-C", git_project.to_str().unwrap(), "init"])
        .status()
        .expect("git init should run");

    fs::write(git_project.join("README.md"), "init").expect("README should write");

    std::process::Command::new("git")
        .args(["-C", git_project.to_str().unwrap(), "add", "."])
        .status()
        .expect("git add should run");

    std::process::Command::new("git")
        .args([
            "-C",
            git_project.to_str().unwrap(),
            "-c",
            "user.email=test@example.com",
            "-c",
            "user.name=Test",
            "commit",
            "-m",
            "init",
        ])
        .status()
        .expect("git commit should run");

    let capability = manager.detect_capability(&git_project);

    assert!(
        matches!(capability, WorkspaceCapability::Cow | WorkspaceCapability::Worktree),
        "git project should be detected as Cow or Worktree, not Full; got {capability:?}"
    );
}
