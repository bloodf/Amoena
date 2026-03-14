//! End-to-end tests for hook management routes.

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

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

#[tokio::test]
async fn hook_list_returns_registered_hooks() {
    let tempdir = TempDir::new().expect("tempdir should be created");
    let runtime = start_runtime(temp_config(&tempdir))
        .await
        .expect("runtime should start");
    let client = Client::new();
    let session = bootstrap(&client, &runtime).await;
    let base_url = &runtime.launch_context().api_base_url;

    // Register a hook
    let register_status = client
        .post(format!("{base_url}/api/v1/hooks"))
        .bearer_auth(&session.auth_token)
        .json(&json!({
            "eventName": "SessionStart",
            "handlerType": "command",
            "handlerConfig": { "command": "echo hello" }
        }))
        .send()
        .await
        .expect("register hook request should complete")
        .status();
    assert_eq!(
        register_status,
        reqwest::StatusCode::CREATED,
        "registering a hook should return 201"
    );

    // List hooks — the registered hook should appear
    let hooks: Vec<Value> = client
        .get(format!("{base_url}/api/v1/hooks"))
        .bearer_auth(&session.auth_token)
        .send()
        .await
        .expect("list hooks request should complete")
        .error_for_status()
        .expect("list hooks should return 200")
        .json()
        .await
        .expect("list hooks response should deserialize");

    assert!(
        !hooks.is_empty(),
        "hook list should contain the registered hook"
    );
    assert_eq!(
        hooks[0]["eventName"].as_str(),
        Some("SessionStart"),
        "registered hook should have the correct eventName"
    );

    runtime.shutdown().await.expect("shutdown should complete cleanly");
}

#[tokio::test]
async fn hook_register_and_fire() {
    let tempdir = TempDir::new().expect("tempdir should be created");
    let runtime = start_runtime(temp_config(&tempdir))
        .await
        .expect("runtime should start");
    let client = Client::new();
    let session = bootstrap(&client, &runtime).await;
    let base_url = &runtime.launch_context().api_base_url;

    // Register an echo hook
    client
        .post(format!("{base_url}/api/v1/hooks"))
        .bearer_auth(&session.auth_token)
        .json(&json!({
            "eventName": "UserPromptSubmit",
            "handlerType": "command",
            "handlerConfig": { "command": "echo hook-fired" }
        }))
        .send()
        .await
        .expect("register hook request should complete")
        .error_for_status()
        .expect("register hook should return 201");

    // Fire the hook event
    let results: Vec<Value> = client
        .post(format!("{base_url}/api/v1/hooks/fire"))
        .bearer_auth(&session.auth_token)
        .json(&json!({
            "event": "UserPromptSubmit",
            "payload": { "content": "hello" }
        }))
        .send()
        .await
        .expect("fire hook request should complete")
        .error_for_status()
        .expect("fire hook should return 200")
        .json()
        .await
        .expect("fire hook response should deserialize");

    assert!(
        !results.is_empty(),
        "fire hook should return at least one invocation result"
    );
    assert_eq!(
        results[0]["status"].as_str(),
        Some("ok"),
        "hook invocation should succeed"
    );
    assert!(
        results[0]["output"]
            .as_str()
            .unwrap_or("")
            .contains("hook-fired"),
        "hook output should contain the echo output"
    );

    runtime.shutdown().await.expect("shutdown should complete cleanly");
}

#[tokio::test]
async fn hook_delete_removes_hook() {
    let tempdir = TempDir::new().expect("tempdir should be created");
    let runtime = start_runtime(temp_config(&tempdir))
        .await
        .expect("runtime should start");
    let client = Client::new();
    let session = bootstrap(&client, &runtime).await;
    let base_url = &runtime.launch_context().api_base_url;

    // Register a hook
    client
        .post(format!("{base_url}/api/v1/hooks"))
        .bearer_auth(&session.auth_token)
        .json(&json!({
            "eventName": "SessionEnd",
            "handlerType": "command",
            "handlerConfig": { "command": "echo test" }
        }))
        .send()
        .await
        .expect("register hook request should complete")
        .error_for_status()
        .expect("register hook should succeed");

    // List hooks to get the hook ID
    let hooks: Vec<Value> = client
        .get(format!("{base_url}/api/v1/hooks"))
        .bearer_auth(&session.auth_token)
        .send()
        .await
        .expect("list hooks request should complete")
        .error_for_status()
        .expect("list hooks should succeed")
        .json()
        .await
        .expect("list hooks response should deserialize");

    let hook_id = hooks[0]["id"]
        .as_str()
        .expect("registered hook should have an id");

    // Delete the hook
    let delete_status = client
        .delete(format!("{base_url}/api/v1/hooks/{hook_id}"))
        .bearer_auth(&session.auth_token)
        .send()
        .await
        .expect("delete hook request should complete")
        .status();
    assert_eq!(
        delete_status,
        reqwest::StatusCode::NO_CONTENT,
        "deleting a hook should return 204"
    );

    // Verify the hook is gone
    let hooks_after: Vec<Value> = client
        .get(format!("{base_url}/api/v1/hooks"))
        .bearer_auth(&session.auth_token)
        .send()
        .await
        .expect("list hooks request should complete")
        .error_for_status()
        .expect("list hooks should succeed")
        .json()
        .await
        .expect("list hooks response should deserialize");

    assert!(
        hooks_after.iter().all(|h| h["id"].as_str() != Some(hook_id)),
        "deleted hook should no longer appear in the hook list"
    );

    runtime.shutdown().await.expect("shutdown should complete cleanly");
}

#[tokio::test]
async fn hook_fire_unknown_event_returns_400() {
    let tempdir = TempDir::new().expect("tempdir should be created");
    let runtime = start_runtime(temp_config(&tempdir))
        .await
        .expect("runtime should start");
    let client = Client::new();
    let session = bootstrap(&client, &runtime).await;
    let base_url = &runtime.launch_context().api_base_url;

    let status = client
        .post(format!("{base_url}/api/v1/hooks/fire"))
        .bearer_auth(&session.auth_token)
        .json(&json!({ "event": "NonExistentEvent" }))
        .send()
        .await
        .expect("fire hook request should complete")
        .status();

    assert_eq!(
        status,
        reqwest::StatusCode::BAD_REQUEST,
        "firing an unknown event should return 400"
    );

    runtime.shutdown().await.expect("shutdown should complete cleanly");
}
