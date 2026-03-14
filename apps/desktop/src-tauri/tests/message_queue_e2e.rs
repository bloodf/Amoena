//! End-to-end tests for message queue API routes.

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

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

#[tokio::test]
async fn enqueue_and_list_messages() {
    let tempdir = TempDir::new().expect("tempdir should be created");
    let runtime = start_runtime(temp_config(&tempdir))
        .await
        .expect("runtime should start");
    let client = Client::new();
    let session = bootstrap(&client, &runtime).await;
    let base_url = &runtime.launch_context().api_base_url;
    let session_id = create_test_session(&client, base_url, &session.auth_token).await;

    let enqueue_status = client
        .post(format!("{base_url}/api/v1/sessions/{session_id}/queue"))
        .bearer_auth(&session.auth_token)
        .json(&json!({ "content": "hello world" }))
        .send()
        .await
        .expect("enqueue request should complete")
        .status();
    assert_eq!(
        enqueue_status,
        reqwest::StatusCode::CREATED,
        "enqueue should return 201"
    );

    let messages: Vec<Value> = client
        .get(format!("{base_url}/api/v1/sessions/{session_id}/queue"))
        .bearer_auth(&session.auth_token)
        .send()
        .await
        .expect("list queue request should complete")
        .error_for_status()
        .expect("list queue should return 200")
        .json()
        .await
        .expect("list queue response should deserialize");

    assert_eq!(messages.len(), 1, "queue should contain the enqueued message");
    assert_eq!(
        messages[0]["content"].as_str(),
        Some("hello world"),
        "enqueued message content should match"
    );

    runtime.shutdown().await.expect("shutdown should complete cleanly");
}

#[tokio::test]
async fn app_queue_reorder_succeeds() {
    let tempdir = TempDir::new().expect("tempdir should be created");
    let runtime = start_runtime(temp_config(&tempdir))
        .await
        .expect("runtime should start");
    let client = Client::new();
    let session = bootstrap(&client, &runtime).await;
    let base_url = &runtime.launch_context().api_base_url;
    let session_id = create_test_session(&client, base_url, &session.auth_token).await;

    // Enqueue two app-type messages
    let mut ids = Vec::new();
    for content in ["first", "second"] {
        let msg: Value = client
            .post(format!("{base_url}/api/v1/sessions/{session_id}/queue"))
            .bearer_auth(&session.auth_token)
            .json(&json!({ "content": content, "queueType": "app" }))
            .send()
            .await
            .expect("enqueue request should complete")
            .error_for_status()
            .expect("enqueue should succeed")
            .json()
            .await
            .expect("enqueue response should deserialize");
        ids.push(msg["id"].as_str().expect("id should be present").to_string());
    }

    // Reorder: reverse
    let reorder_status = client
        .post(format!(
            "{base_url}/api/v1/sessions/{session_id}/queue/reorder"
        ))
        .bearer_auth(&session.auth_token)
        .json(&json!({ "orderedIds": [ids[1], ids[0]] }))
        .send()
        .await
        .expect("reorder request should complete")
        .status();
    assert_eq!(
        reorder_status,
        reqwest::StatusCode::NO_CONTENT,
        "reorder of app messages should return 204"
    );

    // Verify order reversed
    let messages: Vec<Value> = client
        .get(format!("{base_url}/api/v1/sessions/{session_id}/queue"))
        .bearer_auth(&session.auth_token)
        .send()
        .await
        .expect("list queue request should complete")
        .error_for_status()
        .expect("list queue should succeed")
        .json()
        .await
        .expect("list queue response should deserialize");

    assert_eq!(
        messages[0]["id"].as_str(),
        Some(ids[1].as_str()),
        "first message after reorder should be the originally second message"
    );

    runtime.shutdown().await.expect("shutdown should complete cleanly");
}

