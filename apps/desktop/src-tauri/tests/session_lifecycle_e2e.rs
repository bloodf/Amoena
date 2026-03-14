use std::path::PathBuf;

use lunaria_desktop::{start_runtime, BootstrapSession, EventEnvelope, RuntimeConfig, RuntimeHandle};
use reqwest::Client;
use tempfile::TempDir;
use tokio::time::{sleep, timeout, Duration};

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

fn repo_root() -> PathBuf {
    PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .join("..")
        .join("..")
        .join("..")
}

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

async fn wait_for_transcript<F>(
    client: &Client,
    runtime: &RuntimeHandle,
    auth_token: &str,
    session_id: &str,
    predicate: F,
) -> Vec<EventEnvelope>
where
    F: Fn(&[EventEnvelope]) -> bool,
{
    timeout(Duration::from_secs(10), async {
        loop {
            let transcript: Vec<EventEnvelope> = client
                .get(format!(
                    "{}/api/v1/sessions/{session_id}/transcript",
                    runtime.launch_context().api_base_url
                ))
                .bearer_auth(auth_token)
                .send()
                .await
                .expect("transcript request should complete")
                .error_for_status()
                .expect("transcript request should succeed")
                .json()
                .await
                .expect("transcript response should deserialize");

            if predicate(&transcript) {
                return transcript;
            }

            sleep(Duration::from_millis(50)).await;
        }
    })
    .await
    .expect("timed out waiting for transcript state")
}

fn cli_available(name: &str) -> bool {
    std::process::Command::new("which")
        .arg(name)
        .output()
        .map(|o| o.status.success())
        .unwrap_or(false)
}

fn api_key_available(var: &str) -> bool {
    std::env::var(var)
        .map(|v| !v.is_empty())
        .unwrap_or(false)
}

// ---------------------------------------------------------------------------
// 1. Health endpoint
// ---------------------------------------------------------------------------

#[tokio::test]
async fn health_endpoint_returns_ok() {
    let tempdir = TempDir::new().expect("tempdir should be created");
    let runtime = start_runtime(temp_config(&tempdir))
        .await
        .expect("runtime should start");

    let response: serde_json::Value = reqwest::get(format!(
        "{}/health",
        runtime.launch_context().api_base_url
    ))
    .await
    .expect("health request should complete")
    .error_for_status()
    .expect("health endpoint should return 200")
    .json()
    .await
    .expect("health response should deserialize");

    assert_eq!(
        response["status"].as_str(),
        Some("ok"),
        "health status should be ok"
    );
    assert_eq!(
        response["appName"].as_str(),
        Some("Lunaria"),
        "health response should report Lunaria app name"
    );
    assert!(
        response["instanceId"].as_str().is_some_and(|id| !id.is_empty()),
        "health response should include a non-empty instanceId"
    );

    runtime.shutdown().await.expect("shutdown should complete cleanly");
}

// ---------------------------------------------------------------------------
// 2. Bootstrap auth succeeds with valid token
// ---------------------------------------------------------------------------

#[tokio::test]
async fn bootstrap_auth_succeeds_with_valid_token() {
    let tempdir = TempDir::new().expect("tempdir should be created");
    let runtime = start_runtime(temp_config(&tempdir))
        .await
        .expect("runtime should start");

    let launch = runtime.launch_context().clone();
    let session: serde_json::Value = reqwest::Client::new()
        .post(format!("{}{}", launch.api_base_url, launch.bootstrap_path))
        .json(&serde_json::json!({ "token": launch.bootstrap_token }))
        .send()
        .await
        .expect("bootstrap request should complete")
        .error_for_status()
        .expect("bootstrap should succeed with valid token")
        .json()
        .await
        .expect("bootstrap response should deserialize");

    assert!(
        session["authToken"].as_str().is_some_and(|t| !t.is_empty()),
        "bootstrap should return a non-empty authToken"
    );
    assert_eq!(
        session["apiBaseUrl"].as_str(),
        Some(launch.api_base_url.as_str()),
        "bootstrap should return the correct apiBaseUrl"
    );
    assert_eq!(
        session["instanceId"].as_str(),
        Some(launch.instance_id.as_str()),
        "bootstrap should return the correct instanceId"
    );

    runtime.shutdown().await.expect("shutdown should complete cleanly");
}

// ---------------------------------------------------------------------------
// 3. Bootstrap auth fails with wrong token
// ---------------------------------------------------------------------------

#[tokio::test]
async fn bootstrap_auth_fails_with_wrong_token() {
    let tempdir = TempDir::new().expect("tempdir should be created");
    let runtime = start_runtime(temp_config(&tempdir))
        .await
        .expect("runtime should start");

    let status = reqwest::Client::new()
        .post(format!(
            "{}{}",
            runtime.launch_context().api_base_url,
            runtime.launch_context().bootstrap_path
        ))
        .json(&serde_json::json!({ "token": "definitely-wrong-token" }))
        .send()
        .await
        .expect("bootstrap request should complete")
        .status();

    assert_eq!(
        status,
        reqwest::StatusCode::UNAUTHORIZED,
        "wrong bootstrap token should return 401"
    );

    runtime.shutdown().await.expect("shutdown should complete cleanly");
}

// ---------------------------------------------------------------------------
// 4. Bootstrap token is consumed on second attempt
// ---------------------------------------------------------------------------

#[tokio::test]
async fn bootstrap_auth_consumed_on_second_attempt() {
    let tempdir = TempDir::new().expect("tempdir should be created");
    let runtime = start_runtime(temp_config(&tempdir))
        .await
        .expect("runtime should start");

    let launch = runtime.launch_context().clone();
    let bootstrap_url = format!("{}{}", launch.api_base_url, launch.bootstrap_path);
    let client = reqwest::Client::new();

    // First call should succeed
    client
        .post(&bootstrap_url)
        .json(&serde_json::json!({ "token": launch.bootstrap_token }))
        .send()
        .await
        .expect("first bootstrap request should complete")
        .error_for_status()
        .expect("first bootstrap should succeed");

    // Second call with the same token should be rejected
    let second_status = client
        .post(&bootstrap_url)
        .json(&serde_json::json!({ "token": launch.bootstrap_token }))
        .send()
        .await
        .expect("second bootstrap request should complete")
        .status();

    assert_eq!(
        second_status,
        reqwest::StatusCode::UNAUTHORIZED,
        "bootstrap token should be consumed after first use"
    );

    runtime.shutdown().await.expect("shutdown should complete cleanly");
}

