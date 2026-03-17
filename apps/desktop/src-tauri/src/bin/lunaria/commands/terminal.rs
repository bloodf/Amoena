use anyhow::Result;
use clap::Subcommand;
use serde_json::json;

use crate::client::LunariaClient;
use crate::output;

#[derive(Subcommand)]
pub enum TerminalCommand {
    /// Create a terminal session
    Create {
        /// Working directory
        #[arg(long)]
        cwd: Option<String>,
        /// Columns
        #[arg(long, default_value = "80")]
        cols: u32,
        /// Rows
        #[arg(long, default_value = "24")]
        rows: u32,
    },
    /// Send input to a terminal
    Input {
        /// Terminal session ID
        id: String,
        /// Input data
        data: String,
    },
    /// Resize a terminal
    Resize {
        /// Terminal session ID
        id: String,
        /// Columns
        #[arg(long, default_value = "120")]
        cols: u32,
        /// Rows
        #[arg(long, default_value = "40")]
        rows: u32,
    },
    /// Get terminal events/output
    Events {
        /// Terminal session ID
        id: String,
    },
    /// Close a terminal session
    Close {
        /// Terminal session ID
        id: String,
    },
}

pub async fn execute(client: &LunariaClient, cmd: TerminalCommand) -> Result<()> {
    match cmd {
        TerminalCommand::Create { cwd, cols, rows } => {
            let body = json!({
                "cwd": cwd.unwrap_or_else(|| ".".to_string()),
                "cols": cols,
                "rows": rows,
            });
            let resp = client.post("/api/v1/terminal/sessions", &body).await?;
            if client.json_output {
                output::print_json(&resp);
            } else {
                let id = output::json_str(&resp, "terminalSessionId");
                output::print_success(&format!("Terminal session created: {id}"));
            }
        }
        TerminalCommand::Input { id, data } => {
            client
                .post(
                    &format!("/api/v1/terminal/sessions/{id}/input"),
                    &json!({ "data": data }),
                )
                .await?;
            output::print_success("Input sent");
        }
        TerminalCommand::Resize { id, cols, rows } => {
            client
                .post(
                    &format!("/api/v1/terminal/sessions/{id}/resize"),
                    &json!({ "cols": cols, "rows": rows }),
                )
                .await?;
            output::print_success(&format!("Resized to {cols}x{rows}"));
        }
        TerminalCommand::Events { id } => {
            let resp = client
                .get(&format!("/api/v1/terminal/sessions/{id}/events"))
                .await?;
            output::print_json(&resp);
        }
        TerminalCommand::Close { id } => {
            client.delete(&format!("/api/v1/terminal/sessions/{id}")).await?;
            output::print_success(&format!("Terminal session {id} closed"));
        }
    }
    Ok(())
}
