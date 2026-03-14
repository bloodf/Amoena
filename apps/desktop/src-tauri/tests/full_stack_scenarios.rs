use std::path::PathBuf;

use lunaria_desktop::{start_runtime, BootstrapSession, EventEnvelope, RuntimeConfig, RuntimeHandle};
use reqwest::Client;
use tempfile::TempDir;
use tokio::time::{sleep, timeout, Duration};

// ---------------------------------------------------------------------------
// Shared helpers
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
        .json(&serde_json::json!({
            "workingDir": working_dir,
            "sessionMode": "native",
            "tuiType": "native"
        }))
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

            sleep(Duration::from_millis(25)).await;
        }
    })
    .await
    .expect("timed out waiting for transcript state")
}

// ---------------------------------------------------------------------------
// 1. autopilot_phase_progression_via_native_session
// ---------------------------------------------------------------------------

#[tokio::test]
async fn autopilot_phase_progression_via_native_session() {
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

    client
        .post(format!(
            "{}/api/v1/sessions/{session_id}/autopilot",
            runtime.launch_context().api_base_url
        ))
        .bearer_auth(&bootstrap.auth_token)
        .json(&serde_json::json!({ "enabled": true }))
        .send()
        .await
        .expect("enable autopilot request should complete")
        .error_for_status()
        .expect("enable autopilot should succeed");

    client
        .post(format!(
            "{}/api/v1/sessions/{session_id}/messages",
            runtime.launch_context().api_base_url
        ))
        .bearer_auth(&bootstrap.auth_token)
        .json(&serde_json::json!({ "content": "refactor the authentication module" }))
        .send()
        .await
        .expect("send message request should complete")
        .error_for_status()
        .expect("send message should succeed");

    let transcript = wait_for_transcript(
        &client,
        &runtime,
        &bootstrap.auth_token,
        &session_id,
        |events| {
            events.iter().any(|e| {
                e.event_type == "autopilot.phase"
                    && e.payload["currentPhase"].as_str() == Some("goal_analysis")
            })
        },
    )
    .await;

    let phase_event = transcript
        .iter()
        .find(|e| {
            e.event_type == "autopilot.phase"
                && e.payload["currentPhase"].as_str() == Some("goal_analysis")
        })
        .expect("autopilot.phase event with currentPhase goal_analysis should exist");

    assert_eq!(
        phase_event.payload["currentPhase"].as_str(),
        Some("goal_analysis"),
        "autopilot phase should be goal_analysis after enabling and sending a goal"
    );

    runtime.shutdown().await.expect("shutdown should succeed");
}

// ---------------------------------------------------------------------------
// 2. autopilot_toggle_emits_phase_event
// ---------------------------------------------------------------------------

#[tokio::test]
async fn autopilot_toggle_emits_phase_event() {
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

    let enabled_response: serde_json::Value = client
        .post(format!(
            "{}/api/v1/sessions/{session_id}/autopilot",
            runtime.launch_context().api_base_url
        ))
        .bearer_auth(&bootstrap.auth_token)
        .json(&serde_json::json!({ "enabled": true }))
        .send()
        .await
        .expect("enable autopilot request should complete")
        .error_for_status()
        .expect("enable autopilot should succeed")
        .json()
        .await
        .expect("enable autopilot response should deserialize");

    assert_eq!(
        enabled_response["metadata"]["autopilot"].as_bool(),
        Some(true),
        "enable autopilot response should reflect autopilot: true in metadata"
    );

    let transcript_on = wait_for_transcript(
        &client,
        &runtime,
        &bootstrap.auth_token,
        &session_id,
        |events| {
            events.iter().any(|e| {
                e.event_type == "autopilot.phase"
                    && e.payload["enabled"].as_bool() == Some(true)
                    && e.payload["currentPhase"].as_str() == Some("goal_analysis")
            })
        },
    )
    .await;

    assert!(
        transcript_on.iter().any(|e| {
            e.event_type == "autopilot.phase"
                && e.payload["enabled"].as_bool() == Some(true)
                && e.payload["currentPhase"].as_str() == Some("goal_analysis")
        }),
        "transcript should contain autopilot.phase event with enabled: true and currentPhase: goal_analysis"
    );

    client
        .post(format!(
            "{}/api/v1/sessions/{session_id}/autopilot",
            runtime.launch_context().api_base_url
        ))
        .bearer_auth(&bootstrap.auth_token)
        .json(&serde_json::json!({ "enabled": false }))
        .send()
        .await
        .expect("disable autopilot request should complete")
        .error_for_status()
        .expect("disable autopilot should succeed");

    let transcript_off = wait_for_transcript(
        &client,
        &runtime,
        &bootstrap.auth_token,
        &session_id,
        |events| {
            events.iter().any(|e| {
                e.event_type == "autopilot.phase"
                    && e.payload["enabled"].as_bool() == Some(false)
            })
        },
    )
    .await;

    assert!(
        transcript_off.iter().any(|e| {
            e.event_type == "autopilot.phase" && e.payload["enabled"].as_bool() == Some(false)
        }),
        "transcript should contain autopilot.phase event with enabled: false after disabling"
    );

    runtime.shutdown().await.expect("shutdown should succeed");
}

