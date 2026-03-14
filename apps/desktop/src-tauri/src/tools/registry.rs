use std::collections::BTreeMap;

use serde_json::Value;

#[derive(Clone, Debug, PartialEq, Eq)]
pub enum ToolLevel {
    ReadOnly,
    ReadWrite,
    ShellAccess,
    Admin,
}

#[derive(Clone, Debug)]
pub struct ToolDefinition {
    pub name: String,
    pub description: String,
    pub input_schema: Value,
    pub is_read_only: bool,
    pub requires_permission: bool,
    pub required_level: ToolLevel,
}

#[derive(Clone)]
pub struct ToolRegistry {
    tools: BTreeMap<String, ToolDefinition>,
}

impl ToolRegistry {
    pub fn new() -> Self {
        let mut tools = BTreeMap::new();
        for tool in builtins() {
            tools.insert(tool.name.clone(), tool);
        }
        Self { tools }
    }

    pub fn definitions(&self) -> Vec<ToolDefinition> {
        self.tools.values().cloned().collect()
    }

    pub fn get(&self, name: &str) -> Option<&ToolDefinition> {
        self.tools.get(name)
    }

    pub fn validate_args(&self, name: &str, args: &Value) -> anyhow::Result<()> {
        let tool = self
            .get(name)
            .ok_or_else(|| anyhow::anyhow!("unknown tool: {name}"))?;
        let required = tool
            .input_schema
            .get("required")
            .and_then(Value::as_array)
            .cloned()
            .unwrap_or_default();

        let object = args
            .as_object()
            .ok_or_else(|| anyhow::anyhow!("tool args for {name} must be an object"))?;

        for key in required {
            let key = key
                .as_str()
                .ok_or_else(|| anyhow::anyhow!("invalid required key for {name}"))?;
            if !object.contains_key(key) {
                anyhow::bail!("tool {name} missing required field {key}");
            }
        }

        Ok(())
    }
}

impl Default for ToolRegistry {
    fn default() -> Self {
        Self::new()
    }
}

fn builtins() -> Vec<ToolDefinition> {
    vec![
        ToolDefinition {
            name: "echo".to_string(),
            description: "Return the provided text payload.".to_string(),
            input_schema: serde_json::json!({
                "type": "object",
                "required": ["text"]
            }),
            is_read_only: true,
            requires_permission: false,
            required_level: ToolLevel::ReadOnly,
        },
        ToolDefinition {
            name: "Read".to_string(),
            description: "Read a file from disk.".to_string(),
            input_schema: serde_json::json!({
                "type": "object",
                "required": ["path"]
            }),
            is_read_only: true,
            requires_permission: true,
            required_level: ToolLevel::ReadOnly,
        },
        ToolDefinition {
            name: "Bash".to_string(),
            description: "Execute a shell command.".to_string(),
            input_schema: serde_json::json!({
                "type": "object",
                "required": ["command"]
            }),
            is_read_only: false,
            requires_permission: true,
            required_level: ToolLevel::ShellAccess,
        },
        ToolDefinition {
            name: "MemoryExpand".to_string(),
            description: "Expand an observation to its L1 or L2 memory tier.".to_string(),
            input_schema: serde_json::json!({
                "type": "object",
                "required": ["observationId", "tier"]
            }),
            is_read_only: true,
            requires_permission: true,
            required_level: ToolLevel::ReadOnly,
        },
    ]
}
