use lunaria_desktop::{start_runtime, BootstrapSession, EventEnvelope, RuntimeConfig, RuntimeHandle};
use reqwest::Client;
use tempfile::TempDir;
use tokio::time::{sleep, timeout, Duration};

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

async fn create_native_session(
    client: &Client,
    runtime: &RuntimeHandle,
    auth_token: &str,
    working_dir: &str,
) -> String {
    let session: serde_json::Value = client
        .post(format!("{}/api/v1/sessions", runtime.launch_context().api_base_url))
        .bearer_auth(auth_token)
        .json(&serde_json::json!({
            "workingDir": working_dir,
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

    session["id"]
        .as_str()
        .expect("session id should exist")
        .to_string()
}

async fn create_native_session_with_metadata(
    client: &Client,
    runtime: &RuntimeHandle,
    auth_token: &str,
    working_dir: &str,
    metadata: serde_json::Value,
) -> String {
    let session: serde_json::Value = client
        .post(format!("{}/api/v1/sessions", runtime.launch_context().api_base_url))
        .bearer_auth(auth_token)
        .json(&serde_json::json!({
            "workingDir": working_dir,
            "sessionMode": "native",
            "tuiType": "native",
            "metadata": metadata,
        }))
        .send()
        .await
        .expect("create session request should complete")
        .error_for_status()
        .expect("create session should succeed")
        .json()
        .await
        .expect("create session response should deserialize");

    session["id"]
        .as_str()
        .expect("session id should exist")
        .to_string()
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
    let deadline = Duration::from_secs(5);
    timeout(deadline, async {
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

            sleep(Duration::from_millis(25)).await;
        }
    })
    .await
    .expect("timed out waiting for transcript state")
}

#[tokio::test]
async fn native_session_completes_a_prompt_response_cycle() {
    let tempdir = TempDir::new().expect("tempdir should be created");
    let config = temp_config(&tempdir);
    let database_path = config.database_path.clone();
    let runtime = start_runtime(config)
        .await
        .expect("runtime should start");
    let client = Client::new();
    let bootstrap = bootstrap(&client, &runtime).await;
    let session_id = create_native_session(
        &client,
        &runtime,
        &bootstrap.auth_token,
        &tempdir.path().display().to_string(),
    )
    .await;

    client
        .post(format!(
            "{}/api/v1/sessions/{session_id}/messages",
            runtime.launch_context().api_base_url
        ))
        .bearer_auth(&bootstrap.auth_token)
        .json(&serde_json::json!({ "content": "hello native loop" }))
        .send()
        .await
        .expect("message create should complete")
        .error_for_status()
        .expect("message create should succeed");

    let transcript = wait_for_transcript(
        &client,
        &runtime,
        &bootstrap.auth_token,
        &session_id,
        |events| {
            let event_types = events.iter().map(|event| event.event_type.as_str()).collect::<Vec<_>>();
            event_types.contains(&"message.delta")
                && event_types.contains(&"message.complete")
                && event_types.contains(&"usage")
        },
    )
    .await;
    let event_types = transcript
        .iter()
        .map(|event| event.event_type.clone())
        .collect::<Vec<_>>();
    assert!(
        event_types.contains(&"message.delta".to_string()),
        "native loop should emit incremental message deltas"
    );
    assert!(
        event_types.contains(&"message.complete".to_string()),
        "native loop should emit a completion event"
    );
    assert!(
        event_types.contains(&"usage".to_string()),
        "native loop should emit usage accounting"
    );
    let completion_event = transcript
        .iter()
        .find(|event| event.event_type == "message.complete")
        .expect("completion event should exist");
    assert_eq!(
        completion_event.payload["collaborationStyle"].as_str(),
        Some("directive")
    );
    assert_eq!(
        completion_event.payload["communicationPreference"].as_str(),
        Some("structured")
    );

    let usage_count: i64 = rusqlite::Connection::open(database_path)
        .expect("sqlite db should open")
        .query_row(
            "SELECT COUNT(*) FROM usage_analytics WHERE session_id = ?1",
            rusqlite::params![session_id],
            |row| row.get(0),
        )
        .expect("usage analytics should be queryable");
    assert_eq!(usage_count, 1, "native loop should persist one usage record");

    runtime.shutdown().await.expect("shutdown should succeed");
}

#[tokio::test]
async fn native_session_executes_a_tool_call_and_continues() {
    let tempdir = TempDir::new().expect("tempdir should be created");
    let runtime = start_runtime(temp_config(&tempdir))
        .await
        .expect("runtime should start");
    let client = Client::new();
    let bootstrap = bootstrap(&client, &runtime).await;
    let session_id = create_native_session(
        &client,
        &runtime,
        &bootstrap.auth_token,
        &tempdir.path().display().to_string(),
    )
    .await;

    client
        .post(format!(
            "{}/api/v1/sessions/{session_id}/messages",
            runtime.launch_context().api_base_url
        ))
        .bearer_auth(&bootstrap.auth_token)
        .json(&serde_json::json!({ "content": "tool:echo:ping" }))
        .send()
        .await
        .expect("message create should complete")
        .error_for_status()
        .expect("message create should succeed");

    let events = wait_for_transcript(
        &client,
        &runtime,
        &bootstrap.auth_token,
        &session_id,
        |events| {
            let event_types = events.iter().map(|event| event.event_type.as_str()).collect::<Vec<_>>();
            event_types.contains(&"tool.start")
                && event_types.contains(&"tool.result")
                && event_types.contains(&"message.complete")
        },
    )
    .await;
    let event_types = events
        .iter()
        .map(|event| event.event_type.as_str())
        .collect::<Vec<_>>();

    assert!(event_types.contains(&"tool.start"));
    assert!(event_types.contains(&"tool.result"));
    assert!(event_types.contains(&"message.complete"));
    assert!(
        events.iter().any(|event| {
            event.event_type == "message.complete"
                && event.payload["content"].as_str() == Some("Tool echo returned: ping")
        }),
        "tool continuation should produce a final assistant response"
    );

    runtime.shutdown().await.expect("shutdown should succeed");
}

#[tokio::test]
async fn native_session_can_be_interrupted() {
    let tempdir = TempDir::new().expect("tempdir should be created");
    let runtime = start_runtime(temp_config(&tempdir))
        .await
        .expect("runtime should start");
    let client = Client::new();
    let bootstrap = bootstrap(&client, &runtime).await;
    let session_id = create_native_session(
        &client,
        &runtime,
        &bootstrap.auth_token,
        &tempdir.path().display().to_string(),
    )
    .await;

    client
        .post(format!(
            "{}/api/v1/sessions/{session_id}/messages",
            runtime.launch_context().api_base_url
        ))
        .bearer_auth(&bootstrap.auth_token)
        .json(&serde_json::json!({ "content": "slow: this takes time to finish" }))
        .send()
        .await
        .expect("message create should complete")
        .error_for_status()
        .expect("message create should succeed");

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
        |events| events.iter().any(|event| event.event_type == "error"),
    )
    .await;
    let error_event = transcript
        .iter()
        .find(|event| event.event_type == "error")
        .expect("interrupt should record an error event");
    assert_eq!(error_event.payload["code"].as_str(), Some("cancelled"));

    runtime.shutdown().await.expect("shutdown should succeed");
}

#[tokio::test]
async fn native_autopilot_sessions_emit_phase_events_and_follow_up_turns() {
    let tempdir = TempDir::new().expect("tempdir should be created");
    let runtime = start_runtime(temp_config(&tempdir))
        .await
        .expect("runtime should start");
    let client = Client::new();
    let bootstrap = bootstrap(&client, &runtime).await;
    let session_id = create_native_session_with_metadata(
        &client,
        &runtime,
        &bootstrap.auth_token,
        &tempdir.path().display().to_string(),
        serde_json::json!({ "autopilot": true }),
    )
    .await;

    client
        .post(format!(
            "{}/api/v1/sessions/{session_id}/messages",
            runtime.launch_context().api_base_url
        ))
        .bearer_auth(&bootstrap.auth_token)
        .json(&serde_json::json!({ "content": "hello autopilot" }))
        .send()
        .await
        .expect("message create should complete")
        .error_for_status()
        .expect("message create should succeed");

    let transcript = wait_for_transcript(
        &client,
        &runtime,
        &bootstrap.auth_token,
        &session_id,
        |events| {
            let phase_count = events
                .iter()
                .filter(|event| event.event_type == "autopilot.phase")
                .count();
            let completion_count = events
                .iter()
                .filter(|event| event.event_type == "message.complete")
                .count();

            phase_count >= 2 && completion_count >= 2
        },
    )
    .await;

    let phase_count = transcript
        .iter()
        .filter(|event| event.event_type == "autopilot.phase")
        .count();
    let completion_count = transcript
        .iter()
        .filter(|event| event.event_type == "message.complete")
        .count();

    assert!(phase_count >= 2, "autopilot should emit phase progress");
    assert!(
        completion_count >= 2,
        "autopilot should continue with at least one follow-up turn"
    );

    runtime.shutdown().await.expect("shutdown should succeed");
}
