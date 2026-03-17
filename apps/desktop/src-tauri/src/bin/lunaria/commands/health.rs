use anyhow::Result;

use crate::client::LunariaClient;
use crate::output;

pub async fn execute(client: &LunariaClient) -> Result<()> {
    let resp = client.get("/api/v1/health").await?;
    if client.json_output {
        output::print_json(&resp);
    } else {
        let status = output::json_str(&resp, "status");
        let app = output::json_str(&resp, "appName");
        let version = output::json_str(&resp, "appVersion");
        let instance = output::json_str(&resp, "instanceId");
        output::print_success(&format!("{app} v{version} — status: {status}"));
        output::print_detail(&format!("Instance: {instance}"));
    }
    Ok(())
}