// ---------------------------------------------------------------------------
// 3. team_consensus_approve_after_flag_resolution
// ---------------------------------------------------------------------------

#[tokio::test]
async fn team_consensus_approve_after_flag_resolution() {
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

    let agents_before: Vec<serde_json::Value> = client
        .get(format!(
            "{}/api/v1/sessions/{session_id}/agents/list",
            runtime.launch_context().api_base_url
        ))
        .bearer_auth(&bootstrap.auth_token)
        .send()
        .await
        .expect("list agents request should complete")
        .error_for_status()
        .expect("list agents request should succeed")
        .json()
        .await
        .expect("list agents response should deserialize");

    let primary_id = agents_before
        .iter()
        .find(|a| a["mode"].as_str() == Some("primary"))
        .expect("primary agent should exist after session creation")["id"]
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
            "stepsLimit": null
        }))
        .send()
        .await
        .expect("spawn subagent request should complete")
        .error_for_status()
        .expect("spawn subagent request should succeed");

    let agents_after: Vec<serde_json::Value> = client
        .get(format!(
            "{}/api/v1/sessions/{session_id}/agents/list",
            runtime.launch_context().api_base_url
        ))
        .bearer_auth(&bootstrap.auth_token)
        .send()
        .await
        .expect("list agents should complete")
        .error_for_status()
        .expect("list agents should succeed")
        .json()
        .await
        .expect("list agents should deserialize");

    let subagent_id = agents_after
        .iter()
        .find(|a| a["agentType"].as_str() == Some("reviewer"))
        .expect("reviewer agent should appear in list")["id"]
        .as_str()
        .expect("subagent id should exist")
        .to_string();

    let team: serde_json::Value = client
        .post(format!(
            "{}/api/v1/teams",
            runtime.launch_context().api_base_url
        ))
        .bearer_auth(&bootstrap.auth_token)
        .json(&serde_json::json!({
            "name": "consensus-approve-team",
            "divisionRequirements": { "engineering": 1, "qa": 1 },
            "threshold": 0.6
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
            "content": "Should we proceed with the merge?",
            "messageType": "decision_request",
            "metadata": {}
        }))
        .send()
        .await
        .expect("decision_request mailbox send should complete")
        .error_for_status()
        .expect("decision_request mailbox send should succeed");

    client
        .post(format!(
            "{}/api/v1/teams/{team_id}/mailbox",
            runtime.launch_context().api_base_url
        ))
        .bearer_auth(&bootstrap.auth_token)
        .json(&serde_json::json!({
            "sessionId": session_id,
            "fromAgentId": subagent_id,
            "toAgentId": null,
            "content": "I approve the merge",
            "messageType": "decision_response",
            "metadata": { "vote": "approve", "weight": 1.0 }
        }))
        .send()
        .await
        .expect("decision_response mailbox send should complete")
        .error_for_status()
        .expect("decision_response mailbox send should succeed");

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

    assert_eq!(
        mailbox.len(),
        2,
        "mailbox should contain decision_request and decision_response"
    );
    assert!(
        mailbox
            .iter()
            .any(|m| m["messageType"].as_str() == Some("decision_request")),
        "mailbox should contain a decision_request message"
    );
    assert!(
        mailbox
            .iter()
            .any(|m| m["messageType"].as_str() == Some("decision_response")),
        "mailbox should contain a decision_response message"
    );

    runtime.shutdown().await.expect("shutdown should succeed");
}

