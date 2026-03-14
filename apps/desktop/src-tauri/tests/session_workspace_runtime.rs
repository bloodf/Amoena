use lunaria_desktop::{start_runtime, BootstrapSession, RuntimeConfig, RuntimeHandle};
use reqwest::Client;
use serde_json::Value;
use tempfile::TempDir;

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

#[tokio::test]
async fn session_workspace_support_endpoints_return_memory_metadata_and_file_writes() {
    let tempdir = TempDir::new().expect("tempdir should be created");
    let workspace_root = tempdir.path().join("workspace");
    std::fs::create_dir_all(workspace_root.join("src/auth"))
        .expect("workspace folders should be created");
    std::fs::write(
        workspace_root.join("src/auth/tokens.rs"),
        "pub fn refresh() -> bool { false }\n",
    )
    .expect("workspace file should be written");

    let runtime = start_runtime(temp_config(&tempdir))
        .await
        .expect("runtime should start");
    let client = Client::new();
    let bootstrap = bootstrap(&client, &runtime).await;

    let created: Value = client
        .post(format!("{}/api/v1/sessions", runtime.launch_context().api_base_url))
        .bearer_auth(&bootstrap.auth_token)
        .json(&serde_json::json!({
            "workingDir": workspace_root.display().to_string(),
            "sessionMode": "native",
            "tuiType": "native",
            "metadata": { "autopilot": true }
        }))
        .send()
        .await
        .expect("create session request should complete")
        .error_for_status()
        .expect("create session should succeed")
        .json()
        .await
        .expect("create session response should deserialize");
    let session_id = created["id"]
        .as_str()
        .expect("session id should exist")
        .to_string();

    client
        .post(format!(
            "{}/api/v1/sessions/{session_id}/messages",
            runtime.launch_context().api_base_url
        ))
        .bearer_auth(&bootstrap.auth_token)
        .json(&serde_json::json!({
            "content": "Review the auth middleware",
            "attachments": [{ "type": "file_ref", "path": "src/auth/tokens.rs", "name": "tokens.rs" }]
        }))
        .send()
        .await
        .expect("message create request should complete")
        .error_for_status()
        .expect("message create should succeed");

    let sessions: Value = client
        .get(format!("{}/api/v1/sessions", runtime.launch_context().api_base_url))
        .bearer_auth(&bootstrap.auth_token)
        .send()
        .await
        .expect("sessions list request should complete")
        .error_for_status()
        .expect("sessions list should succeed")
        .json()
        .await
        .expect("sessions list should deserialize");
    let session_summary = sessions
        .as_array()
        .expect("sessions should be an array")
        .iter()
        .find(|candidate| candidate["id"].as_str() == Some(session_id.as_str()))
        .expect("created session should be listed");
    assert_eq!(
        session_summary["metadata"]["autopilot"].as_bool(),
        Some(true),
        "session summary should preserve metadata required by the workspace header"
    );

    let memory: Value = client
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
    assert!(
        memory["entries"]
            .as_array()
            .expect("memory entries should be an array")
            .iter()
            .any(|entry| entry["title"].as_str() == Some("User prompt")),
        "session memory should expose observation tiers to the workspace"
    );
    assert!(
        memory["tokenBudget"]["total"].as_i64().unwrap_or_default() > 0,
        "session memory should expose a token budget"
    );

    client
        .post(format!(
            "{}/api/v1/files/content",
            runtime.launch_context().api_base_url
        ))
        .bearer_auth(&bootstrap.auth_token)
        .json(&serde_json::json!({
            "path": workspace_root.join("src/auth/tokens.rs").display().to_string(),
            "content": "pub fn refresh() -> bool { true }\n"
        }))
        .send()
        .await
        .expect("file save request should complete")
        .error_for_status()
        .expect("file save should succeed");

    let file_path = workspace_root.join("src/auth/tokens.rs").display().to_string();
    let file_content: Value = client
        .get(format!(
            "{}/api/v1/files/content",
            runtime.launch_context().api_base_url,
        ))
        .bearer_auth(&bootstrap.auth_token)
        .query(&[("path", file_path.as_str())])
        .send()
        .await
        .expect("file content request should complete")
        .error_for_status()
        .expect("file content should succeed")
        .json()
        .await
        .expect("file content should deserialize");
    assert_eq!(
        file_content["content"].as_str(),
        Some("pub fn refresh() -> bool { true }\n"),
        "file writes should round-trip through the workspace editor contract"
    );

    runtime.shutdown().await.expect("shutdown should succeed");
}

