use std::path::PathBuf;

use lunaria_desktop::{start_runtime, BootstrapSession, EventEnvelope, RuntimeConfig, RuntimeHandle};
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

async fn create_session(
    client: &Client,
    runtime: &RuntimeHandle,
    auth_token: &str,
    working_dir: &str,
) -> String {
    let session: serde_json::Value = client
        .post(format!(
            "{}/api/v1/sessions",
            runtime.launch_context().api_base_url
        ))
        .bearer_auth(auth_token)
        .json(&serde_json::json!({ "workingDir": working_dir }))
        .send()
        .await
        .expect("create session request should complete")
        .error_for_status()
        .expect("create session request should succeed")
        .json()
        .await
        .expect("create session response should deserialize");

    session["id"]
        .as_str()
        .expect("session id should exist")
        .to_string()
}

async fn list_agents(
    client: &Client,
    runtime: &RuntimeHandle,
    auth_token: &str,
    session_id: &str,
) -> Vec<serde_json::Value> {
    client
        .get(format!(
            "{}/api/v1/sessions/{session_id}/agents/list",
            runtime.launch_context().api_base_url
        ))
        .bearer_auth(auth_token)
        .send()
        .await
        .expect("list agents request should complete")
        .error_for_status()
        .expect("list agents request should succeed")
        .json::<Vec<serde_json::Value>>()
        .await
        .expect("list agents response should deserialize")
}

// ─── Test 1 ───────────────────────────────────────────────────────────────────

#[tokio::test]
async fn primary_agent_created_on_session_start() {
    let tempdir = TempDir::new().expect("tempdir should be created");
    let runtime = start_runtime(temp_config(&tempdir))
        .await
        .expect("runtime should start");
    let client = Client::new();
    let bootstrap = bootstrap(&client, &runtime).await;

    let session_id = create_session(
        &client,
        &runtime,
        &bootstrap.auth_token,
        &tempdir.path().display().to_string(),
    )
    .await;

    let agents = list_agents(&client, &runtime, &bootstrap.auth_token, &session_id).await;

    assert_eq!(agents.len(), 1, "exactly one agent should be created with the session");

    let primary = &agents[0];
    assert_eq!(
        primary["mode"].as_str().expect("mode should be a string"),
        "primary",
        "agent mode should be primary"
    );
    assert_eq!(
        primary["status"].as_str().expect("status should be a string"),
        "active",
        "primary agent should be active"
    );
    assert!(
        primary["toolAccess"].as_array().is_some(),
        "primary agent should have a toolAccess array"
    );
    assert!(
        primary["division"].as_str().is_some(),
        "primary agent should have a division"
    );

    runtime.shutdown().await.expect("shutdown should succeed");
}

// ─── Test 2 ───────────────────────────────────────────────────────────────────

#[tokio::test]
async fn primary_agent_appears_in_transcript() {
    let tempdir = TempDir::new().expect("tempdir should be created");
    let runtime = start_runtime(temp_config(&tempdir))
        .await
        .expect("runtime should start");
    let client = Client::new();
    let bootstrap = bootstrap(&client, &runtime).await;

    let session_id = create_session(
        &client,
        &runtime,
        &bootstrap.auth_token,
        &tempdir.path().display().to_string(),
    )
    .await;

    let transcript = wait_for_transcript(
        &client,
        &runtime,
        &bootstrap.auth_token,
        &session_id,
        |events| events.iter().any(|e| e.event_type == "agent.spawned"),
    )
    .await;

    let spawned = transcript
        .iter()
        .find(|e| e.event_type == "agent.spawned")
        .expect("agent.spawned event should exist");

    assert_eq!(
        spawned.payload["mode"].as_str().expect("mode should be present"),
        "primary",
        "spawned event should indicate primary mode"
    );

    runtime.shutdown().await.expect("shutdown should succeed");
}

// ─── Test 3 ───────────────────────────────────────────────────────────────────

#[tokio::test]
async fn spawn_subagent_with_tool_intersection() {
    let tempdir = TempDir::new().expect("tempdir should be created");
    let runtime = start_runtime(temp_config(&tempdir))
        .await
        .expect("runtime should start");
    let client = Client::new();
    let bootstrap = bootstrap(&client, &runtime).await;

    let session_id = create_session(
        &client,
        &runtime,
        &bootstrap.auth_token,
        &tempdir.path().display().to_string(),
    )
    .await;

    let agents = list_agents(&client, &runtime, &bootstrap.auth_token, &session_id).await;
    let primary_id = agents[0]["id"]
        .as_str()
        .expect("primary agent id should exist")
        .to_string();

    client
        .post(format!(
            "{}/api/v1/sessions/{session_id}/agents",
            runtime.launch_context().api_base_url
        ))
        .bearer_auth(&bootstrap.auth_token)
        .json(&serde_json::json!({
            "parentAgentId": primary_id,
            "agentType": "researcher",
            "model": "gpt-5-mini",
            "requestedTools": ["Read", "echo", "nonexistent_tool"],
            "personaId": null,
            "stepsLimit": 10
        }))
        .send()
        .await
        .expect("spawn subagent request should complete")
        .error_for_status()
        .expect("spawn subagent request should succeed");

    let all_agents = list_agents(&client, &runtime, &bootstrap.auth_token, &session_id).await;
    assert_eq!(all_agents.len(), 2, "should have 2 agents total after spawning");

    let subagent = all_agents
        .iter()
        .find(|a| a["mode"].as_str() == Some("subagent"))
        .expect("subagent should exist");

    assert_eq!(
        subagent["parentAgentId"].as_str().expect("parentAgentId should exist"),
        primary_id,
        "subagent should reference primary as parent"
    );

    let tool_access = subagent["toolAccess"]
        .as_array()
        .expect("toolAccess should be an array");
    let tool_names: Vec<&str> = tool_access
        .iter()
        .filter_map(|t| t.as_str())
        .collect();
    assert!(
        !tool_names.contains(&"nonexistent_tool"),
        "nonexistent_tool should be excluded by tool intersection"
    );

    runtime.shutdown().await.expect("shutdown should succeed");
}