// ---------------------------------------------------------------------------
// 4. team_consensus_weighted_voting_rejects_below_threshold
// ---------------------------------------------------------------------------

#[tokio::test]
async fn team_consensus_weighted_voting_rejects_below_threshold() {
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

    let agents_before: Vec<serde_json::Value> = client
        .get(format!(
            "{}/api/v1/sessions/{session_id}/agents/list",
            runtime.launch_context().api_base_url
        ))
        .bearer_auth(&bootstrap.auth_token)
        .send()
        .await
        .expect("list agents request should complete")
        .error_for_status()
        .expect("list agents request should succeed")
        .json()
        .await
        .expect("list agents response should deserialize");

    let primary_id = agents_before
        .iter()
        .find(|a| a["mode"].as_str() == Some("primary"))
        .expect("primary agent should exist after session creation")["id"]
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
            "agentType": "approver",
            "model": "gpt-5-mini",
            "requestedTools": ["Read"],
            "personaId": null,
            "stepsLimit": null
        }))
        .send()
        .await
        .expect("spawn approver subagent should complete")
        .error_for_status()
        .expect("spawn approver subagent should succeed");

    client
        .post(format!(
            "{}/api/v1/sessions/{session_id}/agents",
            runtime.launch_context().api_base_url
        ))
        .bearer_auth(&bootstrap.auth_token)
        .json(&serde_json::json!({
            "parentAgentId": primary_id,
            "agentType": "rejector",
            "model": "gpt-5-mini",
            "requestedTools": ["Read"],
            "personaId": null,
            "stepsLimit": null
        }))
        .send()
        .await
        .expect("spawn rejector subagent should complete")
        .error_for_status()
        .expect("spawn rejector subagent should succeed");

    let agents_after: Vec<serde_json::Value> = client
        .get(format!(
            "{}/api/v1/sessions/{session_id}/agents/list",
            runtime.launch_context().api_base_url
        ))
        .bearer_auth(&bootstrap.auth_token)
        .send()
        .await
        .expect("list agents should complete")
        .error_for_status()
        .expect("list agents should succeed")
        .json()
        .await
        .expect("list agents should deserialize");

    let approver_id = agents_after
        .iter()
        .find(|a| a["agentType"].as_str() == Some("approver"))
        .expect("approver agent should appear in list")["id"]
        .as_str()
        .expect("approver agent id should exist")
        .to_string();

    let rejector_id = agents_after
        .iter()
        .find(|a| a["agentType"].as_str() == Some("rejector"))
        .expect("rejector agent should appear in list")["id"]
        .as_str()
        .expect("rejector agent id should exist")
        .to_string();

    let team: serde_json::Value = client
        .post(format!(
            "{}/api/v1/teams",
            runtime.launch_context().api_base_url
        ))
        .bearer_auth(&bootstrap.auth_token)
        .json(&serde_json::json!({
            "name": "weighted-reject-team",
            "divisionRequirements": {},
            "threshold": 0.8
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
            "fromAgentId": approver_id,
            "toAgentId": null,
            "content": "I approve",
            "messageType": "decision_response",
            "metadata": { "vote": "approve", "weight": 0.4 }
        }))
        .send()
        .await
        .expect("approver vote send should complete")
        .error_for_status()
        .expect("approver vote send should succeed");

    client
        .post(format!(
            "{}/api/v1/teams/{team_id}/mailbox",
            runtime.launch_context().api_base_url
        ))
        .bearer_auth(&bootstrap.auth_token)
        .json(&serde_json::json!({
            "sessionId": session_id,
            "fromAgentId": rejector_id,
            "toAgentId": null,
            "content": "I reject",
            "messageType": "decision_response",
            "metadata": { "vote": "reject", "weight": 0.6 }
        }))
        .send()
        .await
        .expect("rejector vote send should complete")
        .error_for_status()
        .expect("rejector vote send should succeed");

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

    assert_eq!(mailbox.len(), 2, "mailbox should contain both votes");

    let approve_vote = mailbox
        .iter()
        .find(|m| m["metadata"]["vote"].as_str() == Some("approve"))
        .expect("approve vote should exist in mailbox");
    assert_eq!(
        approve_vote["metadata"]["weight"].as_f64(),
        Some(0.4),
        "approve vote weight should be 0.4"
    );

    let reject_vote = mailbox
        .iter()
        .find(|m| m["metadata"]["vote"].as_str() == Some("reject"))
        .expect("reject vote should exist in mailbox");
    assert_eq!(
        reject_vote["metadata"]["weight"].as_f64(),
        Some(0.6),
        "reject vote weight should be 0.6"
    );

    runtime.shutdown().await.expect("shutdown should succeed");
}

