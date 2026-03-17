use anyhow::Result;
use clap::Subcommand;
use serde_json::json;

use crate::client::LunariaClient;
use crate::output::{self, Table};

#[derive(Subcommand)]
pub enum UsageCommand {
    /// List usage records
    List {
        /// From date (YYYY-MM-DD)
        #[arg(long)]
        from: Option<String>,
        /// To date (YYYY-MM-DD)
        #[arg(long)]
        to: Option<String>,
    },
    /// List daily usage aggregates
    Daily {
        /// From date (YYYY-MM-DD)
        #[arg(long)]
        from: Option<String>,
        /// To date (YYYY-MM-DD)
        #[arg(long)]
        to: Option<String>,
    },
    /// Get usage summary
    Summary,
    /// Refresh usage data
    Refresh,
}

pub async fn execute(client: &LunariaClient, cmd: UsageCommand) -> Result<()> {
    match cmd {
        UsageCommand::List { from, to } => {
            let mut query = Vec::new();
            if let Some(f) = from {
                query.push(format!("from={f}"));
            }
            if let Some(t) = to {
                query.push(format!("to={t}"));
            }
            let qs = if query.is_empty() {
                String::new()
            } else {
                format!("?{}", query.join("&"))
            };
            let resp = client.get(&format!("/api/v1/usage{qs}")).await?;
            if client.json_output {
                output::print_json(&resp);
            } else {
                let records = resp.as_array().map(|a| a.as_slice()).unwrap_or(&[]);
                let mut table = Table::new(vec!["Provider", "Model", "Input Tokens", "Output Tokens", "Date"]);
                for r in records {
                    table.add_row(vec![
                        output::json_str(r, "provider").to_string(),
                        output::json_str(r, "model").to_string(),
                        output::json_i64(r, "inputTokens"),
                        output::json_i64(r, "outputTokens"),
                        output::json_str_truncated(r, "createdAt", 19),
                    ]);
                }
                table.print();
            }
        }
        UsageCommand::Daily { from, to } => {
            let mut query = Vec::new();
            if let Some(f) = from {
                query.push(format!("from={f}"));
            }
            if let Some(t) = to {
                query.push(format!("to={t}"));
            }
            let qs = if query.is_empty() {
                String::new()
            } else {
                format!("?{}", query.join("&"))
            };
            let resp = client.get(&format!("/api/v1/usage/daily{qs}")).await?;
            if client.json_output {
                output::print_json(&resp);
            } else {
                let days = resp.as_array().map(|a| a.as_slice()).unwrap_or(&[]);
                let mut table = Table::new(vec!["Date", "Requests", "Input Tokens", "Output Tokens"]);
                for d in days {
                    table.add_row(vec![
                        output::json_str(d, "date").to_string(),
                        output::json_i64(d, "requestCount"),
                        output::json_i64(d, "totalInputTokens"),
                        output::json_i64(d, "totalOutputTokens"),
                    ]);
                }
                table.print();
            }
        }
        UsageCommand::Summary => {
            let resp = client.get("/api/v1/usage/summary").await?;
            if client.json_output {
                output::print_json(&resp);
            } else {
                output::print_success("Usage Summary");
                output::print_detail(&format!(
                    "Total requests: {}",
                    output::json_i64(&resp, "totalRequests")
                ));
                output::print_detail(&format!(
                    "Total input tokens: {}",
                    output::json_i64(&resp, "totalInputTokens")
                ));
                output::print_detail(&format!(
                    "Total output tokens: {}",
                    output::json_i64(&resp, "totalOutputTokens")
                ));
            }
        }
        UsageCommand::Refresh => {
            client.post("/api/v1/usage/refresh", &json!({})).await?;
            output::print_success("Usage data refreshed");
        }
    }
    Ok(())
}
