use serde_json::Value;

use crate::tools::ToolLevel;

#[derive(Clone, Debug, PartialEq, Eq)]
pub enum ToolPermissionMode {
    Allow,
    Ask,
    Deny,
}

#[derive(Clone, Debug, PartialEq, Eq)]
pub enum PermissionCeiling {
    ReadOnly,
    ReadWrite,
    ShellAccess,
    Admin,
}

#[derive(Clone, Debug, PartialEq, Eq)]
pub struct PermissionRule {
    pub tool_name: String,
    pub mode: ToolPermissionMode,
}

pub fn parse_permission_mode(value: &str, read_only_tool: bool) -> anyhow::Result<ToolPermissionMode> {
    match value {
        "allow" | "dontAsk" | "bypassPermissions" | "yolo" => Ok(ToolPermissionMode::Allow),
        "deny" => Ok(ToolPermissionMode::Deny),
        "ask" | "manual" | "default" => Ok(ToolPermissionMode::Ask),
        "auto-safe" | "acceptEdits" | "plan" => {
            if read_only_tool {
                Ok(ToolPermissionMode::Allow)
            } else {
                Ok(ToolPermissionMode::Ask)
            }
        }
        other => anyhow::bail!("invalid permission mode: {other}"),
    }
}

pub fn parse_permission_ceiling(value: Option<&str>) -> PermissionCeiling {
    match value.unwrap_or("admin") {
        "read_only" => PermissionCeiling::ReadOnly,
        "read_write" => PermissionCeiling::ReadWrite,
        "shell_access" => PermissionCeiling::ShellAccess,
        _ => PermissionCeiling::Admin,
    }
}

pub fn effective_permission_mode(
    session_metadata: &Value,
    tool_name: &str,
    read_only_tool: bool,
    required_level: &ToolLevel,
    persona_ceiling: &PermissionCeiling,
) -> anyhow::Result<ToolPermissionMode> {
    if exceeds_ceiling(required_level, persona_ceiling) {
        return Ok(ToolPermissionMode::Deny);
    }

    if let Some(mode) = session_metadata
        .get("permissions")
        .and_then(|permissions| permissions.get("tools"))
        .and_then(|tools| tools.get(tool_name))
        .and_then(Value::as_str)
    {
        return parse_permission_mode(mode, read_only_tool);
    }

    let default_mode = session_metadata
        .get("permissions")
        .and_then(|permissions| permissions.get("mode"))
        .and_then(Value::as_str)
        .unwrap_or("auto-safe");

    parse_permission_mode(default_mode, read_only_tool)
}

fn exceeds_ceiling(required_level: &ToolLevel, ceiling: &PermissionCeiling) -> bool {
    match (required_level, ceiling) {
        (ToolLevel::ReadOnly, _) => false,
        (ToolLevel::ReadWrite, PermissionCeiling::ReadOnly) => true,
        (ToolLevel::ReadWrite, _) => false,
        (ToolLevel::ShellAccess, PermissionCeiling::ShellAccess)
        | (ToolLevel::ShellAccess, PermissionCeiling::Admin) => false,
        (ToolLevel::ShellAccess, _) => true,
        (ToolLevel::Admin, PermissionCeiling::Admin) => false,
        (ToolLevel::Admin, _) => true,
    }
}
