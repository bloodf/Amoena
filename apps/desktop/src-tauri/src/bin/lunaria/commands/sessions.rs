use anyhow::Result;
use clap::Subcommand;
use serde_json::json;
use tokio_stream::StreamExt;

use crate::client::LunariaClient;
use crate::output::{self, Table};

#[derive(Subcommand)]
pub enum SessionsCommand {
    /// List all sessions
    List,
    /// Create a new session
    Create {
        /// Session mode: native or wrapper
        #[arg(long, default_value = "wrapper")]
        mode: String,
        /// TUI type: claude-code, opencode, codex, gemini
        #[arg(long, default_value = "claude-code")]
        tui: String,
        /// Working directory
        #[arg(long, default_value = ".")]
        dir: String,
        /// Provider name
        #[arg(long, default_value = "claude")]
        provider: String,
        /// Model name
        #[arg(long, default_value = "Claude 4 Sonnet")]
        model: String,
    },
    /// Delete a session
    Delete {
        /// Session ID
        id: String,
    },
    /// List child sessions
    Children {
        /// Session ID
        id: String,
    },
    /// Show session tree
    Tree {
        /// Session ID
        id: String,
    },
    /// Toggle autopilot
    Autopilot {
        /// Session ID
        id: String,
        /// Enable autopilot
        #[arg(long)]
        enable: bool,
        /// Disable autopilot
        #[arg(long)]
        disable: bool,
    },
    /// List session messages
    Messages {
        /// Session ID
        id: String,
    },
    /// Send a message to a session
    Send {
        /// Session ID
        id: String,
        /// Message content
        content: String,
    },
    /// List session agents
    Agents {
        /// Session ID
        id: String,
    },
    /// Spawn a sub-agent
    SpawnAgent {
        /// Session ID
        id: String,
        /// Agent type
        #[arg(long, default_value = "coder")]
        r#type: String,
        /// Model name
        #[arg(long, default_value = "Claude 4 Sonnet")]
        model: String,
    },
    /// Interrupt a running session
    Interrupt {
        /// Session ID
        id: String,
    },
    /// Resolve a permission request
    Permission {
        /// Session ID
        id: String,
        /// Tool name
        tool: String,
        /// Allow the permission
        #[arg(long)]
        allow: bool,
        /// Deny the permission
        #[arg(long)]
        deny: bool,
    },
    /// Stream session events (SSE)
    Stream {
        /// Session ID
        id: String,
    },
    /// Get session transcript
    Transcript {
        /// Session ID
        id: String,
    },
    /// Get session memory
    Memory {
        /// Session ID
        id: String,
    },
}