// ---------------------------------------------------------------------------
// 5. Full session lifecycle: create → message → delete → verify archived
// ---------------------------------------------------------------------------

#[tokio::test]
async fn full_session_lifecycle_create_message_delete() {
    let tempdir = TempDir::new().expect("tempdir should be created");
    let runtime = start_runtime(temp_config(&tempdir))
        .await
        .expect("runtime should start");
    let client = Client::new();
    let bootstrap = bootstrap(&client, &runtime).await;

    // Create session
    let created: serde_json::Value = client
        .post(format!("{}/api/v1/sessions", runtime.launch_context().api_base_url))
        .bearer_auth(&bootstrap.auth_token)
        .json(&serde_json::json!({
            "workingDir": tempdir.path().display().to_string(),
            "sessionMode": "native",
            "tuiType": "native"
        }))
        .send()
        .await
        .expect("create session request should complete")
        .error_for_status()
        .expect("create session should succeed")
        .json()
        .await
        .expect("create session response should deserialize");

    let session_id = created["id"].as_str().expect("session id should exist").to_string();
    assert_eq!(
        created["status"].as_str(),
        Some("created"),
        "newly created session should have status 'created'"
    );

    // Send message
    let message_response = client
        .post(format!(
            "{}/api/v1/sessions/{session_id}/messages",
            runtime.launch_context().api_base_url
        ))
        .bearer_auth(&bootstrap.auth_token)
        .json(&serde_json::json!({ "content": "lifecycle test message" }))
        .send()
        .await
        .expect("send message request should complete");

    assert_eq!(
        message_response.status(),
        reqwest::StatusCode::CREATED,
        "send message should return 201"
    );

    // Wait for message.created in transcript
    wait_for_transcript(
        &client,
        &runtime,
        &bootstrap.auth_token,
        &session_id,
        |events| events.iter().any(|e| e.event_type == "message.created"),
    )
    .await;

    // Delete session
    let delete_status = client
        .delete(format!(
            "{}/api/v1/sessions/{session_id}",
            runtime.launch_context().api_base_url
        ))
        .bearer_auth(&bootstrap.auth_token)
        .send()
        .await
        .expect("delete session request should complete")
        .status();

    assert_eq!(
        delete_status,
        reqwest::StatusCode::NO_CONTENT,
        "delete session should return 204"
    );

    // Verify archived (not in list)
    let sessions: Vec<serde_json::Value> = client
        .get(format!("{}/api/v1/sessions", runtime.launch_context().api_base_url))
        .bearer_auth(&bootstrap.auth_token)
        .send()
        .await
        .expect("list sessions request should complete")
        .error_for_status()
        .expect("list sessions should succeed")
        .json()
        .await
        .expect("sessions list should deserialize");

    assert!(
        !sessions.iter().any(|s| s["id"].as_str() == Some(session_id.as_str())),
        "deleted session should not appear in session list"
    );

    runtime.shutdown().await.expect("shutdown should complete cleanly");
}

// ---------------------------------------------------------------------------
// 6. Session creates with default native mode
// ---------------------------------------------------------------------------

#[tokio::test]
async fn session_creates_with_default_native_mode() {
    let tempdir = TempDir::new().expect("tempdir should be created");
    let runtime = start_runtime(temp_config(&tempdir))
        .await
        .expect("runtime should start");
    let client = Client::new();
    let bootstrap = bootstrap(&client, &runtime).await;

    let created: serde_json::Value = client
        .post(format!("{}/api/v1/sessions", runtime.launch_context().api_base_url))
        .bearer_auth(&bootstrap.auth_token)
        .json(&serde_json::json!({
            "workingDir": tempdir.path().display().to_string()
        }))
        .send()
        .await
        .expect("create session request should complete")
        .error_for_status()
        .expect("create session should succeed")
        .json()
        .await
        .expect("create session response should deserialize");

    assert_eq!(
        created["sessionMode"].as_str(),
        Some("native"),
        "session should default to native mode when sessionMode is omitted"
    );

    runtime.shutdown().await.expect("shutdown should complete cleanly");
}

// ---------------------------------------------------------------------------
// 7. Session creates with explicit provider and model
// ---------------------------------------------------------------------------

#[tokio::test]
async fn session_creates_with_explicit_provider_and_model() {
    let tempdir = TempDir::new().expect("tempdir should be created");
    let runtime = start_runtime(temp_config(&tempdir))
        .await
        .expect("runtime should start");
    let client = Client::new();
    let bootstrap = bootstrap(&client, &runtime).await;

    let created: serde_json::Value = client
        .post(format!("{}/api/v1/sessions", runtime.launch_context().api_base_url))
        .bearer_auth(&bootstrap.auth_token)
        .json(&serde_json::json!({
            "workingDir": tempdir.path().display().to_string(),
            "sessionMode": "native",
            "tuiType": "native",
            "providerId": "anthropic",
            "modelId": "claude-sonnet-4-20250514"
        }))
        .send()
        .await
        .expect("create session request should complete")
        .error_for_status()
        .expect("create session should succeed")
        .json()
        .await
        .expect("create session response should deserialize");

    assert_eq!(
        created["providerId"].as_str(),
        Some("anthropic"),
        "session record should preserve providerId"
    );
    assert_eq!(
        created["modelId"].as_str(),
        Some("claude-sonnet-4-20250514"),
        "session record should preserve modelId"
    );

    runtime.shutdown().await.expect("shutdown should complete cleanly");
}

// ---------------------------------------------------------------------------
// 8. Session message creates transcript events
// ---------------------------------------------------------------------------

