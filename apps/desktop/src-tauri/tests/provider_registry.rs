use std::sync::Arc;

use axum::{
    extract::Query,
    http::{header::AUTHORIZATION, HeaderMap, StatusCode},
    response::IntoResponse,
    routing::get,
    Json, Router,
};
use lunaria_desktop::{
    config::{ConfigService, MemorySecretStore, RuntimePaths, SecretStore},
    persistence::{repositories::providers::ProviderRepository, Database},
    providers::{
        local::{LmStudioDetector, OllamaDetector},
        EnvironmentReader, ProviderRegistryService, ProviderSummary, StaticEnvironment,
    },
    start_runtime, BootstrapSession, RuntimeConfig,
};
use reqwest::Client;
use tempfile::TempDir;
use tokio::net::TcpListener;

fn setup() -> (TempDir, Arc<Database>, RuntimePaths, Arc<dyn SecretStore>) {
    let tempdir = TempDir::new().expect("tempdir should be created");
    let state_root = tempdir.path().join(".lunaria");
    let database = Arc::new(
        Database::open(state_root.join("lunaria.sqlite"))
            .expect("database should be created"),
    );
    let paths = RuntimePaths::new(state_root);
    let secrets: Arc<dyn SecretStore> = Arc::new(MemorySecretStore::new());

    (tempdir, database, paths, secrets)
}

fn provider_service(
    database: Arc<Database>,
    paths: RuntimePaths,
    secret_store: Arc<dyn SecretStore>,
    env: Arc<dyn EnvironmentReader>,
) -> ProviderRegistryService {
    let config_service = Arc::new(ConfigService::new(paths, database.clone(), secret_store));
    ProviderRegistryService::new(database, config_service, env, vec![])
}

#[tokio::test]
async fn provider_registry_seeds_cloud_providers_and_models() {
    let (_tempdir, database, paths, secrets) = setup();
    let service = provider_service(
        database,
        paths,
        secrets,
        Arc::new(StaticEnvironment::default()),
    );

    service.refresh_catalog().await.expect("catalog refresh should succeed");

    let providers = service.list_providers().expect("providers should list");
    let ids = providers.iter().map(|provider| provider.id.as_str()).collect::<Vec<_>>();
    assert!(ids.contains(&"anthropic"));
    assert!(ids.contains(&"openai"));
    assert!(ids.contains(&"google"));

    let anthropic_models = service
        .list_models("anthropic")
        .expect("anthropic models should list");
    assert!(
        anthropic_models
            .iter()
            .any(|model| model.model_id == "claude-sonnet-4-20250514"),
        "bundled anthropic catalog should be persisted"
    );
}

#[tokio::test]
async fn auth_state_resolution_distinguishes_env_and_keychain_credentials() {
    let (_tempdir, database, paths, secrets) = setup();
    let env = Arc::new(StaticEnvironment::from([
        ("OPENAI_API_KEY".to_string(), "env-openai-key".to_string()),
    ]));
    let service = provider_service(database.clone(), paths, secrets, env);

    service.refresh_catalog().await.expect("catalog refresh should succeed");
    let addr = spawn_server(Router::new().route(
        "/v1/models",
        get(|headers: HeaderMap| async move {
            if headers
                .get("x-api-key")
                .and_then(|value| value.to_str().ok())
                == Some("keychain-anthropic-key")
            {
                (StatusCode::OK, Json(serde_json::json!({ "data": [] }))).into_response()
            } else {
                (StatusCode::UNAUTHORIZED, Json(serde_json::json!({ "error": "invalid" }))).into_response()
            }
        }),
    ))
    .await;
    set_provider_base_url(database.clone(), "anthropic", format!("http://{addr}"));
    service
        .store_api_key("anthropic", "keychain-anthropic-key")
        .await
        .expect("anthropic api key should store");

    let providers = service.list_providers().expect("providers should list");
    let anthropic = providers
        .iter()
        .find(|provider| provider.id == "anthropic")
        .expect("anthropic provider should exist");
    let openai = providers
        .iter()
        .find(|provider| provider.id == "openai")
        .expect("openai provider should exist");
    let google = providers
        .iter()
        .find(|provider| provider.id == "google")
        .expect("google provider should exist");

    assert_eq!(anthropic.auth_status, "connected");
    assert_eq!(anthropic.auth_source.as_deref(), Some("keychain"));
    assert_eq!(openai.auth_status, "connected");
    assert_eq!(openai.auth_source.as_deref(), Some("env"));
    assert_eq!(google.auth_status, "disconnected");
    assert_eq!(google.auth_source, None);
}

