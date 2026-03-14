use std::net::TcpListener;

use lunaria_desktop::{start_runtime, BootstrapSession, RuntimeConfig, RuntimeHandle};
use reqwest::Client;
use serde_json::Value;
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
async fn lan_listener_is_disabled_by_default_and_can_be_toggled() {
    let tempdir = TempDir::new().expect("tempdir should be created");
    let runtime = start_runtime(temp_config(&tempdir))
        .await
        .expect("runtime should start");
    let client = Client::new();
    let bootstrap = bootstrap(&client, &runtime).await;

    let initial_status: Value = client
        .get(format!(
            "{}/api/v1/remote/lan",
            runtime.launch_context().api_base_url
        ))
        .bearer_auth(&bootstrap.auth_token)
        .send()
        .await
        .expect("lan status request should complete")
        .error_for_status()
        .expect("lan status should succeed")
        .json()
        .await
        .expect("lan status should deserialize");

    assert_eq!(initial_status["enabled"], false);

    let port = unused_port();
    let enabled: Value = client
        .post(format!("{}/api/v1/remote/lan", runtime.launch_context().api_base_url))
        .bearer_auth(&bootstrap.auth_token)
        .json(&serde_json::json!({
            "enabled": true,
            "bindAddress": "127.0.0.1",
            "port": port
        }))
        .send()
        .await
        .expect("lan enable request should complete")
        .error_for_status()
        .expect("lan enable should succeed")
        .json()
        .await
        .expect("lan enable response should deserialize");

    assert_eq!(enabled["enabled"], true);
    let lan_base_url = enabled["lanBaseUrl"]
        .as_str()
        .expect("lan base url should exist")
        .to_string();

    let lan_health = client
        .get(format!("{lan_base_url}/api/v1/health"))
        .send()
        .await
        .expect("lan health request should complete");
    assert!(lan_health.status().is_success());

    let disabled: Value = client
        .post(format!("{}/api/v1/remote/lan", runtime.launch_context().api_base_url))
        .bearer_auth(&bootstrap.auth_token)
        .json(&serde_json::json!({ "enabled": false }))
        .send()
        .await
        .expect("lan disable request should complete")
        .error_for_status()
        .expect("lan disable should succeed")
        .json()
        .await
        .expect("lan disable response should deserialize");

    assert_eq!(disabled["enabled"], false);
    assert!(
        client.get(format!("{lan_base_url}/api/v1/health")).send().await.is_err(),
        "lan listener should stop serving after disable"
    );

    runtime.shutdown().await.expect("shutdown should succeed");
}

