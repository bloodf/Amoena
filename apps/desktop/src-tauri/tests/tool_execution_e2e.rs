use lunaria_desktop::{start_runtime, BootstrapSession, EventEnvelope, RuntimeConfig, RuntimeHandle};
use reqwest::Client;
use std::path::PathBuf;
use tempfile::TempDir;
use tokio::time::{sleep, timeout, Duration};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

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
    timeout(Duration::from_secs(10), async {
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

            sleep(Duration::from_millis(50)).await;
        }
    })
    .await
    .expect("timed out waiting for transcript state")
}

async fn create_wrapper_session(
    client: &Client,
    runtime: &RuntimeHandle,
    auth_token: &str,
    tempdir: &TempDir,
) -> String {
    let session: serde_json::Value = client
        .post(format!("{}/api/v1/sessions", runtime.launch_context().api_base_url))
        .bearer_auth(auth_token)
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

    session["id"]
        .as_str()
        .expect("session id should exist")
        .to_string()
}

async fn send_message(
    client: &Client,
    runtime: &RuntimeHandle,
    auth_token: &str,
    session_id: &str,
    content: &str,
) {
    client
        .post(format!(
            "{}/api/v1/sessions/{session_id}/messages",
            runtime.launch_context().api_base_url
        ))
        .bearer_auth(auth_token)
        .json(&serde_json::json!({ "content": content }))
        .send()
        .await
        .expect("message request should complete")
        .error_for_status()
        .expect("message request should succeed");
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

#[tokio::test]
async fn wrapper_session_tool_execution_flow() {
    let tempdir = TempDir::new().expect("tempdir should be created");
    let runtime = start_runtime(temp_config(&tempdir))
        .await
        .expect("runtime should start");
    let client = Client::new();
    let bs = bootstrap(&client, &runtime).await;
    let session_id = create_wrapper_session(&client, &runtime, &bs.auth_token, &tempdir).await;

    // "tool:" prefix triggers the mock to emit tool_call and tool_result events
    send_message(&client, &runtime, &bs.auth_token, &session_id, "tool:echo:hello").await;

    let transcript = wait_for_transcript(
        &client,
        &runtime,
        &bs.auth_token,
        &session_id,
        |events| {
            let types: Vec<&str> = events.iter().map(|e| e.event_type.as_str()).collect();
            types.contains(&"tool.start") && types.contains(&"tool.result")
        },
    )
    .await;

    let tool_start = transcript
        .iter()
        .find(|e| e.event_type == "tool.start")
        .expect("transcript should contain tool.start event");
    assert!(
        tool_start.payload["toolName"].as_str().is_some(),
        "tool.start payload should contain toolName"
    );

    let tool_result = transcript
        .iter()
        .find(|e| e.event_type == "tool.result")
        .expect("transcript should contain tool.result event");
    assert!(
        tool_result.payload["toolName"].as_str().is_some(),
        "tool.result payload should contain toolName"
    );

    runtime.shutdown().await.expect("shutdown should succeed");
}

#[tokio::test]
#[ignore]
async fn wrapper_session_with_real_file_read_tool() {
    let tempdir = TempDir::new().expect("tempdir should be created");
    let test_file = tempdir.path().join("tool_test_content.txt");
    std::fs::write(&test_file, "TOOL_TEST_12345").expect("test file should be written");

    let runtime = start_runtime(temp_config(&tempdir))
        .await
        .expect("runtime should start");
    let client = Client::new();
    let bs = bootstrap(&client, &runtime).await;

    let session: serde_json::Value = client
        .post(format!("{}/api/v1/sessions", runtime.launch_context().api_base_url))
        .bearer_auth(&bs.auth_token)
        .json(&serde_json::json!({
            "workingDir": tempdir.path().display().to_string(),
            "sessionMode": "wrapper",
            "tuiType": "native"
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

    send_message(
        &client,
        &runtime,
        &bs.auth_token,
        &session_id,
        &format!("Read the file at {} and tell me what it says", test_file.display()),
    )
    .await;

    let transcript = wait_for_transcript(
        &client,
        &runtime,
        &bs.auth_token,
        &session_id,
        |events| events.iter().any(|e| e.event_type == "tool.result"),
    )
    .await;

    let tool_result = transcript
        .iter()
        .find(|e| e.event_type == "tool.result")
        .expect("transcript should contain tool.result event");

    let result_str = tool_result.payload["result"].to_string();
    assert!(
        result_str.contains("TOOL_TEST_12345"),
        "tool result should reference the file content; got: {result_str}"
    );

    runtime.shutdown().await.expect("shutdown should succeed");
}

#[tokio::test]
#[ignore]
async fn wrapper_session_with_real_bash_tool() {
    let tempdir = TempDir::new().expect("tempdir should be created");
    let runtime = start_runtime(temp_config(&tempdir))
        .await
        .expect("runtime should start");
    let client = Client::new();
    let bs = bootstrap(&client, &runtime).await;

    let session: serde_json::Value = client
        .post(format!("{}/api/v1/sessions", runtime.launch_context().api_base_url))
        .bearer_auth(&bs.auth_token)
        .json(&serde_json::json!({
            "workingDir": tempdir.path().display().to_string(),
            "sessionMode": "wrapper",
            "tuiType": "native"
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

    send_message(
        &client,
        &runtime,
        &bs.auth_token,
        &session_id,
        "Run the command: echo LUNARIA_BASH_TEST",
    )
    .await;

    let transcript = wait_for_transcript(
        &client,
        &runtime,
        &bs.auth_token,
        &session_id,
        |events| events.iter().any(|e| e.event_type == "tool.result"),
    )
    .await;

    let tool_events: Vec<&EventEnvelope> = transcript
        .iter()
        .filter(|e| e.event_type == "tool.start" || e.event_type == "tool.result")
        .collect();
    assert!(
        !tool_events.is_empty(),
        "transcript should contain tool execution events for the bash command"
    );

    let has_bash_tool = tool_events.iter().any(|e| {
        let tool_name = e.payload["toolName"].as_str().unwrap_or("");
        tool_name.to_lowercase().contains("bash")
            || tool_name.to_lowercase().contains("shell")
            || tool_name.to_lowercase().contains("execute")
    });
    assert!(
        has_bash_tool,
        "transcript should contain a bash/shell/execute tool event"
    );

    runtime.shutdown().await.expect("shutdown should succeed");
}

#[tokio::test]
async fn permission_resolution_approve() {
    let tempdir = TempDir::new().expect("tempdir should be created");
    let config = temp_config(&tempdir);
    let database_path = config.database_path.clone();
    let runtime = start_runtime(config).await.expect("runtime should start");
    let client = Client::new();
    let bs = bootstrap(&client, &runtime).await;

    let session: serde_json::Value = client
        .post(format!("{}/api/v1/sessions", runtime.launch_context().api_base_url))
        .bearer_auth(&bs.auth_token)
        .json(&serde_json::json!({
            "workingDir": tempdir.path().display().to_string(),
            "sessionMode": "native",
            "tuiType": "native",
            "metadata": {
                "permissions": {
                    "mode": "manual"
                }
            }
        }))
        .send()
        .await
        .expect("create session request should complete")
        .error_for_status()
        .expect("create session should succeed")
        .json()
        .await
        .expect("create session response should deserialize");
    let session_id = session["id"].as_str().expect("session id should exist").to_string();

    // Trigger a tool call that requires approval in manual mode
    send_message(&client, &runtime, &bs.auth_token, &session_id, "tool:Bash:printf approval").await;

    let transcript = wait_for_transcript(
        &client,
        &runtime,
        &bs.auth_token,
        &session_id,
        |events| events.iter().any(|e| e.event_type == "permission.requested"),
    )
    .await;

    let request_event = transcript
        .iter()
        .find(|e| e.event_type == "permission.requested")
        .expect("transcript should contain permission.requested event");
    let request_id = request_event.payload["requestId"]
        .as_str()
        .expect("permission.requested payload should contain requestId")
        .to_string();

    let approval_response = client
        .post(format!(
            "{}/api/v1/sessions/{session_id}/permissions",
            runtime.launch_context().api_base_url
        ))
        .bearer_auth(&bs.auth_token)
        .json(&serde_json::json!({
            "requestId": request_id,
            "decision": "approve",
            "reason": "approved in e2e test"
        }))
        .send()
        .await
        .expect("permission resolution request should complete");
    assert!(
        approval_response.status().is_success(),
        "permission approval should return a success status; got: {}",
        approval_response.status()
    );

    let completed = wait_for_transcript(
        &client,
        &runtime,
        &bs.auth_token,
        &session_id,
        |events| {
            let types: Vec<&str> = events.iter().map(|e| e.event_type.as_str()).collect();
            types.contains(&"tool.result") && types.contains(&"message.complete")
        },
    )
    .await;

    assert!(
        completed.iter().any(|e| e.event_type == "tool.result"),
        "approved tool should produce a tool.result event"
    );

    let audit_count: i64 = rusqlite::Connection::open(database_path)
        .expect("sqlite db should open")
        .query_row(
            "SELECT COUNT(*) FROM tool_executions WHERE session_id = ?1",
            rusqlite::params![session_id],
            |row| row.get(0),
        )
        .expect("tool audit count should be queryable");
    assert_eq!(audit_count, 1, "approved tool execution should be recorded in the audit log");

    runtime.shutdown().await.expect("shutdown should succeed");
}

#[tokio::test]
async fn permission_resolution_deny() {
    let tempdir = TempDir::new().expect("tempdir should be created");
    let runtime = start_runtime(temp_config(&tempdir))
        .await
        .expect("runtime should start");
    let client = Client::new();
    let bs = bootstrap(&client, &runtime).await;

    // Use manual mode so that tool calls pause at a permission gate.
    let session: serde_json::Value = client
        .post(format!("{}/api/v1/sessions", runtime.launch_context().api_base_url))
        .bearer_auth(&bs.auth_token)
        .json(&serde_json::json!({
            "workingDir": tempdir.path().display().to_string(),
            "sessionMode": "native",
            "tuiType": "native",
            "metadata": {
                "permissions": {
                    "mode": "manual"
                }
            }
        }))
        .send()
        .await
        .expect("create session request should complete")
        .error_for_status()
        .expect("create session should succeed")
        .json()
        .await
        .expect("create session response should deserialize");
    let session_id = session["id"].as_str().expect("session id should exist").to_string();

    send_message(&client, &runtime, &bs.auth_token, &session_id, "tool:Bash:printf denial").await;

    // Wait for the approval gate to open. Use a generous timeout so the native
    // turn has time to start even when tests run in parallel. Retry on 500
    // because the transcript file may not exist yet immediately after session creation.
    let transcript = timeout(Duration::from_secs(15), async {
        loop {
            let response = client
                .get(format!(
                    "{}/api/v1/sessions/{session_id}/transcript",
                    runtime.launch_context().api_base_url
                ))
                .bearer_auth(&bs.auth_token)
                .send()
                .await
                .expect("transcript request should complete");
            if response.status().is_server_error() {
                sleep(Duration::from_millis(100)).await;
                continue;
            }
            let t: Vec<EventEnvelope> = response
                .error_for_status()
                .expect("transcript request should succeed")
                .json()
                .await
                .expect("transcript response should deserialize");
            if t.iter().any(|e| e.event_type == "permission.requested") {
                return t;
            }
            sleep(Duration::from_millis(50)).await;
        }
    })
    .await
    .expect("timed out waiting for permission.requested event");

    let request_event = transcript
        .iter()
        .find(|e| e.event_type == "permission.requested")
        .expect("transcript should contain permission.requested event");
    let request_id = request_event.payload["requestId"]
        .as_str()
        .expect("permission.requested payload should contain requestId")
        .to_string();

    let denial_response = client
        .post(format!(
            "{}/api/v1/sessions/{session_id}/permissions",
            runtime.launch_context().api_base_url
        ))
        .bearer_auth(&bs.auth_token)
        .json(&serde_json::json!({
            "requestId": request_id,
            "decision": "deny",
            "reason": "denied in e2e test"
        }))
        .send()
        .await
        .expect("permission denial request should complete");
    assert!(
        denial_response.status().is_success(),
        "permission denial should return a success status; got: {}",
        denial_response.status()
    );

    // After denying, the runtime emits an error event with code "permission_denied"
    // and then the native turn loop completes the turn.
    let completed = timeout(Duration::from_secs(15), async {
        loop {
            let response = client
                .get(format!(
                    "{}/api/v1/sessions/{session_id}/transcript",
                    runtime.launch_context().api_base_url
                ))
                .bearer_auth(&bs.auth_token)
                .send()
                .await
                .expect("transcript request should complete");
            if response.status().is_server_error() {
                sleep(Duration::from_millis(100)).await;
                continue;
            }
            let t: Vec<EventEnvelope> = response
                .error_for_status()
                .expect("transcript request should succeed")
                .json()
                .await
                .expect("transcript response should deserialize");
            let types: Vec<&str> = t.iter().map(|e| e.event_type.as_str()).collect();
            if types.contains(&"message.complete") || types.contains(&"error") {
                return t;
            }
            sleep(Duration::from_millis(50)).await;
        }
    })
    .await
    .expect("timed out waiting for turn to complete after denial");

    let has_denial_signal = completed.iter().any(|e| {
        (e.event_type == "error" && e.payload["code"].as_str() == Some("permission_denied"))
            || e.event_type == "message.complete"
    });
    assert!(
        has_denial_signal,
        "denied tool should produce either a permission_denied error event or a message.complete"
    );

    // The tool should NOT have produced a successful execution result
    assert!(
        !completed.iter().any(|e| e.event_type == "tool.result"),
        "denied tool should not produce a tool.result event"
    );

    runtime.shutdown().await.expect("shutdown should succeed");
}

#[tokio::test]
async fn session_permission_mode_in_metadata() {
    let tempdir = TempDir::new().expect("tempdir should be created");
    let runtime = start_runtime(temp_config(&tempdir))
        .await
        .expect("runtime should start");
    let client = Client::new();
    let bs = bootstrap(&client, &runtime).await;

    let created: serde_json::Value = client
        .post(format!("{}/api/v1/sessions", runtime.launch_context().api_base_url))
        .bearer_auth(&bs.auth_token)
        .json(&serde_json::json!({
            "workingDir": tempdir.path().display().to_string(),
            "sessionMode": "native",
            "tuiType": "native",
            "metadata": {
                "permissionMode": "ask"
            }
        }))
        .send()
        .await
        .expect("create session request should complete")
        .error_for_status()
        .expect("create session should succeed")
        .json()
        .await
        .expect("create session response should deserialize");
    let session_id = created["id"].as_str().expect("session id should exist").to_string();

    let sessions: serde_json::Value = client
        .get(format!("{}/api/v1/sessions", runtime.launch_context().api_base_url))
        .bearer_auth(&bs.auth_token)
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
        .find(|s| s["id"].as_str() == Some(&session_id))
        .expect("created session should appear in the session list");

    assert_eq!(
        session_summary["metadata"]["permissionMode"].as_str(),
        Some("ask"),
        "session metadata should preserve the permissionMode field"
    );

    runtime.shutdown().await.expect("shutdown should succeed");
}

#[tokio::test]
async fn memory_expand_tool_via_observation() {
    let tempdir = TempDir::new().expect("tempdir should be created");
    let runtime = start_runtime(temp_config(&tempdir))
        .await
        .expect("runtime should start");
    let client = Client::new();
    let bs = bootstrap(&client, &runtime).await;

    let base_url = &runtime.launch_context().api_base_url;

    let session: serde_json::Value = client
        .post(format!("{}/api/v1/sessions", base_url))
        .bearer_auth(&bs.auth_token)
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
    let session_id = session["id"].as_str().expect("session id should exist").to_string();

    // Post a manual observation so the MemoryExpand tool has data to retrieve.
    // observe_memory returns 201 with no body, so we only check the status.
    client
        .post(format!("{}/api/v1/memory/observe", base_url))
        .bearer_auth(&bs.auth_token)
        .json(&serde_json::json!({
            "sessionId": session_id,
            "title": "MemoryExpand data path test",
            "narrative": "This observation is used to verify the MemoryExpand tool data path",
            "category": "entity"
        }))
        .send()
        .await
        .expect("observe request should complete")
        .error_for_status()
        .expect("observe request should succeed");

    // Poll session memory until the observation appears (observe_memory is synchronous
    // but tier generation may have a brief async lag).
    let memory: serde_json::Value = timeout(Duration::from_secs(5), async {
        loop {
            let m: serde_json::Value = client
                .get(format!("{}/api/v1/sessions/{}/memory", base_url, session_id))
                .bearer_auth(&bs.auth_token)
                .send()
                .await
                .expect("session memory request should complete")
                .error_for_status()
                .expect("session memory should succeed")
                .json()
                .await
                .expect("session memory should deserialize");
            let has_entry = m["entries"]
                .as_array()
                .map(|arr| arr.iter().any(|e| e["title"].as_str() == Some("MemoryExpand data path test")))
                .unwrap_or(false);
            if has_entry {
                return m;
            }
            sleep(Duration::from_millis(50)).await;
        }
    })
    .await
    .expect("timed out waiting for observation to appear in session memory");

    let entries = memory["entries"]
        .as_array()
        .expect("entries should be an array");
    let matching = entries
        .iter()
        .find(|e| e["title"].as_str() == Some("MemoryExpand data path test"));
    assert!(
        matching.is_some(),
        "session memory should contain the posted observation titled 'MemoryExpand data path test'"
    );

    // The flat entry has l0Summary/l1Summary/l2Content fields that MemoryExpand would read.
    let entry = matching.unwrap();
    let l0 = entry["l0Summary"].as_str().unwrap_or("");
    assert!(
        !l0.is_empty(),
        "observation entry should have a non-empty l0Summary for MemoryExpand tool consumption"
    );

    runtime.shutdown().await.expect("shutdown should succeed");
}

#[tokio::test]
async fn multiple_tool_executions_in_single_turn() {
    let tempdir = TempDir::new().expect("tempdir should be created");
    let runtime = start_runtime(temp_config(&tempdir))
        .await
        .expect("runtime should start");
    let client = Client::new();
    let bs = bootstrap(&client, &runtime).await;
    let session_id = create_wrapper_session(&client, &runtime, &bs.auth_token, &tempdir).await;

    // "tool:" prefix in the mock produces exactly one tool_call and tool_result pair per invocation.
    // Send two separate messages to accumulate multiple tool events in the transcript.
    send_message(&client, &runtime, &bs.auth_token, &session_id, "tool:echo:first").await;

    wait_for_transcript(
        &client,
        &runtime,
        &bs.auth_token,
        &session_id,
        |events| events.iter().any(|e| e.event_type == "message.complete"),
    )
    .await;

    send_message(&client, &runtime, &bs.auth_token, &session_id, "tool:echo:second").await;

    let transcript = wait_for_transcript(
        &client,
        &runtime,
        &bs.auth_token,
        &session_id,
        |events| {
            let starts = events.iter().filter(|e| e.event_type == "tool.start").count();
            let results = events.iter().filter(|e| e.event_type == "tool.result").count();
            starts >= 2 && results >= 2
        },
    )
    .await;

    let tool_start_count = transcript.iter().filter(|e| e.event_type == "tool.start").count();
    let tool_result_count = transcript.iter().filter(|e| e.event_type == "tool.result").count();

    assert!(
        tool_start_count >= 2,
        "transcript should contain at least 2 tool.start events; got {tool_start_count}"
    );
    assert!(
        tool_result_count >= 2,
        "transcript should contain at least 2 tool.result events; got {tool_result_count}"
    );

    runtime.shutdown().await.expect("shutdown should succeed");
}

#[tokio::test]
async fn tool_execution_preserves_order_in_transcript() {
    let tempdir = TempDir::new().expect("tempdir should be created");
    let runtime = start_runtime(temp_config(&tempdir))
        .await
        .expect("runtime should start");
    let client = Client::new();
    let bs = bootstrap(&client, &runtime).await;
    let session_id = create_wrapper_session(&client, &runtime, &bs.auth_token, &tempdir).await;

    send_message(&client, &runtime, &bs.auth_token, &session_id, "tool:echo:ordering").await;

    let transcript = wait_for_transcript(
        &client,
        &runtime,
        &bs.auth_token,
        &session_id,
        |events| {
            let types: Vec<&str> = events.iter().map(|e| e.event_type.as_str()).collect();
            types.contains(&"tool.start") && types.contains(&"tool.result")
        },
    )
    .await;

    // Find positions of tool.start and tool.result
    let start_pos = transcript
        .iter()
        .position(|e| e.event_type == "tool.start")
        .expect("transcript should contain tool.start");
    let result_pos = transcript
        .iter()
        .position(|e| e.event_type == "tool.result")
        .expect("transcript should contain tool.result");

    assert!(
        start_pos < result_pos,
        "tool.start (position {start_pos}) must precede tool.result (position {result_pos}) in the transcript"
    );

    // If callId is present on both events, verify they match
    let start_call_id = transcript[start_pos].payload["callId"].as_str();
    let result_call_id = transcript[result_pos].payload["callId"].as_str();
    if let (Some(start_id), Some(result_id)) = (start_call_id, result_call_id) {
        assert_eq!(
            start_id, result_id,
            "tool.start and tool.result should share the same callId"
        );
    }

    runtime.shutdown().await.expect("shutdown should succeed");
}

#[tokio::test]
#[ignore]
async fn real_cli_read_tool_with_content_verification() {
    let tempdir = TempDir::new().expect("tempdir should be created");
    let test_file = tempdir.path().join("read_verify.txt");
    let test_content = "LUNARIA_READ_VERIFY_CONTENT_XYZ";
    std::fs::write(&test_file, test_content).expect("test file should be written");

    let runtime = start_runtime(temp_config(&tempdir))
        .await
        .expect("runtime should start");
    let client = Client::new();
    let bs = bootstrap(&client, &runtime).await;

    let session: serde_json::Value = client
        .post(format!("{}/api/v1/sessions", runtime.launch_context().api_base_url))
        .bearer_auth(&bs.auth_token)
        .json(&serde_json::json!({
            "workingDir": tempdir.path().display().to_string(),
            "sessionMode": "wrapper",
            "tuiType": "native",
            "metadata": {
                "wrapper": {
                    "args": ["--print"]
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

    send_message(
        &client,
        &runtime,
        &bs.auth_token,
        &session_id,
        &format!(
            "Use the Read tool to read {} and reply with the exact content",
            test_file.display()
        ),
    )
    .await;

    let transcript = timeout(Duration::from_secs(60), async {
        loop {
            let t: Vec<EventEnvelope> = client
                .get(format!(
                    "{}/api/v1/sessions/{session_id}/transcript",
                    runtime.launch_context().api_base_url
                ))
                .bearer_auth(&bs.auth_token)
                .send()
                .await
                .expect("transcript request should complete")
                .error_for_status()
                .expect("transcript request should succeed")
                .json()
                .await
                .expect("transcript response should deserialize");

            if t.iter().any(|e| e.event_type == "message.complete") {
                return t;
            }
            sleep(Duration::from_millis(500)).await;
        }
    })
    .await
    .expect("timed out waiting for real CLI response");

    let final_text = transcript
        .iter()
        .find(|e| e.event_type == "message.complete")
        .and_then(|e| e.payload["content"].as_str())
        .unwrap_or("");

    assert!(
        final_text.contains(test_content),
        "real CLI response should contain the file content '{test_content}'; got: {final_text}"
    );

    runtime.shutdown().await.expect("shutdown should succeed");
}

#[tokio::test]
#[ignore]
async fn real_cli_bash_tool_execution() {
    let tempdir = TempDir::new().expect("tempdir should be created");
    let runtime = start_runtime(temp_config(&tempdir))
        .await
        .expect("runtime should start");
    let client = Client::new();
    let bs = bootstrap(&client, &runtime).await;

    let session: serde_json::Value = client
        .post(format!("{}/api/v1/sessions", runtime.launch_context().api_base_url))
        .bearer_auth(&bs.auth_token)
        .json(&serde_json::json!({
            "workingDir": tempdir.path().display().to_string(),
            "sessionMode": "wrapper",
            "tuiType": "native"
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

    send_message(
        &client,
        &runtime,
        &bs.auth_token,
        &session_id,
        "Run this bash command and give me the output: echo LUNARIA_UNIQUE_$(date +%s)",
    )
    .await;

    let transcript = timeout(Duration::from_secs(60), async {
        loop {
            let t: Vec<EventEnvelope> = client
                .get(format!(
                    "{}/api/v1/sessions/{session_id}/transcript",
                    runtime.launch_context().api_base_url
                ))
                .bearer_auth(&bs.auth_token)
                .send()
                .await
                .expect("transcript request should complete")
                .error_for_status()
                .expect("transcript request should succeed")
                .json()
                .await
                .expect("transcript response should deserialize");

            if t.iter().any(|e| e.event_type == "message.complete") {
                return t;
            }
            sleep(Duration::from_millis(500)).await;
        }
    })
    .await
    .expect("timed out waiting for real CLI bash tool response");

    let final_text = transcript
        .iter()
        .find(|e| e.event_type == "message.complete")
        .and_then(|e| e.payload["content"].as_str())
        .unwrap_or("");

    assert!(
        final_text.contains("LUNARIA_UNIQUE_"),
        "real CLI response should mention LUNARIA_UNIQUE_; got: {final_text}"
    );

    runtime.shutdown().await.expect("shutdown should succeed");
}

#[tokio::test]
#[ignore]
async fn real_cli_multi_tool_workflow() {
    let tempdir = TempDir::new().expect("tempdir should be created");
    let test_file = tempdir.path().join("multi_tool.txt");
    let test_content = "MULTI_TOOL_WORKFLOW_CONTENT";
    std::fs::write(&test_file, test_content).expect("test file should be written");

    let runtime = start_runtime(temp_config(&tempdir))
        .await
        .expect("runtime should start");
    let client = Client::new();
    let bs = bootstrap(&client, &runtime).await;

    let session: serde_json::Value = client
        .post(format!("{}/api/v1/sessions", runtime.launch_context().api_base_url))
        .bearer_auth(&bs.auth_token)
        .json(&serde_json::json!({
            "workingDir": tempdir.path().display().to_string(),
            "sessionMode": "wrapper",
            "tuiType": "native"
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

    let path_str = test_file.display().to_string();
    send_message(
        &client,
        &runtime,
        &bs.auth_token,
        &session_id,
        &format!(
            "Read {path_str}, then run 'wc -c {path_str}' to count bytes, and report both"
        ),
    )
    .await;

    let transcript = timeout(Duration::from_secs(90), async {
        loop {
            let t: Vec<EventEnvelope> = client
                .get(format!(
                    "{}/api/v1/sessions/{session_id}/transcript",
                    runtime.launch_context().api_base_url
                ))
                .bearer_auth(&bs.auth_token)
                .send()
                .await
                .expect("transcript request should complete")
                .error_for_status()
                .expect("transcript request should succeed")
                .json()
                .await
                .expect("transcript response should deserialize");

            if t.iter().any(|e| e.event_type == "message.complete") {
                return t;
            }
            sleep(Duration::from_millis(500)).await;
        }
    })
    .await
    .expect("timed out waiting for multi-tool workflow response");

    let final_text = transcript
        .iter()
        .find(|e| e.event_type == "message.complete")
        .and_then(|e| e.payload["content"].as_str())
        .unwrap_or("");

    assert!(
        final_text.contains(test_content),
        "response should mention file content '{test_content}'; got: {final_text}"
    );

    let byte_count = test_content.len().to_string();
    assert!(
        final_text.contains(&byte_count),
        "response should mention byte count '{byte_count}'; got: {final_text}"
    );

    runtime.shutdown().await.expect("shutdown should succeed");
}

#[tokio::test]
async fn file_tree_endpoint() {
    let tempdir = TempDir::new().expect("tempdir should be created");
    let workspace = tempdir.path().join("workspace");
    std::fs::create_dir_all(workspace.join("src/utils")).expect("workspace dirs should be created");
    std::fs::write(workspace.join("README.md"), "# Test").expect("README should be written");
    std::fs::write(workspace.join("src/main.rs"), "fn main() {}").expect("main.rs should be written");
    std::fs::write(workspace.join("src/utils/helper.rs"), "pub fn help() {}").expect("helper.rs should be written");

    let runtime = start_runtime(temp_config(&tempdir))
        .await
        .expect("runtime should start");
    let client = Client::new();
    let bs = bootstrap(&client, &runtime).await;

    let tree: serde_json::Value = client
        .get(format!(
            "{}/api/v1/files/tree",
            runtime.launch_context().api_base_url
        ))
        .bearer_auth(&bs.auth_token)
        .query(&[("root", workspace.display().to_string())])
        .send()
        .await
        .expect("file tree request should complete")
        .error_for_status()
        .expect("file tree request should succeed")
        .json()
        .await
        .expect("file tree response should deserialize");

    let entries = tree
        .as_array()
        .or_else(|| tree["entries"].as_array())
        .expect("file tree response should be an array or have an entries array");

    assert!(
        !entries.is_empty(),
        "file tree should return at least one entry for the workspace directory"
    );

    let first = &entries[0];
    assert!(
        first["name"].as_str().is_some(),
        "file tree entry should have a name field"
    );
    assert!(
        first["path"].as_str().is_some(),
        "file tree entry should have a path field"
    );
    assert!(
        first["nodeType"].as_str().is_some() || first["type"].as_str().is_some(),
        "file tree entry should have a nodeType or type field"
    );

    runtime.shutdown().await.expect("shutdown should succeed");
}

#[tokio::test]
async fn file_content_read_and_write() {
    let tempdir = TempDir::new().expect("tempdir should be created");
    let test_file = tempdir.path().join("editable.txt");
    let original_content = "original content line\n";
    std::fs::write(&test_file, original_content).expect("test file should be written");

    let runtime = start_runtime(temp_config(&tempdir))
        .await
        .expect("runtime should start");
    let client = Client::new();
    let bs = bootstrap(&client, &runtime).await;
    let base_url = runtime.launch_context().api_base_url.clone();
    let file_path = test_file.display().to_string();

    // Read original content via the API
    let read_response: serde_json::Value = client
        .get(format!("{}/api/v1/files/content", base_url))
        .bearer_auth(&bs.auth_token)
        .query(&[("path", file_path.as_str())])
        .send()
        .await
        .expect("file content GET request should complete")
        .error_for_status()
        .expect("file content GET should succeed")
        .json()
        .await
        .expect("file content GET response should deserialize");

    assert_eq!(
        read_response["content"].as_str(),
        Some(original_content),
        "GET /api/v1/files/content should return the original file content"
    );

    // Write updated content via the API
    let updated_content = "updated content line\n";
    client
        .post(format!("{}/api/v1/files/content", base_url))
        .bearer_auth(&bs.auth_token)
        .json(&serde_json::json!({
            "path": file_path,
            "content": updated_content
        }))
        .send()
        .await
        .expect("file content POST request should complete")
        .error_for_status()
        .expect("file content POST should succeed");

    // Read back the updated content
    let updated_response: serde_json::Value = client
        .get(format!("{}/api/v1/files/content", base_url))
        .bearer_auth(&bs.auth_token)
        .query(&[("path", file_path.as_str())])
        .send()
        .await
        .expect("file content GET after write should complete")
        .error_for_status()
        .expect("file content GET after write should succeed")
        .json()
        .await
        .expect("file content GET after write response should deserialize");

    assert_eq!(
        updated_response["content"].as_str(),
        Some(updated_content),
        "file content should reflect the updated value after POST"
    );

    runtime.shutdown().await.expect("shutdown should succeed");
}
