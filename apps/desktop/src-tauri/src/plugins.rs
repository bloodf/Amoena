use std::{fs, path::{Path, PathBuf}, process::Stdio};

use anyhow::{Context, Result};
use reqwest::Url;
use serde::{Deserialize, Serialize};
use serde_json::Value;
use tokio::{
    io::{AsyncBufReadExt, AsyncWriteExt, BufReader},
    process::Command,
};
use crate::persistence::{repositories::{clock::utc_now, plugins::PluginRepository}, Database, PluginEcosystem, PluginHealthStatus, PluginRecord};

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PluginManifest {
    pub id: String,
    pub name: String,
    pub version: String,
    pub author: Option<String>,
    pub description: String,
    pub main: String,
    #[serde(default)]
    pub permissions: Vec<String>,
    #[serde(default)]
    pub activation_events: Vec<String>,
    #[serde(default)]
    pub division_affinity: Option<Vec<String>>,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct InstallReviewIntent {
    pub target_kind: String,
    pub id: String,
    pub source: String,
    pub version: Option<String>,
    pub manifest_url: Option<String>,
    pub publisher: Option<String>,
    pub title: Option<String>,
    pub trusted: bool,
    pub warnings: Vec<String>,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct PluginRpcRequest<'a> {
    jsonrpc: &'static str,
    id: &'a str,
    method: &'a str,
    params: Value,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct PluginRpcResponse {
    id: Option<String>,
    result: Option<Value>,
    error: Option<PluginRpcError>,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct PluginRpcError {
    code: i64,
    message: String,
}

pub struct PluginRegistryService {
    repo: PluginRepository,
}

impl PluginRegistryService {
    pub fn new(database: std::sync::Arc<Database>) -> Self {
        Self {
            repo: PluginRepository::new(database),
        }
    }

    pub fn discover(&self, plugins_root: &Path) -> Result<Vec<PluginRecord>> {
        let mut discovered = Vec::new();

        if !plugins_root.exists() {
            return Ok(discovered);
        }

        for entry in fs::read_dir(plugins_root)
            .with_context(|| format!("failed to read plugin dir {}", plugins_root.display()))?
        {
            let entry = entry?;
            if !entry.file_type()?.is_dir() {
                continue;
            }
            let manifest_path = entry.path().join("manifest.json");
            if !manifest_path.exists() {
                continue;
            }
            let manifest: PluginManifest = serde_json::from_str(
                &fs::read_to_string(&manifest_path)
                    .with_context(|| format!("failed to read {}", manifest_path.display()))?,
            )
            .context("failed to parse plugin manifest")?;

            let now = utc_now();
            let record = PluginRecord {
                id: manifest.id,
                name: manifest.name,
                ecosystem: PluginEcosystem::Lunaria,
                version: Some(manifest.version),
                description: Some(manifest.description),
                source_path: entry.path().display().to_string(),
                enabled: true,
                priority: 100,
                capabilities: manifest.permissions,
                agent_profiles: vec![],
                health_status: PluginHealthStatus::Healthy,
                error_count: 0,
                last_error: None,
                last_event_at: None,
                latency_ms_avg: None,
                division_affinity: manifest.division_affinity.unwrap_or_else(|| vec!["*".to_string()]),
                created_at: now.clone(),
                updated_at: now,
            };
            self.repo.upsert(&record)?;
            discovered.push(record);
        }

        Ok(discovered)
    }

    pub fn list(&self) -> Result<Vec<PluginRecord>> {
        self.repo.list()
    }

    pub fn load(&self, plugin_id: &str) -> Result<PluginManifest> {
        let plugin = self
            .repo
            .get(plugin_id)?
            .ok_or_else(|| anyhow::anyhow!("plugin {} not found", plugin_id))?;
        read_plugin_manifest(Path::new(&plugin.source_path))
    }

    pub fn set_enabled(&self, plugin_id: &str, enabled: bool) -> Result<()> {
        let mut plugin = self
            .repo
            .get(plugin_id)?
            .ok_or_else(|| anyhow::anyhow!("plugin {} not found", plugin_id))?;
        plugin.enabled = enabled;
        plugin.health_status = if enabled {
            PluginHealthStatus::Healthy
        } else {
            PluginHealthStatus::Disabled
        };
        plugin.updated_at = utc_now();
        self.repo.upsert(&plugin)
    }

    pub fn parse_install_deeplink(&self, deeplink: &str) -> Result<InstallReviewIntent> {
        let url = Url::parse(deeplink).context("failed to parse deeplink")?;
        if url.scheme() != "lunaria" {
            anyhow::bail!("unsupported deeplink scheme");
        }

        let target_kind = url.host_str().unwrap_or_default();
        let Some("install") = url.path_segments().and_then(|mut segments| segments.next()) else {
            anyhow::bail!("unsupported deeplink path");
        };

        let params = url.query_pairs().collect::<std::collections::HashMap<_, _>>();
        let id = params
            .get("id")
            .map(|value| value.to_string())
            .ok_or_else(|| anyhow::anyhow!("deeplink missing id"))?;
        let source = params
            .get("source")
            .map(|value| value.to_string())
            .ok_or_else(|| anyhow::anyhow!("deeplink missing source"))?;
        let manifest_url = params.get("manifestUrl").map(|value| value.to_string());
        let version = params.get("version").map(|value| value.to_string());
        let publisher = params.get("publisher").map(|value| value.to_string());
        let title = params.get("title").map(|value| value.to_string());
        let signature = params.get("signature").map(|value| value.to_string());

        let mut warnings = Vec::new();
        let trusted = manifest_url
            .as_deref()
            .map(|value| value.starts_with("https://"))
            .unwrap_or(false)
            && signature.is_some();

        if manifest_url.as_deref().map(|value| !value.starts_with("https://")).unwrap_or(true) {
            warnings.push("manifest_url_untrusted".to_string());
        }
        if signature.is_none() {
            warnings.push("unsigned_plugin".to_string());
        }

        Ok(InstallReviewIntent {
            target_kind: target_kind.to_string(),
            id,
            source,
            version,
            manifest_url,
            publisher,
            title,
            trusted,
            warnings,
        })
    }

    pub async fn execute_hook(
        &self,
        plugin_id: &str,
        hook: &str,
        payload: Value,
        required_permission: Option<&str>,
    ) -> Result<Value> {
        let plugin = self
            .repo
            .get(plugin_id)?
            .ok_or_else(|| anyhow::anyhow!("plugin {} not found", plugin_id))?;
        if !plugin.enabled {
            anyhow::bail!("plugin {} is disabled", plugin_id);
        }

        let manifest = read_plugin_manifest(Path::new(&plugin.source_path))?;
        if !manifest.activation_events.iter().any(|event| event == hook) {
            anyhow::bail!("plugin {} activation event {} is not registered", plugin_id, hook);
        }
        if let Some(permission) = required_permission {
            if !manifest.permissions.iter().any(|granted| granted == permission) {
                anyhow::bail!("plugin {} lacks required permission {}", plugin_id, permission);
            }
        }

        let entry_path = PathBuf::from(&plugin.source_path).join(&manifest.main);
        if !entry_path.exists() {
            anyhow::bail!("plugin {} entry point missing at {}", plugin_id, entry_path.display());
        }

        let mut child = Command::new("bun")
            .arg(&entry_path)
            .current_dir(&plugin.source_path)
            .stdin(Stdio::piped())
            .stdout(Stdio::piped())
            .stderr(Stdio::inherit())
            .spawn()
            .with_context(|| format!("failed to spawn plugin {}", plugin_id))?;

        let mut stdin = child.stdin.take().context("plugin stdin unavailable")?;
        let stdout = child.stdout.take().context("plugin stdout unavailable")?;
        let request_id = "plugin-exec-1";
        let encoded = serde_json::to_string(&PluginRpcRequest {
            jsonrpc: "2.0",
            id: request_id,
            method: "plugin.execute",
            params: serde_json::json!({
                "pluginId": plugin_id,
                "hook": hook,
                "payload": payload,
            }),
        })
        .context("failed to encode plugin request")?;
        stdin
            .write_all(encoded.as_bytes())
            .await
            .context("failed to write plugin request")?;
        stdin
            .write_all(b"\n")
            .await
            .context("failed to terminate plugin request")?;
        stdin.flush().await.context("failed to flush plugin request")?;
        drop(stdin);

        let mut lines = BufReader::new(stdout).lines();
        let line = lines
            .next_line()
            .await
            .context("failed to read plugin response")?
            .ok_or_else(|| anyhow::anyhow!("plugin {} produced no response", plugin_id))?;
        let response: PluginRpcResponse =
            serde_json::from_str(&line).context("failed to parse plugin response")?;
        if response.id.as_deref() != Some(request_id) {
            anyhow::bail!("plugin {} returned mismatched response id", plugin_id);
        }
        if let Some(error) = response.error {
            anyhow::bail!("plugin {} failed {}: {}", plugin_id, error.code, error.message);
        }

        let _ = child.wait().await;
        response
            .result
            .ok_or_else(|| anyhow::anyhow!("plugin {} response missing result", plugin_id))
    }

    pub fn get_record(&self, plugin_id: &str) -> Result<Option<PluginRecord>> {
        self.repo.get(plugin_id)
    }

    pub fn uninstall(&self, plugin_id: &str) -> Result<()> {
        let plugin = self
            .repo
            .get(plugin_id)?
            .ok_or_else(|| anyhow::anyhow!("plugin {} not found", plugin_id))?;
        let plugin_path = PathBuf::from(&plugin.source_path);
        if plugin_path.exists() {
            fs::remove_dir_all(&plugin_path)
                .with_context(|| format!("failed to remove {}", plugin_path.display()))?;
        }
        self.repo.delete(plugin_id)
    }
}

fn read_plugin_manifest(plugin_dir: &Path) -> Result<PluginManifest> {
    let manifest_path = plugin_dir.join("manifest.json");
    serde_json::from_str(
        &fs::read_to_string(&manifest_path)
            .with_context(|| format!("failed to read {}", manifest_path.display()))?,
    )
    .context("failed to parse plugin manifest")
}
