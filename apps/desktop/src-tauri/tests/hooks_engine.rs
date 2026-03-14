use std::{fs, sync::Arc};

use axum::{routing::post, Router};
use lunaria_desktop::{
    hooks::{HookEngine, HookEvent},
    persistence::{Database, HookHandlerType, HookRecord},
};
use tempfile::TempDir;
use tokio::net::TcpListener;

fn setup() -> (TempDir, Arc<Database>, HookEngine) {
    let tempdir = TempDir::new().expect("tempdir should be created");
    let database = Arc::new(
        Database::open(tempdir.path().join("lunaria.sqlite"))
            .expect("database should be created"),
    );
    let engine = HookEngine::new(database.clone());
    (tempdir, database, engine)
}

#[tokio::test]
async fn hooks_run_in_priority_order() {
    let (_tempdir, _database, engine) = setup();
    engine
        .register(HookRecord {
            id: "hook-2".to_string(),
            event_name: HookEvent::UserPromptSubmit.as_str().to_string(),
            handler_type: HookHandlerType::Prompt,
            handler_config: serde_json::json!({ "text": "second" }),
            matcher_regex: None,
            enabled: true,
            priority: 20,
            timeout_ms: 1000,
        })
        .expect("second hook should register");
    engine
        .register(HookRecord {
            id: "hook-1".to_string(),
            event_name: HookEvent::UserPromptSubmit.as_str().to_string(),
            handler_type: HookHandlerType::Prompt,
            handler_config: serde_json::json!({ "text": "first" }),
            matcher_regex: None,
            enabled: true,
            priority: 10,
            timeout_ms: 1000,
        })
        .expect("first hook should register");

    let results = engine
        .fire(HookEvent::UserPromptSubmit, serde_json::json!({ "content": "hello" }))
        .await
        .expect("hooks should execute");

    assert_eq!(results[0].output.as_deref(), Some("first"));
    assert_eq!(results[1].output.as_deref(), Some("second"));
}

#[test]
fn imported_claude_and_opencode_hooks_normalize_to_canonical_events() {
    let (tempdir, _database, engine) = setup();
    let claude_path = tempdir.path().join("hooks.json");
    fs::write(
        &claude_path,
        r#"[{"event":"pre_tool_use","command":"echo claude"}]"#,
    )
    .expect("claude hooks file should write");
    let opencode_path = tempdir.path().join("opencode.json");
    fs::write(
        &opencode_path,
        r#"{"hooks":[{"event":"session_start","command":"echo opencode"}]}"#,
    )
    .expect("opencode config file should write");

    let claude = engine
        .import_claude_hooks(&claude_path)
        .expect("claude hooks should import");
    let opencode = engine
        .import_opencode_hooks(&opencode_path)
        .expect("opencode hooks should import");

    assert_eq!(claude[0].event_name, HookEvent::PreToolUse.as_str());
    assert_eq!(opencode[0].event_name, HookEvent::SessionStart.as_str());
}

#[tokio::test]
async fn hook_failures_and_timeouts_do_not_crash_execution() {
    let (_tempdir, _database, engine) = setup();
    engine
        .register(HookRecord {
            id: "hook-timeout".to_string(),
            event_name: HookEvent::UserPromptSubmit.as_str().to_string(),
            handler_type: HookHandlerType::Command,
            handler_config: serde_json::json!({ "command": "sleep 1" }),
            matcher_regex: None,
            enabled: true,
            priority: 10,
            timeout_ms: 10,
        })
        .expect("timeout hook should register");
    engine
        .register(HookRecord {
            id: "hook-error".to_string(),
            event_name: HookEvent::UserPromptSubmit.as_str().to_string(),
            handler_type: HookHandlerType::Command,
            handler_config: serde_json::json!({ "command": "exit 1" }),
            matcher_regex: None,
            enabled: true,
            priority: 20,
            timeout_ms: 1000,
        })
        .expect("error hook should register");

    let results = engine
        .fire(HookEvent::UserPromptSubmit, serde_json::json!({ "content": "hello" }))
        .await
        .expect("hook execution should continue despite failures");

    assert_eq!(results.len(), 2);
    assert!(results.iter().all(|result| result.status == "failed"));
}

#[tokio::test]
async fn http_hooks_execute_without_blocking_other_handlers() {
    let (_tempdir, _database, engine) = setup();
    let listener = TcpListener::bind("127.0.0.1:0")
        .await
        .expect("listener should bind");
    let addr = listener.local_addr().expect("listener should expose addr");
    tokio::spawn(async move {
        axum::serve(
            listener,
            Router::new().route(
                "/hook",
                post(|| async { axum::http::StatusCode::NO_CONTENT }),
            ),
        )
        .await
        .expect("http hook test server should run");
    });

    engine
        .register(HookRecord {
            id: "hook-http".to_string(),
            event_name: HookEvent::UserPromptSubmit.as_str().to_string(),
            handler_type: HookHandlerType::Http,
            handler_config: serde_json::json!({ "url": format!("http://{addr}/hook") }),
            matcher_regex: None,
            enabled: true,
            priority: 10,
            timeout_ms: 1000,
        })
        .expect("http hook should register");
    engine
        .register(HookRecord {
            id: "hook-prompt".to_string(),
            event_name: HookEvent::UserPromptSubmit.as_str().to_string(),
            handler_type: HookHandlerType::Prompt,
            handler_config: serde_json::json!({ "text": "prompt ok" }),
            matcher_regex: None,
            enabled: true,
            priority: 20,
            timeout_ms: 1000,
        })
        .expect("prompt hook should register");

    let results = engine
        .fire(HookEvent::UserPromptSubmit, serde_json::json!({ "content": "hello" }))
        .await
        .expect("hook execution should succeed");

    assert_eq!(results[0].status, "ok");
    assert_eq!(results[1].output.as_deref(), Some("prompt ok"));
}
