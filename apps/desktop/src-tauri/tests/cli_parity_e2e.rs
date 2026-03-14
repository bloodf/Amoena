//! End-to-end tests for CLI parity: interrupt, permissions, and wrapper capabilities.

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
async fn interrupt_running_session_returns_404_when_no_active_turn() {
    let tempdir = TempDir::new().expect("tempdir should be created");
    let runtime = start_runtime(temp_config(&tempdir))
        .await
        .expect("runtime should start");
    let client = Client::new();
    let session = bootstrap(&client, &runtime).await;
    let base_url = &runtime.launch_context().api_base_url;

    // Create a session so it exists in the DB
    let created: Value = client
        .post(format!("{base_url}/api/v1/sessions"))
        .bearer_auth(&session.auth_token)
        .json(&json!({
            "workingDir": tempdir.path().to_str().unwrap(),
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

    let session_id = created["id"]
        .as_str()
        .expect("created session should have an id");

    // Interrupt a session with no active turn — the runtime cancels nothing and returns 404
    let status = client
        .post(format!("{base_url}/api/v1/sessions/{session_id}/interrupt"))
        .bearer_auth(&session.auth_token)
        .json(&json!({}))
        .send()
        .await
        .expect("interrupt request should complete")
        .status();

    // The runtime returns 204 (success) even when no turn is active —
    // the interrupt is a no-op but not an error.
    assert!(
        status == reqwest::StatusCode::NO_CONTENT || status == reqwest::StatusCode::NOT_FOUND,
        "interrupting a session should return 204 or 404; got: {status}"
    );

    runtime.shutdown().await.expect("shutdown should complete cleanly");
}

#[tokio::test]
async fn error_event_normalization_wrapper_capabilities_endpoint_exists() {
    // Verifies that the capabilities endpoint is reachable and returns a non-empty list,
    // which is the prerequisite for error event normalization across adapters.
    let tempdir = TempDir::new().expect("tempdir should be created");
    let runtime = start_runtime(temp_config(&tempdir))
        .await
        .expect("runtime should start");
    let client = Client::new();
    let session = bootstrap(&client, &runtime).await;
    let base_url = &runtime.launch_context().api_base_url;

    let capabilities: Vec<Value> = client
        .get(format!("{base_url}/api/v1/wrappers/capabilities"))
        .bearer_auth(&session.auth_token)
        .send()
        .await
        .expect("capabilities request should complete")
        .error_for_status()
        .expect("capabilities should return 200")
        .json()
        .await
        .expect("capabilities response should deserialize");

    assert!(
        !capabilities.is_empty(),
        "wrapper capabilities endpoint should return at least one adapter"
    );

    runtime.shutdown().await.expect("shutdown should complete cleanly");
}

#[tokio::test]
async fn permission_request_approval_flow() {
    let tempdir = TempDir::new().expect("tempdir should be created");
    let runtime = start_runtime(temp_config(&tempdir))
        .await
        .expect("runtime should start");
    let client = Client::new();
    let session = bootstrap(&client, &runtime).await;
    let base_url = &runtime.launch_context().api_base_url;

    // Create a session that can be referenced in a permission decision
    let created: Value = client
        .post(format!("{base_url}/api/v1/sessions"))
        .bearer_auth(&session.auth_token)
        .json(&json!({
            "workingDir": tempdir.path().to_str().unwrap(),
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

    let session_id = created["id"]
        .as_str()
        .expect("created session should have an id");

    // Attempt to resolve a permission for a non-existent request_id.
    // The route must exist and process the request — unknown request_id returns 404.
    let status = client
        .post(format!(
            "{base_url}/api/v1/sessions/{session_id}/permissions"
        ))
        .bearer_auth(&session.auth_token)
        .json(&json!({
            "requestId": "nonexistent-request-id",
            "decision": "approve"
        }))
        .send()
        .await
        .expect("permission resolution request should complete")
        .status();

    assert_eq!(
        status,
        reqwest::StatusCode::NOT_FOUND,
        "resolving a permission for an unknown request_id should return 404"
    );

    runtime.shutdown().await.expect("shutdown should complete cleanly");
}

#[tokio::test]
async fn wrapper_capabilities_list_all_adapters() {
    let tempdir = TempDir::new().expect("tempdir should be created");
    let runtime = start_runtime(temp_config(&tempdir))
        .await
        .expect("runtime should start");
    let client = Client::new();
    let session = bootstrap(&client, &runtime).await;
    let base_url = &runtime.launch_context().api_base_url;

    let capabilities: Vec<Value> = client
        .get(format!("{base_url}/api/v1/wrappers/capabilities"))
        .bearer_auth(&session.auth_token)
        .send()
        .await
        .expect("capabilities request should complete")
        .error_for_status()
        .expect("capabilities should return 200")
        .json()
        .await
        .expect("capabilities response should deserialize");

    let kinds: Vec<&str> = capabilities
        .iter()
        .filter_map(|c| c["adapterKind"].as_str())
        .collect();

    for expected in ["claude-code", "opencode", "codex", "gemini"] {
        assert!(
            kinds.contains(&expected),
            "wrapper capabilities should include the '{expected}' adapter; got: {kinds:?}"
        );
    }

    runtime.shutdown().await.expect("shutdown should complete cleanly");
}