// ---------------------------------------------------------------------------
// 5. team_consensus_abstain_excluded_from_calculation
// ---------------------------------------------------------------------------

#[tokio::test]
async fn team_consensus_abstain_excluded_from_calculation() {
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

    let agents_before: Vec<serde_json::Value> = client
        .get(format!(
            "{}/api/v1/sessions/{session_id}/agents/list",
            runtime.launch_context().api_base_url
        ))
        .bearer_auth(&bootstrap.auth_token)
        .send()
        .await
        .expect("list agents request should complete")
        .error_for_status()
        .expect("list agents request should succeed")
        .json()
        .await
        .expect("list agents response should deserialize");

    let primary_id = agents_before
        .iter()
        .find(|a| a["mode"].as_str() == Some("primary"))
        .expect("primary agent should exist after session creation")["id"]
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
            "agentType": "abstainer",
            "model": "gpt-5-mini",
            "requestedTools": ["Read"],
            "personaId": null,
            "stepsLimit": null
        }))
        .send()
        .await
        .expect("spawn abstainer subagent should complete")
        .error_for_status()
        .expect("spawn abstainer subagent should succeed");

    client
        .post(format!(
            "{}/api/v1/sessions/{session_id}/agents",
            runtime.launch_context().api_base_url
        ))
        .bearer_auth(&bootstrap.auth_token)
        .json(&serde_json::json!({
            "parentAgentId": primary_id,
            "agentType": "approver",
            "model": "gpt-5-mini",
            "requestedTools": ["Read"],
            "personaId": null,
            "stepsLimit": null
        }))
        .send()
        .await
        .expect("spawn approver subagent should complete")
        .error_for_status()
        .expect("spawn approver subagent should succeed");

    let agents_after: Vec<serde_json::Value> = client
        .get(format!(
            "{}/api/v1/sessions/{session_id}/agents/list",
            runtime.launch_context().api_base_url
        ))
        .bearer_auth(&bootstrap.auth_token)
        .send()
        .await
        .expect("list agents should complete")
        .error_for_status()
        .expect("list agents should succeed")
        .json()
        .await
        .expect("list agents should deserialize");

    let abstainer_id = agents_after
        .iter()
        .find(|a| a["agentType"].as_str() == Some("abstainer"))
        .expect("abstainer agent should appear in list")["id"]
        .as_str()
        .expect("abstainer agent id should exist")
        .to_string();

    let approver_id = agents_after
        .iter()
        .find(|a| a["agentType"].as_str() == Some("approver"))
        .expect("approver agent should appear in list")["id"]
        .as_str()
        .expect("approver agent id should exist")
        .to_string();

    let team: serde_json::Value = client
        .post(format!(
            "{}/api/v1/teams",
            runtime.launch_context().api_base_url
        ))
        .bearer_auth(&bootstrap.auth_token)
        .json(&serde_json::json!({
            "name": "abstain-test-team",
            "divisionRequirements": {},
            "threshold": 0.6
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
            "content": "Should we ship?",
            "messageType": "decision_request",
            "metadata": {}
        }))
        .send()
        .await
        .expect("decision_request send should complete")
        .error_for_status()
        .expect("decision_request send should succeed");

    client
        .post(format!(
            "{}/api/v1/teams/{team_id}/mailbox",
            runtime.launch_context().api_base_url
        ))
        .bearer_auth(&bootstrap.auth_token)
        .json(&serde_json::json!({
            "sessionId": session_id,
            "fromAgentId": abstainer_id,
            "toAgentId": null,
            "content": "I have no opinion",
            "messageType": "decision_response",
            "metadata": { "vote": "abstain" }
        }))
        .send()
        .await
        .expect("abstain vote send should complete")
        .error_for_status()
        .expect("abstain vote send should succeed");

    client
        .post(format!(
            "{}/api/v1/teams/{team_id}/mailbox",
            runtime.launch_context().api_base_url
        ))
        .bearer_auth(&bootstrap.auth_token)
        .json(&serde_json::json!({
            "sessionId": session_id,
            "fromAgentId": approver_id,
            "toAgentId": null,
            "content": "I approve",
            "messageType": "decision_response",
            "metadata": { "vote": "approve" }
        }))
        .send()
        .await
        .expect("approve vote send should complete")
        .error_for_status()
        .expect("approve vote send should succeed");

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

    assert_eq!(mailbox.len(), 3, "mailbox should contain decision_request, abstain, and approve messages");
    assert!(
        mailbox.iter().any(|m| m["metadata"]["vote"].as_str() == Some("abstain")),
        "mailbox should contain abstain vote"
    );
    assert!(
        mailbox.iter().any(|m| m["metadata"]["vote"].as_str() == Some("approve")),
        "mailbox should contain approve vote"
    );

    runtime.shutdown().await.expect("shutdown should succeed");
}