pub async fn execute(client: &LunariaClient, cmd: SessionsCommand) -> Result<()> {
    match cmd {
        SessionsCommand::List => {
            let resp = client.get("/api/v1/sessions").await?;
            if client.json_output {
                output::print_json(&resp);
            } else {
                let sessions = resp.as_array().map(|a| a.as_slice()).unwrap_or(&[]);
                let mut table = Table::new(vec!["ID", "Working Dir", "Mode", "Status", "TUI", "Updated"]);
                for s in sessions {
                    table.add_row(vec![
                        output::json_str_truncated(s, "id", 12),
                        output::json_str_truncated(s, "workingDirectory", 30),
                        output::json_str(s, "sessionType").to_string(),
                        output::json_str(s, "status").to_string(),
                        output::json_str(s, "tuiType").to_string(),
                        output::json_str_truncated(s, "updatedAt", 19),
                    ]);
                }
                table.print();
            }
        }
        SessionsCommand::Create { mode, tui, dir, provider, model } => {
            let working_dir = std::fs::canonicalize(&dir)
                .unwrap_or_else(|_| std::path::PathBuf::from(&dir))
                .to_string_lossy()
                .to_string();
            let body = json!({
                "workingDir": working_dir,
                "sessionMode": mode,
                "tuiType": tui,
                "providerId": provider,
                "modelId": model,
            });
            let resp = client.post("/api/v1/sessions", &body).await?;
            if client.json_output {
                output::print_json(&resp);
            } else {
                let id = output::json_str(&resp, "id");
                output::print_success(&format!("Session created: {id}"));
            }
        }
        SessionsCommand::Delete { id } => {
            client.delete(&format!("/api/v1/sessions/{id}")).await?;
            output::print_success(&format!("Session {id} deleted"));
        }
        SessionsCommand::Children { id } => {
            let resp = client.get(&format!("/api/v1/sessions/{id}/children")).await?;
            if client.json_output {
                output::print_json(&resp);
            } else {
                let children = resp.as_array().map(|a| a.as_slice()).unwrap_or(&[]);
                let mut table = Table::new(vec!["ID", "Status", "Type"]);
                for c in children {
                    table.add_row(vec![
                        output::json_str_truncated(c, "id", 12),
                        output::json_str(c, "status").to_string(),
                        output::json_str(c, "sessionType").to_string(),
                    ]);
                }
                table.print();
            }
        }
        SessionsCommand::Tree { id } => {
            let resp = client.get(&format!("/api/v1/sessions/{id}/tree")).await?;
            output::print_json(&resp);
        }
        SessionsCommand::Autopilot { id, enable, disable } => {
            let enabled = if disable { false } else { enable || true };
            let body = json!({ "enabled": enabled });
            client.post(&format!("/api/v1/sessions/{id}/autopilot"), &body).await?;
            output::print_success(&format!("Autopilot {}", if enabled { "enabled" } else { "disabled" }));
        }
        SessionsCommand::Messages { id } => {
            let resp = client.get(&format!("/api/v1/sessions/{id}/messages")).await?;
            if client.json_output {
                output::print_json(&resp);
            } else {
                let messages = resp.as_array().map(|a| a.as_slice()).unwrap_or(&[]);
                let mut table = Table::new(vec!["Role", "Content", "Timestamp"]);
                for m in messages {
                    table.add_row(vec![
                        output::json_str(m, "role").to_string(),
                        output::json_str_truncated(m, "content", 60),
                        output::json_str_truncated(m, "createdAt", 19),
                    ]);
                }
                table.print();
            }
        }
        SessionsCommand::Send { id, content } => {
            let body = json!({ "content": content, "role": "user" });
            let resp = client.post(&format!("/api/v1/sessions/{id}/messages"), &body).await?;
            if client.json_output {
                output::print_json(&resp);
            } else {
                output::print_success("Message sent");
            }
        }
        SessionsCommand::Agents { id } => {
            let resp = client.get(&format!("/api/v1/sessions/{id}/agents/list")).await?;
            if client.json_output {
                output::print_json(&resp);
            } else {
                let agents = resp.as_array().map(|a| a.as_slice()).unwrap_or(&[]);
                let mut table = Table::new(vec!["ID", "Type", "Model", "Status"]);
                for a in agents {
                    table.add_row(vec![
                        output::json_str_truncated(a, "id", 12),
                        output::json_str(a, "agentType").to_string(),
                        output::json_str(a, "model").to_string(),
                        output::json_str(a, "status").to_string(),
                    ]);
                }
                table.print();
            }
        }
        SessionsCommand::SpawnAgent { id, r#type, model } => {
            let body = json!({ "agentType": r#type, "model": model });
            let resp = client.post(&format!("/api/v1/sessions/{id}/agents"), &body).await?;
            if client.json_output {
                output::print_json(&resp);
            } else {
                let agent_id = output::json_str(&resp, "id");
                output::print_success(&format!("Agent spawned: {agent_id}"));
            }
        }
        SessionsCommand::Interrupt { id } => {
            client.post(&format!("/api/v1/sessions/{id}/interrupt"), &json!({})).await?;
            output::print_success("Session interrupted");
        }
        SessionsCommand::Permission { id, tool, allow, deny } => {
            let decision = if deny { "deny" } else if allow { "allow" } else { "allow" };
            let body = json!({ "tool": tool, "decision": decision });
            client.post(&format!("/api/v1/sessions/{id}/permissions"), &body).await?;
            output::print_success(&format!("Permission {decision}ed for {tool}"));
        }
        SessionsCommand::Stream { id } => {
            let resp = client.get_streaming(&format!("/api/v1/sessions/{id}/stream")).await?;
            let mut stream = resp.bytes_stream();
            while let Some(chunk) = stream.next().await {
                match chunk {
                    Ok(bytes) => print!("{}", String::from_utf8_lossy(&bytes)),
                    Err(e) => {
                        output::print_error(&format!("Stream error: {e}"));
                        break;
                    }
                }
            }
        }
        SessionsCommand::Transcript { id } => {
            let resp = client.get(&format!("/api/v1/sessions/{id}/transcript")).await?;
            output::print_json(&resp);
        }
        SessionsCommand::Memory { id } => {
            let resp = client.get(&format!("/api/v1/sessions/{id}/memory")).await?;
            output::print_json(&resp);
        }
    }
    Ok(())
}
