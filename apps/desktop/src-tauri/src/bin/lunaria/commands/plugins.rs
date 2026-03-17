use anyhow::Result;
use clap::Subcommand;
use serde_json::json;

use crate::client::LunariaClient;
use crate::output::{self, Table};

#[derive(Subcommand)]
pub enum PluginsCommand {
    /// List all plugins
    List,
    /// Toggle a plugin
    Toggle {
        /// Plugin ID
        id: String,
        /// Enable the plugin
        #[arg(long)]
        enable: bool,
        /// Disable the plugin
        #[arg(long)]
        disable: bool,
    },
    /// Review a plugin install from deep link
    InstallReview {
        /// Deep link URL
        #[arg(long)]
        deeplink: String,
    },
    /// Install a plugin
    Install {
        /// Plugin source
        #[arg(long)]
        source: String,
    },
    /// Uninstall a plugin
    Uninstall {
        /// Plugin ID
        id: String,
    },
    /// Execute a plugin hook
    Execute {
        /// Plugin ID
        id: String,
        /// Hook name
        #[arg(long)]
        hook: String,
    },
    /// Check plugin health
    Health {
        /// Plugin ID
        id: String,
    },
}

pub async fn execute(client: &LunariaClient, cmd: PluginsCommand) -> Result<()> {
    match cmd {
        PluginsCommand::List => {
            let resp = client.get("/api/v1/plugins").await?;
            if client.json_output {
                output::print_json(&resp);
            } else {
                let plugins = resp.as_array().map(|a| a.as_slice()).unwrap_or(&[]);
                let mut table = Table::new(vec!["ID", "Name", "Enabled", "Version"]);
                for p in plugins {
                    table.add_row(vec![
                        output::json_str_truncated(p, "id", 20),
                        output::json_str(p, "name").to_string(),
                        p.get("enabled")
                            .and_then(|v| v.as_bool())
                            .map(|b| if b { "yes" } else { "no" })
                            .unwrap_or("-")
                            .to_string(),
                        output::json_str(p, "version").to_string(),
                    ]);
                }
                table.print();
            }
        }
        PluginsCommand::Toggle { id, enable, disable } => {
            let enabled = if disable { false } else { enable || true };
            client
                .post(&format!("/api/v1/plugins/{id}"), &json!({ "enabled": enabled }))
                .await?;
            output::print_success(&format!(
                "Plugin {id} {}",
                if enabled { "enabled" } else { "disabled" }
            ));
        }
        PluginsCommand::InstallReview { deeplink } => {
            let resp = client
                .post("/api/v1/plugins/install-review", &json!({ "deeplink": deeplink }))
                .await?;
            output::print_json(&resp);
        }
        PluginsCommand::Install { source } => {
            let resp = client
                .post("/api/v1/plugins/install", &json!({ "source": source }))
                .await?;
            if client.json_output {
                output::print_json(&resp);
            } else {
                output::print_success("Plugin installed");
            }
        }
        PluginsCommand::Uninstall { id } => {
            client.delete(&format!("/api/v1/plugins/{id}/uninstall")).await?;
            output::print_success(&format!("Plugin {id} uninstalled"));
        }
        PluginsCommand::Execute { id, hook } => {
            let resp = client
                .post(
                    &format!("/api/v1/plugins/{id}/execute"),
                    &json!({ "hook": hook }),
                )
                .await?;
            output::print_json(&resp);
        }
        PluginsCommand::Health { id } => {
            let resp = client.get(&format!("/api/v1/plugins/{id}/health")).await?;
            if client.json_output {
                output::print_json(&resp);
            } else {
                let status = output::json_str(&resp, "status");
                output::print_success(&format!("Plugin {id}: {status}"));
            }
        }
    }
    Ok(())
}
