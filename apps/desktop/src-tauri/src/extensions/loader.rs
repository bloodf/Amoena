use std::{collections::HashMap, path::{Path, PathBuf}, sync::Arc};
use anyhow::{Context, Result};
use tokio::sync::RwLock;

use super::format::{ExtensionManifest, LunaBundle};

#[derive(Clone, Debug)]
pub struct LoadedExtension {
    pub manifest: ExtensionManifest,
    pub install_path: PathBuf,
    pub enabled: bool,
}

pub struct ExtensionLoader {
    extensions_dir: PathBuf,
    loaded: Arc<RwLock<HashMap<String, LoadedExtension>>>,
}

impl ExtensionLoader {
    pub fn new(extensions_dir: PathBuf) -> Self {
        Self {
            extensions_dir,
            loaded: Arc::new(RwLock::new(HashMap::new())),
        }
    }

    pub async fn discover(&self) -> Result<Vec<ExtensionManifest>> {
        std::fs::create_dir_all(&self.extensions_dir)
            .with_context(|| format!("failed to create extensions dir: {}", self.extensions_dir.display()))?;

        let mut manifests = Vec::new();
        let entries = std::fs::read_dir(&self.extensions_dir)
            .with_context(|| format!("failed to read extensions dir: {}", self.extensions_dir.display()))?;

        for entry in entries {
            let entry = entry?;
            let path = entry.path();
            if path.extension().and_then(|e| e.to_str()) == Some("luna") {
                match LunaBundle::read(&path) {
                    Ok(bundle) => {
                        let ext = LoadedExtension {
                            manifest: bundle.manifest.clone(),
                            install_path: path,
                            enabled: true,
                        };
                        manifests.push(bundle.manifest.clone());
                        self.loaded.write().await.insert(bundle.manifest.id.clone(), ext);
                    }
                    Err(error) => {
                        tracing::warn!(path = %path.display(), error = %error, "failed to load .luna extension");
                    }
                }
            }
        }

        Ok(manifests)
    }

    pub async fn install(&self, source_path: &Path) -> Result<ExtensionManifest> {
        let bundle = LunaBundle::read(source_path)?;
        let dest = self.extensions_dir.join(format!("{}.luna", bundle.manifest.id));
        if source_path != dest {
            std::fs::copy(source_path, &dest)
                .context("failed to copy .luna to extensions dir")?;
        }
        let ext = LoadedExtension {
            manifest: bundle.manifest.clone(),
            install_path: dest,
            enabled: true,
        };
        self.loaded.write().await.insert(bundle.manifest.id.clone(), ext);
        Ok(bundle.manifest)
    }

    pub async fn install_from_url(&self, url: &str) -> Result<ExtensionManifest> {
        let response = reqwest::get(url).await
            .with_context(|| format!("failed to download .luna from {}", url))?;
        let bytes = response.bytes().await
            .context("failed to read .luna download body")?;
        let bundle = LunaBundle::parse(&bytes)?;
        let dest = self.extensions_dir.join(format!("{}.luna", bundle.manifest.id));
        std::fs::write(&dest, &bytes)
            .context("failed to write .luna to extensions dir")?;
        let ext = LoadedExtension {
            manifest: bundle.manifest.clone(),
            install_path: dest,
            enabled: true,
        };
        self.loaded.write().await.insert(bundle.manifest.id.clone(), ext);
        Ok(bundle.manifest)
    }

    pub async fn uninstall(&self, id: &str) -> Result<()> {
        let mut loaded = self.loaded.write().await;
        let ext = loaded.remove(id)
            .ok_or_else(|| anyhow::anyhow!("extension {} not found", id))?;
        if ext.install_path.exists() {
            std::fs::remove_file(&ext.install_path)
                .context("failed to remove .luna file")?;
        }
        Ok(())
    }

    pub async fn set_enabled(&self, id: &str, enabled: bool) -> Result<()> {
        let mut loaded = self.loaded.write().await;
        let ext = loaded.get_mut(id)
            .ok_or_else(|| anyhow::anyhow!("extension {} not found", id))?;
        ext.enabled = enabled;
        Ok(())
    }

    pub async fn list(&self) -> Vec<LoadedExtension> {
        self.loaded.read().await.values().cloned().collect()
    }

    pub async fn get(&self, id: &str) -> Option<LoadedExtension> {
        self.loaded.read().await.get(id).cloned()
    }

    pub async fn get_bundle(&self, id: &str) -> Result<Option<LunaBundle>> {
        let loaded = self.loaded.read().await;
        match loaded.get(id) {
            Some(ext) => Ok(Some(LunaBundle::read(&ext.install_path)?)),
            None => Ok(None),
        }
    }
}