#[tokio::test]
async fn session_message_creates_transcript_events() {
    let tempdir = TempDir::new().expect("tempdir should be created");
    let runtime = start_runtime(temp_config(&tempdir))
        .await
        .expect("runtime should start");
    let client = Client::new();
    let bootstrap = bootstrap(&client, &runtime).await;

    let created: serde_json::Value = client
        .post(format!("{}/api/v1/sessions", runtime.launch_context().api_base_url))
        .bearer_auth(&bootstrap.auth_token)
        .json(&serde_json::json!({
            "workingDir": tempdir.path().display().to_string(),
            "sessionMode": "native",
            "tuiType": "native"
        }))
        .send()
        .await
        .expect("create session request should complete")
        .error_for_status()
        .expect("create session should succeed")
        .json()
        .await
        .expect("create session response should deserialize");
    let session_id = created["id"].as_str().expect("session id should exist").to_string();

    client
        .post(format!(
            "{}/api/v1/sessions/{session_id}/messages",
            runtime.launch_context().api_base_url
        ))
        .bearer_auth(&bootstrap.auth_token)
        .json(&serde_json::json!({ "content": "event transcript test" }))
        .send()
        .await
        .expect("send message request should complete")
        .error_for_status()
        .expect("send message should succeed");

    let transcript = wait_for_transcript(
        &client,
        &runtime,
        &bootstrap.auth_token,
        &session_id,
        |events| events.iter().any(|e| e.event_type == "message.created"),
    )
    .await;

    let message_event = transcript
        .iter()
        .find(|e| e.event_type == "message.created")
        .expect("transcript should contain message.created event");

    assert_eq!(
        message_event.session_id.as_deref(),
        Some(session_id.as_str()),
        "message.created event should carry the correct sessionId"
    );
    assert_eq!(
        message_event.payload["content"].as_str(),
        Some("event transcript test"),
        "message.created event payload should include message content"
    );

    runtime.shutdown().await.expect("shutdown should complete cleanly");
}

// ---------------------------------------------------------------------------
// 9. Transcript replay returns all events in chronological order
// ---------------------------------------------------------------------------

#[tokio::test]
async fn session_transcript_replay_returns_all_events() {
    let tempdir = TempDir::new().expect("tempdir should be created");
    let runtime = start_runtime(temp_config(&tempdir))
        .await
        .expect("runtime should start");
    let client = Client::new();
    let bootstrap = bootstrap(&client, &runtime).await;

    let created: serde_json::Value = client
        .post(format!("{}/api/v1/sessions", runtime.launch_context().api_base_url))
        .bearer_auth(&bootstrap.auth_token)
        .json(&serde_json::json!({
            "workingDir": tempdir.path().display().to_string(),
            "sessionMode": "native",
            "tuiType": "native"
        }))
        .send()
        .await
        .expect("create session request should complete")
        .error_for_status()
        .expect("create session should succeed")
        .json()
        .await
        .expect("create session response should deserialize");
    let session_id = created["id"].as_str().expect("session id should exist").to_string();

    // Send two messages sequentially
    for content in ["first message", "second message"] {
        client
            .post(format!(
                "{}/api/v1/sessions/{session_id}/messages",
                runtime.launch_context().api_base_url
            ))
            .bearer_auth(&bootstrap.auth_token)
            .json(&serde_json::json!({ "content": content }))
            .send()
            .await
            .expect("send message request should complete")
            .error_for_status()
            .expect("send message should succeed");

        sleep(Duration::from_millis(10)).await;
    }

    // Wait until both messages appear in transcript
    let transcript = wait_for_transcript(
        &client,
        &runtime,
        &bootstrap.auth_token,
        &session_id,
        |events| {
            events
                .iter()
                .filter(|e| e.event_type == "message.created")
                .count()
                >= 2
        },
    )
    .await;

    let event_types: Vec<&str> = transcript.iter().map(|e| e.event_type.as_str()).collect();
    assert!(event_types.contains(&"session.created"), "transcript should contain session.created");
    assert!(event_types.contains(&"agent.spawned"), "transcript should contain agent.spawned");
    assert!(
        transcript
            .iter()
            .filter(|e| e.event_type == "message.created")
            .count()
            >= 2,
        "transcript should contain at least 2 message.created events"
    );

    // Verify chronological order
    let timestamps: Vec<&str> = transcript
        .iter()
        .map(|e| e.occurred_at.as_str())
        .collect();
    let mut sorted = timestamps.clone();
    sorted.sort();
    assert_eq!(
        timestamps, sorted,
        "transcript events should be ordered chronologically"
    );

    runtime.shutdown().await.expect("shutdown should complete cleanly");
}

// ---------------------------------------------------------------------------
// 10. Session deletion archives but transcript remains readable
// ---------------------------------------------------------------------------

#[tokio::test]
async fn session_deletion_archives_not_destroys() {
    let tempdir = TempDir::new().expect("tempdir should be created");
    let runtime = start_runtime(temp_config(&tempdir))
        .await
        .expect("runtime should start");
    let client = Client::new();
    let bootstrap = bootstrap(&client, &runtime).await;

    let created: serde_json::Value = client
        .post(format!("{}/api/v1/sessions", runtime.launch_context().api_base_url))
        .bearer_auth(&bootstrap.auth_token)
        .json(&serde_json::json!({
            "workingDir": tempdir.path().display().to_string(),
            "sessionMode": "native",
            "tuiType": "native"
        }))
        .send()
        .await
        .expect("create session request should complete")
        .error_for_status()
        .expect("create session should succeed")
        .json()
        .await
        .expect("create session response should deserialize");
    let session_id = created["id"].as_str().expect("session id should exist").to_string();

    client
        .post(format!(
            "{}/api/v1/sessions/{session_id}/messages",
            runtime.launch_context().api_base_url
        ))
        .bearer_auth(&bootstrap.auth_token)
        .json(&serde_json::json!({ "content": "message before archive" }))
        .send()
        .await
        .expect("send message request should complete")
        .error_for_status()
        .expect("send message should succeed");

    // Wait for message.created before deleting
    wait_for_transcript(
        &client,
        &runtime,
        &bootstrap.auth_token,
        &session_id,
        |events| events.iter().any(|e| e.event_type == "message.created"),
    )
    .await;

    // Delete (archive) the session
    client
        .delete(format!(
            "{}/api/v1/sessions/{session_id}",
            runtime.launch_context().api_base_url
        ))
        .bearer_auth(&bootstrap.auth_token)
        .send()
        .await
        .expect("delete session request should complete")
        .error_for_status()
        .expect("delete session should succeed");

    // Transcript should still be readable
    let transcript: Vec<EventEnvelope> = client
        .get(format!(
            "{}/api/v1/sessions/{session_id}/transcript",
            runtime.launch_context().api_base_url
        ))
        .bearer_auth(&bootstrap.auth_token)
        .send()
        .await
        .expect("transcript request after archive should complete")
        .error_for_status()
        .expect("transcript should remain accessible after archive")
        .json()
        .await
        .expect("transcript response should deserialize");

    assert!(
        transcript.iter().any(|e| e.event_type == "message.created"),
        "archived session transcript should still contain message.created events"
    );

    runtime.shutdown().await.expect("shutdown should complete cleanly");
}