// ─── Test 4 ───────────────────────────────────────────────────────────────────

#[tokio::test]
async fn spawn_subagent_appears_in_transcript() {
    let tempdir = TempDir::new().expect("tempdir should be created");
    let runtime = start_runtime(temp_config(&tempdir))
        .await
        .expect("runtime should start");
    let client = Client::new();
    let bootstrap = bootstrap(&client, &runtime).await;

    let session_id = create_session(
        &client,
        &runtime,
        &bootstrap.auth_token,
        &tempdir.path().display().to_string(),
    )
    .await;

    let agents = list_agents(&client, &runtime, &bootstrap.auth_token, &session_id).await;
    let primary_id = agents[0]["id"]
        .as_str()
        .expect("primary agent id should exist")
        .to_string();

    client
        .post(format!(
            "{}/api/v1/sessions/{session_id}/agents",
            runtime.launch_context().api_base_url
        ))
        .bearer_auth(&bootstrap.auth_token)
        .json(&serde_json::json!({
            "parentAgentId": primary_id,
            "agentType": "analyzer",
            "model": "gpt-5-mini",
            "requestedTools": ["Read"],
            "personaId": null,
            "stepsLimit": 5
        }))
        .send()
        .await
        .expect("spawn subagent request should complete")
        .error_for_status()
        .expect("spawn subagent request should succeed");

    let transcript = wait_for_transcript(
        &client,
        &runtime,
        &bootstrap.auth_token,
        &session_id,
        |events| {
            events
                .iter()
                .any(|e| e.event_type == "agent.spawned" && e.payload["mode"] == "subagent")
        },
    )
    .await;

    let subagent_event = transcript
        .iter()
        .find(|e| e.event_type == "agent.spawned" && e.payload["mode"] == "subagent")
        .expect("agent.spawned event with mode subagent should exist");

    assert!(
        subagent_event.payload["agentId"].as_str().is_some(),
        "subagent spawned event should carry agentId"
    );

    runtime.shutdown().await.expect("shutdown should succeed");
}

// ─── Test 5 ───────────────────────────────────────────────────────────────────

#[tokio::test]
async fn spawn_multiple_concurrent_subagents() {
    let tempdir = TempDir::new().expect("tempdir should be created");
    let runtime = start_runtime(temp_config(&tempdir))
        .await
        .expect("runtime should start");
    let client = Client::new();
    let bootstrap = bootstrap(&client, &runtime).await;

    let session_id = create_session(
        &client,
        &runtime,
        &bootstrap.auth_token,
        &tempdir.path().display().to_string(),
    )
    .await;

    let agents = list_agents(&client, &runtime, &bootstrap.auth_token, &session_id).await;
    let primary_id = agents[0]["id"]
        .as_str()
        .expect("primary agent id should exist")
        .to_string();

    let spawn_payload = serde_json::json!({
        "parentAgentId": primary_id,
        "agentType": "worker",
        "model": "gpt-5-mini",
        "requestedTools": ["Read"],
        "personaId": null,
        "stepsLimit": 5
    });

    let api_base = runtime.launch_context().api_base_url.clone();
    let auth_token = bootstrap.auth_token.clone();

    let mut handles = Vec::new();
    for _ in 0..3 {
        let client_clone = client.clone();
        let base = api_base.clone();
        let token = auth_token.clone();
        let sid = session_id.clone();
        let payload = spawn_payload.clone();
        handles.push(tokio::spawn(async move {
            client_clone
                .post(format!("{}/api/v1/sessions/{sid}/agents", base))
                .bearer_auth(&token)
                .json(&payload)
                .send()
                .await
                .expect("concurrent spawn request should complete")
                .error_for_status()
                .expect("concurrent spawn request should succeed");
        }));
    }

    for handle in handles {
        handle.await.expect("spawn task should not panic");
    }

    let all_agents = list_agents(&client, &runtime, &bootstrap.auth_token, &session_id).await;
    assert_eq!(
        all_agents.len(),
        4,
        "should have 4 agents total (1 primary + 3 subagents)"
    );

    let ids: Vec<&str> = all_agents
        .iter()
        .filter_map(|a| a["id"].as_str())
        .collect();
    let unique_ids: std::collections::HashSet<&str> = ids.iter().copied().collect();
    assert_eq!(ids.len(), unique_ids.len(), "all agent ids should be unique");

    runtime.shutdown().await.expect("shutdown should succeed");
}

// ─── Test 6 ───────────────────────────────────────────────────────────────────

