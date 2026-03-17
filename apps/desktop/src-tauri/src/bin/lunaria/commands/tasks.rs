use anyhow::Result;
use clap::Subcommand;
use serde_json::json;

use crate::client::LunariaClient;
use crate::output::{self, Table};

#[derive(Subcommand)]
pub enum TasksCommand {
    /// List all tasks (optionally filtered by session)
    List {
        /// Filter by session ID
        #[arg(long)]
        session: Option<String>,
    },
    /// Create a task in a session
    Create {
        /// Session ID
        session_id: String,
        /// Task title
        #[arg(long)]
        title: String,
        /// Task priority (1-5)
        #[arg(long, default_value = "3")]
        priority: i32,
    },
    /// Update a task
    Update {
        /// Session ID
        session_id: String,
        /// Task ID
        task_id: String,
        /// New status
        #[arg(long)]
        status: Option<String>,
        /// New title
        #[arg(long)]
        title: Option<String>,
    },
    /// Delete a task
    Delete {
        /// Session ID
        session_id: String,
        /// Task ID
        task_id: String,
    },
    /// Reorder tasks
    Reorder {
        /// Session ID
        session_id: String,
        /// Ordered task IDs
        ids: Vec<String>,
    },
}

pub async fn execute(client: &LunariaClient, cmd: TasksCommand) -> Result<()> {
    match cmd {
        TasksCommand::List { session } => {
            let resp = if let Some(sid) = session {
                client.get(&format!("/api/v1/sessions/{sid}/tasks")).await?
            } else {
                client.get("/api/v1/tasks").await?
            };
            if client.json_output {
                output::print_json(&resp);
            } else {
                let tasks = resp.as_array().map(|a| a.as_slice()).unwrap_or(&[]);
                let mut table = Table::new(vec!["ID", "Title", "Status", "Priority", "Session"]);
                for t in tasks {
                    table.add_row(vec![
                        output::json_str_truncated(t, "id", 12),
                        output::json_str_truncated(t, "title", 40),
                        output::json_str(t, "status").to_string(),
                        output::json_i64(t, "priority"),
                        output::json_str_truncated(t, "sessionId", 12),
                    ]);
                }
                table.print();
            }
        }
        TasksCommand::Create { session_id, title, priority } => {
            let body = json!({ "title": title, "priority": priority });
            let resp = client
                .post(&format!("/api/v1/sessions/{session_id}/tasks"), &body)
                .await?;
            if client.json_output {
                output::print_json(&resp);
            } else {
                let id = output::json_str(&resp, "id");
                output::print_success(&format!("Task created: {id}"));
            }
        }
        TasksCommand::Update { session_id, task_id, status, title } => {
            let mut body = json!({});
            if let Some(s) = status {
                body["status"] = json!(s);
            }
            if let Some(t) = title {
                body["title"] = json!(t);
            }
            client
                .put(&format!("/api/v1/sessions/{session_id}/tasks/{task_id}"), &body)
                .await?;
            output::print_success("Task updated");
        }
        TasksCommand::Delete { session_id, task_id } => {
            client.delete(&format!("/api/v1/sessions/{session_id}/tasks/{task_id}")).await?;
            output::print_success("Task deleted");
        }
        TasksCommand::Reorder { session_id, ids } => {
            client
                .post(
                    &format!("/api/v1/sessions/{session_id}/tasks/reorder"),
                    &json!({ "ids": ids }),
                )
                .await?;
            output::print_success("Tasks reordered");
        }
    }
    Ok(())
}
