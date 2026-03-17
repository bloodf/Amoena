use anyhow::Result;
use clap::Subcommand;
use serde_json::json;

use crate::client::LunariaClient;
use crate::output::{self, Table};

#[derive(Subcommand)]
pub enum RemoteCommand {
    /// Get remote access status
    Status,
    /// List paired devices
    Devices,
    /// Get current device info
    Me,
    /// Revoke a paired device
    Revoke {
        /// Device ID
        device_id: String,
    },
    /// Get LAN listener status or toggle
    Lan {
        /// Enable LAN access
        #[arg(long)]
        enable: bool,
        /// Disable LAN access
        #[arg(long)]
        disable: bool,
    },
    /// Create a pairing intent
    Pair,
}

pub async fn execute(client: &LunariaClient, cmd: RemoteCommand) -> Result<()> {
    match cmd {
        RemoteCommand::Status => {
            let resp = client.get("/api/v1/remote/status").await?;
            if client.json_output {
                output::print_json(&resp);
            } else {
                output::print_success("Remote Access Status");
                output::print_detail(&format!(
                    "Enabled: {}",
                    resp.get("enabled")
                        .and_then(|v| v.as_bool())
                        .map(|b| if b { "yes" } else { "no" })
                        .unwrap_or("-")
                ));
                output::print_detail(&format!(
                    "LAN: {}",
                    resp.get("lanEnabled")
                        .and_then(|v| v.as_bool())
                        .map(|b| if b { "yes" } else { "no" })
                        .unwrap_or("-")
                ));
            }
        }
        RemoteCommand::Devices => {
            let resp = client.get("/api/v1/remote/devices").await?;
            if client.json_output {
                output::print_json(&resp);
            } else {
                let devices = resp.as_array().map(|a| a.as_slice()).unwrap_or(&[]);
                let mut table = Table::new(vec!["ID", "Name", "Type", "Last Seen"]);
                for d in devices {
                    table.add_row(vec![
                        output::json_str_truncated(d, "id", 12),
                        output::json_str(d, "name").to_string(),
                        output::json_str(d, "deviceType").to_string(),
                        output::json_str_truncated(d, "lastSeen", 19),
                    ]);
                }
                table.print();
            }
        }
        RemoteCommand::Me => {
            let resp = client.get("/api/v1/remote/devices/me").await?;
            output::print_json(&resp);
        }
        RemoteCommand::Revoke { device_id } => {
            client
                .post(
                    &format!("/api/v1/remote/devices/{device_id}/revoke"),
                    &json!({}),
                )
                .await?;
            output::print_success(&format!("Device {device_id} revoked"));
        }
        RemoteCommand::Lan { enable, disable } => {
            if enable || disable {
                let enabled = enable && !disable;
                client
                    .post("/api/v1/remote/lan", &json!({ "enabled": enabled }))
                    .await?;
                output::print_success(&format!(
                    "LAN access {}",
                    if enabled { "enabled" } else { "disabled" }
                ));
            } else {
                let resp = client.get("/api/v1/remote/lan").await?;
                output::print_json(&resp);
            }
        }
        RemoteCommand::Pair => {
            let resp = client
                .post("/api/v1/remote/pairing/intents", &json!({}))
                .await?;
            if client.json_output {
                output::print_json(&resp);
            } else {
                let pin = output::json_str(&resp, "pinCode");
                output::print_success(&format!("Pairing PIN: {pin}"));
                output::print_detail("Enter this PIN on the mobile device to pair.");
            }
        }
    }
    Ok(())
}
