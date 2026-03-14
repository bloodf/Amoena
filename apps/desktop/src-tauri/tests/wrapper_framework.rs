use std::path::PathBuf;

use lunaria_desktop::{
    start_runtime, BootstrapSession, EventEnvelope, RuntimeConfig, RuntimeHandle,
    wrappers::{WrapperAdapterConfig, WrapperManager},
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
    timeout(Duration::from_secs(5), async {
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

            sleep(Duration::from_millis(25)).await;
        }
    })
    .await
    .expect("timed out waiting for transcript state")
}

#[tokio::test]
async fn claude_adapter_exports_persona_and_reports_capabilities() {
    let manager = WrapperManager::new();
    let persona_path = repo_root()
        .join("apps/desktop/resources/agent-personas/ai/agent-orchestrator.md");
    let tempdir = TempDir::new().expect("tempdir should be created");
    let export = manager
        .export_persona("claude-code", &persona_path, tempdir.path())
        .await
        .expect("persona export should succeed")
        .expect("claude adapter should export personas");

    let exported = tokio::fs::read_to_string(&export.path)
        .await
        .expect("exported persona should exist");
    assert!(exported.contains("Agent Orchestrator"));

    let capabilities = manager.capabilities();
    let claude = capabilities
        .iter()
        .find(|capability| capability.adapter_kind == "claude-code")
        .expect("claude capability should exist");
    assert!(claude.supports_persona_export);
    assert_eq!(claude.transport, "stream-json");
}

#[tokio::test]
async fn wrapper_session_normalizes_claude_events_through_runtime_contract() {
    let tempdir = TempDir::new().expect("tempdir should be created");
    let runtime = start_runtime(temp_config(&tempdir))
        .await
        .expect("runtime should start");
    let client = Client::new();
    let bootstrap = bootstrap(&client, &runtime).await;
    let session: serde_json::Value = client
        .post(format!("{}/api/v1/sessions", runtime.launch_context().api_base_url))
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
    let session_id = session["id"].as_str().expect("session id should exist").to_string();

    client
        .post(format!(
            "{}/api/v1/sessions/{session_id}/messages",
            runtime.launch_context().api_base_url
        ))
        .bearer_auth(&bootstrap.auth_token)
        .json(&serde_json::json!({ "content": "hello wrapper" }))
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
        |events| {
            let event_types = events.iter().map(|event| event.event_type.as_str()).collect::<Vec<_>>();
            event_types.contains(&"message.delta")
                && event_types.contains(&"message.complete")
                && event_types.contains(&"usage")
        },
    )
    .await;

    assert!(transcript.iter().any(|event| event.event_type == "message.delta"));
    assert!(transcript.iter().any(|event| {
        event.event_type == "message.complete"
            && event.payload["content"].as_str() == Some("hello wrapper")
    }));

    let capabilities: serde_json::Value = client
        .get(format!(
            "{}/api/v1/wrappers/capabilities",
            runtime.launch_context().api_base_url
        ))
        .bearer_auth(&bootstrap.auth_token)
        .send()
        .await
        .expect("wrapper capability request should complete")
        .error_for_status()
        .expect("wrapper capability request should succeed")
        .json()
        .await
        .expect("wrapper capability response should deserialize");
    assert!(
        capabilities
            .as_array()
            .expect("wrapper capabilities should be an array")
            .iter()
            .any(|capability| capability["adapterKind"].as_str() == Some("claude-code")),
    );

    runtime.shutdown().await.expect("shutdown should succeed");
}