// ---------------------------------------------------------------------------
// 11. Multiple concurrent sessions with no cross-contamination
// ---------------------------------------------------------------------------

#[tokio::test]
async fn multiple_concurrent_sessions_no_cross_contamination() {
    let tempdir = TempDir::new().expect("tempdir should be created");
    let runtime = start_runtime(temp_config(&tempdir))
        .await
        .expect("runtime should start");
    let client = Client::new();
    let bootstrap = bootstrap(&client, &runtime).await;

    // Create 3 sessions concurrently
    let sessions: Vec<serde_json::Value> = futures_util::future::join_all((0..3).map(|_| {
        let client = client.clone();
        let url = format!("{}/api/v1/sessions", runtime.launch_context().api_base_url);
        let token = bootstrap.auth_token.clone();
        let workdir = tempdir.path().display().to_string();
        async move {
            client
                .post(url)
                .bearer_auth(token)
                .json(&serde_json::json!({
                    "workingDir": workdir,
                    "sessionMode": "native",
                    "tuiType": "native"
                }))
                .send()
                .await
                .expect("create session request should complete")
                .error_for_status()
                .expect("create session should succeed")
                .json::<serde_json::Value>()
                .await
                .expect("create session response should deserialize")
        }
    }))
    .await;

    let ids: Vec<String> = sessions
        .iter()
        .map(|s| s["id"].as_str().expect("session id should exist").to_string())
        .collect();

    // Send unique messages to each session
    let unique_messages: Vec<String> = (0..3)
        .map(|i| format!("unique-content-for-session-{i}"))
        .collect();

    for (session_id, message) in ids.iter().zip(unique_messages.iter()) {
        client
            .post(format!(
                "{}/api/v1/sessions/{session_id}/messages",
                runtime.launch_context().api_base_url
            ))
            .bearer_auth(&bootstrap.auth_token)
            .json(&serde_json::json!({ "content": message }))
            .send()
            .await
            .expect("send message request should complete")
            .error_for_status()
            .expect("send message should succeed");
    }

    // Verify each session only contains its own message
    for (i, session_id) in ids.iter().enumerate() {
        let expected = &unique_messages[i];
        let others: Vec<&String> = unique_messages
            .iter()
            .enumerate()
            .filter(|(j, _)| *j != i)
            .map(|(_, m)| m)
            .collect();

        let transcript = wait_for_transcript(
            &client,
            &runtime,
            &bootstrap.auth_token,
            session_id,
            |events| events.iter().any(|e| e.event_type == "message.created"),
        )
        .await;

        let message_events: Vec<&EventEnvelope> = transcript
            .iter()
            .filter(|e| e.event_type == "message.created")
            .collect();

        assert!(
            message_events
                .iter()
                .any(|e| e.payload["content"].as_str() == Some(expected.as_str())),
            "session {i} transcript should contain its own message"
        );

        for other in others {
            assert!(
                !message_events
                    .iter()
                    .any(|e| e.payload["content"].as_str() == Some(other.as_str())),
                "session {i} transcript should not contain messages from other sessions"
            );
        }
    }

    runtime.shutdown().await.expect("shutdown should complete cleanly");
}

// ---------------------------------------------------------------------------
// 12. Wrapper session with mock: full flow
// ---------------------------------------------------------------------------

#[tokio::test]
async fn wrapper_session_with_mock_full_flow() {
    let tempdir = TempDir::new().expect("tempdir should be created");
    let runtime = start_runtime(temp_config(&tempdir))
        .await
        .expect("runtime should start");
    let client = Client::new();
    let bootstrap = bootstrap(&client, &runtime).await;

    let session: serde_json::Value = client
        .post(format!("{}/api/v1/sessions", runtime.launch_context().api_base_url))
        .bearer_auth(&bootstrap.auth_token)
        .json(&serde_json::json!({
            "workingDir": tempdir.path().display().to_string(),
            "sessionMode": "wrapper",
            "tuiType": "claude-code",
            "metadata": {
                "wrapper": {
                    "executable": "bun",
                    "args": [repo_root()
                        .join("apps/desktop/wrapper-mocks/claude.ts")
                        .display()
                        .to_string()]
                }
            }
        }))
        .send()
        .await
        .expect("create wrapper session request should complete")
        .error_for_status()
        .expect("create wrapper session should succeed")
        .json()
        .await
        .expect("create wrapper session response should deserialize");
    let session_id = session["id"].as_str().expect("session id should exist").to_string();

    client
        .post(format!(
            "{}/api/v1/sessions/{session_id}/messages",
            runtime.launch_context().api_base_url
        ))
        .bearer_auth(&bootstrap.auth_token)
        .json(&serde_json::json!({ "content": "hello wrapper" }))
        .send()
        .await
        .expect("send message request should complete")
        .error_for_status()
        .expect("send message should succeed");

    let transcript = wait_for_transcript(
        &client,
        &runtime,
        &bootstrap.auth_token,
        &session_id,
        |events| {
            let types: Vec<&str> = events.iter().map(|e| e.event_type.as_str()).collect();
            types.contains(&"message.delta")
                && types.contains(&"message.complete")
                && types.contains(&"usage")
        },
    )
    .await;

    assert!(
        transcript.iter().any(|e| e.event_type == "message.delta"),
        "transcript should contain message.delta events from mock"
    );
    assert!(
        transcript.iter().any(|e| {
            e.event_type == "message.complete"
                && e.payload["content"].as_str() == Some("hello wrapper")
        }),
        "message.complete should echo mock output"
    );
    assert!(
        transcript.iter().any(|e| e.event_type == "usage"),
        "transcript should contain a usage event"
    );

    runtime.shutdown().await.expect("shutdown should complete cleanly");
}

// ---------------------------------------------------------------------------
// 13. Wrapper session interrupt
// ---------------------------------------------------------------------------