#[tokio::test]
async fn local_model_detectors_register_running_servers() {
    let (_tempdir, database, paths, secrets) = setup();
    let ollama_addr = spawn_server(Router::new().route(
        "/api/tags",
        get(|| async { Json(serde_json::json!({ "models": [{ "name": "qwen3.5:7b" }] })) }),
    ))
    .await;
    let lm_studio_addr = spawn_server(Router::new().route(
        "/v1/models",
        get(|| async { Json(serde_json::json!({ "data": [{ "id": "phi-4-mini" }] })) }),
    ))
    .await;

    let config_service = Arc::new(ConfigService::new(paths, database.clone(), secrets));
    let service = ProviderRegistryService::new(
        database,
        config_service,
        Arc::new(StaticEnvironment::default()),
        vec![
            Arc::new(OllamaDetector::new(format!("http://{}", ollama_addr))),
            Arc::new(LmStudioDetector::new(format!("http://{}", lm_studio_addr))),
        ],
    );

    service.refresh_catalog().await.expect("catalog refresh should succeed");
    let providers = service.list_providers().expect("providers should list");
    let ids = providers.iter().map(|provider| provider.id.as_str()).collect::<Vec<_>>();
    assert!(ids.contains(&"local-ollama"));
    assert!(ids.contains(&"local-lm-studio"));

    let ollama_models = service
        .list_models("local-ollama")
        .expect("ollama models should list");
    let lm_studio_models = service
        .list_models("local-lm-studio")
        .expect("lm studio models should list");

    assert_eq!(ollama_models[0].model_id, "qwen3.5:7b");
    assert_eq!(lm_studio_models[0].model_id, "phi-4-mini");
}