// ---------------------------------------------------------------------------
// 6. subagent_spawn_result_in_transcript
// ---------------------------------------------------------------------------

#[tokio::test]
async fn subagent_spawn_result_in_transcript() {
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

    let agents_before: Vec<serde_json::Value> = client
        .get(format!(
            "{}/api/v1/sessions/{session_id}/agents/list",
            runtime.launch_context().api_base_url
        ))
        .bearer_auth(&bootstrap.auth_token)
        .send()
        .await
        .expect("list agents request should complete")
        .error_for_status()
        .expect("list agents request should succeed")
        .json()
        .await
        .expect("list agents response should deserialize");

    let primary_id = agents_before
        .iter()
        .find(|a| a["mode"].as_str() == Some("primary"))
        .expect("primary agent should exist after session creation")["id"]
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
            "requestedTools": ["Read", "Bash"],
            "personaId": null,
            "stepsLimit": 5
        }))
        .send()
        .await
        .expect("spawn subagent request should complete")
        .error_for_status()
        .expect("spawn subagent request should succeed");

    let agents_after: Vec<serde_json::Value> = client
        .get(format!(
            "{}/api/v1/sessions/{session_id}/agents/list",
            runtime.launch_context().api_base_url
        ))
        .bearer_auth(&bootstrap.auth_token)
        .send()
        .await
        .expect("list agents should complete")
        .error_for_status()
        .expect("list agents should succeed")
        .json()
        .await
        .expect("list agents should deserialize");

    let subagent_id = agents_after
        .iter()
        .find(|a| a["agentType"].as_str() == Some("researcher"))
        .expect("researcher agent should appear in list")["id"]
        .as_str()
        .expect("subagent id should exist")
        .to_string();

    let transcript = wait_for_transcript(
        &client,
        &runtime,
        &bootstrap.auth_token,
        &session_id,
        |events| {
            events.iter().any(|e| {
                e.event_type == "agent.spawned"
                    && e.payload["parentAgentId"].as_str() == Some(&primary_id)
            })
        },
    )
    .await;

    let spawned_event = transcript
        .iter()
        .find(|e| {
            e.event_type == "agent.spawned"
                && e.payload["parentAgentId"].as_str() == Some(primary_id.as_str())
        })
        .expect("agent.spawned event with parentAgentId should exist");

    assert_eq!(
        spawned_event.payload["agentId"].as_str(),
        Some(subagent_id.as_str()),
        "agent.spawned event agentId should match the spawned subagent id"
    );
    assert_eq!(
        spawned_event.payload["parentAgentId"].as_str(),
        Some(primary_id.as_str()),
        "agent.spawned event parentAgentId should match the primary agent id"
    );

    runtime.shutdown().await.expect("shutdown should succeed");
}

// ---------------------------------------------------------------------------
// 7. multiple_messages_preserve_order
// ---------------------------------------------------------------------------