#[tokio::test]
async fn wrapper_session_interrupt() {
    let tempdir = TempDir::new().expect("tempdir should be created");
    let runtime = start_runtime(temp_config(&tempdir))
        .await
        .expect("runtime should start");
    let client = Client::new();
    let bootstrap = bootstrap(&client, &runtime).await;

    let session: serde_json::Value = client
        .post(format!("{}/api/v1/sessions", runtime.launch_context().api_base_url))
        .bearer_auth(&bootstrap.auth_token)
        .json(&serde_json::json!({
            "workingDir": tempdir.path().display().to_string(),
            "sessionMode": "wrapper",
            "tuiType": "claude-code",
            "metadata": {
                "wrapper": {
                    "executable": "bun",
                    "args": [repo_root()
                        .join("apps/desktop/wrapper-mocks/claude.ts")
                        .display()
                        .to_string()]
                }
            }
        }))
        .send()
        .await
        .expect("create wrapper session request should complete")
        .error_for_status()
        .expect("create wrapper session should succeed")
        .json()
        .await
        .expect("create wrapper session response should deserialize");
    let session_id = session["id"].as_str().expect("session id should exist").to_string();

    client
        .post(format!(
            "{}/api/v1/sessions/{session_id}/messages",
            runtime.launch_context().api_base_url
        ))
        .bearer_auth(&bootstrap.auth_token)
        .json(&serde_json::json!({ "content": "slow: long message" }))
        .send()
        .await
        .expect("send slow message request should complete")
        .error_for_status()
        .expect("send slow message should succeed");

    client
        .post(format!(
            "{}/api/v1/sessions/{session_id}/interrupt",
            runtime.launch_context().api_base_url
        ))
        .bearer_auth(&bootstrap.auth_token)
        .send()
        .await
        .expect("interrupt request should complete")
        .error_for_status()
        .expect("interrupt request should succeed");

    let transcript = wait_for_transcript(
        &client,
        &runtime,
        &bootstrap.auth_token,
        &session_id,
        |events| events.iter().any(|e| e.event_type == "error"),
    )
    .await;

    let error_event = transcript
        .iter()
        .find(|e| e.event_type == "error")
        .expect("interrupted session should emit an error event");
    assert_eq!(
        error_event.payload["code"].as_str(),
        Some("cancelled"),
        "interrupt should produce error event with code 'cancelled'"
    );

    runtime.shutdown().await.expect("shutdown should complete cleanly");
}

// ---------------------------------------------------------------------------
// 14. Session list excludes archived sessions
// ---------------------------------------------------------------------------

#[tokio::test]
async fn session_list_excludes_archived() {
    let tempdir = TempDir::new().expect("tempdir should be created");
    let runtime = start_runtime(temp_config(&tempdir))
        .await
        .expect("runtime should start");
    let client = Client::new();
    let bootstrap = bootstrap(&client, &runtime).await;

    // Create two sessions
    let first: serde_json::Value = client
        .post(format!("{}/api/v1/sessions", runtime.launch_context().api_base_url))
        .bearer_auth(&bootstrap.auth_token)
        .json(&serde_json::json!({
            "workingDir": tempdir.path().display().to_string(),
            "sessionMode": "native",
            "tuiType": "native"
        }))
        .send()
        .await
        .expect("create first session request should complete")
        .error_for_status()
        .expect("create first session should succeed")
        .json()
        .await
        .expect("create first session response should deserialize");
    let first_id = first["id"].as_str().expect("first session id should exist").to_string();

    let second: serde_json::Value = client
        .post(format!("{}/api/v1/sessions", runtime.launch_context().api_base_url))
        .bearer_auth(&bootstrap.auth_token)
        .json(&serde_json::json!({
            "workingDir": tempdir.path().display().to_string(),
            "sessionMode": "native",
            "tuiType": "native"
        }))
        .send()
        .await
        .expect("create second session request should complete")
        .error_for_status()
        .expect("create second session should succeed")
        .json()
        .await
        .expect("create second session response should deserialize");
    let second_id = second["id"].as_str().expect("second session id should exist").to_string();

    // Delete first session
    client
        .delete(format!(
            "{}/api/v1/sessions/{first_id}",
            runtime.launch_context().api_base_url
        ))
        .bearer_auth(&bootstrap.auth_token)
        .send()
        .await
        .expect("delete session request should complete")
        .error_for_status()
        .expect("delete session should succeed");

    // List sessions — only second should appear
    let sessions: Vec<serde_json::Value> = client
        .get(format!("{}/api/v1/sessions", runtime.launch_context().api_base_url))
        .bearer_auth(&bootstrap.auth_token)
        .send()
        .await
        .expect("list sessions request should complete")
        .error_for_status()
        .expect("list sessions should succeed")
        .json()
        .await
        .expect("sessions list should deserialize");

    assert_eq!(
        sessions.len(),
        1,
        "session list should contain exactly one session after archiving the other"
    );
    assert_eq!(
        sessions[0]["id"].as_str(),
        Some(second_id.as_str()),
        "remaining session should be the non-deleted one"
    );

    runtime.shutdown().await.expect("shutdown should complete cleanly");
}

// ---------------------------------------------------------------------------
// 15. Autopilot toggle and events
// ---------------------------------------------------------------------------

