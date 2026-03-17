use anyhow::Result;
use clap::Subcommand;
use serde_json::json;

use crate::client::LunariaClient;
use crate::output::{self, Table};

#[derive(Subcommand)]
pub enum MemoryCommand {
    /// Search memory observations
    Search {
        /// Search query
        query: String,
    },
    /// Create a memory observation
    Observe {
        /// Observation title
        #[arg(long)]
        title: String,
        /// Observation type
        #[arg(long, default_value = "pattern")]
        r#type: String,
        /// Category
        #[arg(long, default_value = "skill")]
        category: String,
        /// Content
        #[arg(long)]
        content: String,
    },
}

pub async fn execute(client: &LunariaClient, cmd: MemoryCommand) -> Result<()> {
    match cmd {
        MemoryCommand::Search { query } => {
            let encoded = query
                .replace('%', "%25")
                .replace(' ', "%20")
                .replace('&', "%26");
            let resp = client
                .get(&format!("/api/v1/memory/search?query={encoded}"))
                .await?;
            if client.json_output {
                output::print_json(&resp);
            } else {
                let results = resp.as_array().map(|a| a.as_slice()).unwrap_or(&[]);
                let mut table = Table::new(vec!["ID", "Title", "Type", "Score"]);
                for r in results {
                    table.add_row(vec![
                        output::json_str_truncated(r, "id", 12),
                        output::json_str_truncated(r, "title", 40),
                        output::json_str(r, "type").to_string(),
                        r.get("score")
                            .and_then(|v| v.as_f64())
                            .map(|s| format!("{s:.2}"))
                            .unwrap_or_else(|| "-".to_string()),
                    ]);
                }
                table.print();
            }
        }
        MemoryCommand::Observe { title, r#type, category, content } => {
            let body = json!({
                "sessionId": "cli",
                "title": title,
                "narrative": content,
                "category": category,
            });
            let resp = client.post("/api/v1/memory/observe", &body).await?;
            if client.json_output {
                output::print_json(&resp);
            } else {
                output::print_success("Observation recorded");
            }
        }
    }
    Ok(())
}
