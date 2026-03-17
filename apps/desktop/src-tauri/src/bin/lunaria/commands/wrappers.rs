use std::io::{self, BufRead, Write};

use anyhow::Result;
use clap::Subcommand;
use serde_json::json;
use tokio_stream::StreamExt;

use crate::client::LunariaClient;
use crate::output::{self, Table};

#[derive(Subcommand)]
pub enum WrappersCommand {
    /// List all wrapper adapters
    List,
    /// Health check wrapper adapters
    Health {
        /// Specific adapter (omit for all)
        adapter: Option<String>,
    },
    /// Run a one-shot prompt through a wrapper
    Run {
        /// Adapter name: claude-code, opencode, codex, gemini
        adapter: String,
        /// Prompt message
        message: String,
    },
    /// Compare all available wrappers with the same prompt
    Compare {
        /// Prompt message
        message: String,
    },
    /// Start an interactive chat session with a wrapper
    Chat {
        /// Adapter name: claude-code, opencode, codex, gemini
        adapter: String,
    },
}

pub async fn execute(client: &LunariaClient, cmd: WrappersCommand) -> Result<()> {
    match cmd {
        WrappersCommand::List => {
            let resp = client.get("/api/v1/wrappers/capabilities").await?;
            if client.json_output {
                output::print_json(&resp);
            } else if let Some(obj) = resp.as_object() {
                let mut table = Table::new(vec!["Adapter", "Transport", "Tools", "Persona Export"]);
                for (name, caps) in obj {
                    table.add_row(vec![
                        name.clone(),
                        output::json_str(caps, "transport").to_string(),
                        caps.get("supportsTools")
                            .and_then(|v| v.as_bool())
                            .map(|b| if b { "yes" } else { "no" })
                            .unwrap_or("-")
                            .to_string(),
                        caps.get("supportsPersonaExport")
                            .and_then(|v| v.as_bool())
                            .map(|b| if b { "yes" } else { "no" })
                            .unwrap_or("-")
                            .to_string(),
                    ]);
                }
                table.print();
            }
        }
        WrappersCommand::Health { adapter } => {
            let resp = client.get("/api/v1/wrappers/capabilities").await?;
            if let Some(obj) = resp.as_object() {
                let adapters: Vec<&String> = if let Some(ref name) = adapter {
                    obj.keys().filter(|k| k.as_str() == name.as_str()).collect()
                } else {
                    obj.keys().collect()
                };

                let mut table = Table::new(vec!["Adapter", "Status", "Transport"]);
                for name in adapters {
                    let caps = &obj[name];
                    table.add_row(vec![
                        name.clone(),
                        "discovered".to_string(),
                        output::json_str(caps, "transport").to_string(),
                    ]);
                }
                table.print();
            }
        }
        WrappersCommand::Run { adapter, message } => {
            run_oneshot(client, &adapter, &message).await?;
        }
        WrappersCommand::Compare { message } => {
            let caps = client.get("/api/v1/wrappers/capabilities").await?;
            let adapters: Vec<String> = caps
                .as_object()
                .map(|o| o.keys().cloned().collect())
                .unwrap_or_default();

            if adapters.is_empty() {
                output::print_warning("No wrapper adapters found");
                return Ok(());
            }

            println!("Running comparison across {} adapters...\n", adapters.len());
            for adapter in &adapters {
                println!("--- {} ---", adapter);
                if let Err(e) = run_oneshot(client, adapter, &message).await {
                    output::print_error(&format!("{adapter}: {e}"));
                }
                println!();
            }
        }
        WrappersCommand::Chat { adapter } => {
            interactive_chat(client, &adapter).await?;
        }
    }
    Ok(())
}

