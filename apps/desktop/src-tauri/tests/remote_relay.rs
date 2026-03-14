use std::{net::TcpListener, time::Duration};

use base64::{engine::general_purpose::STANDARD as B64, Engine as _};
use chacha20poly1305::{
    aead::{Aead, KeyInit},
    Key, XChaCha20Poly1305, XNonce,
};
use lunaria_desktop::{start_runtime, BootstrapSession, RuntimeConfig, RuntimeHandle};
use rand::{rngs::OsRng, RngCore};
use reqwest::{Client, StatusCode};
use rusqlite::Connection;
use serde_json::{json, Value};
use tempfile::TempDir;
use x25519_dalek::{EphemeralSecret, PublicKey};

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
    tempdir: &TempDir,
    runtime: &RuntimeHandle,
) -> (Client, BootstrapSession, String, String) {
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
                "name": "Relay Test Phone",
                "deviceType": "mobile",
                "platform": "ios",
                "metadata": {
                    "tempdir": tempdir.path().display().to_string()
                }
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
        bootstrap,
        lan_base_url,
        paired["accessToken"]
            .as_str()
            .expect("remote access token should exist")
            .to_string(),
    )
}

fn derive_cipher(client_secret: EphemeralSecret, server_public_b64: &str) -> XChaCha20Poly1305 {
    let server_public_bytes: [u8; 32] = B64
        .decode(server_public_b64)
        .expect("server public key should decode")
        .try_into()
        .expect("server public key should be 32 bytes");
    let server_public = PublicKey::from(server_public_bytes);
    let shared = client_secret.diffie_hellman(&server_public);
    XChaCha20Poly1305::new(Key::from_slice(shared.as_bytes()))
}

fn encrypt_json(cipher: &XChaCha20Poly1305, value: &Value) -> (String, String) {
    let mut nonce = [0u8; 24];
    OsRng.fill_bytes(&mut nonce);
    let plaintext = serde_json::to_vec(value).expect("payload should serialize");
    let ciphertext = cipher
        .encrypt(XNonce::from_slice(&nonce), plaintext.as_ref())
        .expect("payload should encrypt");
    (B64.encode(nonce), B64.encode(ciphertext))
}

fn decrypt_json(cipher: &XChaCha20Poly1305, nonce_b64: &str, ciphertext_b64: &str) -> Value {
    let nonce_vec = B64.decode(nonce_b64).expect("nonce should decode");
    let ciphertext = B64
        .decode(ciphertext_b64)
        .expect("ciphertext should decode");
    let plaintext = cipher
        .decrypt(XNonce::from_slice(&nonce_vec), ciphertext.as_ref())
        .expect("ciphertext should decrypt");
    serde_json::from_slice(&plaintext).expect("plaintext should decode")
}

#[tokio::test]
async fn relay_room_encrypts_payloads_and_replays_only_missing_events() {
    let tempdir = TempDir::new().expect("tempdir should be created");
    let runtime = start_runtime(temp_config(&tempdir))
        .await
        .expect("runtime should start");
    let (client, bootstrap, _lan_base_url, remote_access_token) =
        pair_remote_device(&tempdir, &runtime).await;

    let room: Value = client
        .post(format!(
            "{}/api/v1/remote/relay/rooms",
            runtime.launch_context().api_base_url
        ))
        .bearer_auth(&bootstrap.auth_token)
        .send()
        .await
        .expect("relay room request should complete")
        .error_for_status()
        .expect("relay room should succeed")
        .json()
        .await
        .expect("relay room response should deserialize");

    let room_id = room["roomId"].as_str().expect("room id should exist");
    let server_public_key = room["serverPublicKey"]
        .as_str()
        .expect("server public key should exist");

    let client_secret = EphemeralSecret::random_from_rng(OsRng);
    let client_public = PublicKey::from(&client_secret);
    let join: Value = client
        .post(format!(
            "{}/api/v1/remote/relay/rooms/{room_id}/join",
            runtime.launch_context().api_base_url
        ))
        .bearer_auth(&remote_access_token)
        .json(&json!({
            "clientPublicKey": B64.encode(client_public.as_bytes())
        }))
        .send()
        .await
        .expect("relay join should complete")
        .error_for_status()
        .expect("relay join should succeed")
        .json()
        .await
        .expect("relay join response should deserialize");

    assert_eq!(join["serverPublicKey"], server_public_key);

    let cipher = derive_cipher(client_secret, server_public_key);
    let first_command = json!({
        "kind": "sessions.list"
    });
    let (nonce, ciphertext) = encrypt_json(&cipher, &first_command);

    let post_status = client
        .post(format!(
            "{}/api/v1/remote/relay/rooms/{room_id}/commands",
            runtime.launch_context().api_base_url
        ))
        .bearer_auth(&remote_access_token)
        .json(&json!({
            "requestId": "req-1",
            "nonce": nonce,
            "ciphertext": ciphertext
        }))
        .send()
        .await
        .expect("relay command should complete");
    assert_eq!(post_status.status(), StatusCode::ACCEPTED);

    let events: Value = client
        .get(format!(
            "{}/api/v1/remote/relay/rooms/{room_id}/events",
            runtime.launch_context().api_base_url
        ))
        .bearer_auth(&remote_access_token)
        .send()
        .await
        .expect("relay events should complete")
        .error_for_status()
        .expect("relay events should succeed")
        .json()
        .await
        .expect("relay events should deserialize");

    let events = events.as_array().expect("relay events should be an array");
    assert_eq!(events.len(), 1);
    let first_event = &events[0];
    assert!(first_event["ciphertext"].as_str().is_some());
    assert!(
        !first_event["ciphertext"]
            .as_str()
            .expect("ciphertext should exist")
            .contains("sessions.list"),
        "relay should only expose opaque ciphertext"
    );

    let decrypted = decrypt_json(
        &cipher,
        first_event["nonce"].as_str().expect("nonce should exist"),
        first_event["ciphertext"]
            .as_str()
            .expect("ciphertext should exist"),
    );
    assert_eq!(decrypted["requestId"], "req-1");
    assert!(decrypted["payload"]["sessions"].is_array());

    let (nonce2, ciphertext2) = encrypt_json(&cipher, &json!({ "kind": "sessions.list" }));
    client
        .post(format!(
            "{}/api/v1/remote/relay/rooms/{room_id}/commands",
            runtime.launch_context().api_base_url
        ))
        .bearer_auth(&remote_access_token)
        .json(&json!({
            "requestId": "req-2",
            "nonce": nonce2,
            "ciphertext": ciphertext2
        }))
        .send()
        .await
        .expect("second relay command should complete")
        .error_for_status()
        .expect("second relay command should succeed");

    let replayed: Value = client
        .get(format!(
            "{}/api/v1/remote/relay/rooms/{room_id}/events?lastEventId=1",
            runtime.launch_context().api_base_url
        ))
        .bearer_auth(&remote_access_token)
        .send()
        .await
        .expect("replayed relay events should complete")
        .error_for_status()
        .expect("replayed relay events should succeed")
        .json()
        .await
        .expect("replayed relay events should deserialize");
    let replayed = replayed.as_array().expect("replayed events should be an array");
    assert_eq!(replayed.len(), 1);
    assert_eq!(replayed[0]["eventId"], 2);

    runtime.shutdown().await.expect("shutdown should succeed");
}