#[tokio::test]
async fn autopilot_toggle_and_events() {
    let tempdir = TempDir::new().expect("tempdir should be created");
    let runtime = start_runtime(temp_config(&tempdir))
        .await
        .expect("runtime should start");
    let client = Client::new();
    let bootstrap = bootstrap(&client, &runtime).await;

    let created: serde_json::Value = client
        .post(format!("{}/api/v1/sessions", runtime.launch_context().api_base_url))
        .bearer_auth(&bootstrap.auth_token)
        .json(&serde_json::json!({
            "workingDir": tempdir.path().display().to_string(),
            "sessionMode": "native",
            "tuiType": "native"
        }))
        .send()
        .await
        .expect("create session request should complete")
        .error_for_status()
        .expect("create session should succeed")
        .json()
        .await
        .expect("create session response should deserialize");
    let session_id = created["id"].as_str().expect("session id should exist").to_string();

    // Enable autopilot
    let enabled_response: serde_json::Value = client
        .post(format!(
            "{}/api/v1/sessions/{session_id}/autopilot",
            runtime.launch_context().api_base_url
        ))
        .bearer_auth(&bootstrap.auth_token)
        .json(&serde_json::json!({ "enabled": true }))
        .send()
        .await
        .expect("enable autopilot request should complete")
        .error_for_status()
        .expect("enable autopilot should succeed")
        .json()
        .await
        .expect("enable autopilot response should deserialize");

    assert_eq!(
        enabled_response["metadata"]["autopilot"].as_bool(),
        Some(true),
        "enable autopilot response should reflect autopilot: true in metadata"
    );

    // Wait for autopilot.phase event with enabled: true
    let transcript_on = wait_for_transcript(
        &client,
        &runtime,
        &bootstrap.auth_token,
        &session_id,
        |events| {
            events.iter().any(|e| {
                e.event_type == "autopilot.phase"
                    && e.payload["enabled"].as_bool() == Some(true)
            })
        },
    )
    .await;

    assert!(
        transcript_on.iter().any(|e| {
            e.event_type == "autopilot.phase" && e.payload["enabled"].as_bool() == Some(true)
        }),
        "transcript should contain autopilot.phase event with enabled: true"
    );

    // Disable autopilot
    client
        .post(format!(
            "{}/api/v1/sessions/{session_id}/autopilot",
            runtime.launch_context().api_base_url
        ))
        .bearer_auth(&bootstrap.auth_token)
        .json(&serde_json::json!({ "enabled": false }))
        .send()
        .await
        .expect("disable autopilot request should complete")
        .error_for_status()
        .expect("disable autopilot should succeed");

    // Wait for autopilot.phase event with enabled: false
    let transcript_off = wait_for_transcript(
        &client,
        &runtime,
        &bootstrap.auth_token,
        &session_id,
        |events| {
            events.iter().any(|e| {
                e.event_type == "autopilot.phase"
                    && e.payload["enabled"].as_bool() == Some(false)
            })
        },
    )
    .await;

    assert!(
        transcript_off.iter().any(|e| {
            e.event_type == "autopilot.phase" && e.payload["enabled"].as_bool() == Some(false)
        }),
        "transcript should contain autopilot.phase event with enabled: false after disabling"
    );

    runtime.shutdown().await.expect("shutdown should complete cleanly");
}

// ---------------------------------------------------------------------------
// 16. Real CLI: full session lifecycle  [ignored — requires live Claude CLI]
// ---------------------------------------------------------------------------

#[tokio::test]
#[ignore]
async fn real_cli_full_session_lifecycle() {
    if !cli_available("claude") || !api_key_available("ANTHROPIC_API_KEY") {
        println!("skipping: claude CLI or ANTHROPIC_API_KEY not available");
        return;
    }

    let tempdir = TempDir::new().expect("tempdir should be created");
    let runtime = start_runtime(temp_config(&tempdir))
        .await
        .expect("runtime should start");
    let client = Client::new();
    let bootstrap = bootstrap(&client, &runtime).await;

    let session: serde_json::Value = client
        .post(format!("{}/api/v1/sessions", runtime.launch_context().api_base_url))
        .bearer_auth(&bootstrap.auth_token)
        .json(&serde_json::json!({
            "workingDir": tempdir.path().display().to_string(),
            "sessionMode": "wrapper",
            "tuiType": "claude-code",
            "metadata": {
                "wrapper": {
                    "executable": "claude",
                    "args": ["--print"]
                }
            }
        }))
        .send()
        .await
        .expect("create session request should complete")
        .error_for_status()
        .expect("create session should succeed")
        .json()
        .await
        .expect("create session response should deserialize");
    let session_id = session["id"].as_str().expect("session id should exist").to_string();

    client
        .post(format!(
            "{}/api/v1/sessions/{session_id}/messages",
            runtime.launch_context().api_base_url
        ))
        .bearer_auth(&bootstrap.auth_token)
        .json(&serde_json::json!({
            "content": "Reply with exactly: LIFECYCLE_TEST"
        }))
        .send()
        .await
        .expect("send message request should complete")
        .error_for_status()
        .expect("send message should succeed");

    let transcript = timeout(Duration::from_secs(60), async {
        loop {
            let transcript: Vec<EventEnvelope> = client
                .get(format!(
                    "{}/api/v1/sessions/{session_id}/transcript",
                    runtime.launch_context().api_base_url
                ))
                .bearer_auth(&bootstrap.auth_token)
                .send()
                .await
                .expect("transcript request should complete")
                .error_for_status()
                .expect("transcript should succeed")
                .json()
                .await
                .expect("transcript should deserialize");

            if transcript.iter().any(|e| e.event_type == "message.complete") {
                return transcript;
            }

            sleep(Duration::from_millis(500)).await;
        }
    })
    .await
    .expect("real CLI should complete within 60 seconds");

    let complete_event = transcript
        .iter()
        .find(|e| e.event_type == "message.complete")
        .expect("transcript should contain message.complete");

    let response_content = complete_event.payload["content"]
        .as_str()
        .unwrap_or_default();
    assert!(
        response_content.contains("LIFECYCLE_TEST"),
        "real CLI response should contain LIFECYCLE_TEST, got: {response_content}"
    );
    assert!(
        transcript.iter().any(|e| e.event_type == "usage"),
        "real CLI session should emit a usage event"
    );

    // Archive
    client
        .delete(format!(
            "{}/api/v1/sessions/{session_id}",
            runtime.launch_context().api_base_url
        ))
        .bearer_auth(&bootstrap.auth_token)
        .send()
        .await
        .expect("delete request should complete")
        .error_for_status()
        .expect("delete should succeed");

    let sessions: Vec<serde_json::Value> = client
        .get(format!("{}/api/v1/sessions", runtime.launch_context().api_base_url))
        .bearer_auth(&bootstrap.auth_token)
        .send()
        .await
        .expect("list sessions request should complete")
        .error_for_status()
        .expect("list sessions should succeed")
        .json()
        .await
        .expect("sessions list should deserialize");

    assert!(
        !sessions.iter().any(|s| s["id"].as_str() == Some(session_id.as_str())),
        "deleted real CLI session should not appear in session list"
    );

    runtime.shutdown().await.expect("shutdown should complete cleanly");
}

// ---------------------------------------------------------------------------
// 17. Real CLI: conversation with memory  [ignored — requires live Claude CLI]
// ---------------------------------------------------------------------------