#[tokio::test]
async fn cli_queue_reorder_rejected() {
    let tempdir = TempDir::new().expect("tempdir should be created");
    let runtime = start_runtime(temp_config(&tempdir))
        .await
        .expect("runtime should start");
    let client = Client::new();
    let session = bootstrap(&client, &runtime).await;
    let base_url = &runtime.launch_context().api_base_url;
    let session_id = create_test_session(&client, base_url, &session.auth_token).await;

    // Enqueue a cli-type message
    let msg: Value = client
        .post(format!("{base_url}/api/v1/sessions/{session_id}/queue"))
        .bearer_auth(&session.auth_token)
        .json(&json!({ "content": "cli message", "queueType": "cli" }))
        .send()
        .await
        .expect("enqueue request should complete")
        .error_for_status()
        .expect("enqueue should succeed")
        .json()
        .await
        .expect("enqueue response should deserialize");
    let msg_id = msg["id"].as_str().expect("id should be present").to_string();

    // Attempt reorder — should be rejected with 403
    let status = client
        .post(format!(
            "{base_url}/api/v1/sessions/{session_id}/queue/reorder"
        ))
        .bearer_auth(&session.auth_token)
        .json(&json!({ "orderedIds": [msg_id] }))
        .send()
        .await
        .expect("reorder request should complete")
        .status();
    assert_eq!(
        status,
        reqwest::StatusCode::FORBIDDEN,
        "reordering a queue containing cli messages should return 403"
    );

    runtime.shutdown().await.expect("shutdown should complete cleanly");
}

#[tokio::test]
async fn edit_queued_message() {
    let tempdir = TempDir::new().expect("tempdir should be created");
    let runtime = start_runtime(temp_config(&tempdir))
        .await
        .expect("runtime should start");
    let client = Client::new();
    let session = bootstrap(&client, &runtime).await;
    let base_url = &runtime.launch_context().api_base_url;
    let session_id = create_test_session(&client, base_url, &session.auth_token).await;

    let msg: Value = client
        .post(format!("{base_url}/api/v1/sessions/{session_id}/queue"))
        .bearer_auth(&session.auth_token)
        .json(&json!({ "content": "original content" }))
        .send()
        .await
        .expect("enqueue request should complete")
        .error_for_status()
        .expect("enqueue should succeed")
        .json()
        .await
        .expect("enqueue response should deserialize");
    let msg_id = msg["id"].as_str().expect("id should be present");

    let updated: Value = client
        .put(format!(
            "{base_url}/api/v1/sessions/{session_id}/queue/{msg_id}"
        ))
        .bearer_auth(&session.auth_token)
        .json(&json!({ "content": "updated content" }))
        .send()
        .await
        .expect("edit request should complete")
        .error_for_status()
        .expect("edit should return 200")
        .json()
        .await
        .expect("edit response should deserialize");

    assert_eq!(
        updated["content"].as_str(),
        Some("updated content"),
        "edited message content should reflect the update"
    );

    runtime.shutdown().await.expect("shutdown should complete cleanly");
}

#[tokio::test]
async fn remove_queued_message() {
    let tempdir = TempDir::new().expect("tempdir should be created");
    let runtime = start_runtime(temp_config(&tempdir))
        .await
        .expect("runtime should start");
    let client = Client::new();
    let session = bootstrap(&client, &runtime).await;
    let base_url = &runtime.launch_context().api_base_url;
    let session_id = create_test_session(&client, base_url, &session.auth_token).await;

    let msg: Value = client
        .post(format!("{base_url}/api/v1/sessions/{session_id}/queue"))
        .bearer_auth(&session.auth_token)
        .json(&json!({ "content": "to be removed" }))
        .send()
        .await
        .expect("enqueue request should complete")
        .error_for_status()
        .expect("enqueue should succeed")
        .json()
        .await
        .expect("enqueue response should deserialize");
    let msg_id = msg["id"].as_str().expect("id should be present");

    let delete_status = client
        .delete(format!(
            "{base_url}/api/v1/sessions/{session_id}/queue/{msg_id}"
        ))
        .bearer_auth(&session.auth_token)
        .send()
        .await
        .expect("delete request should complete")
        .status();
    assert_eq!(
        delete_status,
        reqwest::StatusCode::NO_CONTENT,
        "deleting a queued message should return 204"
    );

    let messages: Vec<Value> = client
        .get(format!("{base_url}/api/v1/sessions/{session_id}/queue"))
        .bearer_auth(&session.auth_token)
        .send()
        .await
        .expect("list queue request should complete")
        .error_for_status()
        .expect("list queue should succeed")
        .json()
        .await
        .expect("list queue response should deserialize");

    assert!(
        messages.iter().all(|m| m["id"].as_str() != Some(msg_id)),
        "deleted message should not appear in queue list"
    );

    runtime.shutdown().await.expect("shutdown should complete cleanly");
}