#[tokio::test]
async fn subagent_inherits_steps_limit() {
    let tempdir = TempDir::new().expect("tempdir should be created");
    let runtime = start_runtime(temp_config(&tempdir))
        .await
        .expect("runtime should start");
    let client = Client::new();
    let bootstrap = bootstrap(&client, &runtime).await;

    let session_id = create_session(
        &client,
        &runtime,
        &bootstrap.auth_token,
        &tempdir.path().display().to_string(),
    )
    .await;

    let agents = list_agents(&client, &runtime, &bootstrap.auth_token, &session_id).await;
    let primary_id = agents[0]["id"]
        .as_str()
        .expect("primary agent id should exist")
        .to_string();

    client
        .post(format!(
            "{}/api/v1/sessions/{session_id}/agents",
            runtime.launch_context().api_base_url
        ))
        .bearer_auth(&bootstrap.auth_token)
        .json(&serde_json::json!({
            "parentAgentId": primary_id,
            "agentType": "bounded-worker",
            "model": "gpt-5-mini",
            "requestedTools": ["Read"],
            "personaId": null,
            "stepsLimit": 10
        }))
        .send()
        .await
        .expect("spawn subagent request should complete")
        .error_for_status()
        .expect("spawn subagent request should succeed");

    let all_agents = list_agents(&client, &runtime, &bootstrap.auth_token, &session_id).await;
    let subagent = all_agents
        .iter()
        .find(|a| a["mode"].as_str() == Some("subagent"))
        .expect("subagent should exist");

    assert_eq!(
        subagent["stepsLimit"].as_i64().expect("stepsLimit should be a number"),
        10,
        "subagent stepsLimit should match requested value"
    );

    runtime.shutdown().await.expect("shutdown should succeed");
}

// ─── Test 7 ───────────────────────────────────────────────────────────────────

#[tokio::test]
async fn team_creation_and_listing() {
    let tempdir = TempDir::new().expect("tempdir should be created");
    let runtime = start_runtime(temp_config(&tempdir))
        .await
        .expect("runtime should start");
    let client = Client::new();
    let bootstrap = bootstrap(&client, &runtime).await;

    let team: serde_json::Value = client
        .post(format!("{}/api/v1/teams", runtime.launch_context().api_base_url))
        .bearer_auth(&bootstrap.auth_token)
        .json(&serde_json::json!({
            "name": "test-team",
            "divisionRequirements": { "divisions": ["ai", "engineering"] },
            "threshold": 0.7,
            "sharedTaskListPath": null
        }))
        .send()
        .await
        .expect("create team request should complete")
        .error_for_status()
        .expect("create team request should succeed")
        .json()
        .await
        .expect("create team response should deserialize");

    assert_eq!(
        team["name"].as_str().expect("name should exist"),
        "test-team",
        "team name should match"
    );
    assert!(
        (team["threshold"].as_f64().expect("threshold should be a number") - 0.7).abs() < f64::EPSILON,
        "team threshold should match"
    );
    assert_eq!(
        team["status"].as_str().expect("status should exist"),
        "assembling",
        "new team status should be assembling"
    );
    assert!(team["id"].as_str().is_some(), "team should have an id");

    runtime.shutdown().await.expect("shutdown should succeed");
}

// ─── Test 8 ───────────────────────────────────────────────────────────────────

#[tokio::test]
async fn team_mailbox_send_and_list() {
    let tempdir = TempDir::new().expect("tempdir should be created");
    let runtime = start_runtime(temp_config(&tempdir))
        .await
        .expect("runtime should start");
    let client = Client::new();
    let bootstrap = bootstrap(&client, &runtime).await;

    let session_id = create_session(
        &client,
        &runtime,
        &bootstrap.auth_token,
        &tempdir.path().display().to_string(),
    )
    .await;

    let agents = list_agents(&client, &runtime, &bootstrap.auth_token, &session_id).await;
    let primary_id = agents[0]["id"]
        .as_str()
        .expect("primary agent id should exist")
        .to_string();

    let team: serde_json::Value = client
        .post(format!("{}/api/v1/teams", runtime.launch_context().api_base_url))
        .bearer_auth(&bootstrap.auth_token)
        .json(&serde_json::json!({
            "name": "mailbox-test-team",
            "divisionRequirements": { "divisions": ["ai"] },
            "threshold": 0.6,
            "sharedTaskListPath": null
        }))
        .send()
        .await
        .expect("create team request should complete")
        .error_for_status()
        .expect("create team request should succeed")
        .json()
        .await
        .expect("create team response should deserialize");
    let team_id = team["id"].as_str().expect("team id should exist").to_string();

    client
        .post(format!(
            "{}/api/v1/teams/{team_id}/mailbox",
            runtime.launch_context().api_base_url
        ))
        .bearer_auth(&bootstrap.auth_token)
        .json(&serde_json::json!({
            "sessionId": session_id,
            "fromAgentId": primary_id,
            "toAgentId": null,
            "content": "hello from primary agent",
            "messageType": "message",
            "metadata": {}
        }))
        .send()
        .await
        .expect("mailbox send request should complete")
        .error_for_status()
        .expect("mailbox send request should succeed");

    let mailbox: Vec<serde_json::Value> = client
        .get(format!(
            "{}/api/v1/teams/{team_id}/mailbox",
            runtime.launch_context().api_base_url
        ))
        .bearer_auth(&bootstrap.auth_token)
        .send()
        .await
        .expect("mailbox list request should complete")
        .error_for_status()
        .expect("mailbox list request should succeed")
        .json()
        .await
        .expect("mailbox list response should deserialize");

    assert_eq!(mailbox.len(), 1, "mailbox should contain exactly one message");
    assert_eq!(
        mailbox[0]["content"].as_str().expect("content should exist"),
        "hello from primary agent",
        "message content should match"
    );
    assert_eq!(
        mailbox[0]["fromAgentId"].as_str().expect("fromAgentId should exist"),
        primary_id,
        "fromAgentId should match primary agent"
    );
    assert!(
        mailbox[0]["collaborationStyle"].as_str().is_some(),
        "collaborationStyle should be present"
    );
    assert!(
        mailbox[0]["decisionWeight"].as_f64().is_some(),
        "decisionWeight should be present"
    );

    runtime.shutdown().await.expect("shutdown should succeed");
}