#[tokio::test]
async fn session_autopilot_endpoint_updates_session_metadata() {
    let tempdir = TempDir::new().expect("tempdir should be created");
    let runtime = start_runtime(temp_config(&tempdir))
        .await
        .expect("runtime should start");
    let client = Client::new();
    let bootstrap = bootstrap(&client, &runtime).await;

    let created: Value = client
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
    let session_id = created["id"]
        .as_str()
        .expect("session id should exist")
        .to_string();

    let updated: Value = client
        .post(format!(
            "{}/api/v1/sessions/{session_id}/autopilot",
            runtime.launch_context().api_base_url
        ))
        .bearer_auth(&bootstrap.auth_token)
        .json(&serde_json::json!({ "enabled": true }))
        .send()
        .await
        .expect("autopilot update request should complete")
        .error_for_status()
        .expect("autopilot update should succeed")
        .json()
        .await
        .expect("autopilot update response should deserialize");

    assert_eq!(updated["metadata"]["autopilot"].as_bool(), Some(true));

    let sessions: Value = client
        .get(format!("{}/api/v1/sessions", runtime.launch_context().api_base_url))
        .bearer_auth(&bootstrap.auth_token)
        .send()
        .await
        .expect("sessions list request should complete")
        .error_for_status()
        .expect("sessions list should succeed")
        .json()
        .await
        .expect("sessions list should deserialize");
    let session_summary = sessions
        .as_array()
        .expect("sessions should be an array")
        .iter()
        .find(|candidate| candidate["id"].as_str() == Some(session_id.as_str()))
        .expect("updated session should be listed");

    assert_eq!(session_summary["metadata"]["autopilot"].as_bool(), Some(true));

    runtime.shutdown().await.expect("shutdown should succeed");
}

#[tokio::test]
async fn autopilot_endpoint_updates_session_metadata() {
    let tempdir = TempDir::new().expect("tempdir should be created");
    let runtime = start_runtime(temp_config(&tempdir))
        .await
        .expect("runtime should start");
    let client = Client::new();
    let bootstrap = bootstrap(&client, &runtime).await;

    let created: Value = client
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
    let session_id = created["id"]
        .as_str()
        .expect("session id should exist")
        .to_string();

    client
        .post(format!(
            "{}/api/v1/sessions/{session_id}/autopilot",
            runtime.launch_context().api_base_url
        ))
        .bearer_auth(&bootstrap.auth_token)
        .json(&serde_json::json!({ "enabled": true }))
        .send()
        .await
        .expect("autopilot toggle request should complete")
        .error_for_status()
        .expect("autopilot toggle should succeed");

    let sessions: Value = client
        .get(format!("{}/api/v1/sessions", runtime.launch_context().api_base_url))
        .bearer_auth(&bootstrap.auth_token)
        .send()
        .await
        .expect("sessions list request should complete")
        .error_for_status()
        .expect("sessions list should succeed")
        .json()
        .await
        .expect("sessions list should deserialize");
    let session_summary = sessions
        .as_array()
        .expect("sessions should be an array")
        .iter()
        .find(|candidate| candidate["id"].as_str() == Some(session_id.as_str()))
        .expect("created session should be listed");

    assert_eq!(session_summary["metadata"]["autopilot"].as_bool(), Some(true));

    runtime.shutdown().await.expect("shutdown should succeed");
}