#[tokio::test]
async fn provider_endpoints_expose_catalog_and_models() {
    let tempdir = TempDir::new().expect("tempdir should be created");
    let mut config = RuntimeConfig::default();
    config.database_path = tempdir.path().join("lunaria.sqlite");
    let runtime = start_runtime(config).await.expect("runtime should start");
    let client = Client::new();
    let bootstrap = bootstrap(&client, &runtime).await;

    let providers: Vec<ProviderSummary> = client
        .get(format!("{}/api/v1/providers", runtime.launch_context().api_base_url))
        .bearer_auth(&bootstrap.auth_token)
        .send()
        .await
        .expect("providers request should complete")
        .error_for_status()
        .expect("providers request should succeed")
        .json()
        .await
        .expect("providers response should deserialize");

    assert!(providers.iter().any(|provider| provider.id == "anthropic"));

    let models: serde_json::Value = client
        .get(format!(
            "{}/api/v1/providers/anthropic/models",
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

    assert!(
        models
            .as_array()
            .expect("models response should be an array")
            .iter()
            .any(|model| model["modelId"].as_str() == Some("claude-sonnet-4-20250514"))
    );

    runtime.shutdown().await.expect("shutdown should succeed");
}

#[tokio::test]
async fn store_api_key_validates_anthropic_before_persisting() {
    let (_tempdir, database, paths, secrets) = setup();
    let service = provider_service(
        database.clone(),
        paths,
        secrets,
        Arc::new(StaticEnvironment::default()),
    );

    service.refresh_catalog().await.expect("catalog refresh should succeed");
    let addr = spawn_server(Router::new().route(
        "/v1/models",
        get(|headers: HeaderMap| async move {
            if headers
                .get("x-api-key")
                .and_then(|value| value.to_str().ok())
                == Some("anthropic-valid")
            {
                (StatusCode::OK, Json(serde_json::json!({ "data": [] }))).into_response()
            } else {
                (StatusCode::UNAUTHORIZED, Json(serde_json::json!({ "error": "invalid" }))).into_response()
            }
        }),
    ))
    .await;
    set_provider_base_url(database.clone(), "anthropic", format!("http://{addr}"));

    service
        .store_api_key("anthropic", "anthropic-valid")
        .await
        .expect("anthropic key should validate and store");

    let credential = ProviderRepository::new(database.clone())
        .latest_credential("anthropic")
        .expect("credential query should succeed");
    assert!(credential.is_some(), "validated anthropic key should persist");

    let anthropic = service
        .list_providers()
        .expect("providers should list")
        .into_iter()
        .find(|provider| provider.id == "anthropic")
        .expect("anthropic provider should exist");
    assert_eq!(anthropic.auth_status, "connected");
}

#[tokio::test]
async fn store_api_key_validates_openai_before_persisting() {
    let (_tempdir, database, paths, secrets) = setup();
    let service = provider_service(
        database.clone(),
        paths,
        secrets,
        Arc::new(StaticEnvironment::default()),
    );

    service.refresh_catalog().await.expect("catalog refresh should succeed");
    let addr = spawn_server(Router::new().route(
        "/v1/models",
        get(|headers: HeaderMap| async move {
            if headers
                .get(AUTHORIZATION)
                .and_then(|value| value.to_str().ok())
                == Some("Bearer openai-valid")
            {
                (StatusCode::OK, Json(serde_json::json!({ "data": [] }))).into_response()
            } else {
                (StatusCode::UNAUTHORIZED, Json(serde_json::json!({ "error": "invalid" }))).into_response()
            }
        }),
    ))
    .await;
    set_provider_base_url(database.clone(), "openai", format!("http://{addr}"));

    service
        .store_api_key("openai", "openai-valid")
        .await
        .expect("openai key should validate and store");

    let credential = ProviderRepository::new(database.clone())
        .latest_credential("openai")
        .expect("credential query should succeed");
    assert!(credential.is_some(), "validated openai key should persist");
}

#[tokio::test]
async fn store_api_key_rejects_invalid_google_credentials_without_mutation() {
    let (_tempdir, database, paths, secrets) = setup();
    let service = provider_service(
        database.clone(),
        paths,
        secrets,
        Arc::new(StaticEnvironment::default()),
    );

    service.refresh_catalog().await.expect("catalog refresh should succeed");
    let addr = spawn_server(Router::new().route(
        "/v1/models",
        get(|Query(query): Query<std::collections::HashMap<String, String>>| async move {
            if query.get("key").map(String::as_str) == Some("google-valid") {
                (StatusCode::OK, Json(serde_json::json!({ "models": [] }))).into_response()
            } else {
                (StatusCode::UNAUTHORIZED, Json(serde_json::json!({ "error": "invalid" }))).into_response()
            }
        }),
    ))
    .await;
    set_provider_base_url(database.clone(), "google", format!("http://{addr}"));

    let error = service
        .store_api_key("google", "google-invalid")
        .await
        .expect_err("google key should be rejected");
    assert!(
        error.to_string().contains("google"),
        "rejection should name the provider"
    );

    let credential = ProviderRepository::new(database.clone())
        .latest_credential("google")
        .expect("credential query should succeed");
    assert!(credential.is_none(), "rejected key must not persist");

    let google = service
        .list_providers()
        .expect("providers should list")
        .into_iter()
        .find(|provider| provider.id == "google")
        .expect("google provider should exist");
    assert_eq!(google.auth_status, "disconnected");
}

async fn bootstrap(client: &Client, runtime: &lunaria_desktop::RuntimeHandle) -> BootstrapSession {
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

async fn spawn_server(router: Router) -> std::net::SocketAddr {
    let listener = TcpListener::bind("127.0.0.1:0")
        .await
        .expect("listener should bind");
    let addr = listener.local_addr().expect("listener should have addr");

    tokio::spawn(async move {
        axum::serve(listener, router)
            .await
            .expect("test server should run");
    });

    addr
}

fn set_provider_base_url(database: Arc<Database>, provider_id: &str, base_url: String) {
    let repo = ProviderRepository::new(database);
    let provider = repo
        .get_provider(provider_id)
        .expect("provider lookup should succeed")
        .expect("provider should exist");
    repo.upsert_provider(&lunaria_desktop::persistence::ProviderRecord {
        base_url: Some(base_url),
        ..provider
    })
    .expect("provider override should persist");
}