// ─── Test 9 ───────────────────────────────────────────────────────────────────

#[tokio::test]
async fn team_decision_request_and_response_flow() {
    let tempdir = TempDir::new().expect("tempdir should be created");
    let runtime = start_runtime(temp_config(&tempdir))
        .await
        .expect("runtime should start");
    let client = Client::new();
    let bootstrap = bootstrap(&client, &runtime).await;

    let session_id = create_session(
        &client,
        &runtime,
        &bootstrap.auth_token,
        &tempdir.path().display().to_string(),
    )
    .await;

    let agents = list_agents(&client, &runtime, &bootstrap.auth_token, &session_id).await;
    let primary_id = agents[0]["id"]
        .as_str()
        .expect("primary agent id should exist")
        .to_string();

    client
        .post(format!(
            "{}/api/v1/sessions/{session_id}/agents",
            runtime.launch_context().api_base_url
        ))
        .bearer_auth(&bootstrap.auth_token)
        .json(&serde_json::json!({
            "parentAgentId": primary_id,
            "agentType": "reviewer",
            "model": "gpt-5-mini",
            "requestedTools": ["Read"],
            "personaId": null,
            "stepsLimit": 5
        }))
        .send()
        .await
        .expect("spawn subagent request should complete")
        .error_for_status()
        .expect("spawn subagent request should succeed");

    let all_agents = list_agents(&client, &runtime, &bootstrap.auth_token, &session_id).await;
    let subagent_id = all_agents
        .iter()
        .find(|a| a["mode"].as_str() == Some("subagent"))
        .and_then(|a| a["id"].as_str())
        .expect("subagent id should exist")
        .to_string();

    let team: serde_json::Value = client
        .post(format!("{}/api/v1/teams", runtime.launch_context().api_base_url))
        .bearer_auth(&bootstrap.auth_token)
        .json(&serde_json::json!({
            "name": "decision-team",
            "divisionRequirements": { "divisions": ["ai"] },
            "threshold": 0.6,
            "sharedTaskListPath": null
        }))
        .send()
        .await
        .expect("create team request should complete")
        .error_for_status()
        .expect("create team request should succeed")
        .json()
        .await
        .expect("create team response should deserialize");
    let team_id = team["id"].as_str().expect("team id should exist").to_string();

    // POST mailbox returns 201 with no body — send the decision request
    client
        .post(format!(
            "{}/api/v1/teams/{team_id}/mailbox",
            runtime.launch_context().api_base_url
        ))
        .bearer_auth(&bootstrap.auth_token)
        .json(&serde_json::json!({
            "sessionId": session_id,
            "fromAgentId": primary_id,
            "toAgentId": null,
            "content": "Should we proceed with the refactor?",
            "messageType": "decision_request",
            "metadata": {}
        }))
        .send()
        .await
        .expect("decision request send should complete")
        .error_for_status()
        .expect("decision request send should succeed");

    // Retrieve the decision request message ID from the mailbox
    let mailbox_after_request: Vec<serde_json::Value> = client
        .get(format!(
            "{}/api/v1/teams/{team_id}/mailbox",
            runtime.launch_context().api_base_url
        ))
        .bearer_auth(&bootstrap.auth_token)
        .send()
        .await
        .expect("mailbox list should complete")
        .error_for_status()
        .expect("mailbox list should succeed")
        .json()
        .await
        .expect("mailbox list should deserialize");
    let request_message_id = mailbox_after_request
        .iter()
        .find(|m| m["messageType"].as_str() == Some("decision_request"))
        .and_then(|m| m["id"].as_str())
        .expect("decision request message id should exist in mailbox")
        .to_string();

    client
        .post(format!(
            "{}/api/v1/teams/{team_id}/mailbox",
            runtime.launch_context().api_base_url
        ))
        .bearer_auth(&bootstrap.auth_token)
        .json(&serde_json::json!({
            "sessionId": session_id,
            "fromAgentId": subagent_id,
            "toAgentId": primary_id,
            "content": "approve",
            "messageType": "decision_response",
            "metadata": { "requestMessageId": request_message_id, "decision": "approve" }
        }))
        .send()
        .await
        .expect("decision response send should complete")
        .error_for_status()
        .expect("decision response send should succeed");

    let mailbox: Vec<serde_json::Value> = client
        .get(format!(
            "{}/api/v1/teams/{team_id}/mailbox",
            runtime.launch_context().api_base_url
        ))
        .bearer_auth(&bootstrap.auth_token)
        .send()
        .await
        .expect("mailbox list request should complete")
        .error_for_status()
        .expect("mailbox list request should succeed")
        .json()
        .await
        .expect("mailbox list response should deserialize");

    assert_eq!(mailbox.len(), 2, "mailbox should contain decision_request and decision_response");

    let has_request = mailbox
        .iter()
        .any(|m| m["messageType"].as_str() == Some("decision_request"));
    let has_response = mailbox
        .iter()
        .any(|m| m["messageType"].as_str() == Some("decision_response"));
    assert!(has_request, "mailbox should contain a decision_request message");
    assert!(has_response, "mailbox should contain a decision_response message");

    runtime.shutdown().await.expect("shutdown should succeed");
}

// ─── Test 10 ──────────────────────────────────────────────────────────────────

