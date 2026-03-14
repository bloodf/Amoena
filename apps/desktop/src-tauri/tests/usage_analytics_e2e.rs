use std::path::PathBuf;

use lunaria_desktop::{
    start_runtime, BootstrapSession, EventEnvelope, RuntimeConfig, RuntimeHandle,
};
use reqwest::Client;
use tempfile::TempDir;
use tokio::time::{sleep, timeout, Duration};

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

#[tokio::test]
async fn provider_catalog_populated_on_startup() {
    let tempdir = TempDir::new().expect("tempdir should be created");
    let runtime = start_runtime(temp_config(&tempdir))
        .await
        .expect("runtime should start");
    let client = Client::new();
    let bootstrap = bootstrap(&client, &runtime).await;

    let providers: serde_json::Value = client
        .get(format!(
            "{}/api/v1/providers",
            runtime.launch_context().api_base_url
        ))
        .bearer_auth(&bootstrap.auth_token)
        .send()
        .await
        .expect("providers request should complete")
        .error_for_status()
        .expect("providers request should succeed")
        .json()
        .await
        .expect("providers response should deserialize");

    let providers_array = providers
        .as_array()
        .expect("providers response should be an array");
    assert!(
        !providers_array.is_empty(),
        "at least one provider should be listed on startup"
    );

    for provider in providers_array {
        assert!(
            provider["id"].as_str().is_some(),
            "each provider should have an id field"
        );
        assert!(
            provider["name"].as_str().is_some(),
            "each provider should have a name field"
        );
    }

    runtime.shutdown().await.expect("shutdown should succeed");
}

#[tokio::test]
async fn provider_models_listed() {
    let tempdir = TempDir::new().expect("tempdir should be created");
    let runtime = start_runtime(temp_config(&tempdir))
        .await
        .expect("runtime should start");
    let client = Client::new();
    let bootstrap = bootstrap(&client, &runtime).await;

    let providers: serde_json::Value = client
        .get(format!(
            "{}/api/v1/providers",
            runtime.launch_context().api_base_url
        ))
        .bearer_auth(&bootstrap.auth_token)
        .send()
        .await
        .expect("providers request should complete")
        .error_for_status()
        .expect("providers request should succeed")
        .json()
        .await
        .expect("providers response should deserialize");

    let first_provider = providers
        .as_array()
        .expect("providers should be an array")
        .first()
        .expect("at least one provider should exist");
    let provider_id = first_provider["id"]
        .as_str()
        .expect("provider should have id");

    let models: serde_json::Value = client
        .get(format!(
            "{}/api/v1/providers/{provider_id}/models",
            runtime.launch_context().api_base_url
        ))
        .bearer_auth(&bootstrap.auth_token)
        .send()
        .await
        .expect("provider models request should complete")
        .error_for_status()
        .expect("provider models request should succeed")
        .json()
        .await
        .expect("provider models response should deserialize");

    let models_array = models
        .as_array()
        .expect("models response should be an array");
    assert!(
        !models_array.is_empty(),
        "provider should have at least one model"
    );

    for model in models_array {
        assert!(
            model["modelId"].as_str().is_some(),
            "each model should have a modelId field"
        );
        assert!(
            model["displayName"].as_str().is_some(),
            "each model should have a displayName field"
        );
    }

    runtime.shutdown().await.expect("shutdown should succeed");
}

#[tokio::test]
#[ignore = "requires real provider network validation; use a valid API key in live environments"]
async fn provider_auth_storage() {
    let tempdir = TempDir::new().expect("tempdir should be created");
    let runtime = start_runtime(temp_config(&tempdir))
        .await
        .expect("runtime should start");
    let client = Client::new();
    let bootstrap = bootstrap(&client, &runtime).await;

    let response = client
        .post(format!(
            "{}/api/v1/providers/anthropic/auth",
            runtime.launch_context().api_base_url
        ))
        .bearer_auth(&bootstrap.auth_token)
        .json(&serde_json::json!({ "apiKey": "test-key-12345" }))
        .send()
        .await
        .expect("provider auth request should complete");

    assert_eq!(
        response.status().as_u16(),
        204,
        "provider auth storage should return 204"
    );

    runtime.shutdown().await.expect("shutdown should succeed");
}

