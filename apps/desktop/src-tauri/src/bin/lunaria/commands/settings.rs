use anyhow::Result;
use clap::Subcommand;
use serde_json::json;

use crate::client::LunariaClient;
use crate::output;

#[derive(Subcommand)]
pub enum SettingsCommand {
    /// Get settings (optionally a specific key)
    Get {
        /// Setting key (omit for all settings)
        key: Option<String>,
    },
    /// Set a setting value
    Set {
        /// Setting key
        key: String,
        /// Setting value (JSON)
        value: String,
    },
}

pub async fn execute(client: &LunariaClient, cmd: SettingsCommand) -> Result<()> {
    match cmd {
        SettingsCommand::Get { key } => {
            let resp = client.get("/api/v1/settings").await?;
            if let Some(k) = key {
                let value = resp.get(&k).cloned().unwrap_or(serde_json::Value::Null);
                if client.json_output {
                    output::print_json(&value);
                } else {
                    println!("{k} = {}", serde_json::to_string_pretty(&value).unwrap_or_default());
                }
            } else {
                output::print_json(&resp);
            }
        }
        SettingsCommand::Set { key, value } => {
            let parsed: serde_json::Value =
                serde_json::from_str(&value).unwrap_or(serde_json::Value::String(value));
            let mut values = serde_json::Map::new();
            values.insert(key.clone(), parsed);
            client
                .post("/api/v1/settings", &json!({ "values": serde_json::Value::Object(values) }))
                .await?;
            output::print_success(&format!("Setting {key} updated"));
        }
    }
    Ok(())
}
