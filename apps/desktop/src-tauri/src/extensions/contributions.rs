use serde::{Deserialize, Serialize};

use super::format::{
    ExtensionCommand, ExtensionHook, ExtensionMenuItem, ExtensionPanel, ExtensionProvider,
    ExtensionSetting, ExtensionTool,
};

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AggregatedContributions {
    pub commands: Vec<CommandContribution>,
    pub menu_items: Vec<MenuContribution>,
    pub panels: Vec<PanelContribution>,
    pub settings: Vec<SettingContribution>,
    pub hooks: Vec<HookContribution>,
    pub tools: Vec<ToolContribution>,
    pub providers: Vec<ProviderContribution>,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CommandContribution {
    pub extension_id: String,
    pub command: ExtensionCommand,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MenuContribution {
    pub extension_id: String,
    pub menu_location: String,
    pub item: ExtensionMenuItem,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PanelContribution {
    pub extension_id: String,
    pub panel: ExtensionPanel,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SettingContribution {
    pub extension_id: String,
    pub setting: ExtensionSetting,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct HookContribution {
    pub extension_id: String,
    pub hook: ExtensionHook,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ToolContribution {
    pub extension_id: String,
    pub tool: ExtensionTool,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ProviderContribution {
    pub extension_id: String,
    pub provider: ExtensionProvider,
}

impl AggregatedContributions {
    pub fn empty() -> Self {
        Self {
            commands: Vec::new(),
            menu_items: Vec::new(),
            panels: Vec::new(),
            settings: Vec::new(),
            hooks: Vec::new(),
            tools: Vec::new(),
            providers: Vec::new(),
        }
    }
}