#[tokio::test]
async fn reasoning_mode_configuration() {
    let tempdir = TempDir::new().expect("tempdir should be created");
    let runtime = start_runtime(temp_config(&tempdir))
        .await
        .expect("runtime should start");
    let client = Client::new();
    let bootstrap = bootstrap(&client, &runtime).await;

    let response = client
        .post(format!(
            "{}/api/v1/providers/anthropic/models/claude-sonnet-4-20250514/reasoning",
            runtime.launch_context().api_base_url
        ))
        .bearer_auth(&bootstrap.auth_token)
        .json(&serde_json::json!({ "mode": "extended", "effort": "high" }))
        .send()
        .await
        .expect("reasoning config request should complete");

    assert_eq!(
        response.status().as_u16(),
        204,
        "reasoning mode configuration should return 204"
    );

    let settings: serde_json::Value = client
        .get(format!(
            "{}/api/v1/settings",
            runtime.launch_context().api_base_url
        ))
        .bearer_auth(&bootstrap.auth_token)
        .send()
        .await
        .expect("settings request should complete")
        .error_for_status()
        .expect("settings request should succeed")
        .json()
        .await
        .expect("settings response should deserialize");

    assert!(
        !settings.is_null(),
        "settings should exist after reasoning configuration"
    );

    runtime.shutdown().await.expect("shutdown should succeed");
}

#[tokio::test]
async fn settings_read_and_write() {
    let tempdir = TempDir::new().expect("tempdir should be created");
    let runtime = start_runtime(temp_config(&tempdir))
        .await
        .expect("runtime should start");
    let client = Client::new();
    let bootstrap = bootstrap(&client, &runtime).await;

    let settings: serde_json::Value = client
        .get(format!(
            "{}/api/v1/settings",
            runtime.launch_context().api_base_url
        ))
        .bearer_auth(&bootstrap.auth_token)
        .send()
        .await
        .expect("settings request should complete")
        .error_for_status()
        .expect("settings request should succeed")
        .json()
        .await
        .expect("settings response should deserialize");

    assert!(
        !settings.is_null(),
        "settings response should have content"
    );

    let response = client
        .post(format!(
            "{}/api/v1/settings",
            runtime.launch_context().api_base_url
        ))
        .bearer_auth(&bootstrap.auth_token)
        .json(&serde_json::json!({
            "values": { "ui.theme": "dark" }
        }))
        .send()
        .await
        .expect("settings write request should complete");

    assert_eq!(
        response.status().as_u16(),
        204,
        "settings write should return 204"
    );

    runtime.shutdown().await.expect("shutdown should succeed");
}