#[tokio::test]
#[ignore]
async fn real_cli_conversation_with_memory() {
    if !cli_available("claude") || !api_key_available("ANTHROPIC_API_KEY") {
        println!("skipping: claude CLI or ANTHROPIC_API_KEY not available");
        return;
    }

    let tempdir = TempDir::new().expect("tempdir should be created");
    let runtime = start_runtime(temp_config(&tempdir))
        .await
        .expect("runtime should start");
    let client = Client::new();
    let bootstrap = bootstrap(&client, &runtime).await;

    let session: serde_json::Value = client
        .post(format!("{}/api/v1/sessions", runtime.launch_context().api_base_url))
        .bearer_auth(&bootstrap.auth_token)
        .json(&serde_json::json!({
            "workingDir": tempdir.path().display().to_string(),
            "sessionMode": "wrapper",
            "tuiType": "claude-code",
            "metadata": {
                "wrapper": {
                    "executable": "claude",
                    "args": ["--print"]
                }
            }
        }))
        .send()
        .await
        .expect("create session request should complete")
        .error_for_status()
        .expect("create session should succeed")
        .json()
        .await
        .expect("create session response should deserialize");
    let session_id = session["id"].as_str().expect("session id should exist").to_string();

    client
        .post(format!(
            "{}/api/v1/sessions/{session_id}/messages",
            runtime.launch_context().api_base_url
        ))
        .bearer_auth(&bootstrap.auth_token)
        .json(&serde_json::json!({
            "content": "My name is TestUser and I work on the Lunaria project"
        }))
        .send()
        .await
        .expect("send message request should complete")
        .error_for_status()
        .expect("send message should succeed");

    // Wait for response
    timeout(Duration::from_secs(60), async {
        loop {
            let transcript: Vec<EventEnvelope> = client
                .get(format!(
                    "{}/api/v1/sessions/{session_id}/transcript",
                    runtime.launch_context().api_base_url
                ))
                .bearer_auth(&bootstrap.auth_token)
                .send()
                .await
                .expect("transcript request should complete")
                .error_for_status()
                .expect("transcript should succeed")
                .json()
                .await
                .expect("transcript should deserialize");

            if transcript.iter().any(|e| e.event_type == "message.complete") {
                return;
            }

            sleep(Duration::from_millis(500)).await;
        }
    })
    .await
    .expect("real CLI should respond within 60 seconds");

    // Check session memory for captured observations
    let memory: serde_json::Value = client
        .get(format!(
            "{}/api/v1/sessions/{session_id}/memory",
            runtime.launch_context().api_base_url
        ))
        .bearer_auth(&bootstrap.auth_token)
        .send()
        .await
        .expect("session memory request should complete")
        .error_for_status()
        .expect("session memory should succeed")
        .json()
        .await
        .expect("session memory should deserialize");

    let entries = memory["entries"]
        .as_array()
        .expect("memory entries should be an array");
    assert!(
        !entries.is_empty(),
        "session memory should contain at least one observation after introduction message"
    );

    runtime.shutdown().await.expect("shutdown should complete cleanly");
}

// ---------------------------------------------------------------------------
// 18. Real CLI: multi-turn conversation  [ignored — requires live Claude CLI]
// ---------------------------------------------------------------------------

#[tokio::test]
#[ignore]
async fn real_cli_multi_turn_conversation() {
    if !cli_available("claude") || !api_key_available("ANTHROPIC_API_KEY") {
        println!("skipping: claude CLI or ANTHROPIC_API_KEY not available");
        return;
    }

    let tempdir = TempDir::new().expect("tempdir should be created");
    let runtime = start_runtime(temp_config(&tempdir))
        .await
        .expect("runtime should start");
    let client = Client::new();
    let bootstrap = bootstrap(&client, &runtime).await;

    let session: serde_json::Value = client
        .post(format!("{}/api/v1/sessions", runtime.launch_context().api_base_url))
        .bearer_auth(&bootstrap.auth_token)
        .json(&serde_json::json!({
            "workingDir": tempdir.path().display().to_string(),
            "sessionMode": "wrapper",
            "tuiType": "claude-code",
            "metadata": {
                "wrapper": {
                    "executable": "claude",
                    "args": ["--print"]
                }
            }
        }))
        .send()
        .await
        .expect("create session request should complete")
        .error_for_status()
        .expect("create session should succeed")
        .json()
        .await
        .expect("create session response should deserialize");
    let session_id = session["id"].as_str().expect("session id should exist").to_string();

    // First turn
    client
        .post(format!(
            "{}/api/v1/sessions/{session_id}/messages",
            runtime.launch_context().api_base_url
        ))
        .bearer_auth(&bootstrap.auth_token)
        .json(&serde_json::json!({ "content": "My favorite color is blue. Acknowledge this." }))
        .send()
        .await
        .expect("first message request should complete")
        .error_for_status()
        .expect("first message should succeed");

    // Wait for first response
    timeout(Duration::from_secs(60), async {
        loop {
            let transcript: Vec<EventEnvelope> = client
                .get(format!(
                    "{}/api/v1/sessions/{session_id}/transcript",
                    runtime.launch_context().api_base_url
                ))
                .bearer_auth(&bootstrap.auth_token)
                .send()
                .await
                .expect("transcript request should complete")
                .error_for_status()
                .expect("transcript should succeed")
                .json()
                .await
                .expect("transcript should deserialize");

            if transcript.iter().any(|e| e.event_type == "message.complete") {
                return;
            }

            sleep(Duration::from_millis(500)).await;
        }
    })
    .await
    .expect("first real CLI turn should complete within 60 seconds");

    // Second turn referencing the first
    client
        .post(format!(
            "{}/api/v1/sessions/{session_id}/messages",
            runtime.launch_context().api_base_url
        ))
        .bearer_auth(&bootstrap.auth_token)
        .json(&serde_json::json!({
            "content": "What color did I mention in my previous message?"
        }))
        .send()
        .await
        .expect("second message request should complete")
        .error_for_status()
        .expect("second message should succeed");

    // Wait for second response
    let transcript = timeout(Duration::from_secs(60), async {
        loop {
            let transcript: Vec<EventEnvelope> = client
                .get(format!(
                    "{}/api/v1/sessions/{session_id}/transcript",
                    runtime.launch_context().api_base_url
                ))
                .bearer_auth(&bootstrap.auth_token)
                .send()
                .await
                .expect("transcript request should complete")
                .error_for_status()
                .expect("transcript should succeed")
                .json()
                .await
                .expect("transcript should deserialize");

            if transcript
                .iter()
                .filter(|e| e.event_type == "message.complete")
                .count()
                >= 2
            {
                return transcript;
            }

            sleep(Duration::from_millis(500)).await;
        }
    })
    .await
    .expect("second real CLI turn should complete within 60 seconds");

    let user_messages: Vec<&EventEnvelope> = transcript
        .iter()
        .filter(|e| e.event_type == "message.created")
        .collect();
    let completions: Vec<&EventEnvelope> = transcript
        .iter()
        .filter(|e| e.event_type == "message.complete")
        .collect();

    assert!(
        user_messages.len() >= 2,
        "transcript should contain at least 2 user message.created events"
    );
    assert!(
        completions.len() >= 2,
        "transcript should contain at least 2 message.complete events"
    );

    runtime.shutdown().await.expect("shutdown should complete cleanly");
}

