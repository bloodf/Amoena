use anyhow::Result;
use clap::Subcommand;
use serde_json::json;

use crate::client::LunariaClient;
use crate::output::{self, Table};

#[derive(Subcommand)]
pub enum ProvidersCommand {
    /// List all providers
    List,
    /// List models for a provider
    Models {
        /// Provider ID
        id: String,
    },
    /// Set provider authentication
    Auth {
        /// Provider ID
        id: String,
        /// API key
        #[arg(long)]
        api_key: String,
    },
    /// Set reasoning defaults for a model
    Reasoning {
        /// Provider ID
        id: String,
        /// Model ID
        model_id: String,
        /// Reasoning mode: auto, enabled, disabled
        #[arg(long, default_value = "auto")]
        mode: String,
        /// Reasoning effort: low, medium, high
        #[arg(long, default_value = "high")]
        effort: String,
    },
    /// List wrapper capabilities
    Wrappers,
}

pub async fn execute(client: &LunariaClient, cmd: ProvidersCommand) -> Result<()> {
    match cmd {
        ProvidersCommand::List => {
            let resp = client.get("/api/v1/providers").await?;
            if client.json_output {
                output::print_json(&resp);
            } else {
                let providers = resp.as_array().map(|a| a.as_slice()).unwrap_or(&[]);
                let mut table = Table::new(vec!["ID", "Name", "Auth Status", "Models"]);
                for p in providers {
                    let model_count = p
                        .get("modelCount")
                        .and_then(|m| m.as_i64())
                        .unwrap_or(0) as usize;
                    table.add_row(vec![
                        output::json_str(p, "id").to_string(),
                        output::json_str(p, "name").to_string(),
                        output::json_str(p, "authStatus").to_string(),
                        model_count.to_string(),
                    ]);
                }
                table.print();
            }
        }
        ProvidersCommand::Models { id } => {
            let resp = client.get(&format!("/api/v1/providers/{id}/models")).await?;
            if client.json_output {
                output::print_json(&resp);
            } else {
                let models = resp.as_array().map(|a| a.as_slice()).unwrap_or(&[]);
                let mut table = Table::new(vec!["ID", "Name", "Context Window"]);
                for m in models {
                    table.add_row(vec![
                        output::json_str(m, "id").to_string(),
                        output::json_str(m, "name").to_string(),
                        output::json_i64(m, "contextWindow"),
                    ]);
                }
                table.print();
            }
        }
        ProvidersCommand::Auth { id, api_key } => {
            client
                .post(
                    &format!("/api/v1/providers/{id}/auth"),
                    &json!({ "apiKey": api_key }),
                )
                .await?;
            output::print_success(&format!("Auth updated for provider {id}"));
        }
        ProvidersCommand::Reasoning { id, model_id, mode, effort } => {
            client
                .post(
                    &format!("/api/v1/providers/{id}/models/{model_id}/reasoning"),
                    &json!({ "mode": mode, "effort": effort }),
                )
                .await?;
            output::print_success("Reasoning defaults updated");
        }
        ProvidersCommand::Wrappers => {
            let resp = client.get("/api/v1/wrappers/capabilities").await?;
            output::print_json(&resp);
        }
    }
    Ok(())
}
