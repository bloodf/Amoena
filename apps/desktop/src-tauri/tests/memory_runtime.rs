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
async fn manual_memory_observe_and_search_endpoints_work() {
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
    let session_id = session["id"].as_str().expect("session id should exist").to_string();

    client
        .post(format!("{}/api/v1/memory/observe", runtime.launch_context().api_base_url))
        .bearer_auth(&bootstrap.auth_token)
        .json(&serde_json::json!({
            "sessionId": session_id,
            "title": "skill: rg",
            "narrative": "Use ripgrep for fast search operations",
            "category": "skill"
        }))
        .send()
        .await
        .expect("manual observe request should complete")
        .error_for_status()
        .expect("manual observe request should succeed");

    let search: serde_json::Value = client
        .get(format!(
            "{}/api/v1/memory/search?query=ripgrep&category=skill",
            runtime.launch_context().api_base_url
        ))
        .bearer_auth(&bootstrap.auth_token)
        .send()
        .await
        .expect("memory search request should complete")
        .error_for_status()
        .expect("memory search request should succeed")
        .json()
        .await
        .expect("memory search response should deserialize");

    assert_eq!(search.as_array().expect("search response should be array").len(), 1);

    runtime.shutdown().await.expect("shutdown should succeed");
}

#[tokio::test]
async fn native_runtime_activity_creates_searchable_observations() {
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
    let session_id = session["id"].as_str().expect("session id should exist").to_string();

    client
        .post(format!(
            "{}/api/v1/sessions/{session_id}/messages",
            runtime.launch_context().api_base_url
        ))
        .bearer_auth(&bootstrap.auth_token)
        .json(&serde_json::json!({ "content": "tool:echo:memory signal" }))
        .send()
        .await
        .expect("message request should complete")
        .error_for_status()
        .expect("message request should succeed");

    wait_for_transcript(
        &client,
        &runtime,
        &bootstrap.auth_token,
        &session_id,
        |events| events.iter().any(|event| event.event_type == "message.complete"),
    )
    .await;

    let search: serde_json::Value = client
        .get(format!(
            "{}/api/v1/memory/search?query=memory&category=tool_usage",
            runtime.launch_context().api_base_url
        ))
        .bearer_auth(&bootstrap.auth_token)
        .send()
        .await
        .expect("memory search request should complete")
        .error_for_status()
        .expect("memory search request should succeed")
        .json()
        .await
        .expect("memory search response should deserialize");

    assert!(
        search
            .as_array()
            .expect("search response should be array")
            .iter()
            .any(|entry| entry["observation"]["title"].as_str() == Some("Tool echo")),
        "tool activity should produce a searchable observation"
    );

    runtime.shutdown().await.expect("shutdown should succeed");
}