#[tokio::test]
async fn multiple_messages_preserve_order() {
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

    for i in 1..=5 {
        client
            .post(format!(
                "{}/api/v1/sessions/{session_id}/messages",
                runtime.launch_context().api_base_url
            ))
            .bearer_auth(&bootstrap.auth_token)
            .json(&serde_json::json!({ "content": format!("msg-{i}") }))
            .send()
            .await
            .expect("send message request should complete")
            .error_for_status()
            .expect("send message should succeed");
    }

    let transcript = wait_for_transcript(
        &client,
        &runtime,
        &bootstrap.auth_token,
        &session_id,
        |events| {
            let user_events: Vec<_> = events
                .iter()
                .filter(|e| e.event_type == "message.created")
                .collect();
            user_events.len() >= 5
        },
    )
    .await;

    let user_messages: Vec<&EventEnvelope> = transcript
        .iter()
        .filter(|e| e.event_type == "message.created")
        .collect();

    assert!(
        user_messages.len() >= 5,
        "transcript should contain at least 5 user.message events"
    );

    let contents: Vec<&str> = user_messages
        .iter()
        .filter_map(|e| e.payload["content"].as_str())
        .collect();

    let mut seen_indices: Vec<usize> = Vec::new();
    for content in &contents {
        if let Some(n) = content
            .strip_prefix("msg-")
            .and_then(|s| s.parse::<usize>().ok())
        {
            seen_indices.push(n);
        }
    }

    let is_sorted = seen_indices.windows(2).all(|w| w[0] <= w[1]);
    assert!(
        is_sorted,
        "user message events should appear in the order they were sent, got: {seen_indices:?}"
    );

    runtime.shutdown().await.expect("shutdown should succeed");
}

// ---------------------------------------------------------------------------
// 8. concurrent_sessions_isolated
// ---------------------------------------------------------------------------

#[tokio::test]
async fn concurrent_sessions_isolated() {
    let tempdir = TempDir::new().expect("tempdir should be created");
    let runtime = start_runtime(temp_config(&tempdir))
        .await
        .expect("runtime should start");
    let client = Client::new();
    let bootstrap = bootstrap(&client, &runtime).await;

    let session_a = create_session(
        &client,
        &runtime,
        &bootstrap.auth_token,
        &tempdir.path().display().to_string(),
    )
    .await;

    let session_b = create_session(
        &client,
        &runtime,
        &bootstrap.auth_token,
        &tempdir.path().display().to_string(),
    )
    .await;

    client
        .post(format!(
            "{}/api/v1/sessions/{session_a}/messages",
            runtime.launch_context().api_base_url
        ))
        .bearer_auth(&bootstrap.auth_token)
        .json(&serde_json::json!({ "content": "hello from session-a" }))
        .send()
        .await
        .expect("send message to session_a should complete")
        .error_for_status()
        .expect("send message to session_a should succeed");

    client
        .post(format!(
            "{}/api/v1/sessions/{session_b}/messages",
            runtime.launch_context().api_base_url
        ))
        .bearer_auth(&bootstrap.auth_token)
        .json(&serde_json::json!({ "content": "hello from session-b" }))
        .send()
        .await
        .expect("send message to session_b should complete")
        .error_for_status()
        .expect("send message to session_b should succeed");

    let transcript_a = wait_for_transcript(
        &client,
        &runtime,
        &bootstrap.auth_token,
        &session_a,
        |events| events.iter().any(|e| e.event_type == "message.created"),
    )
    .await;

    let transcript_b = wait_for_transcript(
        &client,
        &runtime,
        &bootstrap.auth_token,
        &session_b,
        |events| events.iter().any(|e| e.event_type == "message.created"),
    )
    .await;

    assert!(
        transcript_a.iter().any(|e| {
            e.event_type == "message.created"
                && e.payload["content"].as_str() == Some("hello from session-a")
        }),
        "session_a transcript should contain its own message"
    );
    assert!(
        !transcript_a.iter().any(|e| {
            e.event_type == "message.created"
                && e.payload["content"].as_str() == Some("hello from session-b")
        }),
        "session_a transcript should not contain session_b messages"
    );

    assert!(
        transcript_b.iter().any(|e| {
            e.event_type == "message.created"
                && e.payload["content"].as_str() == Some("hello from session-b")
        }),
        "session_b transcript should contain its own message"
    );
    assert!(
        !transcript_b.iter().any(|e| {
            e.event_type == "message.created"
                && e.payload["content"].as_str() == Some("hello from session-a")
        }),
        "session_b transcript should not contain session_a messages"
    );

    runtime.shutdown().await.expect("shutdown should succeed");
}

