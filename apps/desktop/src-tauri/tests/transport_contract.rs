use lunaria_desktop::{start_runtime, BootstrapSession, EventEnvelope, RuntimeConfig, RuntimeHandle};
use reqwest::Client;
use tempfile::TempDir;
use tokio::time::{timeout, Duration};

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

async fn read_sse_event(response: &mut reqwest::Response) -> EventEnvelope {
    let mut buffer = String::new();

    loop {
        let chunk = timeout(Duration::from_secs(3), response.chunk())
            .await
            .expect("timed out waiting for sse chunk")
            .expect("failed to read sse chunk")
            .expect("sse stream ended unexpectedly");

        buffer.push_str(&String::from_utf8_lossy(&chunk));

        if let Some(frame_end) = buffer.find("\n\n") {
            let frame = buffer[..frame_end].replace("\r\n", "\n");
            let data_line = frame
                .lines()
                .find(|line| line.starts_with("data:"))
                .expect("sse frame should contain data");
            let payload = data_line.trim_start_matches("data:").trim();

            return serde_json::from_str(payload).expect("sse payload should deserialize");
        }
    }
}

async fn read_sse_event_by_type(
    response: &mut reqwest::Response,
    expected_event_type: &str,
) -> EventEnvelope {
    let mut buffer = String::new();

    loop {
        let chunk = timeout(Duration::from_secs(3), response.chunk())
            .await
            .expect("timed out waiting for sse chunk")
            .expect("failed to read sse chunk")
            .expect("sse stream ended unexpectedly");

        buffer.push_str(&String::from_utf8_lossy(&chunk));

        while let Some(frame_end) = buffer.find("\n\n") {
            let frame = buffer[..frame_end].replace("\r\n", "\n");
            let data_line = frame
                .lines()
                .find(|line| line.starts_with("data:"))
                .expect("sse frame should contain data");
            let payload = data_line.trim_start_matches("data:").trim();
            let event: EventEnvelope =
                serde_json::from_str(payload).expect("sse payload should deserialize");
            buffer = buffer[frame_end + 2..].to_string();

            if event.event_type == expected_event_type {
                return event;
            }
        }
    }
}

#[tokio::test]
async fn global_sse_stream_receives_session_created_events() {
    let tempdir = TempDir::new().expect("tempdir should be created");
    let runtime = start_runtime(temp_config(&tempdir))
        .await
        .expect("runtime should start");
    let client = Client::new();
    let bootstrap = bootstrap(&client, &runtime).await;

    let mut global_stream = client
        .get(format!("{}/api/v1/events", runtime.launch_context().api_base_url))
        .bearer_auth(&bootstrap.auth_token)
        .send()
        .await
        .expect("global stream request should complete")
        .error_for_status()
        .expect("global stream should authorize");

    let event_task = tokio::spawn(async move {
        let mut response = global_stream;
        read_sse_event_by_type(&mut response, "session.created").await
    });

    let create_response: serde_json::Value = client
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
    let session_id = create_response["id"]
        .as_str()
        .expect("session id should be present")
        .to_string();

    let list_response: serde_json::Value = client
        .get(format!("{}/api/v1/sessions", runtime.launch_context().api_base_url))
        .bearer_auth(&bootstrap.auth_token)
        .send()
        .await
        .expect("list sessions request should complete")
        .error_for_status()
        .expect("list sessions should succeed")
        .json()
        .await
        .expect("list sessions response should deserialize");
    assert!(
        list_response
            .as_array()
            .expect("sessions response should be an array")
            .iter()
            .any(|session| session["id"].as_str() == Some(session_id.as_str())),
        "created session should be listed through the REST scaffold"
    );

    let event = event_task.await.expect("created event task should join");
    assert_eq!(event.channel, "global");
    assert_eq!(event.event_type, "session.created");
    assert_eq!(event.session_id.as_deref(), Some(session_id.as_str()));

    runtime.shutdown().await.expect("shutdown should succeed");
}