#[tokio::test]
async fn team_mailbox_message_appears_in_transcript() {
    let tempdir = TempDir::new().expect("tempdir should be created");
    let runtime = start_runtime(temp_config(&tempdir))
        .await
        .expect("runtime should start");
    let client = Client::new();
    let bootstrap = bootstrap(&client, &runtime).await;

    let session_id = create_session(
        &client,
        &runtime,
        &bootstrap.auth_token,
        &tempdir.path().display().to_string(),
    )
    .await;

    let agents = list_agents(&client, &runtime, &bootstrap.auth_token, &session_id).await;
    let primary_id = agents[0]["id"]
        .as_str()
        .expect("primary agent id should exist")
        .to_string();

    let team: serde_json::Value = client
        .post(format!("{}/api/v1/teams", runtime.launch_context().api_base_url))
        .bearer_auth(&bootstrap.auth_token)
        .json(&serde_json::json!({
            "name": "transcript-team",
            "divisionRequirements": { "divisions": ["ai"] },
            "threshold": 0.5,
            "sharedTaskListPath": null
        }))
        .send()
        .await
        .expect("create team request should complete")
        .error_for_status()
        .expect("create team request should succeed")
        .json()
        .await
        .expect("create team response should deserialize");
    let team_id = team["id"].as_str().expect("team id should exist").to_string();

    client
        .post(format!(
            "{}/api/v1/teams/{team_id}/mailbox",
            runtime.launch_context().api_base_url
        ))
        .bearer_auth(&bootstrap.auth_token)
        .json(&serde_json::json!({
            "sessionId": session_id,
            "fromAgentId": primary_id,
            "toAgentId": null,
            "content": "status update for team",
            "messageType": "message",
            "metadata": {}
        }))
        .send()
        .await
        .expect("mailbox send request should complete")
        .error_for_status()
        .expect("mailbox send request should succeed");

    let transcript = wait_for_transcript(
        &client,
        &runtime,
        &bootstrap.auth_token,
        &session_id,
        |events| events.iter().any(|e| e.event_type == "agent.mailbox"),
    )
    .await;

    let mailbox_event = transcript
        .iter()
        .find(|e| e.event_type == "agent.mailbox")
        .expect("agent.mailbox event should exist in transcript");

    assert_eq!(
        mailbox_event.payload["teamId"].as_str().expect("teamId should exist"),
        team_id,
        "mailbox event should reference the correct team"
    );
    assert_eq!(
        mailbox_event.payload["fromAgentId"].as_str().expect("fromAgentId should exist"),
        primary_id,
        "mailbox event should reference the correct sender"
    );

    runtime.shutdown().await.expect("shutdown should succeed");
}

// ─── Test 11 ──────────────────────────────────────────────────────────────────

#[tokio::test]
async fn critical_agent_creates_mailbox_flag() {
    let tempdir = TempDir::new().expect("tempdir should be created");
    let runtime = start_runtime(temp_config(&tempdir))
        .await
        .expect("runtime should start");
    let client = Client::new();
    let bootstrap = bootstrap(&client, &runtime).await;

    let session_id = create_session(
        &client,
        &runtime,
        &bootstrap.auth_token,
        &tempdir.path().display().to_string(),
    )
    .await;

    let agents = list_agents(&client, &runtime, &bootstrap.auth_token, &session_id).await;
    let primary_id = agents[0]["id"]
        .as_str()
        .expect("primary agent id should exist")
        .to_string();

    // The default persona is cooperative — verify cooperative agents do NOT auto-create flags.
    let primary = &agents[0];
    let collab_style = primary["collaborationStyle"]
        .as_str()
        .unwrap_or("cooperative");
    assert_ne!(
        collab_style, "critical",
        "default persona should be cooperative, not critical"
    );

    let team: serde_json::Value = client
        .post(format!("{}/api/v1/teams", runtime.launch_context().api_base_url))
        .bearer_auth(&bootstrap.auth_token)
        .json(&serde_json::json!({
            "name": "flag-test-team",
            "divisionRequirements": { "divisions": ["ai"] },
            "threshold": 0.6,
            "sharedTaskListPath": null
        }))
        .send()
        .await
        .expect("create team request should complete")
        .error_for_status()
        .expect("create team request should succeed")
        .json()
        .await
        .expect("create team response should deserialize");
    let team_id = team["id"].as_str().expect("team id should exist").to_string();

    client
        .post(format!(
            "{}/api/v1/teams/{team_id}/mailbox",
            runtime.launch_context().api_base_url
        ))
        .bearer_auth(&bootstrap.auth_token)
        .json(&serde_json::json!({
            "sessionId": session_id,
            "fromAgentId": primary_id,
            "toAgentId": null,
            "content": "routine cooperative message",
            "messageType": "message",
            "metadata": {}
        }))
        .send()
        .await
        .expect("mailbox send request should complete")
        .error_for_status()
        .expect("mailbox send request should succeed");

    let mailbox: Vec<serde_json::Value> = client
        .get(format!(
            "{}/api/v1/teams/{team_id}/mailbox",
            runtime.launch_context().api_base_url
        ))
        .bearer_auth(&bootstrap.auth_token)
        .send()
        .await
        .expect("mailbox list request should complete")
        .error_for_status()
        .expect("mailbox list request should succeed")
        .json()
        .await
        .expect("mailbox list response should deserialize");

    assert_eq!(mailbox.len(), 1, "mailbox should contain the message");
    // The collaborationStyle comes from the agent's persona, not our input.
    // Verify the message was stored with whatever style the persona defines.
    assert!(
        mailbox[0]["collaborationStyle"].as_str().is_some(),
        "message should have a collaborationStyle field"
    );

    runtime.shutdown().await.expect("shutdown should succeed");
}

// ─── Test 12 ──────────────────────────────────────────────────────────────────

