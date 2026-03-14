//! End-to-end tests for session hierarchy (parent/child/tree) routes.

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

async fn create_session(client: &Client, base_url: &str, auth: &str, parent_id: Option<&str>) -> Value {
    let mut body = json!({
        "workingDir": "/tmp",
        "sessionMode": "native",
        "tuiType": "native"
    });
    if let Some(pid) = parent_id {
        body["parentSessionId"] = json!(pid);
    }
    client
        .post(format!("{base_url}/api/v1/sessions"))
        .bearer_auth(auth)
        .json(&body)
        .send()
        .await
        .expect("create session request should complete")
        .error_for_status()
        .expect("create session should return 201")
        .json()
        .await
        .expect("create session response should deserialize")
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

#[tokio::test]
async fn create_child_session() {
    let tempdir = TempDir::new().expect("tempdir should be created");
    let runtime = start_runtime(temp_config(&tempdir))
        .await
        .expect("runtime should start");
    let client = Client::new();
    let session = bootstrap(&client, &runtime).await;
    let base_url = &runtime.launch_context().api_base_url;

    let parent = create_session(&client, base_url, &session.auth_token, None).await;
    let parent_id = parent["id"].as_str().expect("parent id should be present");

    let child = create_session(&client, base_url, &session.auth_token, Some(parent_id)).await;

    assert!(
        child["id"].as_str().is_some(),
        "child session should have an id"
    );

    // Verify child appears in parent's children list
    let children: Vec<Value> = client
        .get(format!("{base_url}/api/v1/sessions/{parent_id}/children"))
        .bearer_auth(&session.auth_token)
        .send()
        .await
        .expect("list children request should complete")
        .error_for_status()
        .expect("list children should return 200")
        .json()
        .await
        .expect("list children response should deserialize");

    let child_id = child["id"].as_str().expect("child id should be present");
    assert!(
        children.iter().any(|c| c["id"].as_str() == Some(child_id)),
        "child session should appear in parent's children list"
    );

    runtime.shutdown().await.expect("shutdown should complete cleanly");
}

#[tokio::test]
async fn list_children_returns_only_direct_children() {
    let tempdir = TempDir::new().expect("tempdir should be created");
    let runtime = start_runtime(temp_config(&tempdir))
        .await
        .expect("runtime should start");
    let client = Client::new();
    let session = bootstrap(&client, &runtime).await;
    let base_url = &runtime.launch_context().api_base_url;

    let parent = create_session(&client, base_url, &session.auth_token, None).await;
    let parent_id = parent["id"].as_str().expect("parent id should be present");

    let child1 = create_session(&client, base_url, &session.auth_token, Some(parent_id)).await;
    let child1_id = child1["id"].as_str().expect("child1 id should be present");

    // Create grandchild under child1
    create_session(&client, base_url, &session.auth_token, Some(child1_id)).await;

    let children: Vec<Value> = client
        .get(format!("{base_url}/api/v1/sessions/{parent_id}/children"))
        .bearer_auth(&session.auth_token)
        .send()
        .await
        .expect("list children request should complete")
        .error_for_status()
        .expect("list children should return 200")
        .json()
        .await
        .expect("list children response should deserialize");

    assert_eq!(
        children.len(),
        1,
        "list children should return only direct children, not grandchildren"
    );
    assert_eq!(
        children[0]["id"].as_str(),
        Some(child1_id),
        "the direct child should be child1"
    );

    runtime.shutdown().await.expect("shutdown should complete cleanly");
}

#[tokio::test]
async fn session_tree_returns_full_hierarchy() {
    let tempdir = TempDir::new().expect("tempdir should be created");
    let runtime = start_runtime(temp_config(&tempdir))
        .await
        .expect("runtime should start");
    let client = Client::new();
    let session = bootstrap(&client, &runtime).await;
    let base_url = &runtime.launch_context().api_base_url;

    let parent = create_session(&client, base_url, &session.auth_token, None).await;
    let parent_id = parent["id"].as_str().expect("parent id should be present");

    let child = create_session(&client, base_url, &session.auth_token, Some(parent_id)).await;
    let child_id = child["id"].as_str().expect("child id should be present");

    create_session(&client, base_url, &session.auth_token, Some(child_id)).await;

    let tree: Value = client
        .get(format!("{base_url}/api/v1/sessions/{parent_id}/tree"))
        .bearer_auth(&session.auth_token)
        .send()
        .await
        .expect("get tree request should complete")
        .error_for_status()
        .expect("get tree should return 200")
        .json()
        .await
        .expect("get tree response should deserialize");

    assert_eq!(
        tree["session"]["id"].as_str(),
        Some(parent_id),
        "tree root should be the parent session"
    );
    let tree_children = tree["children"].as_array().expect("tree should have children array");
    assert_eq!(
        tree_children.len(),
        1,
        "parent tree node should have one direct child"
    );
    assert_eq!(
        tree_children[0]["session"]["id"].as_str(),
        Some(child_id),
        "child in tree should be the direct child"
    );
    let grandchildren = tree_children[0]["children"]
        .as_array()
        .expect("child node should have children array");
    assert_eq!(
        grandchildren.len(),
        1,
        "child tree node should have one grandchild"
    );

    runtime.shutdown().await.expect("shutdown should complete cleanly");
}

#[tokio::test]
async fn child_session_has_parent_reference() {
    let tempdir = TempDir::new().expect("tempdir should be created");
    let runtime = start_runtime(temp_config(&tempdir))
        .await
        .expect("runtime should start");
    let client = Client::new();
    let session = bootstrap(&client, &runtime).await;
    let base_url = &runtime.launch_context().api_base_url;

    let parent = create_session(&client, base_url, &session.auth_token, None).await;
    let parent_id = parent["id"].as_str().expect("parent id should be present");

    let child = create_session(&client, base_url, &session.auth_token, Some(parent_id)).await;

    // The create response should reflect the session's data; verify child appears in children list
    // (SessionSummary doesn't expose parentSessionId, but we can verify via the children route)
    let children: Vec<Value> = client
        .get(format!("{base_url}/api/v1/sessions/{parent_id}/children"))
        .bearer_auth(&session.auth_token)
        .send()
        .await
        .expect("list children request should complete")
        .error_for_status()
        .expect("list children should return 200")
        .json()
        .await
        .expect("list children response should deserialize");

    let child_id = child["id"].as_str().expect("child id should be present");
    assert!(
        children.iter().any(|c| c["id"].as_str() == Some(child_id)),
        "child should appear under the parent's children — confirming the parent reference is stored"
    );

    runtime.shutdown().await.expect("shutdown should complete cleanly");
}

#[tokio::test]
async fn list_children_empty_for_leaf() {
    let tempdir = TempDir::new().expect("tempdir should be created");
    let runtime = start_runtime(temp_config(&tempdir))
        .await
        .expect("runtime should start");
    let client = Client::new();
    let session = bootstrap(&client, &runtime).await;
    let base_url = &runtime.launch_context().api_base_url;

    let parent = create_session(&client, base_url, &session.auth_token, None).await;
    let parent_id = parent["id"].as_str().expect("parent id should be present");

    let leaf = create_session(&client, base_url, &session.auth_token, Some(parent_id)).await;
    let leaf_id = leaf["id"].as_str().expect("leaf id should be present");

    let children: Vec<Value> = client
        .get(format!("{base_url}/api/v1/sessions/{leaf_id}/children"))
        .bearer_auth(&session.auth_token)
        .send()
        .await
        .expect("list children request should complete")
        .error_for_status()
        .expect("list children should return 200")
        .json()
        .await
        .expect("list children response should deserialize");

    assert!(
        children.is_empty(),
        "a leaf session with no children should return an empty children list"
    );

    runtime.shutdown().await.expect("shutdown should complete cleanly");
}