#[tokio::test]
async fn wrapper_session_interruption_reports_cancelled() {
    let tempdir = TempDir::new().expect("tempdir should be created");
    let runtime = start_runtime(temp_config(&tempdir))
        .await
        .expect("runtime should start");
    let client = Client::new();
    let bootstrap = bootstrap(&client, &runtime).await;
    let session: serde_json::Value = client
        .post(format!("{}/api/v1/sessions", runtime.launch_context().api_base_url))
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
    let session_id = session["id"].as_str().expect("session id should exist").to_string();

    client
        .post(format!(
            "{}/api/v1/sessions/{session_id}/messages",
            runtime.launch_context().api_base_url
        ))
        .bearer_auth(&bootstrap.auth_token)
        .json(&serde_json::json!({ "content": "slow: wrapper interruption" }))
        .send()
        .await
        .expect("wrapper message request should complete")
        .error_for_status()
        .expect("wrapper message request should succeed");

    client
        .post(format!(
            "{}/api/v1/sessions/{session_id}/interrupt",
            runtime.launch_context().api_base_url
        ))
        .bearer_auth(&bootstrap.auth_token)
        .send()
        .await
        .expect("wrapper interrupt request should complete")
        .error_for_status()
        .expect("wrapper interrupt request should succeed");

    let transcript = wait_for_transcript(
        &client,
        &runtime,
        &bootstrap.auth_token,
        &session_id,
        |events| events.iter().any(|event| event.event_type == "error"),
    )
    .await;
    let error_event = transcript
        .iter()
        .find(|event| event.event_type == "error")
        .expect("cancelled wrapper session should emit error");
    assert_eq!(error_event.payload["code"].as_str(), Some("cancelled"));

    runtime.shutdown().await.expect("shutdown should succeed");
}

#[tokio::test]
async fn additional_adapters_report_capability_degradation_versions_and_contract_output() {
    let manager = WrapperManager::new();
    let version_script = repo_root().join("apps/desktop/wrapper-mocks/version.ts");
    let persona_path = repo_root()
        .join("apps/desktop/resources/agent-personas/ai/agent-orchestrator.md");
    let tempdir = TempDir::new().expect("tempdir should be created");

    let adapters = [
        (
            "opencode",
            vec![version_script.display().to_string(), "opencode".to_string()],
            repo_root().join("apps/desktop/wrapper-mocks/opencode.ts"),
        ),
        (
            "codex",
            vec![version_script.display().to_string(), "codex".to_string()],
            repo_root().join("apps/desktop/wrapper-mocks/codex.ts"),
        ),
        (
            "gemini",
            vec![version_script.display().to_string(), "gemini".to_string()],
            repo_root().join("apps/desktop/wrapper-mocks/gemini.ts"),
        ),
    ];

    for (kind, args, turn_script) in adapters {
        let health = manager
            .health_check(
                kind,
                &WrapperAdapterConfig {
                    executable: "bun".to_string(),
                    args,
                    env: Default::default(),
                },
            )
            .await
            .expect("adapter health check should succeed");
        assert_eq!(health.status, "ok");
        assert!(health.version.is_some());

        let outcome = manager
            .execute_turn(
                kind,
                lunaria_desktop::wrappers::WrapperExecutionRequest {
                    session_id: format!("session-{kind}"),
                    working_dir: tempdir.path().to_path_buf(),
                    prompt: format!("hello {kind}"),
                    persona_path: persona_path.clone(),
                    adapter_config: WrapperAdapterConfig {
                        executable: "bun".to_string(),
                        args: vec![turn_script.display().to_string()],
                        env: Default::default(),
                    },
                },
            )
            .await
            .expect("adapter execute_turn should succeed");
        assert!(
            outcome
                .events
                .iter()
                .any(|event| matches!(event, lunaria_desktop::wrappers::NormalizedWrapperEvent::MessageComplete(_))),
            "adapter {kind} should normalize a completion event"
        );
    }

    let capabilities = manager.capabilities();
    let gemini = capabilities
        .iter()
        .find(|capability| capability.adapter_kind == "gemini")
        .expect("gemini capability should exist");
    assert!(!gemini.supports_tools);
    assert!(gemini.degraded_features.contains(&"tool-calls".to_string()));
}