#[tokio::test]
async fn pairing_refresh_and_revoke_flow_work_over_lan_auth() {
    let tempdir = TempDir::new().expect("tempdir should be created");
    let runtime = start_runtime(temp_config(&tempdir))
        .await
        .expect("runtime should start");
    let client = Client::new();
    let bootstrap = bootstrap(&client, &runtime).await;

    let port = unused_port();
    let enabled: Value = client
        .post(format!("{}/api/v1/remote/lan", runtime.launch_context().api_base_url))
        .bearer_auth(&bootstrap.auth_token)
        .json(&serde_json::json!({
            "enabled": true,
            "bindAddress": "127.0.0.1",
            "port": port
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
        .json(&serde_json::json!({}))
        .send()
        .await
        .expect("pairing intent request should complete")
        .error_for_status()
        .expect("pairing intent should succeed")
        .json()
        .await
        .expect("pairing intent should deserialize");

    let pairing_token = pairing["pairingToken"]
        .as_str()
        .expect("pairing token should exist");
    let pin = pairing["pinCode"]
        .as_str()
        .expect("pin code should exist");

    let rejected = client
        .post(format!("{lan_base_url}/api/v1/remote/pair/complete"))
        .json(&serde_json::json!({
            "pairingToken": pairing_token,
            "pin": "000000",
            "deviceMetadata": {
                "name": "Heitor's iPhone",
                "deviceType": "mobile",
                "platform": "ios"
            }
        }))
        .send()
        .await
        .expect("pair reject request should complete");
    assert_eq!(rejected.status(), reqwest::StatusCode::UNAUTHORIZED);

    let paired: Value = client
        .post(format!("{lan_base_url}/api/v1/remote/pair/complete"))
        .json(&serde_json::json!({
            "pairingToken": pairing_token,
            "pin": pin,
            "deviceMetadata": {
                "name": "Heitor's iPhone",
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

    let device_id = paired["deviceId"]
        .as_str()
        .expect("device id should exist")
        .to_string();
    let access_token = paired["accessToken"]
        .as_str()
        .expect("access token should exist")
        .to_string();
    let refresh_token = paired["refreshToken"]
        .as_str()
        .expect("refresh token should exist")
        .to_string();

    let me: Value = client
        .get(format!("{lan_base_url}/api/v1/remote/devices/me"))
        .bearer_auth(&access_token)
        .send()
        .await
        .expect("me request should complete")
        .error_for_status()
        .expect("me request should succeed")
        .json()
        .await
        .expect("me response should deserialize");
    assert_eq!(me["deviceId"], device_id);

    let refreshed: Value = client
        .post(format!("{lan_base_url}/api/v1/remote/auth/refresh"))
        .json(&serde_json::json!({ "refreshToken": refresh_token }))
        .send()
        .await
        .expect("refresh request should complete")
        .error_for_status()
        .expect("refresh should succeed")
        .json()
        .await
        .expect("refresh response should deserialize");
    let refreshed_access = refreshed["accessToken"]
        .as_str()
        .expect("refreshed access should exist")
        .to_string();

    client
        .post(format!(
            "{}/api/v1/remote/devices/{device_id}/revoke",
            runtime.launch_context().api_base_url
        ))
        .bearer_auth(&bootstrap.auth_token)
        .send()
        .await
        .expect("revoke request should complete")
        .error_for_status()
        .expect("revoke should succeed");

    let unauthorized = client
        .get(format!("{lan_base_url}/api/v1/remote/devices/me"))
        .bearer_auth(&refreshed_access)
        .send()
        .await
        .expect("post-revoke me request should complete");
    assert_eq!(unauthorized.status(), reqwest::StatusCode::UNAUTHORIZED);

    runtime.shutdown().await.expect("shutdown should succeed");
}

#[tokio::test]
async fn paired_remote_clients_can_list_and_send_session_messages() {
    let tempdir = TempDir::new().expect("tempdir should be created");
    let runtime = start_runtime(temp_config(&tempdir))
        .await
        .expect("runtime should start");
    let client = Client::new();
    let bootstrap = bootstrap(&client, &runtime).await;

    let port = unused_port();
    let enabled: Value = client
        .post(format!("{}/api/v1/remote/lan", runtime.launch_context().api_base_url))
        .bearer_auth(&bootstrap.auth_token)
        .json(&serde_json::json!({
            "enabled": true,
            "bindAddress": "127.0.0.1",
            "port": port
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
        .json(&serde_json::json!({}))
        .send()
        .await
        .expect("pairing intent request should complete")
        .error_for_status()
        .expect("pairing intent should succeed")
        .json()
        .await
        .expect("pairing intent should deserialize");

    let remote_access: Value = client
        .post(format!("{lan_base_url}/api/v1/remote/pair/complete"))
        .json(&serde_json::json!({
            "pairingToken": pairing["pairingToken"],
            "pin": pairing["pinCode"],
            "deviceMetadata": {
                "name": "QA iPhone",
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
    let remote_access_token = remote_access["accessToken"]
        .as_str()
        .expect("remote access token should exist")
        .to_string();

    let session: Value = client
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
        .json(&serde_json::json!({ "content": "desktop seeded message" }))
        .send()
        .await
        .expect("desktop seed message request should complete")
        .error_for_status()
        .expect("desktop seed message should succeed");

    let listed: Value = client
        .get(format!("{lan_base_url}/api/v1/sessions/{session_id}/messages"))
        .bearer_auth(&remote_access_token)
        .send()
        .await
        .expect("remote list messages should complete")
        .error_for_status()
        .expect("remote list messages should succeed")
        .json()
        .await
        .expect("remote list messages response should deserialize");
    assert!(
        listed
            .as_array()
            .expect("remote messages should be an array")
            .iter()
            .any(|message| message["content"].as_str() == Some("desktop seeded message")),
        "paired client should be able to read session transcript messages"
    );

    client
        .post(format!("{lan_base_url}/api/v1/sessions/{session_id}/messages"))
        .bearer_auth(&remote_access_token)
        .json(&serde_json::json!({
            "content": "mobile follow-up",
            "attachments": [
                {
                    "type": "file_ref",
                    "name": "notes.md",
                    "path": "notes.md"
                }
            ]
        }))
        .send()
        .await
        .expect("remote create message should complete")
        .error_for_status()
        .expect("remote create message should succeed");

    let refreshed: Value = client
        .get(format!(
            "{}/api/v1/sessions/{session_id}/messages",
            runtime.launch_context().api_base_url
        ))
        .bearer_auth(&bootstrap.auth_token)
        .send()
        .await
        .expect("desktop list messages should complete")
        .error_for_status()
        .expect("desktop list messages should succeed")
        .json()
        .await
        .expect("desktop list messages response should deserialize");
    assert!(
        refreshed
            .as_array()
            .expect("desktop messages should be an array")
            .iter()
            .any(|message| message["content"].as_str() == Some("mobile follow-up")),
        "paired client messages should persist through the main session message path"
    );

    runtime.shutdown().await.expect("shutdown should succeed");
}
