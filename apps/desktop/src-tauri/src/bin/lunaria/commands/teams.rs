use anyhow::Result;
use clap::Subcommand;
use serde_json::json;

use crate::client::LunariaClient;
use crate::output::{self, Table};

#[derive(Subcommand)]
pub enum TeamsCommand {
    /// Create a new team
    Create {
        /// Team name
        #[arg(long)]
        name: String,
    },
    /// List team mailbox messages
    Mailbox {
        /// Team ID
        team_id: String,
    },
    /// Send a message to a team mailbox
    Send {
        /// Team ID
        team_id: String,
        /// Sender agent ID
        #[arg(long)]
        from: String,
        /// Message content
        #[arg(long)]
        content: String,
    },
}

pub async fn execute(client: &LunariaClient, cmd: TeamsCommand) -> Result<()> {
    match cmd {
        TeamsCommand::Create { name } => {
            let body = json!({
                "name": name,
                "divisionRequirements": {},
            });
            let resp = client.post("/api/v1/teams", &body).await?;
            if client.json_output {
                output::print_json(&resp);
            } else {
                let id = output::json_str(&resp, "id");
                output::print_success(&format!("Team created: {id}"));
            }
        }
        TeamsCommand::Mailbox { team_id } => {
            let resp = client.get(&format!("/api/v1/teams/{team_id}/mailbox")).await?;
            if client.json_output {
                output::print_json(&resp);
            } else {
                let messages = resp.as_array().map(|a| a.as_slice()).unwrap_or(&[]);
                let mut table = Table::new(vec!["ID", "From", "Content", "Timestamp"]);
                for m in messages {
                    table.add_row(vec![
                        output::json_str_truncated(m, "id", 12),
                        output::json_str_truncated(m, "fromAgentId", 12),
                        output::json_str_truncated(m, "content", 40),
                        output::json_str_truncated(m, "createdAt", 19),
                    ]);
                }
                table.print();
            }
        }
        TeamsCommand::Send { team_id, from, content } => {
            let body = json!({
                "sessionId": "cli",
                "fromAgentId": from,
                "content": content,
            });
            client
                .post(&format!("/api/v1/teams/{team_id}/mailbox"), &body)
                .await?;
            output::print_success("Message sent to team mailbox");
        }
    }
    Ok(())
}