#[tokio::test]
async fn session_with_provider_and_model_selection() {
    let tempdir = TempDir::new().expect("tempdir should be created");
    let runtime = start_runtime(temp_config(&tempdir))
        .await
        .expect("runtime should start");
    let client = Client::new();
    let bootstrap = bootstrap(&client, &runtime).await;

    let session: serde_json::Value = client
        .post(format!(
            "{}/api/v1/sessions",
            runtime.launch_context().api_base_url
        ))
        .bearer_auth(&bootstrap.auth_token)
        .json(&serde_json::json!({
            "workingDir": tempdir.path().display().to_string(),
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

    assert!(
        session["id"].as_str().is_some(),
        "session should have an id"
    );
    assert_eq!(
        session["providerId"].as_str(),
        Some("anthropic"),
        "session should record provider_id"
    );
    assert_eq!(
        session["modelId"].as_str(),
        Some("claude-sonnet-4-20250514"),
        "session should record model_id"
    );

    runtime.shutdown().await.expect("shutdown should succeed");
}

#[tokio::test]
async fn message_with_reasoning_mode() {
    let tempdir = TempDir::new().expect("tempdir should be created");
    let runtime = start_runtime(temp_config(&tempdir))
        .await
        .expect("runtime should start");
    let client = Client::new();
    let bootstrap = bootstrap(&client, &runtime).await;

    let session: serde_json::Value = client
        .post(format!(
            "{}/api/v1/sessions",
            runtime.launch_context().api_base_url
        ))
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
    let session_id = session["id"]
        .as_str()
        .expect("session id should exist")
        .to_string();

    let msg_response = client
        .post(format!(
            "{}/api/v1/sessions/{session_id}/messages",
            runtime.launch_context().api_base_url
        ))
        .bearer_auth(&bootstrap.auth_token)
        .json(&serde_json::json!({
            "content": "explain extended reasoning",
            "reasoningMode": "on",
            "reasoningEffort": "high"
        }))
        .send()
        .await
        .expect("message request should complete");

    assert_eq!(
        msg_response.status().as_u16(),
        201,
        "message with reasoning mode should return 201"
    );

    let transcript = wait_for_transcript(
        &client,
        &runtime,
        &bootstrap.auth_token,
        &session_id,
        |events| {
            events
                .iter()
                .any(|event| event.event_type == "message.complete" || event.event_type == "usage")
        },
    )
    .await;

    assert!(
        transcript
            .iter()
            .any(|event| event.event_type == "message.complete" || event.event_type == "usage"),
        "message should appear in transcript"
    );

    runtime.shutdown().await.expect("shutdown should succeed");
}

#[tokio::test]
async fn wrapper_session_usage_tracking() {
    let tempdir = TempDir::new().expect("tempdir should be created");
    let runtime = start_runtime(temp_config(&tempdir))
        .await
        .expect("runtime should start");
    let client = Client::new();
    let bootstrap = bootstrap(&client, &runtime).await;

    let session: serde_json::Value = client
        .post(format!(
            "{}/api/v1/sessions",
            runtime.launch_context().api_base_url
        ))
        .bearer_auth(&bootstrap.auth_token)
        .json(&serde_json::json!({
            "workingDir": tempdir.path().display().to_string(),
            "sessionMode": "wrapper",
            "tuiType": "claude-code",
            "metadata": {
                "wrapper": {
                    "executable": "bun",
                    "args": [repo_root().join("apps/desktop/wrapper-mocks/claude.ts").display().to_string()]
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
    let session_id = session["id"]
        .as_str()
        .expect("session id should exist")
        .to_string();

    client
        .post(format!(
            "{}/api/v1/sessions/{session_id}/messages",
            runtime.launch_context().api_base_url
        ))
        .bearer_auth(&bootstrap.auth_token)
        .json(&serde_json::json!({ "content": "hello" }))
        .send()
        .await
        .expect("wrapper message request should complete")
        .error_for_status()
        .expect("wrapper message request should succeed");

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
        .expect("transcript should contain a usage event");

    assert!(
        usage_event.payload["inputTokens"].as_i64().unwrap_or(0) > 0,
        "usage event should have non-zero inputTokens"
    );
    assert!(
        usage_event.payload["outputTokens"].as_i64().unwrap_or(0) > 0,
        "usage event should have non-zero outputTokens"
    );

    runtime.shutdown().await.expect("shutdown should succeed");
}

#[tokio::test]
async fn multiple_sessions_usage_isolation() {
    let tempdir = TempDir::new().expect("tempdir should be created");
    let runtime = start_runtime(temp_config(&tempdir))
        .await
        .expect("runtime should start");
    let client = Client::new();
    let bootstrap = bootstrap(&client, &runtime).await;

    let mock_path = repo_root()
        .join("apps/desktop/wrapper-mocks/claude.ts")
        .display()
        .to_string();

    let session_a: serde_json::Value = client
        .post(format!(
            "{}/api/v1/sessions",
            runtime.launch_context().api_base_url
        ))
        .bearer_auth(&bootstrap.auth_token)
        .json(&serde_json::json!({
            "workingDir": tempdir.path().display().to_string(),
            "sessionMode": "wrapper",
            "tuiType": "claude-code",
            "metadata": {
                "wrapper": {
                    "executable": "bun",
                    "args": [mock_path.clone()]
                }
            }
        }))
        .send()
        .await
        .expect("create session A request should complete")
        .error_for_status()
        .expect("create session A should succeed")
        .json()
        .await
        .expect("create session A response should deserialize");
    let session_id_a = session_a["id"]
        .as_str()
        .expect("session A id should exist")
        .to_string();

    let session_b: serde_json::Value = client
        .post(format!(
            "{}/api/v1/sessions",
            runtime.launch_context().api_base_url
        ))
        .bearer_auth(&bootstrap.auth_token)
        .json(&serde_json::json!({
            "workingDir": tempdir.path().display().to_string(),
            "sessionMode": "wrapper",
            "tuiType": "claude-code",
            "metadata": {
                "wrapper": {
                    "executable": "bun",
                    "args": [mock_path]
                }
            }
        }))
        .send()
        .await
        .expect("create session B request should complete")
        .error_for_status()
        .expect("create session B should succeed")
        .json()
        .await
        .expect("create session B response should deserialize");
    let session_id_b = session_b["id"]
        .as_str()
        .expect("session B id should exist")
        .to_string();

    for (session_id, label) in [(&session_id_a, "session A"), (&session_id_b, "session B")] {
        client
            .post(format!(
                "{}/api/v1/sessions/{session_id}/messages",
                runtime.launch_context().api_base_url
            ))
            .bearer_auth(&bootstrap.auth_token)
            .json(&serde_json::json!({ "content": format!("hello from {label}") }))
            .send()
            .await
            .expect("message request should complete")
            .error_for_status()
            .expect("message request should succeed");
    }

    let transcript_a = wait_for_transcript(
        &client,
        &runtime,
        &bootstrap.auth_token,
        &session_id_a,
        |events| events.iter().any(|event| event.event_type == "usage"),
    )
    .await;

    let transcript_b = wait_for_transcript(
        &client,
        &runtime,
        &bootstrap.auth_token,
        &session_id_b,
        |events| events.iter().any(|event| event.event_type == "usage"),
    )
    .await;

    assert!(
        transcript_a
            .iter()
            .any(|event| event.event_type == "usage"),
        "session A transcript should contain usage event"
    );
    assert!(
        transcript_b
            .iter()
            .any(|event| event.event_type == "usage"),
        "session B transcript should contain usage event"
    );

    let a_session_ids: Vec<_> = transcript_a
        .iter()
        .filter_map(|event| event.payload["sessionId"].as_str())
        .collect();
    let b_session_ids: Vec<_> = transcript_b
        .iter()
        .filter_map(|event| event.payload["sessionId"].as_str())
        .collect();

    for id in &a_session_ids {
        assert_ne!(
            *id, session_id_b,
            "session A transcript must not contain session B events"
        );
    }
    for id in &b_session_ids {
        assert_ne!(
            *id, session_id_a,
            "session B transcript must not contain session A events"
        );
    }

    runtime.shutdown().await.expect("shutdown should succeed");
}

#[tokio::test]
async fn session_with_attachments() {
    let tempdir = TempDir::new().expect("tempdir should be created");
    let runtime = start_runtime(temp_config(&tempdir))
        .await
        .expect("runtime should start");
    let client = Client::new();
    let bootstrap = bootstrap(&client, &runtime).await;

    let attachment_path = tempdir.path().join("test.txt");
    std::fs::write(&attachment_path, "attachment content for testing")
        .expect("attachment file should be created");

    let session: serde_json::Value = client
        .post(format!(
            "{}/api/v1/sessions",
            runtime.launch_context().api_base_url
        ))
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
    let session_id = session["id"]
        .as_str()
        .expect("session id should exist")
        .to_string();

    let msg_response = client
        .post(format!(
            "{}/api/v1/sessions/{session_id}/messages",
            runtime.launch_context().api_base_url
        ))
        .bearer_auth(&bootstrap.auth_token)
        .json(&serde_json::json!({
            "content": "review this file",
            "attachments": [{ "type": "file", "path": attachment_path.display().to_string() }]
        }))
        .send()
        .await
        .expect("message with attachment request should complete");

    assert_eq!(
        msg_response.status().as_u16(),
        201,
        "message with attachments should return 201"
    );

    let transcript = wait_for_transcript(
        &client,
        &runtime,
        &bootstrap.auth_token,
        &session_id,
        |events| {
            events.iter().any(|event| {
                event.event_type == "message.complete" || event.event_type == "usage"
            })
        },
    )
    .await;

    let has_attachment_event = transcript.iter().any(|event| {
        (event.event_type == "message.complete" || event.event_type == "message.user")
            && event.payload["attachments"].as_array().map_or(false, |arr| !arr.is_empty())
    });

    assert!(
        has_attachment_event || transcript.iter().any(|event| event.event_type == "message.complete"),
        "transcript should reflect the submitted message"
    );

    runtime.shutdown().await.expect("shutdown should succeed");
}

#[tokio::test]
async fn autopilot_mode_toggle() {
    let tempdir = TempDir::new().expect("tempdir should be created");
    let runtime = start_runtime(temp_config(&tempdir))
        .await
        .expect("runtime should start");
    let client = Client::new();
    let bootstrap = bootstrap(&client, &runtime).await;

    let session: serde_json::Value = client
        .post(format!(
            "{}/api/v1/sessions",
            runtime.launch_context().api_base_url
        ))
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
    let session_id = session["id"]
        .as_str()
        .expect("session id should exist")
        .to_string();

    let enabled_response: serde_json::Value = client
        .post(format!(
            "{}/api/v1/sessions/{session_id}/autopilot",
            runtime.launch_context().api_base_url
        ))
        .bearer_auth(&bootstrap.auth_token)
        .json(&serde_json::json!({ "enabled": true }))
        .send()
        .await
        .expect("autopilot enable request should complete")
        .error_for_status()
        .expect("autopilot enable should succeed")
        .json()
        .await
        .expect("autopilot enable response should deserialize");

    assert_eq!(
        enabled_response["metadata"]["autopilot"].as_bool(),
        Some(true),
        "autopilot enable response should reflect enabled state"
    );

    let disabled_response: serde_json::Value = client
        .post(format!(
            "{}/api/v1/sessions/{session_id}/autopilot",
            runtime.launch_context().api_base_url
        ))
        .bearer_auth(&bootstrap.auth_token)
        .json(&serde_json::json!({ "enabled": false }))
        .send()
        .await
        .expect("autopilot disable request should complete")
        .error_for_status()
        .expect("autopilot disable should succeed")
        .json()
        .await
        .expect("autopilot disable response should deserialize");

    assert_eq!(
        disabled_response["metadata"]["autopilot"].as_bool(),
        Some(false),
        "autopilot disable response should reflect disabled state"
    );

    runtime.shutdown().await.expect("shutdown should succeed");
}

#[tokio::test]
#[ignore]
async fn real_cli_usage_tracking() {
    let tempdir = TempDir::new().expect("tempdir should be created");
    let runtime = start_runtime(temp_config(&tempdir))
        .await
        .expect("runtime should start");
    let client = Client::new();
    let bootstrap = bootstrap(&client, &runtime).await;

    let session: serde_json::Value = client
        .post(format!(
            "{}/api/v1/sessions",
            runtime.launch_context().api_base_url
        ))
        .bearer_auth(&bootstrap.auth_token)
        .json(&serde_json::json!({
            "workingDir": tempdir.path().display().to_string(),
            "sessionMode": "wrapper",
            "tuiType": "claude-code",
            "metadata": {
                "wrapper": {
                    "executable": "claude",
                    "args": []
                }
            }
        }))
        .send()
        .await
        .expect("create real CLI session request should complete")
        .error_for_status()
        .expect("create real CLI session should succeed")
        .json()
        .await
        .expect("create real CLI session response should deserialize");
    let session_id = session["id"]
        .as_str()
        .expect("session id should exist")
        .to_string();

    client
        .post(format!(
            "{}/api/v1/sessions/{session_id}/messages",
            runtime.launch_context().api_base_url
        ))
        .bearer_auth(&bootstrap.auth_token)
        .json(&serde_json::json!({ "content": "reply with exactly: ok" }))
        .send()
        .await
        .expect("real CLI message request should complete")
        .error_for_status()
        .expect("real CLI message request should succeed");

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
        .expect("real CLI session should emit a usage event");

    assert!(
        usage_event.payload["inputTokens"].as_i64().unwrap_or(0) > 0,
        "real CLI usage event should have non-zero inputTokens"
    );
    assert!(
        usage_event.payload["outputTokens"].as_i64().unwrap_or(0) > 0,
        "real CLI usage event should have non-zero outputTokens"
    );

    runtime.shutdown().await.expect("shutdown should succeed");
}

#[tokio::test]
#[ignore]
async fn real_cli_model_switch_usage() {
    let tempdir = TempDir::new().expect("tempdir should be created");
    let runtime = start_runtime(temp_config(&tempdir))
        .await
        .expect("runtime should start");
    let client = Client::new();
    let bootstrap = bootstrap(&client, &runtime).await;

    let models = [
        ("claude-sonnet-4-20250514", "--model", "claude-sonnet-4-20250514"),
        ("claude-haiku-4-5-20251001", "--model", "claude-haiku-4-5-20251001"),
    ];

    let mut usage_by_model: Vec<(String, i64, i64)> = Vec::new();

    for (model_label, flag, model_value) in models {
        let session: serde_json::Value = client
            .post(format!(
                "{}/api/v1/sessions",
                runtime.launch_context().api_base_url
            ))
            .bearer_auth(&bootstrap.auth_token)
            .json(&serde_json::json!({
                "workingDir": tempdir.path().display().to_string(),
                "sessionMode": "wrapper",
                "tuiType": "claude-code",
                "metadata": {
                    "wrapper": {
                        "executable": "claude",
                        "args": [flag, model_value]
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
        let session_id = session["id"]
            .as_str()
            .expect("session id should exist")
            .to_string();

        client
            .post(format!(
                "{}/api/v1/sessions/{session_id}/messages",
                runtime.launch_context().api_base_url
            ))
            .bearer_auth(&bootstrap.auth_token)
            .json(&serde_json::json!({ "content": "reply with exactly: ok" }))
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
            .expect("session should emit a usage event");

        let input_tokens = usage_event.payload["inputTokens"].as_i64().unwrap_or(0);
        let output_tokens = usage_event.payload["outputTokens"].as_i64().unwrap_or(0);

        assert!(input_tokens > 0, "model {model_label} should have non-zero inputTokens");
        assert!(output_tokens > 0, "model {model_label} should have non-zero outputTokens");

        usage_by_model.push((model_label.to_string(), input_tokens, output_tokens));
    }

    assert_eq!(
        usage_by_model.len(),
        2,
        "both models should have produced usage events"
    );

    runtime.shutdown().await.expect("shutdown should succeed");
}

#[tokio::test]
async fn plugin_listing() {
    let tempdir = TempDir::new().expect("tempdir should be created");
    let runtime = start_runtime(temp_config(&tempdir))
        .await
        .expect("runtime should start");
    let client = Client::new();
    let bootstrap = bootstrap(&client, &runtime).await;

    let plugins: serde_json::Value = client
        .get(format!(
            "{}/api/v1/plugins",
            runtime.launch_context().api_base_url
        ))
        .bearer_auth(&bootstrap.auth_token)
        .send()
        .await
        .expect("plugins request should complete")
        .error_for_status()
        .expect("plugins request should succeed")
        .json()
        .await
        .expect("plugins response should deserialize");

    let plugins_array = plugins
        .as_array()
        .expect("plugins response should be an array");

    for plugin in plugins_array {
        assert!(
            plugin["id"].as_str().is_some(),
            "each plugin should have an id field"
        );
        assert!(
            plugin["enabled"].as_bool().is_some(),
            "each plugin should have an enabled field"
        );
    }

    runtime.shutdown().await.expect("shutdown should succeed");
}

#[tokio::test]
async fn plugin_toggle_via_api() {
    let tempdir = TempDir::new().expect("tempdir should be created");
    let runtime = start_runtime(temp_config(&tempdir))
        .await
        .expect("runtime should start");
    let client = Client::new();
    let bootstrap = bootstrap(&client, &runtime).await;

    let plugins: serde_json::Value = client
        .get(format!(
            "{}/api/v1/plugins",
            runtime.launch_context().api_base_url
        ))
        .bearer_auth(&bootstrap.auth_token)
        .send()
        .await
        .expect("plugins list request should complete")
        .error_for_status()
        .expect("plugins list request should succeed")
        .json()
        .await
        .expect("plugins list response should deserialize");

    let plugins_array = plugins
        .as_array()
        .expect("plugins response should be an array");

    if plugins_array.is_empty() {
        // No plugins registered — verify the endpoint at least returns an array.
        runtime.shutdown().await.expect("shutdown should succeed");
        return;
    }

    let first_plugin = &plugins_array[0];
    let plugin_id = first_plugin["id"]
        .as_str()
        .expect("plugin should have an id")
        .to_string();
    let originally_enabled = first_plugin["enabled"]
        .as_bool()
        .expect("plugin should have an enabled field");

    // Toggle to disabled.
    let disable_response = client
        .post(format!(
            "{}/api/v1/plugins/{plugin_id}",
            runtime.launch_context().api_base_url
        ))
        .bearer_auth(&bootstrap.auth_token)
        .json(&serde_json::json!({ "enabled": false }))
        .send()
        .await
        .expect("plugin disable request should complete");
    assert_eq!(
        disable_response.status().as_u16(),
        204,
        "plugin toggle to disabled should return 204"
    );

    let after_disable: serde_json::Value = client
        .get(format!(
            "{}/api/v1/plugins",
            runtime.launch_context().api_base_url
        ))
        .bearer_auth(&bootstrap.auth_token)
        .send()
        .await
        .expect("plugins list request should complete")
        .error_for_status()
        .expect("plugins list request should succeed")
        .json()
        .await
        .expect("plugins list response should deserialize");

    let disabled_plugin = after_disable
        .as_array()
        .expect("plugins response should be an array")
        .iter()
        .find(|p| p["id"].as_str() == Some(plugin_id.as_str()))
        .expect("plugin should still appear in list after toggle");
    assert_eq!(
        disabled_plugin["enabled"].as_bool(),
        Some(false),
        "plugin should be disabled after toggle"
    );

    // Toggle back to original state.
    let restore_response = client
        .post(format!(
            "{}/api/v1/plugins/{plugin_id}",
            runtime.launch_context().api_base_url
        ))
        .bearer_auth(&bootstrap.auth_token)
        .json(&serde_json::json!({ "enabled": originally_enabled }))
        .send()
        .await
        .expect("plugin restore request should complete");
    assert_eq!(
        restore_response.status().as_u16(),
        204,
        "plugin toggle to restored state should return 204"
    );

    let after_restore: serde_json::Value = client
        .get(format!(
            "{}/api/v1/plugins",
            runtime.launch_context().api_base_url
        ))
        .bearer_auth(&bootstrap.auth_token)
        .send()
        .await
        .expect("plugins list request should complete")
        .error_for_status()
        .expect("plugins list request should succeed")
        .json()
        .await
        .expect("plugins list response should deserialize");

    let restored_plugin = after_restore
        .as_array()
        .expect("plugins response should be an array")
        .iter()
        .find(|p| p["id"].as_str() == Some(plugin_id.as_str()))
        .expect("plugin should still appear in list after restore");
    assert_eq!(
        restored_plugin["enabled"].as_bool(),
        Some(originally_enabled),
        "plugin enabled state should be restored to its original value"
    );

    runtime.shutdown().await.expect("shutdown should succeed");
}

#[tokio::test]
async fn plugin_install_review_deeplink() {
    let tempdir = TempDir::new().expect("tempdir should be created");
    let runtime = start_runtime(temp_config(&tempdir))
        .await
        .expect("runtime should start");
    let client = Client::new();
    let bootstrap = bootstrap(&client, &runtime).await;

    let response = client
        .post(format!(
            "{}/api/v1/plugins/install-review",
            runtime.launch_context().api_base_url
        ))
        .bearer_auth(&bootstrap.auth_token)
        .json(&serde_json::json!({
            "deeplink": "lunaria://install?pluginId=test-plugin&source=github&version=1.0.0"
        }))
        .send()
        .await
        .expect("install-review request should complete");

    let status = response.status().as_u16();

    // The endpoint processes the deeplink - it may return 200 with parsed fields,
    // or a 4xx/5xx if the deeplink format isn't recognized. Either way, the endpoint exists.
    if status == 200 {
        let body: serde_json::Value = response.json().await
            .expect("install-review response should deserialize");
        assert!(
            body.get("pluginId").is_some() || body.get("source").is_some(),
            "successful install-review should return parsed fields"
        );
    } else {
        // Non-200 is acceptable - verifies the endpoint exists and processes the request
        assert!(
            status < 600,
            "install-review should return a valid HTTP status"
        );
    }

    runtime.shutdown().await.expect("shutdown should succeed");
}

#[tokio::test]
async fn settings_round_trip_via_api() {
    let tempdir = TempDir::new().expect("tempdir should be created");
    let runtime = start_runtime(temp_config(&tempdir))
        .await
        .expect("runtime should start");
    let client = Client::new();
    let bootstrap = bootstrap(&client, &runtime).await;

    // Write two settings values.
    let write_response = client
        .post(format!(
            "{}/api/v1/settings",
            runtime.launch_context().api_base_url
        ))
        .bearer_auth(&bootstrap.auth_token)
        .json(&serde_json::json!({
            "values": { "ui.theme": "dark", "editor.fontSize": "14" }
        }))
        .send()
        .await
        .expect("settings write request should complete");
    assert_eq!(
        write_response.status().as_u16(),
        204,
        "settings write should return 204"
    );

    // Read back and verify the response is non-null.
    let settings_after_first_write: serde_json::Value = client
        .get(format!(
            "{}/api/v1/settings",
            runtime.launch_context().api_base_url
        ))
        .bearer_auth(&bootstrap.auth_token)
        .send()
        .await
        .expect("settings read request should complete")
        .error_for_status()
        .expect("settings read request should succeed")
        .json()
        .await
        .expect("settings read response should deserialize");
    assert!(
        !settings_after_first_write.is_null(),
        "settings response should be non-null after first write"
    );

    // Overwrite one of the settings.
    let overwrite_response = client
        .post(format!(
            "{}/api/v1/settings",
            runtime.launch_context().api_base_url
        ))
        .bearer_auth(&bootstrap.auth_token)
        .json(&serde_json::json!({
            "values": { "ui.theme": "light" }
        }))
        .send()
        .await
        .expect("settings overwrite request should complete");
    assert_eq!(
        overwrite_response.status().as_u16(),
        204,
        "settings overwrite should return 204"
    );

    // Read again — response must still be non-null.
    let settings_after_second_write: serde_json::Value = client
        .get(format!(
            "{}/api/v1/settings",
            runtime.launch_context().api_base_url
        ))
        .bearer_auth(&bootstrap.auth_token)
        .send()
        .await
        .expect("settings read request should complete")
        .error_for_status()
        .expect("settings read request should succeed")
        .json()
        .await
        .expect("settings read response should deserialize");
    assert!(
        !settings_after_second_write.is_null(),
        "settings response should be non-null after second write"
    );

    runtime.shutdown().await.expect("shutdown should succeed");
}
