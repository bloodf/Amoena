//! End-to-end tests for the extension system routes.

use std::collections::HashMap;

use lunaria_desktop::{
    extensions::format::{
        ExtensionCommand, ExtensionContributions, ExtensionManifest,
        ExtensionPanel, LunaBundle,
    },
    start_runtime, BootstrapSession, RuntimeConfig, RuntimeHandle,
};
use reqwest::Client;
use serde_json::{json, Value};
use tempfile::TempDir;

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

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

fn create_test_luna_file(dir: &std::path::Path, id: &str, name: &str) -> std::path::PathBuf {
    let manifest = ExtensionManifest {
        id: id.to_string(),
        name: name.to_string(),
        version: "1.0.0".to_string(),
        publisher: Some("test-publisher".to_string()),
        description: "A test extension".to_string(),
        icon: None,
        permissions: vec!["sessions.read".to_string()],
        activation_events: vec!["onSession".to_string()],
        contributes: ExtensionContributions {
            commands: vec![ExtensionCommand {
                id: format!("{}.hello", id),
                title: "Hello World".to_string(),
            }],
            panels: vec![ExtensionPanel {
                id: format!("{}.panel", id),
                entry: "ui/panel.html".to_string(),
                title: Some("Test Panel".to_string()),
            }],
            ..Default::default()
        },
        backend: None,
    };
    let mut assets = HashMap::new();
    assets.insert("ui/panel.html".to_string(), b"<h1>Test Panel</h1>".to_vec());
    let bundle = LunaBundle { manifest, assets };
    let path = dir.join(format!("{}.luna", id));
    bundle.write(&path).unwrap();
    path
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

#[tokio::test]
async fn extension_install_from_local_path() {
    let tempdir = TempDir::new().expect("tempdir should be created");
    let runtime = start_runtime(temp_config(&tempdir))
        .await
        .expect("runtime should start");
    let client = Client::new();
    let session = bootstrap(&client, &runtime).await;
    let base_url = &runtime.launch_context().api_base_url;

    let luna_dir = TempDir::new().expect("luna dir should be created");
    let luna_path = create_test_luna_file(luna_dir.path(), "test-ext", "Test Extension");
    let luna_path_str = luna_path.to_str().expect("luna path should be utf-8");

    let status = client
        .post(format!("{base_url}/api/v1/extensions"))
        .bearer_auth(&session.auth_token)
        .json(&json!({ "path": luna_path_str }))
        .send()
        .await
        .expect("install extension request should complete")
        .status();

    assert_eq!(
        status,
        reqwest::StatusCode::CREATED,
        "installing an extension from a local path should return 201"
    );

    runtime.shutdown().await.expect("shutdown should complete cleanly");
}

#[tokio::test]
async fn extension_list_installed() {
    let tempdir = TempDir::new().expect("tempdir should be created");
    let runtime = start_runtime(temp_config(&tempdir))
        .await
        .expect("runtime should start");
    let client = Client::new();
    let session = bootstrap(&client, &runtime).await;
    let base_url = &runtime.launch_context().api_base_url;

    let luna_dir = TempDir::new().expect("luna dir should be created");
    let luna_path = create_test_luna_file(luna_dir.path(), "list-ext", "List Extension");
    let luna_path_str = luna_path.to_str().expect("luna path should be utf-8");

    // Install the extension
    client
        .post(format!("{base_url}/api/v1/extensions"))
        .bearer_auth(&session.auth_token)
        .json(&json!({ "path": luna_path_str }))
        .send()
        .await
        .expect("install request should complete")
        .error_for_status()
        .expect("install should return 201");

    // List extensions and verify it appears
    let extensions: Vec<Value> = client
        .get(format!("{base_url}/api/v1/extensions"))
        .bearer_auth(&session.auth_token)
        .send()
        .await
        .expect("list extensions request should complete")
        .error_for_status()
        .expect("list extensions should return 200")
        .json()
        .await
        .expect("list extensions response should deserialize");

    assert!(
        extensions.iter().any(|e| e["id"].as_str() == Some("list-ext")),
        "installed extension should appear in the extension list"
    );

    runtime.shutdown().await.expect("shutdown should complete cleanly");
}

#[tokio::test]
async fn extension_enable_disable() {
    let tempdir = TempDir::new().expect("tempdir should be created");
    let runtime = start_runtime(temp_config(&tempdir))
        .await
        .expect("runtime should start");
    let client = Client::new();
    let session = bootstrap(&client, &runtime).await;
    let base_url = &runtime.launch_context().api_base_url;

    let luna_dir = TempDir::new().expect("luna dir should be created");
    let luna_path = create_test_luna_file(luna_dir.path(), "toggle-ext", "Toggle Extension");
    let luna_path_str = luna_path.to_str().expect("luna path should be utf-8");

    // Install the extension
    client
        .post(format!("{base_url}/api/v1/extensions"))
        .bearer_auth(&session.auth_token)
        .json(&json!({ "path": luna_path_str }))
        .send()
        .await
        .expect("install request should complete")
        .error_for_status()
        .expect("install should return 201");

    // Disable the extension
    let toggle_status = client
        .post(format!("{base_url}/api/v1/extensions/toggle-ext/toggle"))
        .bearer_auth(&session.auth_token)
        .json(&json!({ "enabled": false }))
        .send()
        .await
        .expect("toggle request should complete")
        .status();

    assert_eq!(
        toggle_status,
        reqwest::StatusCode::NO_CONTENT,
        "toggling an extension should return 204"
    );

    // Verify it is reported as disabled in the list
    let extensions: Vec<Value> = client
        .get(format!("{base_url}/api/v1/extensions"))
        .bearer_auth(&session.auth_token)
        .send()
        .await
        .expect("list extensions request should complete")
        .error_for_status()
        .expect("list extensions should return 200")
        .json()
        .await
        .expect("list extensions response should deserialize");

    let ext = extensions
        .iter()
        .find(|e| e["id"].as_str() == Some("toggle-ext"))
        .expect("toggle-ext should still appear in the extension list");

    assert_eq!(
        ext["enabled"].as_bool(),
        Some(false),
        "extension should be reported as disabled after toggling"
    );

    runtime.shutdown().await.expect("shutdown should complete cleanly");
}

#[tokio::test]
async fn extension_uninstall() {
    let tempdir = TempDir::new().expect("tempdir should be created");
    let runtime = start_runtime(temp_config(&tempdir))
        .await
        .expect("runtime should start");
    let client = Client::new();
    let session = bootstrap(&client, &runtime).await;
    let base_url = &runtime.launch_context().api_base_url;

    let luna_dir = TempDir::new().expect("luna dir should be created");
    let luna_path = create_test_luna_file(luna_dir.path(), "remove-ext", "Remove Extension");
    let luna_path_str = luna_path.to_str().expect("luna path should be utf-8");

    // Install the extension
    client
        .post(format!("{base_url}/api/v1/extensions"))
        .bearer_auth(&session.auth_token)
        .json(&json!({ "path": luna_path_str }))
        .send()
        .await
        .expect("install request should complete")
        .error_for_status()
        .expect("install should return 201");

    // Uninstall the extension
    let delete_status = client
        .delete(format!("{base_url}/api/v1/extensions/remove-ext"))
        .bearer_auth(&session.auth_token)
        .send()
        .await
        .expect("delete request should complete")
        .status();

    assert_eq!(
        delete_status,
        reqwest::StatusCode::NO_CONTENT,
        "uninstalling an extension should return 204"
    );

    // Verify it no longer appears in the list
    let extensions: Vec<Value> = client
        .get(format!("{base_url}/api/v1/extensions"))
        .bearer_auth(&session.auth_token)
        .send()
        .await
        .expect("list extensions request should complete")
        .error_for_status()
        .expect("list extensions should return 200")
        .json()
        .await
        .expect("list extensions response should deserialize");

    assert!(
        extensions.iter().all(|e| e["id"].as_str() != Some("remove-ext")),
        "uninstalled extension should no longer appear in the extension list"
    );

    runtime.shutdown().await.expect("shutdown should complete cleanly");
}

#[tokio::test]
async fn extension_contributions_aggregated() {
    let tempdir = TempDir::new().expect("tempdir should be created");
    let runtime = start_runtime(temp_config(&tempdir))
        .await
        .expect("runtime should start");
    let client = Client::new();
    let session = bootstrap(&client, &runtime).await;
    let base_url = &runtime.launch_context().api_base_url;

    let luna_dir = TempDir::new().expect("luna dir should be created");
    let luna_path = create_test_luna_file(luna_dir.path(), "contrib-ext", "Contrib Extension");
    let luna_path_str = luna_path.to_str().expect("luna path should be utf-8");

    // Install the extension
    client
        .post(format!("{base_url}/api/v1/extensions"))
        .bearer_auth(&session.auth_token)
        .json(&json!({ "path": luna_path_str }))
        .send()
        .await
        .expect("install request should complete")
        .error_for_status()
        .expect("install should return 201");

    // Get aggregated contributions
    let contributions: Value = client
        .get(format!("{base_url}/api/v1/extensions/contributions"))
        .bearer_auth(&session.auth_token)
        .send()
        .await
        .expect("contributions request should complete")
        .error_for_status()
        .expect("contributions should return 200")
        .json()
        .await
        .expect("contributions response should deserialize");

    let commands = contributions["commands"]
        .as_array()
        .expect("contributions should have a commands array");

    assert!(
        commands
            .iter()
            .any(|c| c["command"]["id"].as_str() == Some("contrib-ext.hello")),
        "aggregated contributions should include the command from the installed extension"
    );

    runtime.shutdown().await.expect("shutdown should complete cleanly");
}

#[tokio::test]
async fn extension_panel_html_served() {
    let tempdir = TempDir::new().expect("tempdir should be created");
    let runtime = start_runtime(temp_config(&tempdir))
        .await
        .expect("runtime should start");
    let client = Client::new();
    let session = bootstrap(&client, &runtime).await;
    let base_url = &runtime.launch_context().api_base_url;

    let luna_dir = TempDir::new().expect("luna dir should be created");
    let luna_path = create_test_luna_file(luna_dir.path(), "panel-ext", "Panel Extension");
    let luna_path_str = luna_path.to_str().expect("luna path should be utf-8");

    // Install the extension
    client
        .post(format!("{base_url}/api/v1/extensions"))
        .bearer_auth(&session.auth_token)
        .json(&json!({ "path": luna_path_str }))
        .send()
        .await
        .expect("install request should complete")
        .error_for_status()
        .expect("install should return 201");

    // Request the panel HTML asset
    let html = client
        .get(format!(
            "{base_url}/api/v1/extensions/panel-ext/panels/panel-ext.panel"
        ))
        .bearer_auth(&session.auth_token)
        .send()
        .await
        .expect("panel request should complete")
        .error_for_status()
        .expect("panel endpoint should return 200")
        .text()
        .await
        .expect("panel response should be text");

    assert!(
        html.contains("<h1>Test Panel</h1>"),
        "panel HTML response should contain the asset content; got: {html:?}"
    );

    runtime.shutdown().await.expect("shutdown should complete cleanly");
}

#[tokio::test]
async fn extension_manifest_validation_rejects_invalid() {
    let tempdir = TempDir::new().expect("tempdir should be created");
    let runtime = start_runtime(temp_config(&tempdir))
        .await
        .expect("runtime should start");
    let client = Client::new();
    let session = bootstrap(&client, &runtime).await;
    let base_url = &runtime.launch_context().api_base_url;

    // Write a file with bad magic bytes — not a valid .luna bundle
    let luna_dir = TempDir::new().expect("luna dir should be created");
    let bad_path = luna_dir.path().join("bad.luna");
    std::fs::write(&bad_path, b"BADS\x01\x00\x00\x00this is not valid")
        .expect("bad luna file should write");
    let bad_path_str = bad_path.to_str().expect("bad path should be utf-8");

    let status = client
        .post(format!("{base_url}/api/v1/extensions"))
        .bearer_auth(&session.auth_token)
        .json(&json!({ "path": bad_path_str }))
        .send()
        .await
        .expect("install request should complete")
        .status();

    assert!(
        status.is_client_error() || status.is_server_error(),
        "installing an invalid .luna file should return a 4xx or 5xx status; got {status}"
    );

    runtime.shutdown().await.expect("shutdown should complete cleanly");
}

#[tokio::test]
async fn extension_multiple_installs() {
    let tempdir = TempDir::new().expect("tempdir should be created");
    let runtime = start_runtime(temp_config(&tempdir))
        .await
        .expect("runtime should start");
    let client = Client::new();
    let session = bootstrap(&client, &runtime).await;
    let base_url = &runtime.launch_context().api_base_url;

    let luna_dir = TempDir::new().expect("luna dir should be created");
    let path_a = create_test_luna_file(luna_dir.path(), "ext-alpha", "Alpha Extension");
    let path_b = create_test_luna_file(luna_dir.path(), "ext-beta", "Beta Extension");

    // Install both extensions
    for (path, label) in [(&path_a, "ext-alpha"), (&path_b, "ext-beta")] {
        client
            .post(format!("{base_url}/api/v1/extensions"))
            .bearer_auth(&session.auth_token)
            .json(&json!({ "path": path.to_str().expect("path should be utf-8") }))
            .send()
            .await
            .expect("install request should complete")
            .error_for_status()
            .unwrap_or_else(|_| panic!("install of {label} should return 201"));
    }

    // List and verify both appear
    let extensions: Vec<Value> = client
        .get(format!("{base_url}/api/v1/extensions"))
        .bearer_auth(&session.auth_token)
        .send()
        .await
        .expect("list extensions request should complete")
        .error_for_status()
        .expect("list extensions should return 200")
        .json()
        .await
        .expect("list extensions response should deserialize");

    for id in ["ext-alpha", "ext-beta"] {
        assert!(
            extensions.iter().any(|e| e["id"].as_str() == Some(id)),
            "extension {id} should appear in the list after installation"
        );
    }

    runtime.shutdown().await.expect("shutdown should complete cleanly");
}
