//! End-to-end tests for session interrupt and file API routes.

use std::fs;

use lunaria_desktop::{start_runtime, BootstrapSession, RuntimeConfig, RuntimeHandle};
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

// ---------------------------------------------------------------------------
// Interrupt tests
// ---------------------------------------------------------------------------

#[tokio::test]
async fn interrupt_nonexistent_session_returns_404() {
    let tempdir = TempDir::new().expect("tempdir should be created");
    let runtime = start_runtime(temp_config(&tempdir))
        .await
        .expect("runtime should start");
    let client = Client::new();
    let session = bootstrap(&client, &runtime).await;
    let base_url = &runtime.launch_context().api_base_url;

    let status = client
        .post(format!(
            "{base_url}/api/v1/sessions/nonexistent-session-id/interrupt"
        ))
        .bearer_auth(&session.auth_token)
        .json(&json!({}))
        .send()
        .await
        .expect("interrupt request should complete")
        .status();

    assert_eq!(
        status,
        reqwest::StatusCode::NOT_FOUND,
        "interrupting a nonexistent session should return 404"
    );

    runtime.shutdown().await.expect("shutdown should complete cleanly");
}

// ---------------------------------------------------------------------------
// File tree tests
// ---------------------------------------------------------------------------

#[tokio::test]
async fn file_tree_returns_directory_listing() {
    let tempdir = TempDir::new().expect("tempdir should be created");
    let runtime = start_runtime(temp_config(&tempdir))
        .await
        .expect("runtime should start");
    let client = Client::new();
    let session = bootstrap(&client, &runtime).await;
    let base_url = &runtime.launch_context().api_base_url;

    let dir = TempDir::new().expect("file dir should be created");
    fs::write(dir.path().join("file1.txt"), "hello").expect("file1 should write");
    fs::write(dir.path().join("file2.rs"), "fn main() {}").expect("file2 should write");
    fs::create_dir(dir.path().join("subdir")).expect("subdir should create");
    fs::write(dir.path().join("subdir/nested.txt"), "nested").expect("nested file should write");

    let tree: Vec<Value> = client
        .get(format!("{base_url}/api/v1/files/tree"))
        .bearer_auth(&session.auth_token)
        .query(&[("root", dir.path().to_str().expect("dir path should be utf-8"))])
        .send()
        .await
        .expect("file tree request should complete")
        .error_for_status()
        .expect("file tree should return 200")
        .json()
        .await
        .expect("file tree response should deserialize");

    assert!(
        tree.len() >= 3,
        "file tree should contain file1.txt, file2.rs, and subdir; got {} entries",
        tree.len()
    );

    runtime.shutdown().await.expect("shutdown should complete cleanly");
}

#[tokio::test]
async fn file_tree_empty_directory_returns_empty_list() {
    let tempdir = TempDir::new().expect("tempdir should be created");
    let runtime = start_runtime(temp_config(&tempdir))
        .await
        .expect("runtime should start");
    let client = Client::new();
    let session = bootstrap(&client, &runtime).await;
    let base_url = &runtime.launch_context().api_base_url;

    let dir = TempDir::new().expect("empty dir should be created");

    let tree: Vec<Value> = client
        .get(format!("{base_url}/api/v1/files/tree"))
        .bearer_auth(&session.auth_token)
        .query(&[("root", dir.path().to_str().expect("dir path should be utf-8"))])
        .send()
        .await
        .expect("file tree request should complete")
        .error_for_status()
        .expect("file tree should return 200 for empty dir")
        .json()
        .await
        .expect("file tree response should deserialize");

    assert!(
        tree.is_empty(),
        "file tree for an empty directory should return an empty list"
    );

    runtime.shutdown().await.expect("shutdown should complete cleanly");
}

// ---------------------------------------------------------------------------
// File content tests
// ---------------------------------------------------------------------------

#[tokio::test]
async fn file_content_read_returns_file_contents() {
    let tempdir = TempDir::new().expect("tempdir should be created");
    let runtime = start_runtime(temp_config(&tempdir))
        .await
        .expect("runtime should start");
    let client = Client::new();
    let session = bootstrap(&client, &runtime).await;
    let base_url = &runtime.launch_context().api_base_url;

    let dir = TempDir::new().expect("file dir should be created");
    let file_path = dir.path().join("test.txt");
    fs::write(&file_path, "hello world").expect("test file should write");

    let content: Value = client
        .get(format!("{base_url}/api/v1/files/content"))
        .bearer_auth(&session.auth_token)
        .query(&[("path", file_path.to_str().expect("file path should be utf-8"))])
        .send()
        .await
        .expect("file content request should complete")
        .error_for_status()
        .expect("file content should return 200")
        .json()
        .await
        .expect("file content response should deserialize");

    assert_eq!(
        content["content"].as_str(),
        Some("hello world"),
        "file content response should contain the file text"
    );

    runtime.shutdown().await.expect("shutdown should complete cleanly");
}

#[tokio::test]
async fn file_content_write_and_read_round_trip() {
    let tempdir = TempDir::new().expect("tempdir should be created");
    let runtime = start_runtime(temp_config(&tempdir))
        .await
        .expect("runtime should start");
    let client = Client::new();
    let session = bootstrap(&client, &runtime).await;
    let base_url = &runtime.launch_context().api_base_url;

    let dir = TempDir::new().expect("file dir should be created");
    let file_path = dir.path().join("roundtrip.txt");
    let file_path_str = file_path.to_str().expect("file path should be utf-8");

    // Write via API
    let write_status = client
        .post(format!("{base_url}/api/v1/files/content"))
        .bearer_auth(&session.auth_token)
        .json(&json!({
            "path": file_path_str,
            "content": "written via API"
        }))
        .send()
        .await
        .expect("file write request should complete")
        .status();
    assert_eq!(
        write_status,
        reqwest::StatusCode::NO_CONTENT,
        "writing file content should return 204"
    );

    // Read back via API
    let content: Value = client
        .get(format!("{base_url}/api/v1/files/content"))
        .bearer_auth(&session.auth_token)
        .query(&[("path", file_path_str)])
        .send()
        .await
        .expect("file read request should complete")
        .error_for_status()
        .expect("file read should return 200")
        .json()
        .await
        .expect("file read response should deserialize");

    assert_eq!(
        content["content"].as_str(),
        Some("written via API"),
        "round-trip file content should match what was written"
    );

    runtime.shutdown().await.expect("shutdown should complete cleanly");
}

#[tokio::test]
async fn file_content_nonexistent_file_returns_error() {
    let tempdir = TempDir::new().expect("tempdir should be created");
    let runtime = start_runtime(temp_config(&tempdir))
        .await
        .expect("runtime should start");
    let client = Client::new();
    let session = bootstrap(&client, &runtime).await;
    let base_url = &runtime.launch_context().api_base_url;

    let status = client
        .get(format!("{base_url}/api/v1/files/content"))
        .bearer_auth(&session.auth_token)
        .query(&[("path", "/nonexistent/path/file.txt")])
        .send()
        .await
        .expect("file content request should complete")
        .status();

    assert!(
        status.is_client_error() || status.is_server_error(),
        "reading a nonexistent file should return a 4xx or 5xx status; got {status}"
    );

    runtime.shutdown().await.expect("shutdown should complete cleanly");
}