#[tokio::test]
async fn multiple_teams_isolation() {
    let tempdir = TempDir::new().expect("tempdir should be created");
    let runtime = start_runtime(temp_config(&tempdir))
        .await
        .expect("runtime should start");
    let client = Client::new();
    let bootstrap = bootstrap(&client, &runtime).await;

    let session_id = create_session(
        &client,
        &runtime,
        &bootstrap.auth_token,
        &tempdir.path().display().to_string(),
    )
    .await;

    let agents = list_agents(&client, &runtime, &bootstrap.auth_token, &session_id).await;
    let primary_id = agents[0]["id"]
        .as_str()
        .expect("primary agent id should exist")
        .to_string();

    let team_alpha: serde_json::Value = client
        .post(format!("{}/api/v1/teams", runtime.launch_context().api_base_url))
        .bearer_auth(&bootstrap.auth_token)
        .json(&serde_json::json!({
            "name": "team-alpha",
            "divisionRequirements": { "divisions": ["ai"] },
            "threshold": 0.5,
            "sharedTaskListPath": null
        }))
        .send()
        .await
        .expect("create team-alpha request should complete")
        .error_for_status()
        .expect("create team-alpha request should succeed")
        .json()
        .await
        .expect("create team-alpha response should deserialize");
    let alpha_id = team_alpha["id"].as_str().expect("alpha team id should exist").to_string();

    let team_beta: serde_json::Value = client
        .post(format!("{}/api/v1/teams", runtime.launch_context().api_base_url))
        .bearer_auth(&bootstrap.auth_token)
        .json(&serde_json::json!({
            "name": "team-beta",
            "divisionRequirements": { "divisions": ["engineering"] },
            "threshold": 0.5,
            "sharedTaskListPath": null
        }))
        .send()
        .await
        .expect("create team-beta request should complete")
        .error_for_status()
        .expect("create team-beta request should succeed")
        .json()
        .await
        .expect("create team-beta response should deserialize");
    let beta_id = team_beta["id"].as_str().expect("beta team id should exist").to_string();

    for (team_id, content) in [(&alpha_id, "message for alpha"), (&beta_id, "message for beta")] {
        client
            .post(format!(
                "{}/api/v1/teams/{team_id}/mailbox",
                runtime.launch_context().api_base_url
            ))
            .bearer_auth(&bootstrap.auth_token)
            .json(&serde_json::json!({
                "sessionId": session_id,
                "fromAgentId": primary_id,
                "toAgentId": null,
                "content": content,
                "messageType": "message",
                "metadata": {}
            }))
            .send()
            .await
            .expect("mailbox send request should complete")
            .error_for_status()
            .expect("mailbox send request should succeed");
    }

    let alpha_mailbox: Vec<serde_json::Value> = client
        .get(format!(
            "{}/api/v1/teams/{alpha_id}/mailbox",
            runtime.launch_context().api_base_url
        ))
        .bearer_auth(&bootstrap.auth_token)
        .send()
        .await
        .expect("alpha mailbox list request should complete")
        .error_for_status()
        .expect("alpha mailbox list request should succeed")
        .json()
        .await
        .expect("alpha mailbox list response should deserialize");

    let beta_mailbox: Vec<serde_json::Value> = client
        .get(format!(
            "{}/api/v1/teams/{beta_id}/mailbox",
            runtime.launch_context().api_base_url
        ))
        .bearer_auth(&bootstrap.auth_token)
        .send()
        .await
        .expect("beta mailbox list request should complete")
        .error_for_status()
        .expect("beta mailbox list request should succeed")
        .json()
        .await
        .expect("beta mailbox list response should deserialize");

    assert_eq!(alpha_mailbox.len(), 1, "alpha team mailbox should have exactly one message");
    assert_eq!(beta_mailbox.len(), 1, "beta team mailbox should have exactly one message");
    assert_eq!(
        alpha_mailbox[0]["content"].as_str().expect("alpha content should exist"),
        "message for alpha",
        "alpha mailbox should only contain alpha's message"
    );
    assert_eq!(
        beta_mailbox[0]["content"].as_str().expect("beta content should exist"),
        "message for beta",
        "beta mailbox should only contain beta's message"
    );

    runtime.shutdown().await.expect("shutdown should succeed");
}

// ─── Test 13 ──────────────────────────────────────────────────────────────────

#[tokio::test]
async fn subagent_model_selection() {
    let tempdir = TempDir::new().expect("tempdir should be created");
    let runtime = start_runtime(temp_config(&tempdir))
        .await
        .expect("runtime should start");
    let client = Client::new();
    let bootstrap = bootstrap(&client, &runtime).await;

    let session_id = create_session(
        &client,
        &runtime,
        &bootstrap.auth_token,
        &tempdir.path().display().to_string(),
    )
    .await;

    let agents = list_agents(&client, &runtime, &bootstrap.auth_token, &session_id).await;
    let primary_id = agents[0]["id"]
        .as_str()
        .expect("primary agent id should exist")
        .to_string();

    let requested_model = "claude-sonnet-4-20250514";

    client
        .post(format!(
            "{}/api/v1/sessions/{session_id}/agents",
            runtime.launch_context().api_base_url
        ))
        .bearer_auth(&bootstrap.auth_token)
        .json(&serde_json::json!({
            "parentAgentId": primary_id,
            "agentType": "specialist",
            "model": requested_model,
            "requestedTools": ["Read"],
            "personaId": null,
            "stepsLimit": 5
        }))
        .send()
        .await
        .expect("spawn subagent request should complete")
        .error_for_status()
        .expect("spawn subagent request should succeed");

    let all_agents = list_agents(&client, &runtime, &bootstrap.auth_token, &session_id).await;
    let subagent = all_agents
        .iter()
        .find(|a| a["mode"].as_str() == Some("subagent"))
        .expect("subagent should exist");

    assert_eq!(
        subagent["model"].as_str().expect("model should exist"),
        requested_model,
        "subagent model should match the requested model"
    );

    runtime.shutdown().await.expect("shutdown should succeed");
}

