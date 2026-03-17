use anyhow::Result;
use clap::Subcommand;
use serde_json::json;

use crate::client::LunariaClient;
use crate::output::{self, Table};

#[derive(Subcommand)]
pub enum HooksCommand {
    /// List registered hooks
    List,
    /// Register a new hook
    Register {
        /// Event name to hook into
        #[arg(long)]
        event: String,
        /// Handler type
        #[arg(long, default_value = "command")]
        handler: String,
        /// Handler configuration (JSON)
        #[arg(long)]
        config: String,
    },
    /// Delete a hook
    Delete {
        /// Hook ID
        id: String,
    },
    /// Fire a hook event
    Fire {
        /// Event name
        #[arg(long)]
        event: String,
        /// Event payload (JSON)
        #[arg(long, default_value = "{}")]
        payload: String,
    },
}

pub async fn execute(client: &LunariaClient, cmd: HooksCommand) -> Result<()> {
    match cmd {
        HooksCommand::List => {
            let resp = client.get("/api/v1/hooks").await?;
            if client.json_output {
                output::print_json(&resp);
            } else {
                let hooks = resp.as_array().map(|a| a.as_slice()).unwrap_or(&[]);
                let mut table = Table::new(vec!["ID", "Event", "Handler", "Created"]);
                for h in hooks {
                    table.add_row(vec![
                        output::json_str_truncated(h, "id", 12),
                        output::json_str(h, "eventName").to_string(),
                        output::json_str(h, "handlerType").to_string(),
                        output::json_str_truncated(h, "createdAt", 19),
                    ]);
                }
                table.print();
            }
        }
        HooksCommand::Register { event, handler, config } => {
            let config_value: serde_json::Value =
                serde_json::from_str(&config).unwrap_or(serde_json::Value::String(config));
            let body = json!({
                "eventName": event,
                "handlerType": handler,
                "handlerConfig": config_value,
            });
            let resp = client.post("/api/v1/hooks", &body).await?;
            if client.json_output {
                output::print_json(&resp);
            } else {
                let id = output::json_str(&resp, "id");
                output::print_success(&format!("Hook registered: {id}"));
            }
        }
        HooksCommand::Delete { id } => {
            client.delete(&format!("/api/v1/hooks/{id}")).await?;
            output::print_success(&format!("Hook {id} deleted"));
        }
        HooksCommand::Fire { event, payload } => {
            let payload_value: serde_json::Value =
                serde_json::from_str(&payload).unwrap_or(json!({}));
            let body = json!({
                "event": event,
                "payload": payload_value,
            });
            client.post("/api/v1/hooks/fire", &body).await?;
            output::print_success(&format!("Event {event} fired"));
        }
    }
    Ok(())
}
