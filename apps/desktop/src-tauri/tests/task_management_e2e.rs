//! End-to-end tests for session task management routes.

use lunaria_desktop::{start_runtime, BootstrapSession, RuntimeConfig, RuntimeHandle};
use reqwest::Client;
use serde_json::{json, Value};
use tempfile::TempDir;

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

fn temp_config(tempdir: &TempDir) -> RuntimeConfig {
    let mut config = RuntimeConfig::default();
    config.database_path = tempdir.path().join("lunaria.sqlite");
    config
}

async fn bootstrap(client: &Client, runtime: &RuntimeHandle) -> BootstrapSession {
    client
        .post(format!(
            "{}{}",
            runtime.launch_context().api_base_url,
            runtime.launch_context().bootstrap_path
        ))
        .json(&json!({ "token": runtime.launch_context().bootstrap_token }))
        .send()
        .await
        .expect("bootstrap request should complete")
        .error_for_status()
        .expect("bootstrap request should succeed")
        .json()
        .await
        .expect("bootstrap response should deserialize")
}

async fn create_test_session(client: &Client, base_url: &str, auth: &str) -> String {
    let body: Value = client
        .post(format!("{base_url}/api/v1/sessions"))
        .bearer_auth(auth)
        .json(&json!({
            "workingDir": "/tmp",
            "sessionMode": "native",
            "tuiType": "native"
        }))
        .send()
        .await
        .expect("create session request should complete")
        .error_for_status()
        .expect("create session should return 201")
        .json()
        .await
        .expect("create session response should deserialize");
    body["id"].as_str().expect("session id should be present").to_string()
}

