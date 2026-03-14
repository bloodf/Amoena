use lunaria_desktop::{start_runtime, BootstrapSession, RuntimeConfig, RuntimeHandle};
use reqwest::Client;
use tempfile::TempDir;
use tokio::time::{sleep, Duration};

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
        .json(&serde_json::json!({ "token": runtime.launch_context().bootstrap_token }))
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
async fn terminal_resize_updates_dimensions() {
    let tempdir = TempDir::new().expect("tempdir should be created");
    let runtime = start_runtime(temp_config(&tempdir))
        .await
        .expect("runtime should start");
    let client = Client::new();
    let bootstrap = bootstrap(&client, &runtime).await;

    let created: serde_json::Value = client
        .post(format!(
            "{}/api/v1/terminal/sessions",
            runtime.launch_context().api_base_url
        ))
        .bearer_auth(&bootstrap.auth_token)
        .json(&serde_json::json!({
            "shell": null,
            "cwd": null,
            "cols": 80,
            "rows": 24
        }))
        .send()
        .await
        .expect("create terminal request should complete")
        .error_for_status()
        .expect("create terminal should return 201")
        .json()
        .await
        .expect("create terminal response should deserialize");

    let terminal_id = created["terminalSessionId"]
        .as_str()
        .expect("terminalSessionId should be a string");

    let resize_status = client
        .post(format!(
            "{}/api/v1/terminal/sessions/{}/resize",
            runtime.launch_context().api_base_url,
            terminal_id
        ))
        .bearer_auth(&bootstrap.auth_token)
        .json(&serde_json::json!({ "cols": 120, "rows": 40 }))
        .send()
        .await
        .expect("resize request should complete")
        .status();

    assert_eq!(resize_status.as_u16(), 204, "resize should return 204 No Content");

    runtime.shutdown().await.expect("shutdown should succeed");
}

#[tokio::test]
async fn terminal_events_since_filters_by_last_id() {
    let tempdir = TempDir::new().expect("tempdir should be created");
    let runtime = start_runtime(temp_config(&tempdir))
        .await
        .expect("runtime should start");
    let client = Client::new();
    let bootstrap = bootstrap(&client, &runtime).await;

    let created: serde_json::Value = client
        .post(format!(
            "{}/api/v1/terminal/sessions",
            runtime.launch_context().api_base_url
        ))
        .bearer_auth(&bootstrap.auth_token)
        .json(&serde_json::json!({
            "shell": null,
            "cwd": null,
            "cols": 80,
            "rows": 24
        }))
        .send()
        .await
        .expect("create terminal request should complete")
        .error_for_status()
        .expect("create terminal should return 201")
        .json()
        .await
        .expect("create terminal response should deserialize");

    let terminal_id = created["terminalSessionId"]
        .as_str()
        .expect("terminalSessionId should be a string");

    client
        .post(format!(
            "{}/api/v1/terminal/sessions/{}/input",
            runtime.launch_context().api_base_url,
            terminal_id
        ))
        .bearer_auth(&bootstrap.auth_token)
        .json(&serde_json::json!({ "data": "echo hello\n" }))
        .send()
        .await
        .expect("first input request should complete")
        .error_for_status()
        .expect("first input should return 204");

    sleep(Duration::from_millis(500)).await;

    let first_events: Vec<serde_json::Value> = client
        .get(format!(
            "{}/api/v1/terminal/sessions/{}/events",
            runtime.launch_context().api_base_url,
            terminal_id
        ))
        .bearer_auth(&bootstrap.auth_token)
        .send()
        .await
        .expect("first events request should complete")
        .error_for_status()
        .expect("first events should succeed")
        .json()
        .await
        .expect("first events should deserialize");

    let max_event_id = first_events
        .iter()
        .filter_map(|e| e["eventId"].as_i64())
        .max()
        .expect("at least one event should have arrived after echo hello");

    client
        .post(format!(
            "{}/api/v1/terminal/sessions/{}/input",
            runtime.launch_context().api_base_url,
            terminal_id
        ))
        .bearer_auth(&bootstrap.auth_token)
        .json(&serde_json::json!({ "data": "echo world\n" }))
        .send()
        .await
        .expect("second input request should complete")
        .error_for_status()
        .expect("second input should return 204");

    sleep(Duration::from_millis(500)).await;

    let new_events: Vec<serde_json::Value> = client
        .get(format!(
            "{}/api/v1/terminal/sessions/{}/events?lastEventId={}",
            runtime.launch_context().api_base_url,
            terminal_id,
            max_event_id
        ))
        .bearer_auth(&bootstrap.auth_token)
        .send()
        .await
        .expect("filtered events request should complete")
        .error_for_status()
        .expect("filtered events should succeed")
        .json()
        .await
        .expect("filtered events should deserialize");

    assert!(
        !new_events.is_empty(),
        "new events should arrive after echo world"
    );
    for event in &new_events {
        let event_id = event["eventId"].as_i64().expect("eventId should be present");
        assert!(
            event_id > max_event_id,
            "all returned events should have eventId > {max_event_id}, got {event_id}"
        );
    }

    runtime.shutdown().await.expect("shutdown should succeed");
}

