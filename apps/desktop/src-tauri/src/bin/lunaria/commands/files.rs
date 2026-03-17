use anyhow::Result;
use clap::Subcommand;
use serde_json::json;

use crate::client::LunariaClient;
use crate::output;

#[derive(Subcommand)]
pub enum FilesCommand {
    /// List file tree
    Tree {
        /// Root path
        #[arg(long)]
        root: Option<String>,
    },
    /// Read file contents
    Read {
        /// File path
        path: String,
    },
    /// Write file contents
    Write {
        /// File path
        path: String,
        /// File content
        #[arg(long)]
        content: String,
    },
}

pub async fn execute(client: &LunariaClient, cmd: FilesCommand) -> Result<()> {
    match cmd {
        FilesCommand::Tree { root } => {
            let tree_root = root.unwrap_or_else(|| ".".to_string());
            let path = format!("/api/v1/files/tree?root={}", urlencoding(&tree_root));
            let resp = client.get(&path).await?;
            output::print_json(&resp);
        }
        FilesCommand::Read { path } => {
            let resp = client
                .get(&format!("/api/v1/files/content?path={}", urlencoding(&path)))
                .await?;
            if client.json_output {
                output::print_json(&resp);
            } else {
                let content = resp
                    .get("content")
                    .and_then(|v| v.as_str())
                    .unwrap_or("");
                println!("{content}");
            }
        }
        FilesCommand::Write { path, content } => {
            client
                .post("/api/v1/files/content", &json!({ "path": path, "content": content }))
                .await?;
            output::print_success(&format!("Written: {path}"));
        }
    }
    Ok(())
}

fn urlencoding(s: &str) -> String {
    s.replace('%', "%25")
        .replace(' ', "%20")
        .replace('&', "%26")
        .replace('=', "%3D")
        .replace('?', "%3F")
        .replace('#', "%23")
}
