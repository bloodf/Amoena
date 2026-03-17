use anyhow::Result;
use clap::Subcommand;

use crate::client::LunariaClient;
use crate::output::{self, Table};

#[derive(Subcommand)]
pub enum AgentsCommand {
    /// List all agents across sessions
    List,
}

pub async fn execute(client: &LunariaClient, cmd: AgentsCommand) -> Result<()> {
    match cmd {
        AgentsCommand::List => {
            let resp = client.get("/api/v1/agents").await?;
            if client.json_output {
                output::print_json(&resp);
            } else {
                let agents = resp.as_array().map(|a| a.as_slice()).unwrap_or(&[]);
                let mut table = Table::new(vec!["ID", "Session", "Type", "Mode", "Model", "Status"]);
                for a in agents {
                    table.add_row(vec![
                        output::json_str_truncated(a, "id", 12),
                        output::json_str_truncated(a, "sessionId", 12),
                        output::json_str(a, "agentType").to_string(),
                        output::json_str(a, "mode").to_string(),
                        output::json_str(a, "model").to_string(),
                        output::json_str(a, "status").to_string(),
                    ]);
                }
                table.print();
            }
        }
    }
    Ok(())
}
