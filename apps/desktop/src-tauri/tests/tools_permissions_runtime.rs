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
    timeout(Duration::from_secs(5), async {
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
async fn native_tool_call_can_pause_for_approval_and_resume() {
    let tempdir = TempDir::new().expect("tempdir should be created");
    let config = temp_config(&tempdir);
    let database_path = config.database_path.clone();
    let runtime = start_runtime(config).await.expect("runtime should start");
    let client = Client::new();
    let bootstrap = bootstrap(&client, &runtime).await;

    let session: serde_json::Value = client
        .post(format!("{}/api/v1/sessions", runtime.launch_context().api_base_url))
        .bearer_auth(&bootstrap.auth_token)
        .json(&serde_json::json!({
            "workingDir": tempdir.path().display().to_string(),
            "sessionMode": "native",
            "tuiType": "native",
            "metadata": {
                "permissions": {
                    "mode": "manual"
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
        .json(&serde_json::json!({ "content": "tool:Bash:printf approval" }))
        .send()
        .await
        .expect("message request should complete")
        .error_for_status()
        .expect("message request should succeed");

    let transcript = wait_for_transcript(
        &client,
        &runtime,
        &bootstrap.auth_token,
        &session_id,
        |events| events.iter().any(|event| event.event_type == "permission.requested"),
    )
    .await;
    let approval = transcript
        .iter()
        .find(|event| event.event_type == "permission.requested")
        .expect("permission request should exist");
    let request_id = approval.payload["requestId"]
        .as_str()
        .expect("request id should exist")
        .to_string();

    client
        .post(format!(
            "{}/api/v1/sessions/{session_id}/permissions",
            runtime.launch_context().api_base_url
        ))
        .bearer_auth(&bootstrap.auth_token)
        .json(&serde_json::json!({
            "requestId": request_id,
            "decision": "approve",
            "reason": "approved in runtime test"
        }))
        .send()
        .await
        .expect("permission resolve request should complete")
        .error_for_status()
        .expect("permission resolve request should succeed");

    let completed = wait_for_transcript(
        &client,
        &runtime,
        &bootstrap.auth_token,
        &session_id,
        |events| {
            let event_types = events.iter().map(|event| event.event_type.as_str()).collect::<Vec<_>>();
            event_types.contains(&"tool.result") && event_types.contains(&"message.complete")
        },
    )
    .await;

    assert!(completed.iter().any(|event| event.event_type == "tool.result"));
    assert!(completed.iter().any(|event| event.event_type == "message.complete"));

    let audit_count: i64 = rusqlite::Connection::open(database_path)
        .expect("sqlite db should open")
        .query_row(
            "SELECT COUNT(*) FROM tool_executions WHERE session_id = ?1",
            rusqlite::params![session_id],
            |row| row.get(0),
        )
        .expect("tool audit count should be queryable");
    assert_eq!(audit_count, 1);

    runtime.shutdown().await.expect("shutdown should succeed");
}
