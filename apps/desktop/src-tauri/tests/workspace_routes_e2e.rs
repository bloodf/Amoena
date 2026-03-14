//! End-to-end tests for workspace management via WorkspaceManager.

use std::{fs, path::PathBuf, sync::Arc};

use lunaria_desktop::{
    persistence::{Database, WorkspaceStatus},
    workspaces::{WorkspaceCreateRequest, WorkspaceManager},
};
use tempfile::TempDir;

fn setup() -> (TempDir, Arc<Database>, WorkspaceManager) {
    let tempdir = TempDir::new().expect("tempdir should be created");
    let database = Arc::new(
        Database::open(tempdir.path().join("lunaria.sqlite"))
            .expect("database should be created"),
    );
    let manager =
        WorkspaceManager::new(database.clone(), tempdir.path().join("managed-workspaces"));
    (tempdir, database, manager)
}

fn make_project(root: &std::path::Path, name: &str) -> PathBuf {
    let dir = root.join(name);
    fs::create_dir_all(&dir).expect("project dir should be created");
    fs::write(dir.join("readme.txt"), name).expect("fixture file should write");
    dir
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

#[test]
fn workspace_create_reports_active_status() {
    let (tempdir, _database, manager) = setup();
    let project = make_project(tempdir.path(), "project");

    let workspace = manager
        .create(WorkspaceCreateRequest {
            project_path: project,
            agent_id: Some("agent-001".to_string()),
            persona_name: Some("test-persona".to_string()),
        })
        .expect("workspace should create");

    assert_eq!(
        workspace.status,
        WorkspaceStatus::Active,
        "newly created workspace should be active"
    );
    assert_eq!(
        workspace.agent_id.as_deref(),
        Some("agent-001"),
        "workspace should record the requested agentId"
    );
    assert!(
        PathBuf::from(&workspace.clone_path).exists(),
        "clone_path should exist on disk after creation"
    );
}

#[test]
fn workspace_list_includes_all_workspaces() {
    let (tempdir, _database, manager) = setup();
    let project1 = make_project(tempdir.path(), "p1");
    let project2 = make_project(tempdir.path(), "p2");

    manager
        .create(WorkspaceCreateRequest {
            project_path: project1,
            agent_id: None,
            persona_name: None,
        })
        .expect("workspace 1 should create");

    manager
        .create(WorkspaceCreateRequest {
            project_path: project2,
            agent_id: None,
            persona_name: None,
        })
        .expect("workspace 2 should create");

    let all = manager.list().expect("list should succeed");
    assert_eq!(
        all.len(),
        2,
        "list should return all created workspaces"
    );
}

#[test]
fn workspace_archive_transitions_status() {
    let (tempdir, _database, manager) = setup();
    let project = make_project(tempdir.path(), "project");

    let workspace = manager
        .create(WorkspaceCreateRequest {
            project_path: project,
            agent_id: None,
            persona_name: None,
        })
        .expect("workspace should create");

    let archived = manager
        .archive(
            &workspace.id,
            serde_json::json!({
                "filesChanged": ["readme.txt"],
                "testsAdded": 0,
                "testsPassed": 0,
                "keyDecisions": ["workspace route test"],
                "lessonsLearned": [],
                "suggestedNextSteps": []
            }),
        )
        .expect("workspace should archive");

    assert_eq!(
        archived.status,
        WorkspaceStatus::Archived,
        "archived workspace should have Archived status"
    );
}

#[test]
fn workspace_destroy_removes_clone_path() {
    let (tempdir, _database, manager) = setup();
    let project = make_project(tempdir.path(), "project");

    let workspace = manager
        .create(WorkspaceCreateRequest {
            project_path: project,
            agent_id: None,
            persona_name: None,
        })
        .expect("workspace should create");

    let clone_path = workspace.clone_path.clone();
    assert!(
        PathBuf::from(&clone_path).exists(),
        "clone_path should exist before destroy"
    );

    let destroyed = manager
        .destroy(&workspace.id)
        .expect("workspace should destroy");

    assert_eq!(
        destroyed.status,
        WorkspaceStatus::Deleted,
        "destroyed workspace should have Deleted status"
    );
    assert!(
        !PathBuf::from(&destroyed.clone_path).exists(),
        "clone_path should be removed from disk after destroy"
    );
}

#[test]
fn workspace_list_filters_statuses_correctly() {
    let (tempdir, _database, manager) = setup();
    let project1 = make_project(tempdir.path(), "archived-project");
    let project2 = make_project(tempdir.path(), "deleted-project");
    let project3 = make_project(tempdir.path(), "active-project");

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
    assert_eq!(
        all.len(),
        3,
        "list should return all 3 workspaces regardless of status"
    );

    let find = |id: &str| {
        all.iter()
            .find(|w| w.id == id)
            .expect("workspace should be in list")
    };

    assert_eq!(find(&ws1.id).status, WorkspaceStatus::Archived);
    assert_eq!(find(&ws2.id).status, WorkspaceStatus::Deleted);
}