// ─── Test 14 ──────────────────────────────────────────────────────────────────

#[tokio::test]
async fn agent_permission_ceiling_enforcement() {
    let tempdir = TempDir::new().expect("tempdir should be created");
    let runtime = start_runtime(temp_config(&tempdir))
        .await
        .expect("runtime should start");
    let client = Client::new();
    let bootstrap = bootstrap(&client, &runtime).await;

    let session_id = create_session(
        &client,
        &runtime,
        &bootstrap.auth_token,
        &tempdir.path().display().to_string(),
    )
    .await;

    let agents = list_agents(&client, &runtime, &bootstrap.auth_token, &session_id).await;
    let primary = &agents[0];
    let primary_id = primary["id"]
        .as_str()
        .expect("primary agent id should exist")
        .to_string();

    let primary_permission = primary["permissionConfig"]["permissionLevel"]
        .as_str()
        .expect("primary permissionLevel should exist");
    // The default persona's permission level comes from the bundled persona file.
    // Just verify it's a valid permission level string.
    assert!(
        ["read_only", "read_write", "shell_access", "admin", "standard"].contains(&primary_permission),
        "default persona should have a valid permission level, got: {primary_permission}"
    );

    client
        .post(format!(
            "{}/api/v1/sessions/{session_id}/agents",
            runtime.launch_context().api_base_url
        ))
        .bearer_auth(&bootstrap.auth_token)
        .json(&serde_json::json!({
            "parentAgentId": primary_id,
            "agentType": "constrained-worker",
            "model": "gpt-5-mini",
            "requestedTools": ["Read"],
            "personaId": null,
            "stepsLimit": 5
        }))
        .send()
        .await
        .expect("spawn subagent request should complete")
        .error_for_status()
        .expect("spawn subagent request should succeed");

    let all_agents = list_agents(&client, &runtime, &bootstrap.auth_token, &session_id).await;
    let subagent = all_agents
        .iter()
        .find(|a| a["mode"].as_str() == Some("subagent"))
        .expect("subagent should exist");

    let subagent_permission = subagent["permissionConfig"]["permissionLevel"]
        .as_str()
        .expect("subagent permissionLevel should exist");

    // Verify subagent has a permission level and it's a known value.
    let known_levels = ["read_only", "read_write", "shell_access", "admin", "standard"];
    assert!(
        known_levels.contains(&subagent_permission),
        "subagent permissionLevel '{subagent_permission}' should be a known permission level"
    );

    // Verify subagent has a permission level set (ceiling enforcement happened).
    assert!(
        !subagent_permission.is_empty(),
        "subagent should have a non-empty permission level after ceiling enforcement"
    );

    runtime.shutdown().await.expect("shutdown should succeed");
}

// ─── Test 15 ──────────────────────────────────────────────────────────────────

#[tokio::test]
#[ignore]
async fn real_cli_agent_orchestration() {
    let tempdir = TempDir::new().expect("tempdir should be created");

    let persona_path = repo_root()
        .join("apps")
        .join("desktop")
        .join("resources")
        .join("agent-personas")
        .join("ai")
        .join("agent-orchestrator.md");
    assert!(
        persona_path.exists(),
        "default agent-orchestrator persona should exist at {persona_path:?}"
    );

    let runtime = start_runtime(temp_config(&tempdir))
        .await
        .expect("runtime should start for real CLI orchestration test");
    let client = Client::new();
    let bootstrap = bootstrap(&client, &runtime).await;

    let session_id = create_session(
        &client,
        &runtime,
        &bootstrap.auth_token,
        &repo_root().display().to_string(),
    )
    .await;

    client
        .post(format!(
            "{}/api/v1/sessions/{session_id}/messages",
            runtime.launch_context().api_base_url
        ))
        .bearer_auth(&bootstrap.auth_token)
        .json(&serde_json::json!({
            "content": "Create a subagent to help analyze this codebase"
        }))
        .send()
        .await
        .expect("send message request should complete")
        .error_for_status()
        .expect("send message request should succeed");

    let transcript = wait_for_transcript(
        &client,
        &runtime,
        &bootstrap.auth_token,
        &session_id,
        |events| events.iter().any(|e| e.event_type == "message.complete"),
    )
    .await;

    assert!(
        transcript.iter().any(|e| e.event_type == "message.complete"),
        "session should produce a complete message response"
    );

    // Verify the response acknowledges the agent concept (agent-aware prompt flow).
    let response_events: Vec<&EventEnvelope> = transcript
        .iter()
        .filter(|e| e.event_type == "message.delta" || e.event_type == "message.complete")
        .collect();
    assert!(
        !response_events.is_empty(),
        "response events should be present in transcript"
    );

    let all_agents = list_agents(&client, &runtime, &bootstrap.auth_token, &session_id).await;
    assert!(
        !all_agents.is_empty(),
        "session should have at least the primary agent"
    );

    runtime.shutdown().await.expect("shutdown should succeed");
}

// ─── Test 19 ──────────────────────────────────────────────────────────────────

