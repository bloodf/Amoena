use std::net::TcpListener;

use lunaria_desktop::{start_runtime, BootstrapSession, RuntimeConfig, RuntimeHandle};
use reqwest::Client;
use serde_json::{json, Value};
use tempfile::TempDir;

fn temp_config(tempdir: &TempDir) -> RuntimeConfig {
    let mut config = RuntimeConfig::default();
    config.database_path = tempdir.path().join("lunaria.sqlite");
    config
}

fn unused_port() -> u16 {
    TcpListener::bind("127.0.0.1:0")
        .expect("ephemeral port should bind")
        .local_addr()
        .expect("local addr should resolve")
        .port()
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

async fn pair_remote_device(runtime: &RuntimeHandle) -> (Client, BootstrapSession, String, String) {
    let client = Client::new();
    let bootstrap = bootstrap(&client, runtime).await;

    let enabled: Value = client
        .post(format!("{}/api/v1/remote/lan", runtime.launch_context().api_base_url))
        .bearer_auth(&bootstrap.auth_token)
        .json(&json!({
            "enabled": true,
            "bindAddress": "127.0.0.1",
            "port": unused_port()
        }))
        .send()
        .await
        .expect("lan enable request should complete")
        .error_for_status()
        .expect("lan enable should succeed")
        .json()
        .await
        .expect("lan enable response should deserialize");
    let lan_base_url = enabled["lanBaseUrl"]
        .as_str()
        .expect("lan base url should exist")
        .to_string();

    let pairing: Value = client
        .post(format!(
            "{}/api/v1/remote/pairing/intents",
            runtime.launch_context().api_base_url
        ))
        .bearer_auth(&bootstrap.auth_token)
        .json(&json!({}))
        .send()
        .await
        .expect("pairing intent request should complete")
        .error_for_status()
        .expect("pairing intent should succeed")
        .json()
        .await
        .expect("pairing intent should deserialize");

    let paired: Value = client
        .post(format!("{lan_base_url}/api/v1/remote/pair/complete"))
        .json(&json!({
            "pairingToken": pairing["pairingToken"],
            "pin": pairing["pinCode"],
            "deviceMetadata": {
                "name": "Workspace Phone",
                "deviceType": "mobile",
                "platform": "ios",
                "metadata": {}
            }
        }))
        .send()
        .await
        .expect("pair completion request should complete")
        .error_for_status()
        .expect("pair completion should succeed")
        .json()
        .await
        .expect("pair completion response should deserialize");

    (
        client,
        bootstrap,
        lan_base_url,
        paired["accessToken"]
            .as_str()
            .expect("remote access token should exist")
            .to_string(),
    )
}

#[tokio::test]
async fn session_memory_endpoint_returns_tiers_and_budget() {
    let tempdir = TempDir::new().expect("tempdir should be created");
    let runtime = start_runtime(temp_config(&tempdir))
        .await
        .expect("runtime should start");
    let client = Client::new();
    let bootstrap = bootstrap(&client, &runtime).await;

    let session: Value = client
        .post(format!("{}/api/v1/sessions", runtime.launch_context().api_base_url))
        .bearer_auth(&bootstrap.auth_token)
        .json(&json!({
            "workingDir": tempdir.path().display().to_string(),
            "sessionMode": "native",
            "tuiType": "native"
        }))
        .send()
        .await
        .expect("create session should complete")
        .error_for_status()
        .expect("create session should succeed")
        .json()
        .await
        .expect("create session response should deserialize");
    let session_id = session["id"].as_str().expect("session id should exist");

    client
        .post(format!(
            "{}/api/v1/sessions/{session_id}/messages",
            runtime.launch_context().api_base_url
        ))
        .bearer_auth(&bootstrap.auth_token)
        .json(&json!({
            "content": "Review src/main.rs and keep the bugfix context in memory",
            "attachments": [
                { "type": "file_ref", "name": "main.rs", "path": tempdir.path().join("src/main.rs").display().to_string() }
            ]
        }))
        .send()
        .await
        .expect("message create should complete")
        .error_for_status()
        .expect("message create should succeed");

    let memory: Value = client
        .get(format!(
            "{}/api/v1/sessions/{session_id}/memory",
            runtime.launch_context().api_base_url
        ))
        .bearer_auth(&bootstrap.auth_token)
        .send()
        .await
        .expect("memory request should complete")
        .error_for_status()
        .expect("memory request should succeed")
        .json()
        .await
        .expect("memory response should deserialize");

    assert!(memory["entries"].as_array().is_some());
    assert!(
        !memory["entries"].as_array().expect("entries should be array").is_empty(),
        "memory entries should include at least one captured observation"
    );
    assert_eq!(memory["tokenBudget"]["total"].as_i64(), Some(100_000));
    assert!(memory["entries"][0]["l0Summary"].as_str().is_some());
    assert!(memory["entries"][0]["l1Summary"].as_str().is_some());
    assert!(memory["entries"][0]["l2Content"].as_str().is_some());

    runtime.shutdown().await.expect("shutdown should succeed");
}

#[tokio::test]
async fn paired_remote_clients_can_read_and_write_session_surfaces() {
    let tempdir = TempDir::new().expect("tempdir should be created");
    let runtime = start_runtime(temp_config(&tempdir))
        .await
        .expect("runtime should start");
    let (client, bootstrap, lan_base_url, remote_access_token) = pair_remote_device(&runtime).await;

    let session: Value = client
        .post(format!("{}/api/v1/sessions", runtime.launch_context().api_base_url))
        .bearer_auth(&bootstrap.auth_token)
        .json(&json!({
            "workingDir": tempdir.path().display().to_string(),
            "sessionMode": "native",
            "tuiType": "native"
        }))
        .send()
        .await
        .expect("create session should complete")
        .error_for_status()
        .expect("create session should succeed")
        .json()
        .await
        .expect("create session response should deserialize");
    let session_id = session["id"].as_str().expect("session id should exist");

    let initial_messages: Value = client
        .get(format!("{lan_base_url}/api/v1/sessions/{session_id}/messages"))
        .bearer_auth(&remote_access_token)
        .send()
        .await
        .expect("remote message list should complete")
        .error_for_status()
        .expect("remote message list should succeed")
        .json()
        .await
        .expect("remote message list response should deserialize");
    assert_eq!(
        initial_messages
            .as_array()
            .expect("initial remote messages should be array")
            .len(),
        0
    );

    client
        .post(format!("{lan_base_url}/api/v1/sessions/{session_id}/messages"))
        .bearer_auth(&remote_access_token)
        .json(&json!({
            "content": "Remote mobile follow-up",
            "attachments": [
                { "type": "file_ref", "name": "app.tsx", "path": "/tmp/app.tsx" },
                { "type": "folder_ref", "name": "src", "path": "/tmp/src", "itemCount": 4, "truncated": false }
            ]
        }))
        .send()
        .await
        .expect("remote message create should complete")
        .error_for_status()
        .expect("remote message create should succeed");

    let remote_messages: Value = client
        .get(format!("{lan_base_url}/api/v1/sessions/{session_id}/messages"))
        .bearer_auth(&remote_access_token)
        .send()
        .await
        .expect("remote message list after create should complete")
        .error_for_status()
        .expect("remote message list after create should succeed")
        .json()
        .await
        .expect("remote message list after create should deserialize");
    let remote_messages = remote_messages
        .as_array()
        .expect("remote messages after create should be array");
    assert_eq!(remote_messages.len(), 1);
    assert_eq!(remote_messages[0]["content"].as_str(), Some("Remote mobile follow-up"));

    let remote_agents: Value = client
        .get(format!("{lan_base_url}/api/v1/sessions/{session_id}/agents/list"))
        .bearer_auth(&remote_access_token)
        .send()
        .await
        .expect("remote agents request should complete")
        .error_for_status()
        .expect("remote agents request should succeed")
        .json()
        .await
        .expect("remote agents response should deserialize");
    assert!(
        !remote_agents
            .as_array()
            .expect("remote agents should be array")
            .is_empty(),
        "paired clients should be able to inspect session agents"
    );

    runtime.shutdown().await.expect("shutdown should succeed");
}
