use std::collections::HashMap;
use std::io::{Read, Write, Cursor};
use std::path::Path;

use anyhow::{Context, Result, bail};
use serde::{Deserialize, Serialize};
use serde_json::Value;

const MAGIC: &[u8; 4] = b"LUNA";
const FORMAT_VERSION: u32 = 1;

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ExtensionManifest {
    pub id: String,
    pub name: String,
    pub version: String,
    pub publisher: Option<String>,
    pub description: String,
    pub icon: Option<String>,
    pub permissions: Vec<String>,
    pub activation_events: Vec<String>,
    pub contributes: ExtensionContributions,
    pub backend: Option<ExtensionBackend>,
}

#[derive(Clone, Debug, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ExtensionContributions {
    #[serde(default)]
    pub commands: Vec<ExtensionCommand>,
    #[serde(default)]
    pub menus: HashMap<String, Vec<ExtensionMenuItem>>,
    #[serde(default)]
    pub panels: Vec<ExtensionPanel>,
    #[serde(default)]
    pub settings: Vec<ExtensionSetting>,
    #[serde(default)]
    pub hooks: Vec<ExtensionHook>,
    #[serde(default)]
    pub tools: Vec<ExtensionTool>,
    #[serde(default)]
    pub providers: Vec<ExtensionProvider>,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ExtensionCommand {
    pub id: String,
    pub title: String,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ExtensionMenuItem {
    pub command: Option<String>,
    pub panel: Option<String>,
    pub title: String,
    pub icon: Option<String>,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ExtensionPanel {
    pub id: String,
    pub entry: String,
    pub title: Option<String>,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ExtensionSetting {
    pub id: String,
    #[serde(rename = "type")]
    pub setting_type: String,
    pub title: String,
    pub default: Option<Value>,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ExtensionHook {
    pub event: String,
    pub handler: String,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ExtensionTool {
    pub name: String,
    pub description: String,
    pub handler: String,
    pub input_schema: Option<Value>,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ExtensionProvider {
    pub id: String,
    pub name: String,
    pub handler: String,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ExtensionBackend {
    #[serde(rename = "type")]
    pub backend_type: String,
    pub entry: String,
}

#[derive(Clone, Debug)]
pub struct LunaBundle {
    pub manifest: ExtensionManifest,
    pub assets: HashMap<String, Vec<u8>>,
}

impl LunaBundle {
    pub fn read(path: &Path) -> Result<Self> {
        let data = std::fs::read(path)
            .with_context(|| format!("failed to read .luna file: {}", path.display()))?;
        Self::parse(&data)
    }

    pub fn parse(data: &[u8]) -> Result<Self> {
        let mut cursor = Cursor::new(data);

        // Magic
        let mut magic = [0u8; 4];
        cursor.read_exact(&mut magic).context("failed to read magic bytes")?;
        if &magic != MAGIC {
            bail!("invalid .luna file: bad magic bytes");
        }

        // Version
        let mut version_bytes = [0u8; 4];
        cursor.read_exact(&mut version_bytes).context("failed to read version")?;
        let version = u32::from_le_bytes(version_bytes);
        if version != FORMAT_VERSION {
            bail!("unsupported .luna format version: {}", version);
        }

        // Manifest
        let mut manifest_len_bytes = [0u8; 4];
        cursor.read_exact(&mut manifest_len_bytes).context("failed to read manifest length")?;
        let manifest_len = u32::from_le_bytes(manifest_len_bytes) as usize;
        let mut manifest_bytes = vec![0u8; manifest_len];
        cursor.read_exact(&mut manifest_bytes).context("failed to read manifest")?;
        let manifest: ExtensionManifest = serde_json::from_slice(&manifest_bytes)
            .context("failed to parse extension manifest")?;

        // Assets
        let mut asset_count_bytes = [0u8; 4];
        cursor.read_exact(&mut asset_count_bytes).context("failed to read asset count")?;
        let asset_count = u32::from_le_bytes(asset_count_bytes);
        let mut assets = HashMap::new();

        for _ in 0..asset_count {
            let mut name_len_bytes = [0u8; 4];
            cursor.read_exact(&mut name_len_bytes).context("failed to read asset name length")?;
            let name_len = u32::from_le_bytes(name_len_bytes) as usize;

            let mut name_bytes = vec![0u8; name_len];
            cursor.read_exact(&mut name_bytes).context("failed to read asset name")?;
            let name = String::from_utf8(name_bytes).context("invalid asset name")?;

            let mut data_len_bytes = [0u8; 4];
            cursor.read_exact(&mut data_len_bytes).context("failed to read asset data length")?;
            let data_len = u32::from_le_bytes(data_len_bytes) as usize;

            let mut asset_data = vec![0u8; data_len];
            cursor.read_exact(&mut asset_data).context("failed to read asset data")?;

            assets.insert(name, asset_data);
        }

        Ok(Self { manifest, assets })
    }

    pub fn write(&self, path: &Path) -> Result<()> {
        let mut out = Vec::new();

        // Magic + version
        out.write_all(MAGIC)?;
        out.write_all(&FORMAT_VERSION.to_le_bytes())?;

        // Manifest
        let manifest_json = serde_json::to_vec(&self.manifest)?;
        out.write_all(&(manifest_json.len() as u32).to_le_bytes())?;
        out.write_all(&manifest_json)?;

        // Assets
        out.write_all(&(self.assets.len() as u32).to_le_bytes())?;
        for (name, data) in &self.assets {
            let name_bytes = name.as_bytes();
            out.write_all(&(name_bytes.len() as u32).to_le_bytes())?;
            out.write_all(name_bytes)?;
            out.write_all(&(data.len() as u32).to_le_bytes())?;
            out.write_all(data)?;
        }

        std::fs::write(path, out)
            .with_context(|| format!("failed to write .luna file: {}", path.display()))?;
        Ok(())
    }

    pub fn get_asset(&self, name: &str) -> Option<&[u8]> {
        self.assets.get(name).map(|v| v.as_slice())
    }

    pub fn get_asset_as_string(&self, name: &str) -> Option<String> {
        self.assets.get(name).and_then(|v| String::from_utf8(v.clone()).ok())
    }
}
