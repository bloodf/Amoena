use std::str::FromStr;

use anyhow::{anyhow, Result};
use serde::{Deserialize, Serialize};
use serde_json::Value;

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum SessionType {
    Primary,
    Child,
    Team,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum SessionMode {
    Wrapper,
    Native,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum TuiType {
    ClaudeCode,
    Opencode,
    Codex,
    Gemini,
    Native,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum SessionStatus {
    Created,
    Running,
    Paused,
    Completed,
    Failed,
    Cancelled,
    Archived,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum MessageRole {
    System,
    User,
    Assistant,
    Tool,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum SettingScope {
    Global,
    PerTui,
    PerSession,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum ProviderType {
    Cloud,
    Local,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum ProviderAuthType {
    Oauth,
    Apikey,
    Env,
    AwsChain,
    None,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum AuthStatus {
    Connected,
    Disconnected,
    Expired,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum CredentialType {
    OauthToken,
    ApiKey,
    AwsProfile,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SessionRecord {
    pub id: String,
    pub parent_session_id: Option<String>,
    pub session_type: SessionType,
    pub session_mode: SessionMode,
    pub tui_type: TuiType,
    pub provider_id: Option<String>,
    pub model_id: Option<String>,
    pub working_dir: String,
    pub compaction_count: i64,
    pub context_token_count: i64,
    pub workspace_id: Option<String>,
    pub created_at: String,
    pub updated_at: String,
    pub status: SessionStatus,
    pub metadata: Value,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MessageRecord {
    pub id: String,
    pub session_id: String,
    pub role: MessageRole,
    pub content: String,
    pub attachments: Value,
    pub tool_calls: Value,
    pub tokens: i64,
    pub cost: f64,
    pub created_at: String,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SettingRecord {
    pub key: String,
    pub value: Value,
    pub scope: SettingScope,
    pub scope_ref: Option<String>,
    pub updated_at: String,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ProviderRecord {
    pub id: String,
    pub name: String,
    pub npm_package: Option<String>,
    pub provider_type: ProviderType,
    pub base_url: Option<String>,
    pub auth_type: ProviderAuthType,
    pub auth_status: AuthStatus,
    pub model_count: i64,
    pub last_refreshed_at: Option<String>,
    pub created_at: String,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ProviderModelRecord {
    pub provider_id: String,
    pub model_id: String,
    pub display_name: String,
    pub context_window: Option<i64>,
    pub input_cost_per_million: Option<f64>,
    pub output_cost_per_million: Option<f64>,
    pub supports_vision: bool,
    pub supports_tools: bool,
    pub supports_reasoning: bool,
    pub reasoning_modes: Vec<String>,
    pub reasoning_effort_supported: bool,
    pub reasoning_effort_values: Vec<String>,
    pub reasoning_token_budget_supported: bool,
    pub discovered_at: String,
    pub refreshed_at: String,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ProviderCredentialRecord {
    pub id: String,
    pub provider_id: String,
    pub credential_type: CredentialType,
    pub keychain_ref: String,
    pub expires_at: Option<String>,
    pub refresh_token_ref: Option<String>,
    pub created_at: String,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UsageAnalyticsRecord {
    pub id: String,
    pub session_id: Option<String>,
    pub provider: String,
    pub model: String,
    pub input_tokens: i64,
    pub output_tokens: i64,
    pub cost: f64,
    pub timestamp: String,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum ToolPermissionDecision {
    Allowed,
    Denied,
    AutoApproved,
    UserApproved,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ToolExecutionRecord {
    pub id: String,
    pub session_id: String,
    pub agent_id: Option<String>,
    pub tool_name: String,
    pub input: serde_json::Value,
    pub output: Option<serde_json::Value>,
    pub permission_decision: ToolPermissionDecision,
    pub duration_ms: i64,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum PendingApprovalStatus {
    Pending,
    Approved,
    Denied,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PendingApprovalRecord {
    pub id: String,
    pub session_id: String,
    pub tool_name: String,
    pub input: serde_json::Value,
    pub status: PendingApprovalStatus,
    pub created_at: String,
    pub resolved_at: Option<String>,
    pub decision_reason: Option<String>,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum AgentMode {
    Primary,
    Subagent,
    System,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum AgentLifecycleStatus {
    Created,
    Preparing,
    Active,
    Idle,
    Running,
    Paused,
    Stopped,
    Completed,
    Failed,
    Cancelled,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum TeamLifecycleStatus {
    Idle,
    Assembling,
    Active,
    Paused,
    Disbanded,
    Completed,
    Failed,
    Cancelled,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum MailboxMessageType {
    Message,
    DecisionRequest,
    DecisionResponse,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AgentProfileRecord {
    pub id: String,
    pub name: String,
    pub division: String,
    pub system_prompt: String,
    pub tool_access: Vec<String>,
    pub permission_config: serde_json::Value,
    pub collaboration_style: String,
    pub communication_preference: String,
    pub decision_weight: f64,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AgentRecord {
    pub id: String,
    pub session_id: String,
    pub parent_agent_id: Option<String>,
    pub agent_type: String,
    pub mode: AgentMode,
    pub model: String,
    pub system_prompt: Option<String>,
    pub tool_access: Vec<String>,
    pub permission_config: serde_json::Value,
    pub status: AgentLifecycleStatus,
    pub steps_limit: Option<i64>,
    pub division: Option<String>,
    pub collaboration_style: Option<String>,
    pub communication_preference: Option<String>,
    pub decision_weight: Option<f64>,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AgentTeamRecord {
    pub id: String,
    pub name: String,
    pub shared_task_list_path: Option<String>,
    pub status: TeamLifecycleStatus,
    pub division_requirements: serde_json::Value,
    pub threshold: f64,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AgentMessageRecord {
    pub id: String,
    pub team_id: String,
    pub from_agent_id: String,
    pub to_agent_id: Option<String>,
    pub content: String,
    pub message_type: MailboxMessageType,
    pub collaboration_style: String,
    pub decision_weight: f64,
    pub metadata: serde_json::Value,
    pub created_at: String,
    pub read_at: Option<String>,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum MailboxFlagStatus {
    Open,
    Resolved,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MailboxFlagRecord {
    pub id: String,
    pub message_id: String,
    pub team_id: String,
    pub session_id: String,
    pub flag_type: String,
    pub status: MailboxFlagStatus,
    pub created_at: String,
    pub resolved_at: Option<String>,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum HookHandlerType {
    Command,
    Http,
    Prompt,
    Agent,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct HookRecord {
    pub id: String,
    pub event_name: String,
    pub handler_type: HookHandlerType,
    pub handler_config: serde_json::Value,
    pub matcher_regex: Option<String>,
    pub enabled: bool,
    pub priority: i64,
    pub timeout_ms: i64,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum PluginEcosystem {
    ClaudeCode,
    Opencode,
    Lunaria,
    Custom,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum PluginHealthStatus {
    Healthy,
    Degraded,
    Error,
    Disabled,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PluginRecord {
    pub id: String,
    pub name: String,
    pub ecosystem: PluginEcosystem,
    pub version: Option<String>,
    pub description: Option<String>,
    pub source_path: String,
    pub enabled: bool,
    pub priority: i64,
    pub capabilities: Vec<String>,
    pub agent_profiles: Vec<String>,
    pub health_status: PluginHealthStatus,
    pub error_count: i64,
    pub last_error: Option<String>,
    pub last_event_at: Option<String>,
    pub latency_ms_avg: Option<i64>,
    pub division_affinity: Vec<String>,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum WorkspaceStatus {
    Active,
    Archived,
    Deleted,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum CloneType {
    Cow,
    Worktree,
    Full,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct WorkspaceRecord {
    pub id: String,
    pub project_id: String,
    pub agent_id: Option<String>,
    pub persona_name: Option<String>,
    pub clone_path: String,
    pub clone_type: CloneType,
    pub status: WorkspaceStatus,
    pub created_at: String,
    pub run_summary: serde_json::Value,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum WorkspaceMergeReviewStatus {
    Pending,
    Approved,
    Blocked,
    Applied,
    Dismissed,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum DeviceType {
    Desktop,
    Mobile,
    Tablet,
    Unknown,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum DeviceStatus {
    Active,
    Revoked,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DeviceRecord {
    pub device_id: String,
    pub name: String,
    pub device_type: DeviceType,
    pub platform: Option<String>,
    pub paired_at: String,
    pub last_seen: String,
    pub refresh_token_hash: String,
    pub token_family_id: String,
    pub scopes: Vec<String>,
    pub status: DeviceStatus,
    pub metadata: serde_json::Value,
    pub revoked_at: Option<String>,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct WorkspaceMergeReviewRecord {
    pub id: String,
    pub workspace_id: String,
    pub source_branch: String,
    pub target_branch: String,
    pub changed_files: i64,
    pub conflicts: i64,
    pub summary: String,
    pub files: serde_json::Value,
    pub status: WorkspaceMergeReviewStatus,
    pub contributing_agents: serde_json::Value,
    pub team_consensus_score: f64,
    pub flagged_decisions: serde_json::Value,
    pub acknowledged_decisions: serde_json::Value,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum ObservationCategory {
    Profile,
    Preference,
    Entity,
    Pattern,
    ToolUsage,
    Skill,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ObservationRecord {
    pub id: String,
    pub session_id: String,
    pub uri: String,
    pub parent_uri: String,
    pub observation_type: String,
    pub category: ObservationCategory,
    pub title: String,
    pub subtitle: Option<String>,
    pub facts: Vec<String>,
    pub narrative: Option<String>,
    pub concepts: Vec<String>,
    pub files_read: Vec<String>,
    pub files_modified: Vec<String>,
    pub content_hash: String,
    pub prompt_number: i64,
    pub discovery_tokens: i64,
    pub created_at: String,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MemoryTierRecord {
    pub observation_id: String,
    pub l0_summary: String,
    pub l1_summary: String,
    pub l2_content: String,
    pub l0_tokens: i64,
    pub l1_tokens: i64,
    pub l2_tokens: i64,
    pub generated_at: String,
    pub model: String,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SessionSummaryRecord {
    pub session_id: String,
    pub request: String,
    pub investigated: Vec<String>,
    pub learned: Vec<String>,
    pub completed: Vec<String>,
    pub next_steps: Vec<String>,
    pub files_read: Vec<String>,
    pub files_edited: Vec<String>,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ObservationEmbeddingRecord {
    pub observation_id: String,
    pub vector: Vec<f32>,
    pub model: String,
}

impl Default for SessionType {
    fn default() -> Self {
        Self::Primary
    }
}

impl Default for SessionMode {
    fn default() -> Self {
        Self::Wrapper
    }
}

impl Default for SessionStatus {
    fn default() -> Self {
        Self::Created
    }
}

macro_rules! impl_string_enum {
    ($enum_name:ident { $($value:expr => $variant:ident),+ $(,)? }) => {
        impl $enum_name {
            pub fn as_str(&self) -> &'static str {
                match self {
                    $(Self::$variant => $value),+
                }
            }
        }

        impl FromStr for $enum_name {
            type Err = anyhow::Error;

            fn from_str(value: &str) -> Result<Self> {
                match value {
                    $($value => Ok(Self::$variant)),+,
                    _ => Err(anyhow!(concat!("invalid ", stringify!($enum_name), " value: {}"), value)),
                }
            }
        }
    };
}

impl_string_enum!(SessionType {
    "primary" => Primary,
    "child" => Child,
    "team" => Team
});

impl_string_enum!(SessionMode {
    "wrapper" => Wrapper,
    "native" => Native
});

impl_string_enum!(TuiType {
    "claude-code" => ClaudeCode,
    "opencode" => Opencode,
    "codex" => Codex,
    "gemini" => Gemini,
    "native" => Native
});

impl_string_enum!(SessionStatus {
    "created" => Created,
    "running" => Running,
    "paused" => Paused,
    "completed" => Completed,
    "failed" => Failed,
    "cancelled" => Cancelled,
    "archived" => Archived
});

impl_string_enum!(MessageRole {
    "system" => System,
    "user" => User,
    "assistant" => Assistant,
    "tool" => Tool
});

impl_string_enum!(SettingScope {
    "global" => Global,
    "per-tui" => PerTui,
    "per-session" => PerSession
});

impl_string_enum!(ProviderType {
    "cloud" => Cloud,
    "local" => Local
});

impl_string_enum!(ProviderAuthType {
    "oauth" => Oauth,
    "apikey" => Apikey,
    "env" => Env,
    "aws_chain" => AwsChain,
    "none" => None
});

impl_string_enum!(AuthStatus {
    "connected" => Connected,
    "disconnected" => Disconnected,
    "expired" => Expired
});

impl_string_enum!(CredentialType {
    "oauth_token" => OauthToken,
    "api_key" => ApiKey,
    "aws_profile" => AwsProfile
});

impl_string_enum!(ToolPermissionDecision {
    "allowed" => Allowed,
    "denied" => Denied,
    "auto_approved" => AutoApproved,
    "user_approved" => UserApproved
});

impl_string_enum!(PendingApprovalStatus {
    "pending" => Pending,
    "approved" => Approved,
    "denied" => Denied
});

impl_string_enum!(AgentMode {
    "primary" => Primary,
    "subagent" => Subagent,
    "system" => System
});

impl_string_enum!(AgentLifecycleStatus {
    "created" => Created,
    "preparing" => Preparing,
    "active" => Active,
    "idle" => Idle,
    "running" => Running,
    "paused" => Paused,
    "stopped" => Stopped,
    "completed" => Completed,
    "failed" => Failed,
    "cancelled" => Cancelled
});

impl_string_enum!(TeamLifecycleStatus {
    "idle" => Idle,
    "assembling" => Assembling,
    "active" => Active,
    "paused" => Paused,
    "disbanded" => Disbanded,
    "completed" => Completed,
    "failed" => Failed,
    "cancelled" => Cancelled
});

impl_string_enum!(MailboxMessageType {
    "message" => Message,
    "decision_request" => DecisionRequest,
    "decision_response" => DecisionResponse
});

impl_string_enum!(MailboxFlagStatus {
    "open" => Open,
    "resolved" => Resolved
});

impl_string_enum!(HookHandlerType {
    "command" => Command,
    "http" => Http,
    "prompt" => Prompt,
    "agent" => Agent
});

impl_string_enum!(PluginEcosystem {
    "claude-code" => ClaudeCode,
    "opencode" => Opencode,
    "lunaria" => Lunaria,
    "custom" => Custom
});

impl_string_enum!(PluginHealthStatus {
    "healthy" => Healthy,
    "degraded" => Degraded,
    "error" => Error,
    "disabled" => Disabled
});

impl_string_enum!(WorkspaceStatus {
    "active" => Active,
    "archived" => Archived,
    "deleted" => Deleted
});

impl_string_enum!(CloneType {
    "cow" => Cow,
    "worktree" => Worktree,
    "full" => Full
});

impl_string_enum!(WorkspaceMergeReviewStatus {
    "pending" => Pending,
    "approved" => Approved,
    "blocked" => Blocked,
    "applied" => Applied,
    "dismissed" => Dismissed
});

impl_string_enum!(DeviceType {
    "desktop" => Desktop,
    "mobile" => Mobile,
    "tablet" => Tablet,
    "unknown" => Unknown
});

impl_string_enum!(DeviceStatus {
    "active" => Active,
    "revoked" => Revoked
});

impl_string_enum!(ObservationCategory {
    "profile" => Profile,
    "preference" => Preference,
    "entity" => Entity,
    "pattern" => Pattern,
    "tool_usage" => ToolUsage,
    "skill" => Skill
});

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum QueueType {
    App,
    Cli,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum QueueMessageStatus {
    Pending,
    Processing,
    Sent,
    Cancelled,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct QueueMessageRecord {
    pub id: String,
    pub session_id: String,
    pub content: String,
    pub queue_type: QueueType,
    pub status: QueueMessageStatus,
    pub order_index: i64,
    pub created_at: String,
    pub updated_at: String,
}

impl_string_enum!(QueueType {
    "app" => App,
    "cli" => Cli
});

impl_string_enum!(QueueMessageStatus {
    "pending" => Pending,
    "processing" => Processing,
    "sent" => Sent,
    "cancelled" => Cancelled
});

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum TaskStatus {
    Pending,
    InProgress,
    Completed,
    Blocked,
    Cancelled,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TaskRecord {
    pub id: String,
    pub session_id: String,
    pub agent_id: Option<String>,
    pub title: String,
    pub description: Option<String>,
    pub status: TaskStatus,
    pub priority: i64,
    pub order_index: i64,
    pub parent_task_id: Option<String>,
    pub created_at: String,
    pub updated_at: String,
}

impl_string_enum!(TaskStatus {
    "pending" => Pending,
    "in_progress" => InProgress,
    "completed" => Completed,
    "blocked" => Blocked,
    "cancelled" => Cancelled
});
