use anyhow::Result;
use clap::Subcommand;
use serde_json::json;

use crate::client::LunariaClient;
use crate::output::{self, Table};

#[derive(Subcommand)]
pub enum ExtensionsCommand {
    /// List installed extensions
    List,
    /// Install an extension
    Install {
        /// Path to .luna extension file
        #[arg(long)]
        path: String,
    },
    /// Uninstall an extension
    Uninstall {
        /// Extension ID
        id: String,
    },
    /// Toggle an extension on/off
    Toggle {
        /// Extension ID
        id: String,
    },
    /// List extension contributions
    Contributions,
}

pub async fn execute(client: &LunariaClient, cmd: ExtensionsCommand) -> Result<()> {
    match cmd {
        ExtensionsCommand::List => {
            let resp = client.get("/api/v1/extensions").await?;
            if client.json_output {
                output::print_json(&resp);
            } else {
                let exts = resp.as_array().map(|a| a.as_slice()).unwrap_or(&[]);
                let mut table = Table::new(vec!["ID", "Name", "Enabled", "Version"]);
                for e in exts {
                    table.add_row(vec![
                        output::json_str_truncated(e, "id", 20),
                        output::json_str(e, "name").to_string(),
                        e.get("enabled")
                            .and_then(|v| v.as_bool())
                            .map(|b| if b { "yes" } else { "no" })
                            .unwrap_or("-")
                            .to_string(),
                        output::json_str(e, "version").to_string(),
                    ]);
                }
                table.print();
            }
        }
        ExtensionsCommand::Install { path } => {
            let resp = client
                .post("/api/v1/extensions", &json!({ "path": path }))
                .await?;
            if client.json_output {
                output::print_json(&resp);
            } else {
                output::print_success("Extension installed");
            }
        }
        ExtensionsCommand::Uninstall { id } => {
            client.delete(&format!("/api/v1/extensions/{id}")).await?;
            output::print_success(&format!("Extension {id} uninstalled"));
        }
        ExtensionsCommand::Toggle { id } => {
            client
                .post(&format!("/api/v1/extensions/{id}/toggle"), &json!({}))
                .await?;
            output::print_success(&format!("Extension {id} toggled"));
        }
        ExtensionsCommand::Contributions => {
            let resp = client.get("/api/v1/extensions/contributions").await?;
            output::print_json(&resp);
        }
    }
    Ok(())
}