#[tokio::test]
async fn terminal_close_then_input_returns_error() {
    let tempdir = TempDir::new().expect("tempdir should be created");
    let runtime = start_runtime(temp_config(&tempdir))
        .await
        .expect("runtime should start");
    let client = Client::new();
    let bootstrap = bootstrap(&client, &runtime).await;

    let created: serde_json::Value = client
        .post(format!(
            "{}/api/v1/terminal/sessions",
            runtime.launch_context().api_base_url
        ))
        .bearer_auth(&bootstrap.auth_token)
        .json(&serde_json::json!({
            "shell": null,
            "cwd": null,
            "cols": 80,
            "rows": 24
        }))
        .send()
        .await
        .expect("create terminal request should complete")
        .error_for_status()
        .expect("create terminal should return 201")
        .json()
        .await
        .expect("create terminal response should deserialize");

    let terminal_id = created["terminalSessionId"]
        .as_str()
        .expect("terminalSessionId should be a string");

    client
        .delete(format!(
            "{}/api/v1/terminal/sessions/{}",
            runtime.launch_context().api_base_url,
            terminal_id
        ))
        .bearer_auth(&bootstrap.auth_token)
        .send()
        .await
        .expect("close request should complete")
        .error_for_status()
        .expect("close should return 204");

    let input_response = client
        .post(format!(
            "{}/api/v1/terminal/sessions/{}/input",
            runtime.launch_context().api_base_url,
            terminal_id
        ))
        .bearer_auth(&bootstrap.auth_token)
        .json(&serde_json::json!({ "data": "echo after close\n" }))
        .send()
        .await
        .expect("input-after-close request should complete");

    assert!(
        !input_response.status().is_success(),
        "input to a closed terminal session should return a non-2xx status, got {}",
        input_response.status()
    );

    runtime.shutdown().await.expect("shutdown should succeed");
}

#[tokio::test]
async fn terminal_custom_shell_and_cwd() {
    let tempdir = TempDir::new().expect("tempdir should be created");
    let cwd_path = tempdir.path().to_str().expect("tempdir path should be valid UTF-8").to_string();
    let runtime = start_runtime(temp_config(&tempdir))
        .await
        .expect("runtime should start");
    let client = Client::new();
    let bootstrap = bootstrap(&client, &runtime).await;

    let created: serde_json::Value = client
        .post(format!(
            "{}/api/v1/terminal/sessions",
            runtime.launch_context().api_base_url
        ))
        .bearer_auth(&bootstrap.auth_token)
        .json(&serde_json::json!({
            "shell": "/bin/sh",
            "cwd": cwd_path,
            "cols": 80,
            "rows": 24
        }))
        .send()
        .await
        .expect("create terminal request should complete")
        .error_for_status()
        .expect("create terminal should return 201")
        .json()
        .await
        .expect("create terminal response should deserialize");

    let terminal_id = created["terminalSessionId"]
        .as_str()
        .expect("terminalSessionId should be a string");

    client
        .post(format!(
            "{}/api/v1/terminal/sessions/{}/input",
            runtime.launch_context().api_base_url,
            terminal_id
        ))
        .bearer_auth(&bootstrap.auth_token)
        .json(&serde_json::json!({ "data": "pwd\n" }))
        .send()
        .await
        .expect("pwd input request should complete")
        .error_for_status()
        .expect("pwd input should return 204");

    sleep(Duration::from_millis(500)).await;

    let events: Vec<serde_json::Value> = client
        .get(format!(
            "{}/api/v1/terminal/sessions/{}/events",
            runtime.launch_context().api_base_url,
            terminal_id
        ))
        .bearer_auth(&bootstrap.auth_token)
        .send()
        .await
        .expect("events request should complete")
        .error_for_status()
        .expect("events should succeed")
        .json()
        .await
        .expect("events should deserialize");

    let combined_output: String = events
        .iter()
        .filter_map(|e| e["data"].as_str())
        .collect::<Vec<_>>()
        .join("");

    assert!(
        combined_output.contains(&cwd_path),
        "pwd output should contain the tempdir path '{cwd_path}', got: {combined_output:?}"
    );

    runtime.shutdown().await.expect("shutdown should succeed");
}