// ---------------------------------------------------------------------------
// 19. Real CLI: extended thinking session  [ignored — requires live Claude CLI]
// ---------------------------------------------------------------------------

#[tokio::test]
#[ignore]
async fn real_cli_extended_thinking_session() {
    if !cli_available("claude") || !api_key_available("ANTHROPIC_API_KEY") {
        println!("skipping: claude CLI or ANTHROPIC_API_KEY not available");
        return;
    }

    let tempdir = TempDir::new().expect("tempdir should be created");
    let runtime = start_runtime(temp_config(&tempdir))
        .await
        .expect("runtime should start");
    let client = Client::new();
    let bootstrap = bootstrap(&client, &runtime).await;

    let session: serde_json::Value = client
        .post(format!("{}/api/v1/sessions", runtime.launch_context().api_base_url))
        .bearer_auth(&bootstrap.auth_token)
        .json(&serde_json::json!({
            "workingDir": tempdir.path().display().to_string(),
            "sessionMode": "wrapper",
            "tuiType": "claude-code",
            "metadata": {
                "wrapper": {
                    "executable": "claude",
                    "args": ["--print", "--thinking"]
                }
            }
        }))
        .send()
        .await
        .expect("create session request should complete")
        .error_for_status()
        .expect("create session should succeed")
        .json()
        .await
        .expect("create session response should deserialize");
    let session_id = session["id"].as_str().expect("session id should exist").to_string();

    client
        .post(format!(
            "{}/api/v1/sessions/{session_id}/messages",
            runtime.launch_context().api_base_url
        ))
        .bearer_auth(&bootstrap.auth_token)
        .json(&serde_json::json!({
            "content": "Think step by step: what is 13 * 17?"
        }))
        .send()
        .await
        .expect("send message request should complete")
        .error_for_status()
        .expect("send message should succeed");

    let transcript = timeout(Duration::from_secs(90), async {
        loop {
            let transcript: Vec<EventEnvelope> = client
                .get(format!(
                    "{}/api/v1/sessions/{session_id}/transcript",
                    runtime.launch_context().api_base_url
                ))
                .bearer_auth(&bootstrap.auth_token)
                .send()
                .await
                .expect("transcript request should complete")
                .error_for_status()
                .expect("transcript should succeed")
                .json()
                .await
                .expect("transcript should deserialize");

            if transcript.iter().any(|e| e.event_type == "message.complete") {
                return transcript;
            }

            sleep(Duration::from_millis(500)).await;
        }
    })
    .await
    .expect("extended thinking session should complete within 90 seconds");

    assert!(
        transcript.iter().any(|e| e.event_type == "message.complete"),
        "extended thinking session should emit message.complete event"
    );

    runtime.shutdown().await.expect("shutdown should complete cleanly");
}

// ---------------------------------------------------------------------------
// 20. Terminal session lifecycle
// ---------------------------------------------------------------------------

#[tokio::test]
async fn terminal_session_lifecycle() {
    let tempdir = TempDir::new().expect("tempdir should be created");
    let runtime = start_runtime(temp_config(&tempdir))
        .await
        .expect("runtime should start");
    let client = Client::new();
    let bootstrap = bootstrap(&client, &runtime).await;

    // Create terminal session
    let created: serde_json::Value = client
        .post(format!(
            "{}/api/v1/terminal/sessions",
            runtime.launch_context().api_base_url
        ))
        .bearer_auth(&bootstrap.auth_token)
        .json(&serde_json::json!({
            "cwd": tempdir.path().display().to_string()
        }))
        .send()
        .await
        .expect("create terminal session request should complete")
        .error_for_status()
        .expect("create terminal session should succeed")
        .json()
        .await
        .expect("create terminal session response should deserialize");

    let terminal_id = created["terminalSessionId"]
        .as_str()
        .expect("terminal session id should exist")
        .to_string();

    // Send input to terminal
    client
        .post(format!(
            "{}/api/v1/terminal/sessions/{terminal_id}/input",
            runtime.launch_context().api_base_url
        ))
        .bearer_auth(&bootstrap.auth_token)
        .json(&serde_json::json!({ "data": "echo hello\n" }))
        .send()
        .await
        .expect("terminal input request should complete")
        .error_for_status()
        .expect("terminal input should succeed");

    // Give terminal time to process
    sleep(Duration::from_millis(100)).await;

    // List terminal events
    let events: serde_json::Value = client
        .get(format!(
            "{}/api/v1/terminal/sessions/{terminal_id}/events",
            runtime.launch_context().api_base_url
        ))
        .bearer_auth(&bootstrap.auth_token)
        .send()
        .await
        .expect("terminal events request should complete")
        .error_for_status()
        .expect("terminal events should succeed")
        .json()
        .await
        .expect("terminal events response should deserialize");

    assert!(
        events.as_array().is_some(),
        "terminal events should return an array"
    );

    // Close terminal session
    let close_status = client
        .delete(format!(
            "{}/api/v1/terminal/sessions/{terminal_id}",
            runtime.launch_context().api_base_url
        ))
        .bearer_auth(&bootstrap.auth_token)
        .send()
        .await
        .expect("close terminal session request should complete")
        .status();

    assert_eq!(
        close_status,
        reqwest::StatusCode::NO_CONTENT,
        "close terminal session should return 204"
    );

    runtime.shutdown().await.expect("shutdown should complete cleanly");
}