async fn run_oneshot(client: &LunariaClient, adapter: &str, message: &str) -> Result<()> {
    let working_dir = std::env::current_dir()
        .unwrap_or_default()
        .to_string_lossy()
        .to_string();

    let executable = match adapter {
        "claude-code" => "claude",
        "opencode" => "opencode",
        "codex" => "codex",
        "gemini" => "gemini",
        other => other,
    };
    let body = json!({
        "workingDir": working_dir,
        "sessionMode": "wrapper",
        "tuiType": adapter,
        "metadata": { "wrapper": { "executable": executable, "args": [], "env": {} } }
    });
    let session = client.post("/api/v1/sessions", &body).await?;
    let session_id = output::json_str(&session, "id").to_string();

    let msg_body = json!({ "content": message, "role": "user" });
    client
        .post(&format!("/api/v1/sessions/{session_id}/messages"), &msg_body)
        .await?;

    let resp = client
        .get_streaming(&format!("/api/v1/sessions/{session_id}/stream"))
        .await?;
    let mut stream = resp.bytes_stream();
    while let Some(chunk) = stream.next().await {
        match chunk {
            Ok(bytes) => {
                let text = String::from_utf8_lossy(&bytes);
                for line in text.lines() {
                    if let Some(data) = line.strip_prefix("data: ") {
                        if let Ok(event) = serde_json::from_str::<serde_json::Value>(data) {
                            let event_type = output::json_str(&event, "eventType");
                            if event_type == "message.delta" {
                                if let Some(text) = event
                                    .get("payload")
                                    .and_then(|p| p.get("text"))
                                    .and_then(|t| t.as_str())
                                {
                                    print!("{text}");
                                    let _ = io::stdout().flush();
                                }
                            } else if event_type == "message.complete" || event_type == "error" {
                                break;
                            }
                        }
                    }
                }
            }
            Err(_) => break,
        }
    }
    println!();

    let _ = client.delete(&format!("/api/v1/sessions/{session_id}")).await;
    Ok(())
}

async fn interactive_chat(client: &LunariaClient, adapter: &str) -> Result<()> {
    let working_dir = std::env::current_dir()
        .unwrap_or_default()
        .to_string_lossy()
        .to_string();

    let executable = match adapter {
        "claude-code" => "claude",
        "opencode" => "opencode",
        "codex" => "codex",
        "gemini" => "gemini",
        other => other,
    };
    let body = json!({
        "workingDir": working_dir,
        "sessionMode": "wrapper",
        "tuiType": adapter,
        "metadata": { "wrapper": { "executable": executable, "args": [], "env": {} } }
    });
    let session = client.post("/api/v1/sessions", &body).await?;
    let session_id = output::json_str(&session, "id").to_string();

    output::print_success(&format!("Chat session started with {adapter} (type 'exit' to quit)"));

    let stdin = io::stdin();
    loop {
        print!("\n> ");
        let _ = io::stdout().flush();

        let mut input = String::new();
        if stdin.lock().read_line(&mut input).is_err() || input.trim().is_empty() {
            continue;
        }
        let input = input.trim();
        if input == "exit" || input == "quit" {
            break;
        }

        let msg_body = json!({ "content": input, "role": "user" });
        if let Err(e) = client
            .post(&format!("/api/v1/sessions/{session_id}/messages"), &msg_body)
            .await
        {
            output::print_error(&format!("{e}"));
            continue;
        }

        let resp = client
            .get_streaming(&format!("/api/v1/sessions/{session_id}/stream"))
            .await?;
        let mut stream = resp.bytes_stream();
        while let Some(chunk) = stream.next().await {
            match chunk {
                Ok(bytes) => {
                    let text = String::from_utf8_lossy(&bytes);
                    for line in text.lines() {
                        if let Some(data) = line.strip_prefix("data: ") {
                            if let Ok(event) = serde_json::from_str::<serde_json::Value>(data) {
                                let event_type = output::json_str(&event, "eventType");
                                if event_type == "message.delta" {
                                    if let Some(text) = event
                                        .get("payload")
                                        .and_then(|p| p.get("text"))
                                        .and_then(|t| t.as_str())
                                    {
                                        print!("{text}");
                                        let _ = io::stdout().flush();
                                    }
                                } else if event_type == "message.complete" || event_type == "error"
                                {
                                    break;
                                }
                            }
                        }
                    }
                }
                Err(_) => break,
            }
        }
        println!();
    }

    let _ = client.delete(&format!("/api/v1/sessions/{session_id}")).await;
    output::print_success("Chat session ended");
    Ok(())
}
