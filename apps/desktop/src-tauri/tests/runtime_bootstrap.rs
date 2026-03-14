use lunaria_desktop::{start_runtime, RuntimeConfig};
use tempfile::TempDir;

fn temp_config(tempdir: &TempDir) -> RuntimeConfig {
    let mut config = RuntimeConfig::default();
    config.database_path = tempdir.path().join("lunaria.sqlite");
    config
}

#[tokio::test]
async fn health_endpoint_reports_runtime_readiness() {
    let tempdir = TempDir::new().expect("tempdir should be created");
    let config = temp_config(&tempdir);
    let database_path = config.database_path.clone();
    let runtime = start_runtime(config)
        .await
        .expect("runtime should start for health checks");

    assert!(database_path.exists(), "runtime startup should create the sqlite database");

    let health_url = format!("{}/health", runtime.launch_context().api_base_url);
    let response = reqwest::get(&health_url)
        .await
        .expect("health request should complete");

    assert!(response.status().is_success(), "health endpoint must return 200");
    runtime.shutdown().await.expect("shutdown should complete cleanly");
}

#[tokio::test]
async fn bootstrap_exchange_requires_the_launch_token() {
    let tempdir = TempDir::new().expect("tempdir should be created");
    let runtime = start_runtime(temp_config(&tempdir))
        .await
        .expect("runtime should start for bootstrap auth");

    let bootstrap_url = format!(
        "{}{}",
        runtime.launch_context().api_base_url,
        runtime.launch_context().bootstrap_path
    );

    let unauthorized = reqwest::Client::new()
        .post(&bootstrap_url)
        .json(&serde_json::json!({ "token": "invalid-token" }))
        .send()
        .await
        .expect("bootstrap auth request should complete");

    assert_eq!(unauthorized.status(), reqwest::StatusCode::UNAUTHORIZED);
    runtime.shutdown().await.expect("shutdown should complete cleanly");
}

#[tokio::test]
async fn bootstrap_exchange_returns_a_frontend_runtime_session() {
    let tempdir = TempDir::new().expect("tempdir should be created");
    let runtime = start_runtime(temp_config(&tempdir))
        .await
        .expect("runtime should start for bootstrap auth");

    let launch = runtime.launch_context().clone();
    let bootstrap_url = format!("{}{}", launch.api_base_url, launch.bootstrap_path);

    let response = reqwest::Client::new()
        .post(&bootstrap_url)
        .json(&serde_json::json!({ "token": launch.bootstrap_token }))
        .send()
        .await
        .expect("bootstrap auth request should complete");

    assert!(response.status().is_success(), "bootstrap auth should return 200");

    let payload: serde_json::Value = response
        .json()
        .await
        .expect("bootstrap auth response should be valid json");

    assert_eq!(payload["apiBaseUrl"], launch.api_base_url);
    assert_eq!(payload["instanceId"], launch.instance_id);
    assert_eq!(payload["tokenType"], "Bearer");

    runtime.shutdown().await.expect("shutdown should complete cleanly");
}

#[tokio::test]
async fn shutdown_stops_the_loopback_server() {
    let tempdir = TempDir::new().expect("tempdir should be created");
    let runtime = start_runtime(temp_config(&tempdir))
        .await
        .expect("runtime should start for shutdown validation");

    let health_url = format!("{}/health", runtime.launch_context().api_base_url);
    runtime.shutdown().await.expect("shutdown should complete cleanly");

    let health_after_shutdown = reqwest::get(&health_url).await;
    assert!(
        health_after_shutdown.is_err(),
        "server should stop accepting requests after shutdown"
    );
}
