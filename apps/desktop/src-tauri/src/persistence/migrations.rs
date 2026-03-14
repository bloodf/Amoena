use anyhow::{Context, Result};
use rusqlite::{params, Connection};
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};

use crate::persistence::repositories::clock::utc_now;

#[derive(Clone, Debug)]
pub struct Migration {
    pub version: i64,
    pub description: &'static str,
    pub sql: &'static str,
}

#[derive(Clone, Debug, Serialize, Deserialize, PartialEq, Eq)]
pub struct MigrationRecord {
    pub version: i64,
    pub description: String,
    pub applied_at: String,
    pub checksum: String,
}

pub const MIGRATIONS: &[Migration] = &[Migration {
    version: 1,
    description: "bootstrap runtime foundation tables",
    sql: r#"
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  parent_session_id TEXT,
  session_type TEXT NOT NULL DEFAULT 'primary'
    CHECK (session_type IN ('primary', 'child', 'team')),
  session_mode TEXT NOT NULL DEFAULT 'wrapper'
    CHECK (session_mode IN ('wrapper', 'native')),
  tui_type TEXT NOT NULL CHECK (tui_type IN ('claude-code', 'opencode', 'codex', 'gemini', 'native')),
  provider_id TEXT,
  model_id TEXT,
  working_dir TEXT NOT NULL,
  compaction_count INTEGER NOT NULL DEFAULT 0,
  context_token_count INTEGER NOT NULL DEFAULT 0,
  workspace_id TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('created', 'running', 'paused', 'completed', 'failed', 'cancelled', 'archived')),
  metadata TEXT NOT NULL DEFAULT '{}',
  FOREIGN KEY (parent_session_id) REFERENCES sessions(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('system', 'user', 'assistant', 'tool')),
  content TEXT NOT NULL,
  attachments TEXT NOT NULL DEFAULT '[]',
  tool_calls TEXT NOT NULL DEFAULT '[]',
  tokens INTEGER NOT NULL DEFAULT 0 CHECK (tokens >= 0),
  cost REAL NOT NULL DEFAULT 0 CHECK (cost >= 0),
  created_at TEXT NOT NULL,
  FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS settings (
  key TEXT NOT NULL,
  value TEXT NOT NULL,
  scope TEXT NOT NULL CHECK (scope IN ('global', 'per-tui', 'per-session')),
  scope_ref TEXT,
  updated_at TEXT NOT NULL,
  PRIMARY KEY (key, scope, scope_ref)
);

CREATE INDEX IF NOT EXISTS idx_sessions_status ON sessions(status);
CREATE INDEX IF NOT EXISTS idx_sessions_tui_type ON sessions(tui_type);
CREATE INDEX IF NOT EXISTS idx_sessions_working_dir ON sessions(working_dir);
CREATE INDEX IF NOT EXISTS idx_sessions_updated_at ON sessions(updated_at);
CREATE INDEX IF NOT EXISTS idx_messages_session_created ON messages(session_id, created_at);
CREATE INDEX IF NOT EXISTS idx_messages_role ON messages(role);
CREATE INDEX IF NOT EXISTS idx_settings_scope ON settings(scope, scope_ref);
"#,
},
Migration {
    version: 2,
    description: "add provider registry tables",
    sql: r#"
CREATE TABLE IF NOT EXISTS providers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  npm_package TEXT,
  provider_type TEXT NOT NULL DEFAULT 'cloud'
    CHECK (provider_type IN ('cloud', 'local')),
  base_url TEXT,
  auth_type TEXT NOT NULL CHECK (auth_type IN ('oauth', 'apikey', 'env', 'aws_chain', 'none')),
  auth_status TEXT NOT NULL DEFAULT 'disconnected'
    CHECK (auth_status IN ('connected', 'disconnected', 'expired')),
  model_count INTEGER NOT NULL DEFAULT 0,
  last_refreshed_at TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS provider_models (
  provider_id TEXT NOT NULL,
  model_id TEXT NOT NULL,
  display_name TEXT NOT NULL,
  context_window INTEGER,
  input_cost_per_million REAL,
  output_cost_per_million REAL,
  supports_vision INTEGER NOT NULL DEFAULT 0,
  supports_tools INTEGER NOT NULL DEFAULT 0,
  supports_reasoning INTEGER NOT NULL DEFAULT 0,
  reasoning_modes TEXT NOT NULL DEFAULT '["off"]',
  reasoning_effort_supported INTEGER NOT NULL DEFAULT 0,
  reasoning_effort_values TEXT NOT NULL DEFAULT '[]',
  reasoning_token_budget_supported INTEGER NOT NULL DEFAULT 0,
  discovered_at TEXT NOT NULL,
  refreshed_at TEXT NOT NULL,
  PRIMARY KEY (provider_id, model_id),
  FOREIGN KEY (provider_id) REFERENCES providers(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS provider_credentials (
  id TEXT PRIMARY KEY,
  provider_id TEXT NOT NULL,
  credential_type TEXT NOT NULL
    CHECK (credential_type IN ('oauth_token', 'api_key', 'aws_profile')),
  keychain_ref TEXT NOT NULL,
  expires_at TEXT,
  refresh_token_ref TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (provider_id) REFERENCES providers(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_providers_auth_status ON providers(auth_status);
CREATE INDEX IF NOT EXISTS idx_providers_npm_package ON providers(npm_package) WHERE npm_package IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_provider_models_provider_id ON provider_models(provider_id);
CREATE INDEX IF NOT EXISTS idx_provider_models_reasoning ON provider_models(supports_reasoning);
CREATE INDEX IF NOT EXISTS idx_provider_credentials_provider_id ON provider_credentials(provider_id);
CREATE INDEX IF NOT EXISTS idx_provider_credentials_expires_at ON provider_credentials(expires_at) WHERE expires_at IS NOT NULL;
"#,
},
Migration {
    version: 3,
    description: "add usage analytics table",
    sql: r#"
CREATE TABLE IF NOT EXISTS usage_analytics (
  id TEXT PRIMARY KEY,
  session_id TEXT,
  provider TEXT NOT NULL,
  model TEXT NOT NULL,
  input_tokens INTEGER NOT NULL DEFAULT 0 CHECK (input_tokens >= 0),
  output_tokens INTEGER NOT NULL DEFAULT 0 CHECK (output_tokens >= 0),
  cost REAL NOT NULL DEFAULT 0 CHECK (cost >= 0),
  timestamp TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_usage_analytics_timestamp ON usage_analytics(timestamp);
CREATE INDEX IF NOT EXISTS idx_usage_analytics_provider_model ON usage_analytics(provider, model);
CREATE INDEX IF NOT EXISTS idx_usage_analytics_session_id ON usage_analytics(session_id);
"#,
},
Migration {
    version: 4,
    description: "add tool execution audit and pending approvals",
    sql: r#"
CREATE TABLE IF NOT EXISTS tool_executions (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  agent_id TEXT,
  tool_name TEXT NOT NULL,
  input TEXT NOT NULL DEFAULT '{}',
  output TEXT,
  permission_decision TEXT NOT NULL DEFAULT 'allowed'
    CHECK (permission_decision IN ('allowed', 'denied', 'auto_approved', 'user_approved')),
  duration_ms INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS pending_approvals (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  tool_name TEXT NOT NULL,
  input TEXT NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'denied')),
  created_at TEXT NOT NULL,
  resolved_at TEXT,
  decision_reason TEXT,
  FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_tool_executions_session_id ON tool_executions(session_id);
CREATE INDEX IF NOT EXISTS idx_tool_executions_tool_name ON tool_executions(tool_name);
CREATE INDEX IF NOT EXISTS idx_pending_approvals_session_id ON pending_approvals(session_id);
CREATE INDEX IF NOT EXISTS idx_pending_approvals_status ON pending_approvals(status);
"#,
},
Migration {
    version: 5,
    description: "add agent orchestration tables",
    sql: r#"
CREATE TABLE IF NOT EXISTS agent_profiles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  division TEXT,
  system_prompt TEXT NOT NULL,
  tool_access TEXT NOT NULL DEFAULT '[]',
  permission_config TEXT NOT NULL DEFAULT '{}',
  collaboration_style TEXT NOT NULL DEFAULT 'cooperative',
  communication_preference TEXT NOT NULL DEFAULT 'concise',
  decision_weight REAL NOT NULL DEFAULT 0.5,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS agents (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  parent_agent_id TEXT,
  type TEXT NOT NULL,
  mode TEXT NOT NULL CHECK (mode IN ('primary', 'subagent', 'system')),
  model TEXT NOT NULL,
  system_prompt TEXT,
  tool_access TEXT NOT NULL DEFAULT '[]',
  permission_config TEXT NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'created'
    CHECK (status IN ('created', 'preparing', 'active', 'idle', 'running', 'paused', 'stopped', 'completed', 'failed', 'cancelled')),
  steps_limit INTEGER,
  division TEXT,
  collaboration_style TEXT,
  communication_preference TEXT,
  decision_weight REAL,
  FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE,
  FOREIGN KEY (parent_agent_id) REFERENCES agents(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS agent_teams (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  shared_task_list_path TEXT,
  status TEXT NOT NULL DEFAULT 'idle'
    CHECK (status IN ('idle', 'assembling', 'active', 'paused', 'disbanded', 'completed', 'failed', 'cancelled')),
  division_requirements TEXT NOT NULL DEFAULT '{}',
  threshold REAL NOT NULL DEFAULT 0.6
);

CREATE TABLE IF NOT EXISTS agent_messages (
  id TEXT PRIMARY KEY,
  team_id TEXT NOT NULL,
  from_agent_id TEXT NOT NULL,
  to_agent_id TEXT,
  content TEXT NOT NULL,
  message_type TEXT NOT NULL DEFAULT 'message'
    CHECK (message_type IN ('message', 'decision_request', 'decision_response')),
  collaboration_style TEXT NOT NULL DEFAULT 'cooperative',
  decision_weight REAL NOT NULL DEFAULT 0.5,
  metadata TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL,
  read_at TEXT,
  FOREIGN KEY (team_id) REFERENCES agent_teams(id) ON DELETE CASCADE,
  FOREIGN KEY (from_agent_id) REFERENCES agents(id) ON DELETE CASCADE,
  FOREIGN KEY (to_agent_id) REFERENCES agents(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS mailbox_flags (
  id TEXT PRIMARY KEY,
  message_id TEXT NOT NULL,
  team_id TEXT NOT NULL,
  session_id TEXT NOT NULL,
  flag_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open'
    CHECK (status IN ('open', 'resolved')),
  created_at TEXT NOT NULL,
  resolved_at TEXT,
  FOREIGN KEY (message_id) REFERENCES agent_messages(id) ON DELETE CASCADE,
  FOREIGN KEY (team_id) REFERENCES agent_teams(id) ON DELETE CASCADE,
  FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_agents_session_id ON agents(session_id);
CREATE INDEX IF NOT EXISTS idx_agents_parent_agent_id ON agents(parent_agent_id);
CREATE INDEX IF NOT EXISTS idx_agents_status ON agents(status);
CREATE INDEX IF NOT EXISTS idx_agents_mode ON agents(mode);
CREATE INDEX IF NOT EXISTS idx_agent_teams_status ON agent_teams(status);
CREATE INDEX IF NOT EXISTS idx_agent_messages_team_id ON agent_messages(team_id);
CREATE INDEX IF NOT EXISTS idx_agent_messages_from_agent_id ON agent_messages(from_agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_messages_to_agent_id ON agent_messages(to_agent_id);
CREATE INDEX IF NOT EXISTS idx_mailbox_flags_team_id ON mailbox_flags(team_id);
CREATE INDEX IF NOT EXISTS idx_mailbox_flags_session_id ON mailbox_flags(session_id);
"#,
},
Migration {
    version: 6,
    description: "add hooks table",
    sql: r#"
CREATE TABLE IF NOT EXISTS hooks (
  id TEXT PRIMARY KEY,
  event_name TEXT NOT NULL,
  handler_type TEXT NOT NULL
    CHECK (handler_type IN ('command', 'http', 'prompt', 'agent')),
  handler_config TEXT NOT NULL DEFAULT '{}',
  matcher_regex TEXT,
  enabled INTEGER NOT NULL DEFAULT 1,
  priority INTEGER NOT NULL DEFAULT 100,
  timeout_ms INTEGER NOT NULL DEFAULT 30000
);

CREATE INDEX IF NOT EXISTS idx_hooks_event_name ON hooks(event_name);
CREATE INDEX IF NOT EXISTS idx_hooks_enabled_priority ON hooks(enabled, priority);
"#,
},
Migration {
    version: 7,
    description: "add plugin registry table",
    sql: r#"
CREATE TABLE IF NOT EXISTS plugins (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  ecosystem TEXT NOT NULL
    CHECK (ecosystem IN ('claude-code', 'opencode', 'lunaria', 'custom')),
  version TEXT,
  description TEXT,
  source_path TEXT NOT NULL,
  enabled INTEGER NOT NULL DEFAULT 1,
  priority INTEGER NOT NULL DEFAULT 100,
  capabilities TEXT NOT NULL DEFAULT '[]',
  agent_profiles TEXT NOT NULL DEFAULT '[]',
  health_status TEXT NOT NULL DEFAULT 'healthy'
    CHECK (health_status IN ('healthy', 'degraded', 'error', 'disabled')),
  error_count INTEGER NOT NULL DEFAULT 0,
  last_error TEXT,
  last_event_at TEXT,
  latency_ms_avg INTEGER,
  division_affinity TEXT NOT NULL DEFAULT '[\"*\"]',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_plugins_ecosystem ON plugins(ecosystem);
CREATE INDEX IF NOT EXISTS idx_plugins_health_status ON plugins(health_status);
"#,
},
Migration {
    version: 8,
    description: "add observations memory tables and fts",
    sql: r#"
CREATE TABLE IF NOT EXISTS observations (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  uri TEXT NOT NULL,
  parent_uri TEXT NOT NULL,
  type TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'entity'
    CHECK (category IN ('profile', 'preference', 'entity', 'pattern', 'tool_usage', 'skill')),
  title TEXT NOT NULL,
  subtitle TEXT,
  facts TEXT NOT NULL DEFAULT '[]',
  narrative TEXT,
  concepts TEXT NOT NULL DEFAULT '[]',
  files_read TEXT NOT NULL DEFAULT '[]',
  files_modified TEXT NOT NULL DEFAULT '[]',
  content_hash TEXT NOT NULL,
  prompt_number INTEGER NOT NULL DEFAULT 0,
  discovery_tokens INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS memory_tiers (
  observation_id TEXT PRIMARY KEY,
  l0_summary TEXT NOT NULL,
  l1_summary TEXT NOT NULL,
  l2_content TEXT NOT NULL,
  l0_tokens INTEGER NOT NULL,
  l1_tokens INTEGER NOT NULL,
  l2_tokens INTEGER NOT NULL,
  generated_at TEXT NOT NULL,
  model TEXT NOT NULL,
  FOREIGN KEY (observation_id) REFERENCES observations(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS session_summaries (
  session_id TEXT PRIMARY KEY,
  request TEXT NOT NULL,
  investigated TEXT NOT NULL DEFAULT '[]',
  learned TEXT NOT NULL DEFAULT '[]',
  completed TEXT NOT NULL DEFAULT '[]',
  next_steps TEXT NOT NULL DEFAULT '[]',
  files_read TEXT NOT NULL DEFAULT '[]',
  files_edited TEXT NOT NULL DEFAULT '[]',
  FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
);

CREATE VIRTUAL TABLE IF NOT EXISTS observations_fts USING fts5(
  title,
  subtitle,
  narrative,
  facts,
  concepts,
  content='observations',
  content_rowid='rowid',
  tokenize='porter unicode61 remove_diacritics 2'
);

CREATE TRIGGER IF NOT EXISTS observations_fts_insert AFTER INSERT ON observations BEGIN
  INSERT INTO observations_fts(rowid, title, subtitle, narrative, facts, concepts)
  VALUES (new.rowid, new.title, new.subtitle, new.narrative, new.facts, new.concepts);
END;

CREATE TRIGGER IF NOT EXISTS observations_fts_delete AFTER DELETE ON observations BEGIN
  INSERT INTO observations_fts(observations_fts, rowid, title, subtitle, narrative, facts, concepts)
  VALUES ('delete', old.rowid, old.title, old.subtitle, old.narrative, old.facts, old.concepts);
END;

CREATE TRIGGER IF NOT EXISTS observations_fts_update AFTER UPDATE ON observations BEGIN
  INSERT INTO observations_fts(observations_fts, rowid, title, subtitle, narrative, facts, concepts)
  VALUES ('delete', old.rowid, old.title, old.subtitle, old.narrative, old.facts, old.concepts);
  INSERT INTO observations_fts(rowid, title, subtitle, narrative, facts, concepts)
  VALUES (new.rowid, new.title, new.subtitle, new.narrative, new.facts, new.concepts);
END;

CREATE INDEX IF NOT EXISTS idx_observations_session_id ON observations(session_id, created_at);
CREATE INDEX IF NOT EXISTS idx_observations_type ON observations(type);
CREATE INDEX IF NOT EXISTS idx_observations_content_hash ON observations(content_hash);
"#,
},
Migration {
    version: 9,
    description: "add observation embeddings table",
    sql: r#"
CREATE TABLE IF NOT EXISTS observation_embeddings (
  observation_id TEXT PRIMARY KEY,
  embedding TEXT NOT NULL,
  model TEXT NOT NULL,
  FOREIGN KEY (observation_id) REFERENCES observations(id) ON DELETE CASCADE
);
"#,
},
Migration {
    version: 10,
    description: "add workspaces table",
    sql: r#"
CREATE TABLE IF NOT EXISTS workspaces (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  agent_id TEXT,
  persona_name TEXT,
  clone_path TEXT NOT NULL,
  clone_type TEXT NOT NULL CHECK (clone_type IN ('cow', 'worktree', 'full')),
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'archived', 'deleted')),
  created_at TEXT NOT NULL,
  run_summary TEXT NOT NULL DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_workspaces_project_id ON workspaces(project_id);
CREATE INDEX IF NOT EXISTS idx_workspaces_agent_id ON workspaces(agent_id);
CREATE INDEX IF NOT EXISTS idx_workspaces_status ON workspaces(status);
"#,
},
Migration {
    version: 11,
    description: "add workspace merge reviews table",
    sql: r#"
CREATE TABLE IF NOT EXISTS workspace_merge_reviews (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  source_branch TEXT NOT NULL,
  target_branch TEXT NOT NULL,
  changed_files INTEGER NOT NULL DEFAULT 0,
  conflicts INTEGER NOT NULL DEFAULT 0,
  summary TEXT NOT NULL,
  files TEXT NOT NULL DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'blocked', 'applied', 'dismissed')),
  contributing_agents TEXT NOT NULL DEFAULT '[]',
  team_consensus_score REAL NOT NULL DEFAULT 0.0,
  flagged_decisions TEXT NOT NULL DEFAULT '[]',
  acknowledged_decisions TEXT NOT NULL DEFAULT '[]',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_workspace_merge_reviews_workspace_id ON workspace_merge_reviews(workspace_id);
CREATE INDEX IF NOT EXISTS idx_workspace_merge_reviews_status ON workspace_merge_reviews(status);
"#,
},
Migration {
    version: 12,
    description: "add remote device registry",
    sql: r#"
CREATE TABLE IF NOT EXISTS device_registry (
  device_id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  device_type TEXT NOT NULL DEFAULT 'unknown'
    CHECK (device_type IN ('desktop', 'mobile', 'tablet', 'unknown')),
  platform TEXT,
  paired_at TEXT NOT NULL,
  last_seen TEXT NOT NULL,
  refresh_token_hash TEXT NOT NULL,
  token_family_id TEXT NOT NULL,
  scopes TEXT NOT NULL DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'revoked')),
  metadata TEXT NOT NULL DEFAULT '{}',
  revoked_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_device_registry_status ON device_registry(status);
CREATE INDEX IF NOT EXISTS idx_device_registry_last_seen ON device_registry(last_seen);
CREATE INDEX IF NOT EXISTS idx_device_registry_token_family ON device_registry(token_family_id);
"#,
},
Migration {
    version: 13,
    description: "add message queue table",
    sql: r#"
CREATE TABLE IF NOT EXISTS message_queue (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL,
    content TEXT NOT NULL,
    queue_type TEXT NOT NULL CHECK(queue_type IN ('app', 'cli')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'processing', 'sent', 'cancelled')),
    order_index INTEGER NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_message_queue_session_id ON message_queue(session_id, order_index);
CREATE INDEX IF NOT EXISTS idx_message_queue_status ON message_queue(status);
"#,
},
Migration {
    version: 14,
    description: "add tasks table",
    sql: r#"
CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL,
    agent_id TEXT,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'in_progress', 'completed', 'blocked', 'cancelled')),
    priority INTEGER NOT NULL DEFAULT 0,
    order_index INTEGER NOT NULL DEFAULT 0,
    parent_task_id TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_task_id) REFERENCES tasks(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_tasks_session_id ON tasks(session_id, order_index);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_parent_task_id ON tasks(parent_task_id);
"#,
}];

pub fn apply_migrations(connection: &mut Connection) -> Result<Vec<MigrationRecord>> {
    ensure_migration_table(connection)?;
    let applied_versions = applied_migrations(connection)?
        .into_iter()
        .map(|record| record.version)
        .collect::<std::collections::BTreeSet<_>>();

    for migration in MIGRATIONS {
        if applied_versions.contains(&migration.version) {
            continue;
        }

        let checksum = checksum(migration.sql);
        let applied_at = utc_now();
        let transaction = connection
            .transaction()
            .with_context(|| format!("failed to start migration {}", migration.version))?;

        transaction
            .execute_batch(migration.sql)
            .with_context(|| format!("failed to apply migration {}", migration.version))?;
        transaction
            .execute(
                "INSERT INTO schema_migrations (version, description, applied_at, checksum) VALUES (?1, ?2, ?3, ?4)",
                params![migration.version, migration.description, applied_at, checksum],
            )
            .with_context(|| format!("failed to record migration {}", migration.version))?;
        transaction
            .commit()
            .with_context(|| format!("failed to commit migration {}", migration.version))?;
    }

    applied_migrations(connection)
}

pub fn applied_migrations(connection: &Connection) -> Result<Vec<MigrationRecord>> {
    ensure_migration_table(connection)?;

    let mut statement = connection
        .prepare(
            "SELECT version, description, applied_at, checksum FROM schema_migrations ORDER BY version ASC",
        )
        .context("failed to prepare schema_migrations query")?;

    let records = statement
        .query_map([], |row| {
            Ok(MigrationRecord {
                version: row.get(0)?,
                description: row.get(1)?,
                applied_at: row.get(2)?,
                checksum: row.get(3)?,
            })
        })
        .context("failed to query schema_migrations")?
        .collect::<rusqlite::Result<Vec<_>>>()
        .context("failed to collect migration rows")?;

    Ok(records)
}

fn ensure_migration_table(connection: &Connection) -> Result<()> {
    connection
        .execute_batch(
            r#"
CREATE TABLE IF NOT EXISTS schema_migrations (
  version INTEGER PRIMARY KEY,
  description TEXT NOT NULL,
  applied_at TEXT NOT NULL,
  checksum TEXT NOT NULL
);
"#,
        )
        .context("failed to create schema_migrations table")?;

    Ok(())
}

fn checksum(sql: &str) -> String {
    format!("{:x}", Sha256::digest(sql.as_bytes()))
}