async fn create_task(client: &Client, base_url: &str, auth: &str, session_id: &str, title: &str) -> Value {
    client
        .post(format!("{base_url}/api/v1/sessions/{session_id}/tasks"))
        .bearer_auth(auth)
        .json(&json!({ "title": title }))
        .send()
        .await
        .expect("create task request should complete")
        .error_for_status()
        .expect("create task should return 201")
        .json()
        .await
        .expect("create task response should deserialize")
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

#[tokio::test]
async fn create_and_list_tasks() {
    let tempdir = TempDir::new().expect("tempdir should be created");
    let runtime = start_runtime(temp_config(&tempdir))
        .await
        .expect("runtime should start");
    let client = Client::new();
    let session = bootstrap(&client, &runtime).await;
    let base_url = &runtime.launch_context().api_base_url;
    let session_id = create_test_session(&client, base_url, &session.auth_token).await;

    let task = create_task(&client, base_url, &session.auth_token, &session_id, "my task").await;
    let task_id = task["id"].as_str().expect("task id should be present");

    let tasks: Vec<Value> = client
        .get(format!("{base_url}/api/v1/sessions/{session_id}/tasks"))
        .bearer_auth(&session.auth_token)
        .send()
        .await
        .expect("list tasks request should complete")
        .error_for_status()
        .expect("list tasks should return 200")
        .json()
        .await
        .expect("list tasks response should deserialize");

    assert_eq!(tasks.len(), 1, "task list should contain the created task");
    assert_eq!(
        tasks[0]["id"].as_str(),
        Some(task_id),
        "listed task id should match created task"
    );
    assert_eq!(
        tasks[0]["title"].as_str(),
        Some("my task"),
        "listed task title should match"
    );

    runtime.shutdown().await.expect("shutdown should complete cleanly");
}

#[tokio::test]
async fn update_task_status() {
    let tempdir = TempDir::new().expect("tempdir should be created");
    let runtime = start_runtime(temp_config(&tempdir))
        .await
        .expect("runtime should start");
    let client = Client::new();
    let session = bootstrap(&client, &runtime).await;
    let base_url = &runtime.launch_context().api_base_url;
    let session_id = create_test_session(&client, base_url, &session.auth_token).await;

    let task = create_task(&client, base_url, &session.auth_token, &session_id, "work item").await;
    let task_id = task["id"].as_str().expect("task id should be present");

    let updated: Value = client
        .put(format!(
            "{base_url}/api/v1/sessions/{session_id}/tasks/{task_id}"
        ))
        .bearer_auth(&session.auth_token)
        .json(&json!({ "status": "completed" }))
        .send()
        .await
        .expect("update task request should complete")
        .error_for_status()
        .expect("update task should return 200")
        .json()
        .await
        .expect("update task response should deserialize");

    assert_eq!(
        updated["status"].as_str(),
        Some("completed"),
        "updated task status should be 'completed'"
    );

    runtime.shutdown().await.expect("shutdown should complete cleanly");
}

#[tokio::test]
async fn reorder_tasks() {
    let tempdir = TempDir::new().expect("tempdir should be created");
    let runtime = start_runtime(temp_config(&tempdir))
        .await
        .expect("runtime should start");
    let client = Client::new();
    let session = bootstrap(&client, &runtime).await;
    let base_url = &runtime.launch_context().api_base_url;
    let session_id = create_test_session(&client, base_url, &session.auth_token).await;

    let mut ids = Vec::new();
    for title in ["task-1", "task-2", "task-3"] {
        let task = create_task(&client, base_url, &session.auth_token, &session_id, title).await;
        ids.push(task["id"].as_str().expect("task id should be present").to_string());
    }

    // Reorder: reverse the order
    let reorder_status = client
        .post(format!(
            "{base_url}/api/v1/sessions/{session_id}/tasks/reorder"
        ))
        .bearer_auth(&session.auth_token)
        .json(&json!({ "orderedIds": [ids[2], ids[1], ids[0]] }))
        .send()
        .await
        .expect("reorder request should complete")
        .status();
    assert_eq!(
        reorder_status,
        reqwest::StatusCode::NO_CONTENT,
        "reorder tasks should return 204"
    );

    let tasks: Vec<Value> = client
        .get(format!("{base_url}/api/v1/sessions/{session_id}/tasks"))
        .bearer_auth(&session.auth_token)
        .send()
        .await
        .expect("list tasks request should complete")
        .error_for_status()
        .expect("list tasks should return 200")
        .json()
        .await
        .expect("list tasks response should deserialize");

    assert_eq!(
        tasks[0]["id"].as_str(),
        Some(ids[2].as_str()),
        "first task after reorder should be originally the third task"
    );

    runtime.shutdown().await.expect("shutdown should complete cleanly");
}

#[tokio::test]
async fn nested_tasks_with_parent() {
    let tempdir = TempDir::new().expect("tempdir should be created");
    let runtime = start_runtime(temp_config(&tempdir))
        .await
        .expect("runtime should start");
    let client = Client::new();
    let session = bootstrap(&client, &runtime).await;
    let base_url = &runtime.launch_context().api_base_url;
    let session_id = create_test_session(&client, base_url, &session.auth_token).await;

    let parent_task = create_task(
        &client,
        base_url,
        &session.auth_token,
        &session_id,
        "parent task",
    )
    .await;
    let parent_task_id = parent_task["id"].as_str().expect("parent task id should be present");

    let child_task: Value = client
        .post(format!("{base_url}/api/v1/sessions/{session_id}/tasks"))
        .bearer_auth(&session.auth_token)
        .json(&json!({
            "title": "child task",
            "parentTaskId": parent_task_id
        }))
        .send()
        .await
        .expect("create child task request should complete")
        .error_for_status()
        .expect("create child task should return 201")
        .json()
        .await
        .expect("create child task response should deserialize");

    assert_eq!(
        child_task["parentTaskId"].as_str(),
        Some(parent_task_id),
        "child task should reference the parent task id"
    );

    let tasks: Vec<Value> = client
        .get(format!("{base_url}/api/v1/sessions/{session_id}/tasks"))
        .bearer_auth(&session.auth_token)
        .send()
        .await
        .expect("list tasks request should complete")
        .error_for_status()
        .expect("list tasks should return 200")
        .json()
        .await
        .expect("list tasks response should deserialize");

    assert_eq!(tasks.len(), 2, "task list should contain both parent and child tasks");

    runtime.shutdown().await.expect("shutdown should complete cleanly");
}

#[tokio::test]
async fn delete_task() {
    let tempdir = TempDir::new().expect("tempdir should be created");
    let runtime = start_runtime(temp_config(&tempdir))
        .await
        .expect("runtime should start");
    let client = Client::new();
    let session = bootstrap(&client, &runtime).await;
    let base_url = &runtime.launch_context().api_base_url;
    let session_id = create_test_session(&client, base_url, &session.auth_token).await;

    let task = create_task(&client, base_url, &session.auth_token, &session_id, "to delete").await;
    let task_id = task["id"].as_str().expect("task id should be present");

    let delete_status = client
        .delete(format!(
            "{base_url}/api/v1/sessions/{session_id}/tasks/{task_id}"
        ))
        .bearer_auth(&session.auth_token)
        .send()
        .await
        .expect("delete task request should complete")
        .status();
    assert_eq!(
        delete_status,
        reqwest::StatusCode::NO_CONTENT,
        "deleting a task should return 204"
    );

    let tasks: Vec<Value> = client
        .get(format!("{base_url}/api/v1/sessions/{session_id}/tasks"))
        .bearer_auth(&session.auth_token)
        .send()
        .await
        .expect("list tasks request should complete")
        .error_for_status()
        .expect("list tasks should return 200")
        .json()
        .await
        .expect("list tasks response should deserialize");

    assert!(
        tasks.iter().all(|t| t["id"].as_str() != Some(task_id)),
        "deleted task should not appear in the task list"
    );

    runtime.shutdown().await.expect("shutdown should complete cleanly");
}