#[tokio::test]
async fn remote_terminal_streams_output_and_last_event_id_avoids_duplicates() {
    let tempdir = TempDir::new().expect("tempdir should be created");
    let runtime = start_runtime(temp_config(&tempdir))
        .await
        .expect("runtime should start");
    let (client, _bootstrap, lan_base_url, remote_access_token) =
        pair_remote_device(&tempdir, &runtime).await;

    let terminal: Value = client
        .post(format!("{lan_base_url}/api/v1/terminal/sessions"))
        .bearer_auth(&remote_access_token)
        .json(&json!({
            "shell": "/bin/cat",
            "cwd": tempdir.path().display().to_string(),
            "cols": 80,
            "rows": 24
        }))
        .send()
        .await
        .expect("terminal create should complete")
        .error_for_status()
        .expect("terminal create should succeed")
        .json()
        .await
        .expect("terminal create response should deserialize");

    let terminal_id = terminal["terminalSessionId"]
        .as_str()
        .expect("terminal id should exist");

    client
        .post(format!("{lan_base_url}/api/v1/terminal/sessions/{terminal_id}/input"))
        .bearer_auth(&remote_access_token)
        .json(&json!({ "data": "relay-terminal\n" }))
        .send()
        .await
        .expect("terminal input should complete")
        .error_for_status()
        .expect("terminal input should succeed");

    let mut events = Vec::new();
    for _ in 0..20 {
        let response: Value = client
            .get(format!(
                "{lan_base_url}/api/v1/terminal/sessions/{terminal_id}/events?lastEventId=0"
            ))
            .bearer_auth(&remote_access_token)
            .send()
            .await
            .expect("terminal events should complete")
            .error_for_status()
            .expect("terminal events should succeed")
            .json()
            .await
            .expect("terminal events should deserialize");
        events = response.as_array().cloned().expect("events should be an array");
        if events.iter().any(|event| event["data"].as_str().unwrap_or("").contains("relay-terminal")) {
            break;
        }
        tokio::time::sleep(Duration::from_millis(50)).await;
    }

    assert!(
        events
            .iter()
            .any(|event| event["data"].as_str().unwrap_or("").contains("relay-terminal")),
        "terminal output should contain the echoed content"
    );

    let last_event_id = events
        .last()
        .and_then(|event| event["eventId"].as_i64())
        .expect("last event id should exist");

    let mut current_last_event_id = last_event_id;
    let mut replayed_len = None;
    for _ in 0..10 {
        let replayed: Value = client
            .get(format!(
                "{lan_base_url}/api/v1/terminal/sessions/{terminal_id}/events?lastEventId={current_last_event_id}"
            ))
            .bearer_auth(&remote_access_token)
            .send()
            .await
            .expect("terminal replay should complete")
            .error_for_status()
            .expect("terminal replay should succeed")
            .json()
            .await
            .expect("terminal replay should deserialize");
        replayed_len = replayed.as_array().map(Vec::len);
        if replayed_len == Some(0) {
            break;
        }
        current_last_event_id = replayed
            .as_array()
            .and_then(|events| events.last())
            .and_then(|event| event["eventId"].as_i64())
            .expect("replayed events should carry event ids");
        tokio::time::sleep(Duration::from_millis(50)).await;
    }
    assert_eq!(replayed_len, Some(0));

    client
        .delete(format!("{lan_base_url}/api/v1/terminal/sessions/{terminal_id}"))
        .bearer_auth(&remote_access_token)
        .send()
        .await
        .expect("terminal close should complete")
        .error_for_status()
        .expect("terminal close should succeed");

    runtime.shutdown().await.expect("shutdown should succeed");
}

