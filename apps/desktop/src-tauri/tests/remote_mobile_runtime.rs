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

async fn pair_remote_device(
    runtime: &RuntimeHandle,
    bootstrap: &BootstrapSession,
) -> (Client, String, String) {
    let client = Client::new();

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
                "name": "Mobile QA Phone",
                "deviceType": "mobile",
                "platform": "ios"
            }
        }))
        .send()
        .await
        .expect("pair completion request should complete")
        .error_for_status()
        .expect("pair completion should succeed")
        .json()
        .await
        .expect("pair completion should deserialize");

    (
        client,
        lan_base_url,
        paired["accessToken"]
            .as_str()
            .expect("remote access token should exist")
            .to_string(),
    )
}

#[tokio::test]
async fn paired_mobile_clients_can_read_session_summaries_messages_agents_and_memory() {
    let tempdir = TempDir::new().expect("tempdir should be created");
    let workspace_root = tempdir.path().join("workspace");
    std::fs::create_dir_all(workspace_root.join("src"))
        .expect("workspace root should be created");
    std::fs::write(workspace_root.join("src/main.ts"), "console.log('mobile');\n")
        .expect("workspace file should be written");

    let runtime = start_runtime(temp_config(&tempdir))
        .await
        .expect("runtime should start");
    let client = Client::new();
    let bootstrap = bootstrap(&client, &runtime).await;

    let created: Value = client
        .post(format!("{}/api/v1/sessions", runtime.launch_context().api_base_url))
        .bearer_auth(&bootstrap.auth_token)
        .json(&json!({
            "workingDir": workspace_root.display().to_string(),
            "sessionMode": "native",
            "tuiType": "native",
            "metadata": { "autopilot": true }
        }))
        .send()
        .await
        .expect("create session should complete")
        .error_for_status()
        .expect("create session should succeed")
        .json()
        .await
        .expect("create session should deserialize");
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
        .json(&json!({ "content": "Remote mobile summary request" }))
        .send()
        .await
        .expect("create message should complete")
        .error_for_status()
        .expect("create message should succeed");

    let (remote_client, lan_base_url, remote_access_token) =
        pair_remote_device(&runtime, &bootstrap).await;

    let sessions: Value = remote_client
        .get(format!("{lan_base_url}/api/v1/sessions"))
        .bearer_auth(&remote_access_token)
        .send()
        .await
        .expect("remote sessions request should complete")
        .error_for_status()
        .expect("remote sessions should succeed")
        .json()
        .await
        .expect("remote sessions should deserialize");
    assert!(
        sessions
            .as_array()
            .expect("sessions should be an array")
            .iter()
            .any(|candidate| candidate["id"].as_str() == Some(session_id.as_str()))
    );

    let messages: Value = remote_client
        .get(format!(
            "{lan_base_url}/api/v1/sessions/{session_id}/messages"
        ))
        .bearer_auth(&remote_access_token)
        .send()
        .await
        .expect("remote messages request should complete")
        .error_for_status()
        .expect("remote messages should succeed")
        .json()
        .await
        .expect("remote messages should deserialize");
    assert!(
        messages
            .as_array()
            .expect("messages should be an array")
            .iter()
            .any(|message| message["content"].as_str() == Some("Remote mobile summary request"))
    );

    let agents: Value = remote_client
        .get(format!(
            "{lan_base_url}/api/v1/sessions/{session_id}/agents/list"
        ))
        .bearer_auth(&remote_access_token)
        .send()
        .await
        .expect("remote agents request should complete")
        .error_for_status()
        .expect("remote agents should succeed")
        .json()
        .await
        .expect("remote agents should deserialize");
    assert!(
        !agents
            .as_array()
            .expect("agents should be an array")
            .is_empty(),
        "remote mobile client should see the session's agents"
    );

    let memory: Value = remote_client
        .get(format!(
            "{lan_base_url}/api/v1/sessions/{session_id}/memory"
        ))
        .bearer_auth(&remote_access_token)
        .send()
        .await
        .expect("remote memory request should complete")
        .error_for_status()
        .expect("remote memory should succeed")
        .json()
        .await
        .expect("remote memory should deserialize");
    assert!(
        memory["entries"]
            .as_array()
            .expect("memory entries should be an array")
            .iter()
            .any(|entry| entry["title"].as_str() == Some("User prompt"))
    );

    runtime.shutdown().await.expect("shutdown should succeed");
}