#[tokio::test]
async fn flush_sends_next_message() {
    let tempdir = TempDir::new().expect("tempdir should be created");
    let runtime = start_runtime(temp_config(&tempdir))
        .await
        .expect("runtime should start");
    let client = Client::new();
    let session = bootstrap(&client, &runtime).await;
    let base_url = &runtime.launch_context().api_base_url;
    let session_id = create_test_session(&client, base_url, &session.auth_token).await;

    // Enqueue two messages
    let first: Value = client
        .post(format!("{base_url}/api/v1/sessions/{session_id}/queue"))
        .bearer_auth(&session.auth_token)
        .json(&json!({ "content": "first" }))
        .send()
        .await
        .expect("enqueue first request should complete")
        .error_for_status()
        .expect("enqueue first should succeed")
        .json()
        .await
        .expect("enqueue first response should deserialize");
    let first_id = first["id"].as_str().expect("first id should be present");

    client
        .post(format!("{base_url}/api/v1/sessions/{session_id}/queue"))
        .bearer_auth(&session.auth_token)
        .json(&json!({ "content": "second" }))
        .send()
        .await
        .expect("enqueue second request should complete")
        .error_for_status()
        .expect("enqueue second should succeed");

    // Flush — should return the first pending message as processing
    let flushed: Value = client
        .post(format!(
            "{base_url}/api/v1/sessions/{session_id}/queue/flush"
        ))
        .bearer_auth(&session.auth_token)
        .send()
        .await
        .expect("flush request should complete")
        .error_for_status()
        .expect("flush should return 200")
        .json()
        .await
        .expect("flush response should deserialize");

    assert_eq!(
        flushed["id"].as_str(),
        Some(first_id),
        "flush should return the first enqueued message"
    );
    assert_eq!(
        flushed["status"].as_str(),
        Some("processing"),
        "flushed message should have status 'processing'"
    );

    runtime.shutdown().await.expect("shutdown should complete cleanly");
}

#[tokio::test]
async fn queue_preserves_order_after_edits() {
    let tempdir = TempDir::new().expect("tempdir should be created");
    let runtime = start_runtime(temp_config(&tempdir))
        .await
        .expect("runtime should start");
    let client = Client::new();
    let session = bootstrap(&client, &runtime).await;
    let base_url = &runtime.launch_context().api_base_url;
    let session_id = create_test_session(&client, base_url, &session.auth_token).await;

    let msg: Value = client
        .post(format!("{base_url}/api/v1/sessions/{session_id}/queue"))
        .bearer_auth(&session.auth_token)
        .json(&json!({ "content": "original" }))
        .send()
        .await
        .expect("enqueue request should complete")
        .error_for_status()
        .expect("enqueue should succeed")
        .json()
        .await
        .expect("enqueue response should deserialize");
    let msg_id = msg["id"].as_str().expect("id should be present");
    let original_order_index = msg["orderIndex"].as_i64().expect("orderIndex should be present");

    let updated: Value = client
        .put(format!(
            "{base_url}/api/v1/sessions/{session_id}/queue/{msg_id}"
        ))
        .bearer_auth(&session.auth_token)
        .json(&json!({ "content": "edited content" }))
        .send()
        .await
        .expect("edit request should complete")
        .error_for_status()
        .expect("edit should succeed")
        .json()
        .await
        .expect("edit response should deserialize");

    assert_eq!(
        updated["orderIndex"].as_i64(),
        Some(original_order_index),
        "editing a message should not change its order_index"
    );

    runtime.shutdown().await.expect("shutdown should complete cleanly");
}

#[tokio::test]
async fn enqueue_assigns_incrementing_order() {
    let tempdir = TempDir::new().expect("tempdir should be created");
    let runtime = start_runtime(temp_config(&tempdir))
        .await
        .expect("runtime should start");
    let client = Client::new();
    let session = bootstrap(&client, &runtime).await;
    let base_url = &runtime.launch_context().api_base_url;
    let session_id = create_test_session(&client, base_url, &session.auth_token).await;

    let mut order_indices = Vec::new();
    for content in ["msg-a", "msg-b", "msg-c"] {
        let msg: Value = client
            .post(format!("{base_url}/api/v1/sessions/{session_id}/queue"))
            .bearer_auth(&session.auth_token)
            .json(&json!({ "content": content }))
            .send()
            .await
            .expect("enqueue request should complete")
            .error_for_status()
            .expect("enqueue should succeed")
            .json()
            .await
            .expect("enqueue response should deserialize");
        let idx = msg["orderIndex"].as_i64().expect("orderIndex should be present");
        order_indices.push(idx);
    }

    assert!(
        order_indices[0] < order_indices[1] && order_indices[1] < order_indices[2],
        "order indices should be strictly increasing; got {:?}",
        order_indices
    );

    runtime.shutdown().await.expect("shutdown should complete cleanly");
}