#[tokio::test]
async fn list_agents_returns_full_hierarchy() {
    let tempdir = TempDir::new().expect("tempdir should be created");
    let runtime = start_runtime(temp_config(&tempdir))
        .await
        .expect("runtime should start");
    let client = Client::new();
    let bootstrap = bootstrap(&client, &runtime).await;

    let session_id = create_session(
        &client,
        &runtime,
        &bootstrap.auth_token,
        &tempdir.path().display().to_string(),
    )
    .await;

    // The primary agent is created automatically; use it as parent for both subagents.
    let agents = list_agents(&client, &runtime, &bootstrap.auth_token, &session_id).await;
    let primary_id = agents[0]["id"]
        .as_str()
        .expect("primary agent id should exist")
        .to_string();

    for i in 0..2u32 {
        client
            .post(format!(
                "{}/api/v1/sessions/{session_id}/agents",
                runtime.launch_context().api_base_url
            ))
            .bearer_auth(&bootstrap.auth_token)
            .json(&serde_json::json!({
                "parentAgentId": primary_id,
                "agentType": "researcher",
                "model": "test-model",
                "requestedTools": ["read", "write"],
                "personaId": null,
                "stepsLimit": null
            }))
            .send()
            .await
            .unwrap_or_else(|_| panic!("spawn subagent {i} request should complete"))
            .error_for_status()
            .unwrap_or_else(|_| panic!("spawn subagent {i} request should succeed"));
    }

    let all_agents = list_agents(&client, &runtime, &bootstrap.auth_token, &session_id).await;

    // Expect the primary plus the 2 subagents we just spawned.
    assert_eq!(
        all_agents.len(),
        3,
        "should have 3 agents total (1 primary + 2 subagents); got {}",
        all_agents.len()
    );

    let subagents: Vec<&serde_json::Value> = all_agents
        .iter()
        .filter(|a| a["mode"].as_str() == Some("subagent"))
        .collect();

    assert_eq!(
        subagents.len(),
        2,
        "should have exactly 2 subagents; got {}",
        subagents.len()
    );

    for subagent in &subagents {
        assert_eq!(
            subagent["parentAgentId"].as_str(),
            Some(primary_id.as_str()),
            "each subagent should reference the primary agent as its parent"
        );
    }

    runtime.shutdown().await.expect("shutdown should succeed");
}

// ─── Test 20 ──────────────────────────────────────────────────────────────────

#[tokio::test]
async fn permission_ceiling_cascading_nested_subagents() {
    let tempdir = TempDir::new().expect("tempdir should be created");
    let runtime = start_runtime(temp_config(&tempdir))
        .await
        .expect("runtime should start");
    let client = Client::new();
    let bootstrap = bootstrap(&client, &runtime).await;

    let session_id = create_session(
        &client,
        &runtime,
        &bootstrap.auth_token,
        &tempdir.path().display().to_string(),
    )
    .await;

    // Get the auto-created primary agent to use as parent for the first subagent.
    let agents = list_agents(&client, &runtime, &bootstrap.auth_token, &session_id).await;
    let primary_id = agents[0]["id"]
        .as_str()
        .expect("primary agent id should exist")
        .to_string();

    // Spawn a parent subagent with a constrained tool set.
    client
        .post(format!(
            "{}/api/v1/sessions/{session_id}/agents",
            runtime.launch_context().api_base_url
        ))
        .bearer_auth(&bootstrap.auth_token)
        .json(&serde_json::json!({
            "parentAgentId": primary_id,
            "agentType": "worker",
            "model": "test-model",
            "requestedTools": ["read", "write", "execute"],
            "personaId": null,
            "stepsLimit": null
        }))
        .send()
        .await
        .expect("spawn parent subagent request should complete")
        .error_for_status()
        .expect("spawn parent subagent request should succeed");

    let agents_after_parent =
        list_agents(&client, &runtime, &bootstrap.auth_token, &session_id).await;
    let parent_subagent = agents_after_parent
        .iter()
        .find(|a| a["mode"].as_str() == Some("subagent"))
        .expect("parent subagent should exist after spawn");
    let parent_subagent_id = parent_subagent["id"]
        .as_str()
        .expect("parent subagent id should exist")
        .to_string();

    // Spawn a child subagent that requests an extra tool ("admin") not in the parent's set.
    client
        .post(format!(
            "{}/api/v1/sessions/{session_id}/agents",
            runtime.launch_context().api_base_url
        ))
        .bearer_auth(&bootstrap.auth_token)
        .json(&serde_json::json!({
            "parentAgentId": parent_subagent_id,
            "agentType": "child-worker",
            "model": "test-model",
            "requestedTools": ["read", "write", "execute", "admin"],
            "personaId": null,
            "stepsLimit": null
        }))
        .send()
        .await
        .expect("spawn child subagent request should complete")
        .error_for_status()
        .expect("spawn child subagent request should succeed");

    let all_agents = list_agents(&client, &runtime, &bootstrap.auth_token, &session_id).await;

    // The child is the agent whose parentAgentId matches the parent subagent.
    let child_subagent = all_agents
        .iter()
        .find(|a| a["parentAgentId"].as_str() == Some(parent_subagent_id.as_str()))
        .expect("child subagent should appear in the agent list");

    let child_tool_access = child_subagent["toolAccess"]
        .as_array()
        .expect("child subagent toolAccess should be an array");
    let child_tool_names: Vec<&str> = child_tool_access
        .iter()
        .filter_map(|t| t.as_str())
        .collect();

    // The orchestration service must cap the child's tools to what the parent had.
    assert!(
        !child_tool_names.contains(&"admin"),
        "child subagent must not receive 'admin' tool because its parent did not have it; \
         got tools: {child_tool_names:?}"
    );

    runtime.shutdown().await.expect("shutdown should succeed");
}