#[tokio::test]
async fn session_sse_and_transcript_replay_follow_message_events() {
    let tempdir = TempDir::new().expect("tempdir should be created");
    let runtime = start_runtime(temp_config(&tempdir))
        .await
        .expect("runtime should start");
    let client = Client::new();
    let bootstrap = bootstrap(&client, &runtime).await;

    let create_response: serde_json::Value = client
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
    let session_id = create_response["id"]
        .as_str()
        .expect("session id should be present")
        .to_string();

    let session_stream = client
        .get(format!(
            "{}/api/v1/sessions/{session_id}/stream",
            runtime.launch_context().api_base_url
        ))
        .bearer_auth(&bootstrap.auth_token)
        .send()
        .await
        .expect("session stream request should complete")
        .error_for_status()
        .expect("session stream should authorize");

    let event_task = tokio::spawn(async move {
        let mut response = session_stream;
        read_sse_event_by_type(&mut response, "message.created").await
    });

    client
        .post(format!(
            "{}/api/v1/sessions/{session_id}/messages",
            runtime.launch_context().api_base_url
        ))
        .bearer_auth(&bootstrap.auth_token)
        .json(&serde_json::json!({ "content": "hello from transcript test" }))
        .send()
        .await
        .expect("create message request should complete")
        .error_for_status()
        .expect("create message should succeed");

    let event = event_task.await.expect("session event task should join");
    assert_eq!(event.channel, "session.stream");
    assert_eq!(event.event_type, "message.created");
    assert_eq!(event.session_id.as_deref(), Some(session_id.as_str()));
    assert_eq!(
        event.payload["content"].as_str(),
        Some("hello from transcript test")
    );

    let transcript: Vec<EventEnvelope> = client
        .get(format!(
            "{}/api/v1/sessions/{session_id}/transcript",
            runtime.launch_context().api_base_url
        ))
        .bearer_auth(&bootstrap.auth_token)
        .send()
        .await
        .expect("transcript replay request should complete")
        .error_for_status()
        .expect("transcript replay should succeed")
        .json()
        .await
        .expect("transcript replay should deserialize");

    let event_types = transcript
        .iter()
        .map(|event| event.event_type.as_str())
        .collect::<Vec<_>>();
    assert!(event_types.contains(&"agent.spawned"));
    assert!(event_types.contains(&"session.created"));
    assert!(event_types.contains(&"message.created"));

    runtime.shutdown().await.expect("shutdown should succeed");
}

#[tokio::test]
async fn deleting_a_session_archives_it_and_emits_a_deleted_event() {
    let tempdir = TempDir::new().expect("tempdir should be created");
    let runtime = start_runtime(temp_config(&tempdir))
        .await
        .expect("runtime should start");
    let client = Client::new();
    let bootstrap = bootstrap(&client, &runtime).await;

    let mut global_stream = client
        .get(format!("{}/api/v1/events", runtime.launch_context().api_base_url))
        .bearer_auth(&bootstrap.auth_token)
        .send()
        .await
        .expect("global stream request should complete")
        .error_for_status()
        .expect("global stream should authorize");

    let event_task = tokio::spawn(async move {
        let mut response = global_stream;
        read_sse_event_by_type(&mut response, "session.deleted").await
    });

    let create_response: serde_json::Value = client
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
    let session_id = create_response["id"]
        .as_str()
        .expect("session id should be present")
        .to_string();

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

    let list_response: serde_json::Value = client
        .get(format!("{}/api/v1/sessions", runtime.launch_context().api_base_url))
        .bearer_auth(&bootstrap.auth_token)
        .send()
        .await
        .expect("list sessions request should complete")
        .error_for_status()
        .expect("list sessions should succeed")
        .json()
        .await
        .expect("list sessions response should deserialize");
    assert!(
        !list_response
            .as_array()
            .expect("sessions response should be an array")
            .iter()
            .any(|session| session["id"].as_str() == Some(session_id.as_str())),
        "archived session should no longer be listed"
    );

    let event = event_task.await.expect("deleted event task should join");
    assert_eq!(event.channel, "global");
    assert_eq!(event.event_type, "session.deleted");
    assert_eq!(event.session_id.as_deref(), Some(session_id.as_str()));

    runtime.shutdown().await.expect("shutdown should succeed");
}
