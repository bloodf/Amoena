use anyhow::Result;
use clap::Subcommand;
use serde_json::json;

use crate::client::LunariaClient;
use crate::output::{self, Table};

#[derive(Subcommand)]
pub enum QueueCommand {
    /// List queued messages
    List {
        /// Session ID
        session_id: String,
    },
    /// Add a message to the queue
    Add {
        /// Session ID
        session_id: String,
        /// Message content
        content: String,
    },
    /// Edit a queued message
    Edit {
        /// Session ID
        session_id: String,
        /// Message ID
        msg_id: String,
        /// New content
        content: String,
    },
    /// Delete a queued message
    Delete {
        /// Session ID
        session_id: String,
        /// Message ID
        msg_id: String,
    },
    /// Reorder queued messages
    Reorder {
        /// Session ID
        session_id: String,
        /// Ordered message IDs
        ids: Vec<String>,
    },
    /// Flush all queued messages
    Flush {
        /// Session ID
        session_id: String,
    },
}

pub async fn execute(client: &LunariaClient, cmd: QueueCommand) -> Result<()> {
    match cmd {
        QueueCommand::List { session_id } => {
            let resp = client.get(&format!("/api/v1/sessions/{session_id}/queue")).await?;
            if client.json_output {
                output::print_json(&resp);
            } else {
                let items = resp.as_array().map(|a| a.as_slice()).unwrap_or(&[]);
                let mut table = Table::new(vec!["ID", "Content", "Created"]);
                for item in items {
                    table.add_row(vec![
                        output::json_str_truncated(item, "id", 12),
                        output::json_str_truncated(item, "content", 50),
                        output::json_str_truncated(item, "createdAt", 19),
                    ]);
                }
                table.print();
            }
        }
        QueueCommand::Add { session_id, content } => {
            let resp = client
                .post(
                    &format!("/api/v1/sessions/{session_id}/queue"),
                    &json!({ "content": content }),
                )
                .await?;
            if client.json_output {
                output::print_json(&resp);
            } else {
                output::print_success("Message queued");
            }
        }
        QueueCommand::Edit { session_id, msg_id, content } => {
            client
                .put(
                    &format!("/api/v1/sessions/{session_id}/queue/{msg_id}"),
                    &json!({ "content": content }),
                )
                .await?;
            output::print_success("Queue message updated");
        }
        QueueCommand::Delete { session_id, msg_id } => {
            client.delete(&format!("/api/v1/sessions/{session_id}/queue/{msg_id}")).await?;
            output::print_success("Queue message deleted");
        }
        QueueCommand::Reorder { session_id, ids } => {
            client
                .post(
                    &format!("/api/v1/sessions/{session_id}/queue/reorder"),
                    &json!({ "ids": ids }),
                )
                .await?;
            output::print_success("Queue reordered");
        }
        QueueCommand::Flush { session_id } => {
            client
                .post(&format!("/api/v1/sessions/{session_id}/queue/flush"), &json!({}))
                .await?;
            output::print_success("Queue flushed");
        }
    }
    Ok(())
}