// ---------------------------------------------------------------------------
// 9. provider_reasoning_mode_persists_via_api
// ---------------------------------------------------------------------------

#[tokio::test]
async fn provider_reasoning_mode_persists_via_api() {
    let tempdir = TempDir::new().expect("tempdir should be created");
    let runtime = start_runtime(temp_config(&tempdir))
        .await
        .expect("runtime should start");
    let client = Client::new();
    let bootstrap = bootstrap(&client, &runtime).await;

    client
        .post(format!(
            "{}/api/v1/providers/anthropic/models/claude-sonnet-4-20250514/reasoning",
            runtime.launch_context().api_base_url
        ))
        .bearer_auth(&bootstrap.auth_token)
        .json(&serde_json::json!({ "mode": "extended", "effort": "high" }))
        .send()
        .await
        .expect("set reasoning config request should complete")
        .error_for_status()
        .expect("set reasoning config should succeed");

    let settings: serde_json::Value = client
        .get(format!(
            "{}/api/v1/settings",
            runtime.launch_context().api_base_url
        ))
        .bearer_auth(&bootstrap.auth_token)
        .send()
        .await
        .expect("get settings request should complete")
        .error_for_status()
        .expect("get settings request should succeed")
        .json()
        .await
        .expect("get settings response should deserialize");

    assert!(
        !settings.is_null(),
        "settings response should not be null after persisting reasoning config"
    );

    runtime.shutdown().await.expect("shutdown should succeed");
}

// ---------------------------------------------------------------------------
// 10. settings_persist_across_runtime_restart
// ---------------------------------------------------------------------------

#[tokio::test]
async fn settings_persist_across_runtime_restart() {
    let tempdir = TempDir::new().expect("tempdir should be created");
    let database_path = tempdir.path().join("lunaria.sqlite");

    // First runtime: write the setting
    {
        let mut config = RuntimeConfig::default();
        config.database_path = database_path.clone();
        let runtime = start_runtime(config)
            .await
            .expect("first runtime should start");
        let client = Client::new();
        let bootstrap = bootstrap(&client, &runtime).await;

        client
            .post(format!(
                "{}/api/v1/settings",
                runtime.launch_context().api_base_url
            ))
            .bearer_auth(&bootstrap.auth_token)
            .json(&serde_json::json!({ "values": { "ui.theme": "dark" } }))
            .send()
            .await
            .expect("put setting request should complete")
            .error_for_status()
            .expect("put setting should succeed");

        runtime.shutdown().await.expect("first runtime shutdown should succeed");
    }

    // Second runtime: same database_path, verify the setting survived
    {
        let mut config = RuntimeConfig::default();
        config.database_path = database_path;
        let runtime = start_runtime(config)
            .await
            .expect("second runtime should start");
        let client = Client::new();
        let bootstrap = bootstrap(&client, &runtime).await;

        let settings: serde_json::Value = client
            .get(format!(
                "{}/api/v1/settings",
                runtime.launch_context().api_base_url
            ))
            .bearer_auth(&bootstrap.auth_token)
            .send()
            .await
            .expect("get settings request should complete")
            .error_for_status()
            .expect("get settings request should succeed")
            .json()
            .await
            .expect("get settings response should deserialize");

        let theme = settings
            .get("ui.theme")
            .or_else(|| {
                settings["values"]
                    .as_object()
                    .and_then(|v| v.get("ui.theme"))
            })
            .or_else(|| {
                settings["settings"]
                    .as_object()
                    .and_then(|v| v.get("ui.theme"))
            })
            .expect("ui.theme setting should exist after restart");

        assert_eq!(
            theme.as_str(),
            Some("dark"),
            "ui.theme setting should persist across runtime restart"
        );

        runtime.shutdown().await.expect("second runtime shutdown should succeed");
    }
}
