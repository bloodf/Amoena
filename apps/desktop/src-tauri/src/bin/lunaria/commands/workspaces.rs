use anyhow::Result;
use clap::Subcommand;
use serde_json::json;

use crate::client::LunariaClient;
use crate::output::{self, Table};

#[derive(Subcommand)]
pub enum WorkspacesCommand {
    /// List all workspaces
    List,
    /// Create a new workspace
    Create {
        /// Project directory
        #[arg(long, default_value = ".")]
        project: String,
        /// Agent name
        #[arg(long, default_value = "main")]
        agent: String,
        /// Clone type: worktree, copy, or none
        #[arg(long, default_value = "worktree")]
        clone_type: String,
    },
    /// Inspect a workspace
    Inspect {
        /// Workspace ID
        id: String,
    },
    /// Delete a workspace
    Delete {
        /// Workspace ID
        id: String,
    },
    /// Archive a workspace
    Archive {
        /// Workspace ID
        id: String,
    },
    /// Create a workspace review
    Review {
        /// Workspace ID
        id: String,
    },
}

pub async fn execute(client: &LunariaClient, cmd: WorkspacesCommand) -> Result<()> {
    match cmd {
        WorkspacesCommand::List => {
            let resp = client.get("/api/v1/workspaces").await?;
            if client.json_output {
                output::print_json(&resp);
            } else {
                let items = resp.as_array().map(|a| a.as_slice()).unwrap_or(&[]);
                let mut table = Table::new(vec!["ID", "Name", "Status", "Path", "Created"]);
                for w in items {
                    table.add_row(vec![
                        output::json_str_truncated(w, "id", 12),
                        output::json_str_truncated(w, "name", 20),
                        output::json_str(w, "status").to_string(),
                        output::json_str_truncated(w, "path", 30),
                        output::json_str_truncated(w, "createdAt", 19),
                    ]);
                }
                table.print();
            }
        }
        WorkspacesCommand::Create { project, agent, clone_type } => {
            let project_path = std::fs::canonicalize(&project)
                .unwrap_or_else(|_| std::path::PathBuf::from(&project))
                .to_string_lossy()
                .to_string();
            let body = json!({
                "projectPath": project_path,
                "personaName": agent,
            });
            let resp = client.post("/api/v1/workspaces", &body).await?;
            if client.json_output {
                output::print_json(&resp);
            } else {
                let id = output::json_str(&resp, "id");
                output::print_success(&format!("Workspace created: {id}"));
            }
        }
        WorkspacesCommand::Inspect { id } => {
            let resp = client.get(&format!("/api/v1/workspaces/{id}")).await?;
            output::print_json(&resp);
        }
        WorkspacesCommand::Delete { id } => {
            client.delete(&format!("/api/v1/workspaces/{id}")).await?;
            output::print_success(&format!("Workspace {id} deleted"));
        }
        WorkspacesCommand::Archive { id } => {
            client.post(&format!("/api/v1/workspaces/{id}/archive"), &json!({})).await?;
            output::print_success(&format!("Workspace {id} archived"));
        }
        WorkspacesCommand::Review { id } => {
            let resp = client.post(&format!("/api/v1/workspaces/{id}/reviews"), &json!({})).await?;
            if client.json_output {
                output::print_json(&resp);
            } else {
                output::print_success("Review created");
                output::print_json(&resp);
            }
        }
    }
    Ok(())
}