#[tokio::test]
async fn remote_terminal_preserves_escape_sequences_for_pty_output() {
    let tempdir = TempDir::new().expect("tempdir should be created");
    let runtime = start_runtime(temp_config(&tempdir))
        .await
        .expect("runtime should start");
    let (client, _bootstrap, lan_base_url, remote_access_token) =
        pair_remote_device(&tempdir, &runtime).await;

    let terminal: Value = client
        .post(format!("{lan_base_url}/api/v1/terminal/sessions"))
        .bearer_auth(&remote_access_token)
        .json(&json!({
            "shell": "/bin/sh",
            "cwd": tempdir.path().display().to_string(),
            "cols": 80,
            "rows": 24
        }))
        .send()
        .await
        .expect("terminal create should complete")
        .error_for_status()
        .expect("terminal create should succeed")
        .json()
        .await
        .expect("terminal create response should deserialize");

    let terminal_id = terminal["terminalSessionId"]
        .as_str()
        .expect("terminal id should exist");

    client
        .post(format!("{lan_base_url}/api/v1/terminal/sessions/{terminal_id}/input"))
        .bearer_auth(&remote_access_token)
        .json(&json!({ "data": "printf '\\033[31mred\\033[0m\\n'\n" }))
        .send()
        .await
        .expect("terminal input should complete")
        .error_for_status()
        .expect("terminal input should succeed");

    let mut events = Vec::new();
    for _ in 0..20 {
        let response: Value = client
            .get(format!(
                "{lan_base_url}/api/v1/terminal/sessions/{terminal_id}/events?lastEventId=0"
            ))
            .bearer_auth(&remote_access_token)
            .send()
            .await
            .expect("terminal events should complete")
            .error_for_status()
            .expect("terminal events should succeed")
            .json()
            .await
            .expect("terminal events should deserialize");
        events = response.as_array().cloned().expect("events should be an array");
        if events
            .iter()
            .any(|event| event["data"].as_str().unwrap_or("").contains("\u{1b}[31mred\u{1b}[0m"))
        {
            break;
        }
        tokio::time::sleep(Duration::from_millis(50)).await;
    }

    assert!(
        events
            .iter()
            .any(|event| event["data"].as_str().unwrap_or("").contains("\u{1b}[31mred\u{1b}[0m")),
        "pty-backed terminal output should preserve ANSI escape sequences"
    );

    runtime.shutdown().await.expect("shutdown should succeed");
}

#[tokio::test]
async fn remote_permission_resolution_works_over_remote_auth() {
    let tempdir = TempDir::new().expect("tempdir should be created");
    let config = temp_config(&tempdir);
    let database_path = config.database_path.clone();
    let runtime = start_runtime(config).await.expect("runtime should start");
    let (client, bootstrap, lan_base_url, remote_access_token) =
        pair_remote_device(&tempdir, &runtime).await;

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
        .expect("session create should complete")
        .error_for_status()
        .expect("session create should succeed")
        .json()
        .await
        .expect("session create response should deserialize");
    let session_id = session["id"].as_str().expect("session id should exist");

    let connection = Connection::open(database_path).expect("sqlite db should open");
    connection
        .execute(
            "INSERT INTO pending_approvals (id, session_id, tool_name, input, status, created_at, resolved_at, decision_reason)
             VALUES (?1, ?2, ?3, ?4, ?5, datetime('now'), NULL, NULL)",
            rusqlite::params![
                "req-remote-approval",
                session_id,
                "Bash",
                "{\"command\":\"echo hi\"}",
                "pending"
            ],
        )
        .expect("pending approval should insert");

    let response = client
        .post(format!("{lan_base_url}/api/v1/remote/sessions/{session_id}/permissions"))
        .bearer_auth(&remote_access_token)
        .json(&json!({
            "requestId": "req-remote-approval",
            "decision": "approve"
        }))
        .send()
        .await
        .expect("remote permission resolution should complete");
    assert_eq!(response.status(), StatusCode::NO_CONTENT);

    let status: String = connection
        .query_row(
            "SELECT status FROM pending_approvals WHERE id = ?1",
            rusqlite::params!["req-remote-approval"],
            |row| row.get(0),
        )
        .expect("approval status should be queryable");
    assert_eq!(status, "approved");

    runtime.shutdown().await.expect("shutdown should succeed");
}
