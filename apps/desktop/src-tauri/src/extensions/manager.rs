use std::path::PathBuf;

use anyhow::Result;
use serde::{Deserialize, Serialize};

use super::{
    contributions::{
        AggregatedContributions, CommandContribution, HookContribution, MenuContribution,
        PanelContribution, ProviderContribution, SettingContribution, ToolContribution,
    },
    format::ExtensionManifest,
    loader::ExtensionLoader,
};

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ExtensionSummary {
    pub id: String,
    pub name: String,
    pub version: String,
    pub publisher: Option<String>,
    pub description: String,
    pub enabled: bool,
    pub permissions: Vec<String>,
}

pub struct ExtensionManager {
    loader: ExtensionLoader,
}

impl ExtensionManager {
    pub fn new(extensions_dir: PathBuf) -> Self {
        Self {
            loader: ExtensionLoader::new(extensions_dir),
        }
    }

    pub async fn discover(&self) -> Result<Vec<ExtensionManifest>> {
        self.loader.discover().await
    }

    pub async fn install_from_path(&self, path: &std::path::Path) -> Result<ExtensionManifest> {
        self.loader.install(path).await
    }

    pub async fn install_from_url(&self, url: &str) -> Result<ExtensionManifest> {
        self.loader.install_from_url(url).await
    }

    pub async fn uninstall(&self, id: &str) -> Result<()> {
        self.loader.uninstall(id).await
    }

    pub async fn set_enabled(&self, id: &str, enabled: bool) -> Result<()> {
        self.loader.set_enabled(id, enabled).await
    }

    pub async fn list(&self) -> Vec<ExtensionSummary> {
        self.loader
            .list()
            .await
            .into_iter()
            .map(|ext| ExtensionSummary {
                id: ext.manifest.id.clone(),
                name: ext.manifest.name.clone(),
                version: ext.manifest.version.clone(),
                publisher: ext.manifest.publisher.clone(),
                description: ext.manifest.description.clone(),
                enabled: ext.enabled,
                permissions: ext.manifest.permissions.clone(),
            })
            .collect()
    }

    pub async fn get_contributions(&self) -> AggregatedContributions {
        let extensions = self.loader.list().await;
        let mut contributions = AggregatedContributions::empty();

        for ext in extensions.into_iter().filter(|e| e.enabled) {
            let id = &ext.manifest.id;
            let contribs = &ext.manifest.contributes;

            for cmd in &contribs.commands {
                contributions.commands.push(CommandContribution {
                    extension_id: id.clone(),
                    command: cmd.clone(),
                });
            }

            for (location, items) in &contribs.menus {
                for item in items {
                    contributions.menu_items.push(MenuContribution {
                        extension_id: id.clone(),
                        menu_location: location.clone(),
                        item: item.clone(),
                    });
                }
            }

            for panel in &contribs.panels {
                contributions.panels.push(PanelContribution {
                    extension_id: id.clone(),
                    panel: panel.clone(),
                });
            }

            for setting in &contribs.settings {
                contributions.settings.push(SettingContribution {
                    extension_id: id.clone(),
                    setting: setting.clone(),
                });
            }

            for hook in &contribs.hooks {
                contributions.hooks.push(HookContribution {
                    extension_id: id.clone(),
                    hook: hook.clone(),
                });
            }

            for tool in &contribs.tools {
                contributions.tools.push(ToolContribution {
                    extension_id: id.clone(),
                    tool: tool.clone(),
                });
            }

            for provider in &contribs.providers {
                contributions.providers.push(ProviderContribution {
                    extension_id: id.clone(),
                    provider: provider.clone(),
                });
            }
        }

        contributions
    }

    /// Check each extension's activation_events and activate matching extensions.
    /// Supported events: "onSession" (any session starts), "onCommand:*" (matching command invoked)
    pub async fn fire_activation_event(&self, event: &str) -> Vec<String> {
        let extensions = self.loader.list().await;
        let mut activated = Vec::new();

        for ext in extensions.iter().filter(|e| e.enabled) {
            let matches = ext.manifest.activation_events.iter().any(|ae| {
                if ae == event {
                    return true;
                }
                // Support wildcard matching: "onCommand:*" matches "onCommand:myCommand"
                if let Some(prefix) = ae.strip_suffix('*') {
                    return event.starts_with(prefix);
                }
                false
            });

            if matches {
                activated.push(ext.manifest.id.clone());
            }
        }

        activated
    }

    pub async fn get_panel_html(
        &self,
        extension_id: &str,
        panel_id: &str,
    ) -> Result<Option<String>> {
        let bundle = self.loader.get_bundle(extension_id).await?;
        let bundle = match bundle {
            Some(b) => b,
            None => return Ok(None),
        };
        let panel = bundle
            .manifest
            .contributes
            .panels
            .iter()
            .find(|p| p.id == panel_id);
        match panel {
            Some(panel) => Ok(bundle.get_asset_as_string(&panel.entry)),
            None => Ok(None),
        }
    }
}
