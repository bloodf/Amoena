use std::fs;

use lunaria_desktop::{start_runtime, BootstrapSession, EventEnvelope, RuntimeConfig, RuntimeHandle};
use reqwest::Client;
use tempfile::TempDir;
use tokio::time::{sleep, timeout, Duration};

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
async fn subagent_spawn_and_mailbox_flow_emit_runtime_events() {
    let tempdir = TempDir::new().expect("tempdir should be created");
    let runtime = start_runtime(temp_config(&tempdir))
        .await
        .expect("runtime should start");
    let client = Client::new();
    let bootstrap = bootstrap(&client, &runtime).await;

    let persona_path = tempdir.path().join("child-runtime-persona.md");
    fs::write(
        &persona_path,
        r#"---
name: "Runtime Child"
description: "Runtime child persona"
division: "qa"
tools: ["Read", "Agent"]
permissions: "read_only"
collaborationStyle: "critical"
communicationPreference: "structured"
decisionWeight: 0.8
---

Runtime child prompt.
"#,
    )
    .expect("persona file should be written");

    let session: serde_json::Value = client
        .post(format!("{}/api/v1/sessions", runtime.launch_context().api_base_url))
        .bearer_auth(&bootstrap.auth_token)
        .json(&serde_json::json!({
            "workingDir": tempdir.path().display().to_string(),
            "sessionMode": "native",
            "tuiType": "native"
        }))
        .send()
        .await
        .expect("create session should complete")
        .error_for_status()
        .expect("create session should succeed")
        .json()
        .await
        .expect("create session response should deserialize");
    let session_id = session["id"].as_str().expect("session id should exist").to_string();

    let agents: Vec<serde_json::Value> = rusqlite::Connection::open(tempdir.path().join("lunaria.sqlite"))
        .expect("sqlite should open")
        .prepare("SELECT id FROM agents WHERE session_id = ?1 ORDER BY rowid ASC")
        .expect("query should prepare")
        .query_map(rusqlite::params![session_id.clone()], |row| {
            Ok(serde_json::json!({ "id": row.get::<_, String>(0)? }))
        })
        .expect("query should execute")
        .collect::<Result<Vec<_>, _>>()
        .expect("query rows should collect");
    let parent_agent_id = agents[0]["id"].as_str().expect("primary agent should exist").to_string();

    client
        .post(format!(
            "{}/api/v1/sessions/{session_id}/agents",
            runtime.launch_context().api_base_url
        ))
        .bearer_auth(&bootstrap.auth_token)
        .json(&serde_json::json!({
            "parentAgentId": parent_agent_id,
            "personaId": "agent-orchestrator",
            "agentType": "reviewer",
            "model": "gpt-5-mini",
            "requestedTools": ["Read", "Bash"],
            "stepsLimit": 3
        }))
        .send()
        .await
        .expect("spawn subagent should complete")
        .error_for_status()
        .expect("spawn subagent should succeed");

    let team: serde_json::Value = client
        .post(format!("{}/api/v1/teams", runtime.launch_context().api_base_url))
        .bearer_auth(&bootstrap.auth_token)
        .json(&serde_json::json!({
            "name": "runtime-team",
            "divisionRequirements": { "engineering": 1, "qa": 1 }
        }))
        .send()
        .await
        .expect("create team should complete")
        .error_for_status()
        .expect("create team should succeed")
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
            "fromAgentId": parent_agent_id,
            "content": "blocking concern",
            "messageType": "message"
        }))
        .send()
        .await
        .expect("mailbox send should complete")
        .error_for_status()
        .expect("mailbox send should succeed");

    let transcript = wait_for_transcript(
        &client,
        &runtime,
        &bootstrap.auth_token,
        &session_id,
        |events| {
            let event_types = events.iter().map(|event| event.event_type.as_str()).collect::<Vec<_>>();
            event_types.contains(&"agent.spawned") && event_types.contains(&"agent.mailbox")
        },
    )
    .await;

    assert!(transcript.iter().any(|event| event.event_type == "agent.spawned"));
    assert!(transcript.iter().any(|event| event.event_type == "agent.mailbox"));

    let mailbox: serde_json::Value = client
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
        .expect("mailbox response should deserialize");
    assert_eq!(mailbox.as_array().expect("mailbox should be array").len(), 1);

    runtime.shutdown().await.expect("shutdown should succeed");
}
