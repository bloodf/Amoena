use std::fs;

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
async fn native_loop_emits_resolved_reasoning_metadata_in_usage_events() {
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
            "tuiType": "native",
            "providerId": "openai",
            "modelId": "gpt-5-mini"
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
            "content": "reasoning metadata",
            "taskType": "planning",
            "reasoningMode": "on",
            "reasoningEffort": "high"
        }))
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
        |events| events.iter().any(|event| event.event_type == "usage"),
    )
    .await;
    let usage_event = transcript
        .iter()
        .find(|event| event.event_type == "usage")
        .expect("usage event should exist");

    assert_eq!(usage_event.payload["providerId"].as_str(), Some("openai"));
    assert_eq!(usage_event.payload["modelId"].as_str(), Some("gpt-5-mini"));
    assert_eq!(usage_event.payload["reasoningMode"].as_str(), Some("on"));
    assert_eq!(usage_event.payload["reasoningEffort"].as_str(), Some("high"));

    runtime.shutdown().await.expect("shutdown should succeed");
}

#[tokio::test]
async fn persona_preferred_model_flows_into_usage_analytics() {
    let tempdir = TempDir::new().expect("tempdir should be created");
    let config = temp_config(&tempdir);
    let database_path = config.database_path.clone();
    let runtime = start_runtime(config).await.expect("runtime should start");
    let client = Client::new();
    let bootstrap = bootstrap(&client, &runtime).await;

    let persona_path = tempdir.path().join("preferred-persona.md");
    fs::write(
        &persona_path,
        r#"---
name: "Routing Persona"
description: "Persona for routing tests"
division: "engineering"
preferredModel: "gpt-5-mini"
decisionWeight: 0.6
tools: ["Agent"]
---

Use the preferred model when available.
"#,
    )
    .expect("persona file should be written");

    let session: serde_json::Value = client
        .post(format!("{}/api/v1/sessions", runtime.launch_context().api_base_url))
        .bearer_auth(&bootstrap.auth_token)
        .json(&serde_json::json!({
            "workingDir": tempdir.path().display().to_string(),
            "sessionMode": "native",
            "tuiType": "native",
            "metadata": {
                "persona": {
                    "path": persona_path.display().to_string()
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
        .json(&serde_json::json!({ "content": "preferred model" }))
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
        |events| events.iter().any(|event| event.event_type == "usage"),
    )
    .await;

    let usage_row = rusqlite::Connection::open(database_path)
        .expect("sqlite db should open")
        .query_row(
            "SELECT provider, model FROM usage_analytics WHERE session_id = ?1 ORDER BY timestamp DESC LIMIT 1",
            rusqlite::params![session_id],
            |row| Ok((row.get::<_, String>(0)?, row.get::<_, String>(1)?)),
        )
        .expect("usage analytics row should exist");

    assert_eq!(usage_row.0, "openai");
    assert_eq!(usage_row.1, "gpt-5-mini");

    runtime.shutdown().await.expect("shutdown should succeed");
}
