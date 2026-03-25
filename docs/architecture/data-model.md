# Data Model Specification

## Overview

Amoena uses a hybrid persistence model:
- SQLite stores relational and time-series operational data (sessions, messages, usage, devices, notifications, grouping, providers, agents, observations, tools, hooks, workspaces, and autopilot state).
- JSON files store user-editable configuration, extension metadata, provider auth configs, and agent definitions.
- TypeScript interfaces define the canonical contracts shared by the desktop UI, Rust/Tauri bridge payloads, adapters, plugins, and the paired mobile client.

This design aligns with Tauri SQL plugin patterns (`@tauri-apps/plugin-sql` / `tauri-plugin-sql`) and keeps schema evolution deterministic through sequential integer migrations.

## SQLite Schema

### Storage and integrity pragmas

```sql
PRAGMA foreign_keys = ON;
PRAGMA journal_mode = WAL;
PRAGMA synchronous = NORMAL;
PRAGMA busy_timeout = 5000;
PRAGMA auto_vacuum = INCREMENTAL;
```

### Write Contention Strategy

SQLite in WAL mode allows concurrent readers but only one writer at a time. To prevent write contention in the Rust backend:

- **Single writer channel**: All write operations are routed through a dedicated async channel/queue in the Rust backend (Session Manager, TUI Manager). No concurrent writers contend directly on the database connection.
- **`busy_timeout` pragma**: Set to 5000ms (5 seconds). If a write cannot acquire the lock within this window, SQLite returns `SQLITE_BUSY` rather than failing immediately. This handles transient contention gracefully.
- **Batch message inserts**: During high-throughput streaming (e.g., Opus model output via OpenCode SSE at ~25MB/min), incoming message chunks are buffered and inserted in batches rather than per-chunk writes. Recommended batch size: 10 messages or 500ms, whichever comes first.
- **`auto_vacuum = INCREMENTAL`**: Reclaims deleted page space incrementally during write transactions rather than requiring manual `VACUUM` calls. Combined with the weekly `VACUUM`/`ANALYZE` job, this keeps file size bounded without blocking the app.

### Data Retention

Unbounded message storage growth is a known risk. Expected storage: ~1KB/message. At 1000 messages/day, that is ~30MB/month or ~360MB/year. The following retention policies are applied:

- **Message archival**: Messages older than 90 days are moved to a `messages_archive` table (same schema as `messages`). Archived messages remain queryable but are excluded from the active FTS index and hot cache.
- **Session purge**: Sessions with no activity for 180 days are eligible for purge. Purge requires explicit user confirmation and removes the session row, cascading to `messages`, `session_group_membership`, and related records. Archived messages for purged sessions are also removed.
- **`auto_vacuum = INCREMENTAL`**: Reclaims space freed by deletions without a full `VACUUM`. The weekly cleanup job runs `PRAGMA incremental_vacuum` to complete any pending reclamation.
- **Retention configuration**: The `retentionDays` field in `GlobalConfig` controls analytics/log retention. A separate `messageRetentionDays` setting (default: 90) controls message archival threshold.

```sql
-- Archive table for messages older than 90 days
CREATE TABLE IF NOT EXISTS messages_archive (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('system', 'user', 'assistant', 'tool')),
  content TEXT NOT NULL,
  tool_calls TEXT NOT NULL DEFAULT '[]',
  tokens INTEGER NOT NULL DEFAULT 0 CHECK (tokens >= 0),
  cost REAL NOT NULL DEFAULT 0 CHECK (cost >= 0),
  created_at TEXT NOT NULL,
  archived_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_messages_archive_session ON messages_archive(session_id, created_at);
```

### Table: sessions

```sql
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
  FOREIGN KEY (parent_session_id) REFERENCES sessions(id) ON DELETE SET NULL,
  FOREIGN KEY (provider_id) REFERENCES providers(id) ON DELETE SET NULL,
  FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE SET NULL
);
```

### Table: messages

```sql
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
```

### Table: usage_analytics

```sql
CREATE TABLE IF NOT EXISTS usage_analytics (
  id TEXT PRIMARY KEY,
  session_id TEXT,
  provider TEXT NOT NULL,
  model TEXT NOT NULL,
  input_tokens INTEGER NOT NULL DEFAULT 0 CHECK (input_tokens >= 0),
  output_tokens INTEGER NOT NULL DEFAULT 0 CHECK (output_tokens >= 0),
  cost REAL NOT NULL DEFAULT 0 CHECK (cost >= 0),
  timestamp TEXT NOT NULL,
  FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE SET NULL
);
```

### Table: settings

```sql
CREATE TABLE IF NOT EXISTS settings (
  key TEXT NOT NULL,
  value TEXT NOT NULL,
  scope TEXT NOT NULL CHECK (scope IN ('global', 'per-tui', 'per-session')),
  scope_ref TEXT,
  updated_at TEXT NOT NULL,
  PRIMARY KEY (key, scope, scope_ref)
);
```

### Table: plugins

Registry of discovered plugins from all ecosystems. Each plugin can be individually enabled/disabled, and ecosystem-level toggles control groups.

```sql
CREATE TABLE IF NOT EXISTS plugins (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  ecosystem TEXT NOT NULL
    CHECK (ecosystem IN ('claude-code', 'opencode', 'amoena', 'custom')),
  version TEXT,
  description TEXT,
  source_path TEXT NOT NULL,        -- filesystem path where plugin was discovered
  enabled INTEGER NOT NULL DEFAULT 1,
  priority INTEGER NOT NULL DEFAULT 100,  -- execution order (lower = first)
  capabilities TEXT NOT NULL DEFAULT '[]', -- JSON array: ['hooks', 'agents', 'tools', 'mcp', 'ui']
  agent_profiles TEXT NOT NULL DEFAULT '[]', -- JSON array of agent profile IDs contributed by this plugin
  health_status TEXT NOT NULL DEFAULT 'healthy'
    CHECK (health_status IN ('healthy', 'degraded', 'error', 'disabled')),
  error_count INTEGER NOT NULL DEFAULT 0,
  last_error TEXT,
  last_event_at TEXT,
  latency_ms_avg INTEGER,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
```

### Table: agent_profiles

Aggregated agent profiles from all sources (built-in, Claude Code, OpenCode, oh-my-claudecode, oh-my-opencode, custom). These are the tab-switchable agents visible in the SessionComposer.

```sql
CREATE TABLE IF NOT EXISTS agent_profiles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,               -- display name (e.g., 'Build', 'Plan', 'Architect')
  ecosystem TEXT NOT NULL
    CHECK (ecosystem IN ('built-in', 'claude-code', 'opencode', 'oh-my-claudecode', 'oh-my-opencode', 'custom')),
  source_plugin_id TEXT,            -- FK to plugins.id (NULL for built-in)
  model TEXT,                       -- preferred model ID (NULL = use session default)
  system_prompt TEXT,               -- agent system prompt
  tool_access TEXT NOT NULL DEFAULT '[]',       -- JSON array of allowed tool names/globs
  permission_config TEXT NOT NULL DEFAULT '{}', -- JSON permission rules for this agent
  tab_order INTEGER NOT NULL DEFAULT 100,       -- position in tab bar (lower = leftmost)
  tab_shortcut TEXT,                -- optional keyboard shortcut (e.g., 'Ctrl+1')
  enabled INTEGER NOT NULL DEFAULT 1,
  icon TEXT,                        -- icon identifier for tab display
  description TEXT,
  -- Collaboration metadata (MiroFish + agency-agents inspired)
  division TEXT,                    -- organizational category (engineering, design, qa, product, security, devops, ai)
  color TEXT,                       -- hex color for UI display (e.g., '#B800B8')
  emoji TEXT,                       -- emoji badge for visual identification
  vibe TEXT,                        -- short personality descriptor (e.g., 'focused and methodical')
  collaboration_style TEXT DEFAULT 'cooperative'
    CHECK (collaboration_style IN ('cooperative', 'critical', 'exploratory', 'directive', 'supportive')),
  communication_preference TEXT DEFAULT 'concise'
    CHECK (communication_preference IN ('concise', 'detailed', 'structured', 'conversational')),
  decision_weight REAL DEFAULT 0.5
    CHECK (decision_weight BETWEEN 0.0 AND 1.0),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (source_plugin_id) REFERENCES plugins(id) ON DELETE SET NULL
);
```

### Table: plugin_state

```sql
CREATE TABLE IF NOT EXISTS plugin_state (
  plugin_id TEXT NOT NULL,
  key TEXT NOT NULL,
  value TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  PRIMARY KEY (plugin_id, key)
);
```

### Table: device_registry

```sql
CREATE TABLE IF NOT EXISTS device_registry (
  device_id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('desktop', 'mobile', 'tablet', 'unknown')),
  paired_at TEXT NOT NULL,
  last_seen TEXT NOT NULL,
  jwt_token_hash TEXT NOT NULL
);
```

### Table: notification_log

```sql
CREATE TABLE IF NOT EXISTS notification_log (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('permission_request', 'task_complete', 'error', 'session_event', 'system_alert')),
  severity TEXT NOT NULL CHECK (severity IN ('info', 'warning', 'error', 'critical')),
  source_tui TEXT NOT NULL CHECK (source_tui IN ('claude-code', 'opencode', 'codex', 'gemini', 'native', 'system')),
  session_id TEXT,
  dispatched_to TEXT NOT NULL DEFAULT '[]',
  created_at TEXT NOT NULL,
  -- Delivery tracking columns (required by notification-system.md)
  title TEXT NOT NULL DEFAULT '',
  body TEXT,
  urgency TEXT NOT NULL DEFAULT 'normal' CHECK (urgency IN ('low', 'normal', 'high', 'critical')),
  idempotency_key TEXT UNIQUE,
  delivery_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (delivery_status IN ('pending', 'dispatched', 'delivered', 'failed', 'suppressed', 'expired')),
  retry_count INTEGER NOT NULL DEFAULT 0,
  delivered_at TEXT,
  expires_at TEXT,
  FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE SET NULL
);
```

### Table: notification_delivery

Tracks per-channel delivery state for each notification (required by notification-system.md).

```sql
CREATE TABLE IF NOT EXISTS notification_delivery (
  id TEXT PRIMARY KEY,
  notification_id TEXT NOT NULL,
  channel TEXT NOT NULL CHECK (channel IN ('desktop', 'mobile_push', 'in_app')),
  device_id TEXT,
  status TEXT NOT NULL CHECK (status IN ('pending', 'dispatched', 'delivered', 'failed', 'expired')),
  attempt_count INTEGER NOT NULL DEFAULT 0,
  last_attempt_at TEXT,
  delivered_at TEXT,
  error_message TEXT,
  FOREIGN KEY (notification_id) REFERENCES notification_log(id) ON DELETE CASCADE,
  FOREIGN KEY (device_id) REFERENCES device_registry(device_id) ON DELETE SET NULL
);
```

### Table: push_subscriptions

Stores mobile push subscription details per paired device. **Future: fully activated when cloud relay is implemented; the table is created on migration but remains empty until a paired mobile app registers a device token.**

```sql
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id TEXT PRIMARY KEY,
  device_id TEXT NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('android', 'ios')),
  endpoint TEXT NOT NULL,      -- FCM or APNs device token
  created_at TEXT NOT NULL,
  expires_at TEXT,             -- Subscription expiry, if known
  active INTEGER NOT NULL DEFAULT 1,
  FOREIGN KEY (device_id) REFERENCES device_registry(device_id) ON DELETE CASCADE
);
```

### Table: session_groups

```sql
CREATE TABLE IF NOT EXISTS session_groups (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT,
  type TEXT NOT NULL CHECK (type IN ('repo', 'folder', 'custom')),
  parent_group_id TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  FOREIGN KEY (parent_group_id) REFERENCES session_groups(id) ON DELETE SET NULL
);
```

### Table: session_group_membership

```sql
CREATE TABLE IF NOT EXISTS session_group_membership (
  session_id TEXT NOT NULL,
  group_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  PRIMARY KEY (session_id, group_id),
  FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE,
  FOREIGN KEY (group_id) REFERENCES session_groups(id) ON DELETE CASCADE
);
```

### Table: providers

Registered AI providers sourced from [models.dev](https://models.dev). Each row represents a provider whose SDK or API can be used by Amoena's native mode to call models directly without a TUI wrapper.

```sql
CREATE TABLE IF NOT EXISTS providers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  npm_package TEXT,
  provider_type TEXT NOT NULL DEFAULT 'cloud'
    CHECK (provider_type IN ('cloud', 'local')),  -- 'local' for Ollama, llama.cpp, LM Studio, etc.
  base_url TEXT,                                   -- endpoint URL for local/custom providers
  auth_type TEXT NOT NULL CHECK (auth_type IN ('oauth', 'apikey', 'env', 'aws_chain', 'none')),  -- 'none' for local models
  auth_status TEXT NOT NULL DEFAULT 'disconnected'
    CHECK (auth_status IN ('connected', 'disconnected', 'expired')),
  model_count INTEGER NOT NULL DEFAULT 0,
  last_refreshed_at TEXT,
  created_at TEXT NOT NULL
);
```

### Table: provider_models

Cached provider/model capability metadata sourced from models.dev or local runtime discovery. This powers Provider Setup, composer reasoning controls, and model routing.

```sql
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
  reasoning_modes TEXT NOT NULL DEFAULT '["off"]',          -- JSON array
  reasoning_effort_supported INTEGER NOT NULL DEFAULT 0,
  reasoning_effort_values TEXT NOT NULL DEFAULT '[]',       -- JSON array
  reasoning_token_budget_supported INTEGER NOT NULL DEFAULT 0,
  discovered_at TEXT NOT NULL,
  refreshed_at TEXT NOT NULL,
  PRIMARY KEY (provider_id, model_id),
  FOREIGN KEY (provider_id) REFERENCES providers(id) ON DELETE CASCADE
);
```

### Table: provider_credentials

Stores references to secrets held in the OS keychain (macOS Keychain, Windows Credential Manager, libsecret). The database never contains raw secrets — only opaque keychain reference strings.

```sql
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
```

### Table: model_routing

Maps task types to specific models, enabling local models for lightweight system tasks while reserving cloud models for complex reasoning. Users configure this via Settings > Providers > Model Routing or `amoena.json`.

```sql
CREATE TABLE IF NOT EXISTS model_routing (
  task_type TEXT PRIMARY KEY,         -- e.g., 'system.title', 'system.compaction', 'system.observation', 'default'
  provider_id TEXT NOT NULL,
  model_id TEXT NOT NULL,
  description TEXT,                   -- human-readable description of when this route applies
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (provider_id) REFERENCES providers(id) ON DELETE CASCADE
);
```

Per-model reasoning defaults are stored in the `settings` table using provider/model-scoped keys, for example:

- `providers.reasoning.anthropic/claude-4-sonnet.mode = "auto"`
- `providers.reasoning.anthropic/claude-4-sonnet.effort = "high"`
- `providers.reasoning.openai/gpt-5.mode = "off"`

### Table: observations

Session-level knowledge captures. Each observation records a discrete unit of understanding — a fact discovered, a concept identified, or a file interaction — produced by an agent during a session. Used for context reconstruction and semantic search.

```sql
CREATE TABLE IF NOT EXISTS observations (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  type TEXT NOT NULL,
  category TEXT DEFAULT 'entity'
    CHECK (category IN ('profile', 'preference', 'entity', 'pattern', 'tool_usage', 'skill')),
  title TEXT NOT NULL,
  subtitle TEXT,
  facts TEXT NOT NULL DEFAULT '[]',        -- JSON array of strings
  narrative TEXT,
  concepts TEXT NOT NULL DEFAULT '[]',     -- JSON array of strings
  files_read TEXT NOT NULL DEFAULT '[]',   -- JSON array of file paths
  files_modified TEXT NOT NULL DEFAULT '[]', -- JSON array of file paths
  content_hash TEXT NOT NULL,
  prompt_number INTEGER NOT NULL DEFAULT 0,
  discovery_tokens INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
);
```

### Table: observation_embeddings

Vector embeddings for semantic search over observations. The `embedding` column stores a binary blob (e.g., 1536-dim float32 array for `text-embedding-3-small`). One embedding per observation; the model column tracks which embedding model produced it so stale embeddings can be re-generated on model upgrade.

```sql
CREATE TABLE IF NOT EXISTS observation_embeddings (
  observation_id TEXT PRIMARY KEY,
  embedding BLOB NOT NULL,
  model TEXT NOT NULL,
  FOREIGN KEY (observation_id) REFERENCES observations(id) ON DELETE CASCADE
);
```

### Table: memory_tiers

Precomputed L0/L1/L2 tier summaries for observations, enabling progressive context loading without re-summarizing on every retrieval. Generated asynchronously after observation persistence.

```sql
CREATE TABLE IF NOT EXISTS memory_tiers (
  observation_id TEXT PRIMARY KEY,
  l0_summary TEXT NOT NULL,           -- ~50-100 tokens: title + type + category + age
  l1_summary TEXT NOT NULL,           -- ~300-500 tokens: key details, relationships, context
  l2_content TEXT NOT NULL,           -- ~800-2000 tokens: full observation content + metadata
  l0_tokens INTEGER NOT NULL,
  l1_tokens INTEGER NOT NULL,
  l2_tokens INTEGER NOT NULL,
  generated_at TEXT NOT NULL,
  model TEXT NOT NULL,                -- which model generated the summaries
  FOREIGN KEY (observation_id) REFERENCES observations(id) ON DELETE CASCADE
);
```

The tiered summaries are generated by an LLM (routable to a local model for cost efficiency) immediately after observation persistence. If generation fails, the system falls back to truncation-based summaries (first N tokens of the narrative).

### Table: session_summaries

End-of-session or compaction-triggered summaries. One row per session captures the high-level arc: what was requested, investigated, learned, completed, and what remains. Powers the "session recap" UI and cross-session continuity.

```sql
CREATE TABLE IF NOT EXISTS session_summaries (
  session_id TEXT PRIMARY KEY,
  request TEXT NOT NULL,
  investigated TEXT NOT NULL DEFAULT '[]',  -- JSON array of strings
  learned TEXT NOT NULL DEFAULT '[]',       -- JSON array of strings
  completed TEXT NOT NULL DEFAULT '[]',     -- JSON array of strings
  next_steps TEXT NOT NULL DEFAULT '[]',    -- JSON array of strings
  files_read TEXT NOT NULL DEFAULT '[]',    -- JSON array of file paths
  files_edited TEXT NOT NULL DEFAULT '[]',  -- JSON array of file paths
  FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
);
```

### Table: agents

Tracks every agent instance spawned during a session — primary agents, sub-agents, and system-level agents. The `parent_agent_id` column enables tree reconstruction for multi-agent orchestration UIs.

```sql
CREATE TABLE IF NOT EXISTS agents (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  parent_agent_id TEXT,
  type TEXT NOT NULL,
  mode TEXT NOT NULL CHECK (mode IN ('primary', 'subagent', 'system')),
  model TEXT NOT NULL,
  system_prompt TEXT,
  tool_access TEXT NOT NULL DEFAULT '[]',          -- JSON array of tool names
  permission_config TEXT NOT NULL DEFAULT '{}',    -- JSON object
  status TEXT NOT NULL DEFAULT 'created'
    CHECK (status IN ('created', 'preparing', 'active', 'idle', 'running', 'paused', 'stopped', 'completed', 'failed', 'cancelled')),
  steps_limit INTEGER,
  FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE,
  FOREIGN KEY (parent_agent_id) REFERENCES agents(id) ON DELETE SET NULL
);
```

### Table: agent_teams

Named groups of agents collaborating on a shared task. The `shared_task_list_path` points to the filesystem location where the team's task list is persisted (e.g., `.omc/state/sessions/{id}/tasks.json`).

```sql
CREATE TABLE IF NOT EXISTS agent_teams (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  shared_task_list_path TEXT,
  status TEXT NOT NULL DEFAULT 'idle'
    CHECK (status IN ('idle', 'assembling', 'active', 'paused', 'disbanded', 'completed', 'failed', 'cancelled'))
);
```

### Table: agent_messages

Inter-agent communication log. Captures messages exchanged between agents within a team. `to_agent_id` is nullable for broadcast messages.

```sql
CREATE TABLE IF NOT EXISTS agent_messages (
  id TEXT PRIMARY KEY,
  team_id TEXT NOT NULL,
  from_agent_id TEXT NOT NULL,
  to_agent_id TEXT,
  content TEXT NOT NULL,
  read_at TEXT,
  FOREIGN KEY (team_id) REFERENCES agent_teams(id) ON DELETE CASCADE,
  FOREIGN KEY (from_agent_id) REFERENCES agents(id) ON DELETE CASCADE,
  FOREIGN KEY (to_agent_id) REFERENCES agents(id) ON DELETE SET NULL
);
```

### Table: tool_executions

Audit log for every tool invocation. Records input/output payloads, permission decisions, and duration. Essential for debugging agent behavior and enforcing tool permission policies.

```sql
CREATE TABLE IF NOT EXISTS tool_executions (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  agent_id TEXT,
  tool_name TEXT NOT NULL,
  input TEXT NOT NULL DEFAULT '{}',    -- JSON object
  output TEXT,                          -- JSON object, nullable for failed/denied
  permission_decision TEXT NOT NULL DEFAULT 'allowed'
    CHECK (permission_decision IN ('allowed', 'denied', 'auto_approved', 'user_approved')),
  duration_ms INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE,
  FOREIGN KEY (agent_id) REFERENCES agents(id) ON DELETE SET NULL
);
```

### Table: hooks

Event-driven hooks that fire on canonical lifecycle events (for example `SessionStart`, `PreToolUse`, `TaskCompleted`). Supports four persisted handler types: `command`, `http`, `prompt`, and `agent`.

```sql
CREATE TABLE IF NOT EXISTS hooks (
  id TEXT PRIMARY KEY,
  event_name TEXT NOT NULL,
  handler_type TEXT NOT NULL
    CHECK (handler_type IN ('command', 'http', 'prompt', 'agent')),
  handler_config TEXT NOT NULL DEFAULT '{}',  -- JSON object
  matcher_regex TEXT,
  enabled INTEGER NOT NULL DEFAULT 1,
  priority INTEGER NOT NULL DEFAULT 100,
  timeout_ms INTEGER NOT NULL DEFAULT 30000
);
```

### Table: workspaces

Isolated working directories for agents. Each workspace is a clone (copy-on-write, git worktree, or full clone) of a project directory, enabling parallel agent work without file conflicts.

```sql
CREATE TABLE IF NOT EXISTS workspaces (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  agent_id TEXT,
  clone_path TEXT NOT NULL,
  clone_type TEXT NOT NULL CHECK (clone_type IN ('cow', 'worktree', 'full')),
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'archived', 'deleted')),
  created_at TEXT NOT NULL,
  FOREIGN KEY (agent_id) REFERENCES agents(id) ON DELETE SET NULL
);
```

### Table: workspace_merge_reviews

Tracks manual review state for applying an isolated workspace back onto its target branch or main workspace. Merge/apply-back is never automatic.

```sql
CREATE TABLE IF NOT EXISTS workspace_merge_reviews (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  source_branch TEXT NOT NULL,
  target_branch TEXT NOT NULL,
  changed_files INTEGER NOT NULL DEFAULT 0,
  conflicts INTEGER NOT NULL DEFAULT 0,
  summary TEXT NOT NULL,
  files TEXT NOT NULL DEFAULT '[]',              -- JSON array of { path, status }
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'blocked', 'applied', 'dismissed')),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE
);
```

### Table: autopilot_goals

Top-level objectives for autonomous execution. Each goal decomposes into ordered stories.

```sql
CREATE TABLE IF NOT EXISTS autopilot_goals (
  id TEXT PRIMARY KEY,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'in_progress', 'completed', 'failed', 'cancelled')),
  created_at TEXT NOT NULL
);
```

### Table: autopilot_stories

Ordered units of work under a goal. Each story can be assigned to an agent for execution. `sort_order` determines execution sequence within a goal.

```sql
CREATE TABLE IF NOT EXISTS autopilot_stories (
  id TEXT PRIMARY KEY,
  goal_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  agent_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'in_progress', 'completed', 'failed', 'skipped')),
  created_at TEXT NOT NULL,
  FOREIGN KEY (goal_id) REFERENCES autopilot_goals(id) ON DELETE CASCADE,
  FOREIGN KEY (agent_id) REFERENCES agents(id) ON DELETE SET NULL
);
```

### Table: opinions

Questions posed to multiple models for comparative analysis. Used by the CCG (Claude/Codex/Gemini) fan-out pattern and opinion-gathering workflows.

```sql
CREATE TABLE IF NOT EXISTS opinions (
  id TEXT PRIMARY KEY,
  question TEXT NOT NULL,
  session_id TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE SET NULL
);
```

### Table: opinion_responses

Individual model responses to an opinion question. Multiple rows per opinion — one per model/provider combination queried.

```sql
CREATE TABLE IF NOT EXISTS opinion_responses (
  id TEXT PRIMARY KEY,
  opinion_id TEXT NOT NULL,
  model TEXT NOT NULL,
  provider TEXT NOT NULL,
  response TEXT NOT NULL,
  tokens_used INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  FOREIGN KEY (opinion_id) REFERENCES opinions(id) ON DELETE CASCADE
);
```

### Table: linked_workspaces

Groups of workspaces that share context or state — for example, a monorepo split across multiple agent workspaces that need coordinated file access.

```sql
CREATE TABLE IF NOT EXISTS linked_workspaces (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  workspace_ids TEXT NOT NULL DEFAULT '[]',  -- JSON array of workspace id strings
  created_at TEXT NOT NULL
);
```

### Table: usage_events

```sql
CREATE TABLE IF NOT EXISTS usage_events (
  id TEXT PRIMARY KEY,
  timestamp TEXT NOT NULL,
  tui TEXT NOT NULL CHECK (tui IN ('claude-code', 'opencode', 'codex', 'gemini', 'native')),
  provider TEXT NOT NULL,
  model TEXT NOT NULL,
  input_tokens INTEGER NOT NULL DEFAULT 0 CHECK (input_tokens >= 0),
  output_tokens INTEGER NOT NULL DEFAULT 0 CHECK (output_tokens >= 0),
  reasoning_tokens INTEGER NOT NULL DEFAULT 0 CHECK (reasoning_tokens >= 0),
  cache_creation_tokens INTEGER NOT NULL DEFAULT 0 CHECK (cache_creation_tokens >= 0),
  cache_read_tokens INTEGER NOT NULL DEFAULT 0 CHECK (cache_read_tokens >= 0),
  cost_usd REAL NOT NULL DEFAULT 0 CHECK (cost_usd >= 0),
  project_path TEXT,
  session_id TEXT,
  request_id TEXT,
  FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE SET NULL
);
```

### Table: marketplace_resources

Normalized cache of resources aggregated from all external registries (required by marketplace-discovery.md).

```sql
CREATE TABLE IF NOT EXISTS marketplace_resources (
  id TEXT PRIMARY KEY,
  canonical_id TEXT,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  resource_type TEXT NOT NULL CHECK (resource_type IN ('mcp', 'skill', 'plugin', 'agent', 'extension')),
  source_registry TEXT NOT NULL CHECK (source_registry IN (
    'glama', 'smithery', 'mcp-registry', 'pulsemcp', 'lobehub',
    'agentskills-io', 'agentskills-to', 'agent-skills-cc',
    'gemini-extensions', 'opencode-ecosystem', 'npm'
  )),
  source_url TEXT NOT NULL,
  version TEXT,
  author TEXT NOT NULL,
  downloads INTEGER NOT NULL DEFAULT 0,
  stars INTEGER NOT NULL DEFAULT 0,
  security_rating TEXT NOT NULL DEFAULT 'unrated'
    CHECK (security_rating IN ('A', 'B', 'C', 'D', 'F', 'unrated')),
  categories TEXT NOT NULL DEFAULT '[]',       -- JSON array of strings
  compatible_tuis TEXT NOT NULL DEFAULT '[]',  -- JSON array of TuiCompatibility
  install_method TEXT NOT NULL CHECK (install_method IN (
    'mcp-config-inject', 'skill-download', 'npm-install',
    'gemini-extension-install', 'plugin-manifest-install'
  )),
  manifest_url TEXT NOT NULL,
  npm_package TEXT,
  repository_url TEXT,
  is_official INTEGER NOT NULL DEFAULT 0,
  quality_score REAL NOT NULL DEFAULT 0,
  last_updated TEXT NOT NULL,
  fetched_at TEXT NOT NULL
);
```

### Virtual Table: marketplace_fts

FTS5 full-text search index over `marketplace_resources` (required by marketplace-discovery.md). Kept in sync via triggers.

```sql
CREATE VIRTUAL TABLE IF NOT EXISTS marketplace_fts USING fts5(
  name,
  description,
  author,
  categories,
  content='marketplace_resources',
  content_rowid='rowid',
  tokenize='porter unicode61 remove_diacritics 2'
);

CREATE TRIGGER IF NOT EXISTS marketplace_fts_insert AFTER INSERT ON marketplace_resources BEGIN
  INSERT INTO marketplace_fts(rowid, name, description, author, categories)
  VALUES (new.rowid, new.name, new.description, new.author, new.categories);
END;

CREATE TRIGGER IF NOT EXISTS marketplace_fts_delete AFTER DELETE ON marketplace_resources BEGIN
  INSERT INTO marketplace_fts(marketplace_fts, rowid, name, description, author, categories)
  VALUES ('delete', old.rowid, old.name, old.description, old.author, old.categories);
END;

CREATE TRIGGER IF NOT EXISTS marketplace_fts_update AFTER UPDATE ON marketplace_resources BEGIN
  INSERT INTO marketplace_fts(marketplace_fts, rowid, name, description, author, categories)
  VALUES ('delete', old.rowid, old.name, old.description, old.author, old.categories);
  INSERT INTO marketplace_fts(rowid, name, description, author, categories)
  VALUES (new.rowid, new.name, new.description, new.author, new.categories);
END;
```

### Table: marketplace_sync_state

Tracks per-registry sync cursor and schedule (required by marketplace-discovery.md).

```sql
CREATE TABLE IF NOT EXISTS marketplace_sync_state (
  registry TEXT PRIMARY KEY CHECK (registry IN (
    'glama', 'smithery', 'mcp-registry', 'pulsemcp', 'lobehub',
    'agentskills-io', 'agentskills-to', 'agent-skills-cc',
    'gemini-extensions', 'opencode-ecosystem', 'npm'
  )),
  last_sync_at TEXT NOT NULL,
  next_sync_at TEXT NOT NULL,
  last_cursor TEXT,
  total_resources INTEGER NOT NULL DEFAULT 0,
  sync_status TEXT NOT NULL DEFAULT 'idle'
    CHECK (sync_status IN ('idle', 'syncing', 'error')),
  error_message TEXT,
  consecutive_failures INTEGER NOT NULL DEFAULT 0
);
```

### Virtual Table: message_fts

FTS5 full-text search index over `messages` for session history search.

```sql
CREATE VIRTUAL TABLE IF NOT EXISTS message_fts USING fts5(
  content,
  content='messages',
  content_rowid='rowid',
  tokenize='porter unicode61 remove_diacritics 2'
);

CREATE TRIGGER IF NOT EXISTS message_fts_insert AFTER INSERT ON messages BEGIN
  INSERT INTO message_fts(rowid, content) VALUES (new.rowid, new.content);
END;

CREATE TRIGGER IF NOT EXISTS message_fts_delete AFTER DELETE ON messages BEGIN
  INSERT INTO message_fts(message_fts, rowid, content)
  VALUES ('delete', old.rowid, old.content);
END;

CREATE TRIGGER IF NOT EXISTS message_fts_update AFTER UPDATE ON messages BEGIN
  INSERT INTO message_fts(message_fts, rowid, content)
  VALUES ('delete', old.rowid, old.content);
  INSERT INTO message_fts(rowid, content) VALUES (new.rowid, new.content);
END;
```

### Virtual Table: observations_fts

FTS5 full-text search index over `observations` for semantic discovery across sessions. Indexes titles, narratives, facts, and concepts. Kept in sync via triggers.

```sql
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
```

### Virtual Table: session_summaries_fts

FTS5 full-text search index over `session_summaries` for finding past sessions by what was requested, learned, or completed.

```sql
CREATE VIRTUAL TABLE IF NOT EXISTS session_summaries_fts USING fts5(
  request,
  investigated,
  learned,
  completed,
  next_steps,
  content='session_summaries',
  content_rowid='rowid',
  tokenize='porter unicode61 remove_diacritics 2'
);

CREATE TRIGGER IF NOT EXISTS session_summaries_fts_insert AFTER INSERT ON session_summaries BEGIN
  INSERT INTO session_summaries_fts(rowid, request, investigated, learned, completed, next_steps)
  VALUES (new.rowid, new.request, new.investigated, new.learned, new.completed, new.next_steps);
END;

CREATE TRIGGER IF NOT EXISTS session_summaries_fts_delete AFTER DELETE ON session_summaries BEGIN
  INSERT INTO session_summaries_fts(session_summaries_fts, rowid, request, investigated, learned, completed, next_steps)
  VALUES ('delete', old.rowid, old.request, old.investigated, old.learned, old.completed, old.next_steps);
END;

CREATE TRIGGER IF NOT EXISTS session_summaries_fts_update AFTER UPDATE ON session_summaries BEGIN
  INSERT INTO session_summaries_fts(session_summaries_fts, rowid, request, investigated, learned, completed, next_steps)
  VALUES ('delete', old.rowid, old.request, old.investigated, old.learned, old.completed, old.next_steps);
  INSERT INTO session_summaries_fts(rowid, request, investigated, learned, completed, next_steps)
  VALUES (new.rowid, new.request, new.investigated, new.learned, new.completed, new.next_steps);
END;
```

### Table: schema_migrations

```sql
CREATE TABLE IF NOT EXISTS schema_migrations (
  version INTEGER PRIMARY KEY,
  description TEXT NOT NULL,
  applied_at TEXT NOT NULL,
  checksum TEXT NOT NULL
);
```

### Indices

```sql
CREATE INDEX IF NOT EXISTS idx_sessions_status ON sessions(status);
CREATE INDEX IF NOT EXISTS idx_sessions_tui_type ON sessions(tui_type);
CREATE INDEX IF NOT EXISTS idx_sessions_working_dir ON sessions(working_dir);
CREATE INDEX IF NOT EXISTS idx_sessions_updated_at ON sessions(updated_at);

CREATE INDEX IF NOT EXISTS idx_messages_session_created ON messages(session_id, created_at);
CREATE INDEX IF NOT EXISTS idx_messages_role ON messages(role);

CREATE INDEX IF NOT EXISTS idx_usage_analytics_timestamp ON usage_analytics(timestamp);
CREATE INDEX IF NOT EXISTS idx_usage_analytics_provider_model ON usage_analytics(provider, model);
CREATE INDEX IF NOT EXISTS idx_usage_analytics_session_id ON usage_analytics(session_id);

CREATE INDEX IF NOT EXISTS idx_settings_scope ON settings(scope, scope_ref);
CREATE INDEX IF NOT EXISTS idx_plugin_state_plugin_id ON plugin_state(plugin_id);

CREATE INDEX IF NOT EXISTS idx_device_registry_last_seen ON device_registry(last_seen);

CREATE INDEX IF NOT EXISTS idx_notification_log_created_at ON notification_log(created_at);
CREATE INDEX IF NOT EXISTS idx_notification_log_source_tui ON notification_log(source_tui);
CREATE INDEX IF NOT EXISTS idx_notification_log_session_id ON notification_log(session_id);

CREATE INDEX IF NOT EXISTS idx_session_groups_parent ON session_groups(parent_group_id);
CREATE INDEX IF NOT EXISTS idx_session_groups_type_sort ON session_groups(type, sort_order);

CREATE INDEX IF NOT EXISTS idx_session_group_membership_group_id ON session_group_membership(group_id);

CREATE INDEX IF NOT EXISTS idx_usage_events_timestamp ON usage_events(timestamp);
CREATE INDEX IF NOT EXISTS idx_usage_events_tui_provider_model ON usage_events(tui, provider, model);
CREATE INDEX IF NOT EXISTS idx_usage_events_session_id ON usage_events(session_id);
CREATE INDEX IF NOT EXISTS idx_usage_events_project_path ON usage_events(project_path);
CREATE UNIQUE INDEX IF NOT EXISTS idx_usage_events_request_id ON usage_events(request_id) WHERE request_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_notification_delivery_notification_id ON notification_delivery(notification_id);
CREATE INDEX IF NOT EXISTS idx_notification_delivery_status ON notification_delivery(status);
CREATE INDEX IF NOT EXISTS idx_notification_delivery_channel ON notification_delivery(channel);

CREATE INDEX IF NOT EXISTS idx_push_subscriptions_device_id ON push_subscriptions(device_id);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_active ON push_subscriptions(active);

CREATE INDEX IF NOT EXISTS idx_marketplace_canonical_id ON marketplace_resources(canonical_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_resource_type ON marketplace_resources(resource_type);
CREATE INDEX IF NOT EXISTS idx_marketplace_source_registry ON marketplace_resources(source_registry);
CREATE INDEX IF NOT EXISTS idx_marketplace_quality_score ON marketplace_resources(quality_score DESC);
CREATE INDEX IF NOT EXISTS idx_marketplace_npm_package ON marketplace_resources(npm_package) WHERE npm_package IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_marketplace_repository_url ON marketplace_resources(repository_url) WHERE repository_url IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_marketplace_compatible_tuis ON marketplace_resources(compatible_tuis);

-- Sessions (new columns)
CREATE INDEX IF NOT EXISTS idx_sessions_parent_session_id ON sessions(parent_session_id);
CREATE INDEX IF NOT EXISTS idx_sessions_session_type ON sessions(session_type);
CREATE INDEX IF NOT EXISTS idx_sessions_provider_id ON sessions(provider_id);
CREATE INDEX IF NOT EXISTS idx_sessions_workspace_id ON sessions(workspace_id);

-- Providers
CREATE INDEX IF NOT EXISTS idx_providers_auth_status ON providers(auth_status);
CREATE INDEX IF NOT EXISTS idx_providers_npm_package ON providers(npm_package) WHERE npm_package IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_provider_models_provider_id ON provider_models(provider_id);
CREATE INDEX IF NOT EXISTS idx_provider_models_reasoning ON provider_models(supports_reasoning);

-- Provider credentials
CREATE INDEX IF NOT EXISTS idx_provider_credentials_provider_id ON provider_credentials(provider_id);
CREATE INDEX IF NOT EXISTS idx_provider_credentials_expires_at ON provider_credentials(expires_at) WHERE expires_at IS NOT NULL;

-- Observations
CREATE INDEX IF NOT EXISTS idx_observations_session_id ON observations(session_id, created_at);
CREATE INDEX IF NOT EXISTS idx_observations_type ON observations(type);
CREATE INDEX IF NOT EXISTS idx_observations_content_hash ON observations(content_hash);

-- Session summaries (PK is session_id, no additional index needed)

-- Agents
CREATE INDEX IF NOT EXISTS idx_agents_session_id ON agents(session_id);
CREATE INDEX IF NOT EXISTS idx_agents_parent_agent_id ON agents(parent_agent_id);
CREATE INDEX IF NOT EXISTS idx_agents_status ON agents(status);
CREATE INDEX IF NOT EXISTS idx_agents_mode ON agents(mode);

-- Agent teams
CREATE INDEX IF NOT EXISTS idx_agent_teams_status ON agent_teams(status);

-- Agent messages
CREATE INDEX IF NOT EXISTS idx_agent_messages_team_id ON agent_messages(team_id);
CREATE INDEX IF NOT EXISTS idx_agent_messages_from_agent_id ON agent_messages(from_agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_messages_to_agent_id ON agent_messages(to_agent_id);

-- Tool executions
CREATE INDEX IF NOT EXISTS idx_tool_executions_session_id ON tool_executions(session_id);
CREATE INDEX IF NOT EXISTS idx_tool_executions_agent_id ON tool_executions(agent_id);
CREATE INDEX IF NOT EXISTS idx_tool_executions_tool_name ON tool_executions(tool_name);

-- Hooks
CREATE INDEX IF NOT EXISTS idx_hooks_event_name ON hooks(event_name);
CREATE INDEX IF NOT EXISTS idx_hooks_enabled_priority ON hooks(enabled, priority);

-- Workspaces
CREATE INDEX IF NOT EXISTS idx_workspaces_project_id ON workspaces(project_id);
CREATE INDEX IF NOT EXISTS idx_workspaces_agent_id ON workspaces(agent_id);
CREATE INDEX IF NOT EXISTS idx_workspaces_status ON workspaces(status);
CREATE INDEX IF NOT EXISTS idx_workspace_merge_reviews_workspace_id ON workspace_merge_reviews(workspace_id);
CREATE INDEX IF NOT EXISTS idx_workspace_merge_reviews_status ON workspace_merge_reviews(status);

-- Autopilot goals
CREATE INDEX IF NOT EXISTS idx_autopilot_goals_status ON autopilot_goals(status);

-- Autopilot stories
CREATE INDEX IF NOT EXISTS idx_autopilot_stories_goal_id ON autopilot_stories(goal_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_autopilot_stories_agent_id ON autopilot_stories(agent_id);
CREATE INDEX IF NOT EXISTS idx_autopilot_stories_status ON autopilot_stories(status);

-- Opinions
CREATE INDEX IF NOT EXISTS idx_opinions_session_id ON opinions(session_id);

-- Opinion responses
CREATE INDEX IF NOT EXISTS idx_opinion_responses_opinion_id ON opinion_responses(opinion_id);
CREATE INDEX IF NOT EXISTS idx_opinion_responses_model_provider ON opinion_responses(model, provider);
```

### Table Relationships

The following summarizes foreign-key relationships across the schema. Arrows read as "references".

```
sessions
  ├── parent_session_id  → sessions.id          (self-referential, child/team sessions)
  ├── provider_id        → providers.id
  ├── workspace_id       → workspaces.id
  ├─► messages           (session_id, CASCADE)
  ├─► observations       (session_id, CASCADE)
  ├─► session_summaries  (session_id, CASCADE)
  ├─► agents             (session_id, CASCADE)
  ├─► tool_executions    (session_id, CASCADE)
  ├─► opinions           (session_id, SET NULL)
  ├─► usage_analytics    (session_id, SET NULL)
  └─► usage_events       (session_id, SET NULL)

providers
  ├─► provider_models       (provider_id, CASCADE)
  └─► provider_credentials  (provider_id, CASCADE)

agents
  ├── parent_agent_id    → agents.id            (self-referential, agent tree)
  ├── session_id         → sessions.id
  ├─► agent_messages     (from_agent_id / to_agent_id)
  ├─► tool_executions    (agent_id, SET NULL)
  ├─► workspaces         (agent_id, SET NULL)
  └─► autopilot_stories  (agent_id, SET NULL)

agent_teams
  └─► agent_messages     (team_id, CASCADE)

autopilot_goals
  └─► autopilot_stories  (goal_id, CASCADE)

opinions
  └─► opinion_responses  (opinion_id, CASCADE)

observations
  └─► observation_embeddings  (observation_id, CASCADE)

workspaces
  └─► workspace_merge_reviews (workspace_id, CASCADE)
```

## JSON Config Schemas

### Global settings (`~/.amoena/config.json`)

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://amoena.app/schemas/config.global.json",
  "type": "object",
  "required": ["version", "ui", "notifications", "telemetry"],
  "properties": {
    "version": { "type": "integer", "minimum": 1 },
    "locale": { "type": "string", "default": "en-US" },
    "ui": {
      "type": "object",
      "required": ["theme", "density"],
      "properties": {
        "theme": { "type": "string" },
        "density": { "type": "string", "enum": ["compact", "comfortable", "spacious"] }
      },
      "additionalProperties": false
    },
    "notifications": {
      "type": "object",
      "required": ["afkTimeoutSeconds", "desktopEnabled", "soundEnabled"],
      "properties": {
        "afkTimeoutSeconds": { "type": "integer", "minimum": 30, "maximum": 86400 },
        "desktopEnabled": { "type": "boolean" },
        "soundEnabled": { "type": "boolean" }
      },
      "additionalProperties": false
    },
    "telemetry": {
      "type": "object",
      "required": ["enabled", "retentionDays"],
      "properties": {
        "enabled": { "type": "boolean" },
        "retentionDays": { "type": "integer", "minimum": 1, "maximum": 3650 }
      },
      "additionalProperties": false
    },
    "remoteAccess": {
      "type": "object",
      "properties": {
        "enabled": { "type": "boolean", "default": false },
        "lanEnabled": { "type": "boolean", "default": false },
        "lanBindAddress": { "type": "string", "default": "0.0.0.0" },
        "relayEnabled": { "type": "boolean", "default": false },
        "relayEndpoint": { "type": "string", "default": "relay.amoena.app" },
        "pairingPinTtlSeconds": { "type": "integer", "minimum": 30, "maximum": 3600, "default": 120 }
      },
      "additionalProperties": false
    }
  },
  "additionalProperties": false
}
```

### Settings key catalog

The `settings` table is used for settings that are scoped more finely than the global config file. Important keys include:

| Key | Scope | Value shape | Purpose |
|-----|-------|-------------|---------|
| `providers.reasoning.<provider>/<model>.mode` | `global` | `"off" | "auto" | "on"` | Per-model reasoning default |
| `providers.reasoning.<provider>/<model>.effort` | `global` | `"low" | "medium" | "high"` | Per-model reasoning effort default |
| `remote_access.enabled` | `global` | `boolean` | Enables remote access features at all |
| `remote_access.lan.enabled` | `global` | `boolean` | Enables opt-in LAN listener |
| `remote_access.relay.enabled` | `global` | `boolean` | Enables relay connectivity |
| `remote_access.relay.endpoint` | `global` | `string` | Relay server hostname or URL |
| `workspace.merge.review_required` | `global` | `boolean` | Must remain `true` in current architecture |
| `workspace.merge.preserve_on_apply` | `global` | `boolean` | Preserve workspace after apply-back |
| `notifications.muted` | `per-session` | `boolean` | Session-level mute |
| `notifications.mutedTypes` | `per-session` | `string[]` | Session-level notification suppression |

### Per-TUI settings (`~/.amoena/tui/{tui-name}/config.json`)

Amoena-native config uses the canonical permission modes from [`agent-backend-interface.md`](./agent-backend-interface.md). Imported legacy values (`manual`, `auto-safe`, `yolo`) are normalized during ecosystem import and are not persisted back in that form.

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://amoena.app/schemas/config.per-tui.json",
  "type": "object",
  "required": ["tui", "enabled", "adapterMode", "binaryPath", "permissionPolicy"],
  "properties": {
    "tui": { "type": "string", "enum": ["claude-code", "opencode", "codex", "gemini", "native"] },
    "enabled": { "type": "boolean" },
    "adapterMode": { "type": "string", "enum": ["structured", "pty", "hybrid"] },
    "binaryPath": { "type": "string" },
    "defaultModel": { "type": "string" },
    "defaultWorkingDir": { "type": "string" },
    "args": { "type": "array", "items": { "type": "string" } },
    "env": { "type": "object", "additionalProperties": { "type": "string" } },
    "permissionPolicy": {
      "type": "object",
      "required": ["mode"],
      "properties": {
        "mode": { "type": "string", "enum": ["default", "acceptEdits", "plan", "dontAsk", "bypassPermissions"] },
        "allowNetwork": { "type": "boolean" },
        "allowShell": { "type": "boolean" },
        "allowFileWrite": { "type": "boolean" }
      },
      "additionalProperties": false
    }
  },
  "additionalProperties": false
}
```

### Theme config (`~/.amoena/themes/{theme-name}.json`)

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://amoena.app/schemas/theme.json",
  "type": "object",
  "required": ["id", "name", "mode", "tokens"],
  "properties": {
    "id": { "type": "string" },
    "name": { "type": "string" },
    "author": { "type": "string" },
    "mode": { "type": "string", "enum": ["light", "dark"] },
    "tokens": {
      "type": "object",
      "required": ["color", "spacing", "radius", "typography", "shadow"],
      "properties": {
        "color": { "type": "object", "additionalProperties": { "type": "string" } },
        "spacing": { "type": "object", "additionalProperties": { "type": "string" } },
        "radius": { "type": "object", "additionalProperties": { "type": "string" } },
        "typography": { "type": "object", "additionalProperties": { "type": "string" } },
        "shadow": { "type": "object", "additionalProperties": { "type": "string" } }
      },
      "additionalProperties": false
    }
  },
  "additionalProperties": false
}
```

### Plugin manifest (`~/.amoena/plugins/{plugin-id}/manifest.json`)

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://amoena.app/schemas/plugin.manifest.json",
  "type": "object",
  "required": ["id", "name", "version", "main", "permissions", "activationEvents", "contributes"],
  "properties": {
    "id": { "type": "string" },
    "name": { "type": "string" },
    "version": { "type": "string", "pattern": "^[0-9]+\\.[0-9]+\\.[0-9]+(?:-[a-zA-Z0-9.-]+)?$" },
    "author": { "type": "string" },
    "description": { "type": "string" },
    "main": { "type": "string" },
    "minAppVersion": { "type": "string" },
    "permissions": {
      "type": "array",
      "items": {
        "type": "string",
        "enum": [
          "fs.read",
          "fs.write",
          "network",
          "shell.execute",
          "notifications",
          "sessions.read",
          "sessions.write",
          "settings.read",
          "settings.write"
        ]
      },
      "uniqueItems": true
    },
    "activationEvents": {
      "type": "array",
      "items": { "type": "string" }
    },
    "contributes": {
      "type": "object",
      "required": ["commands", "views", "settings", "hooks", "menus"],
      "properties": {
        "commands": { "type": "array", "items": { "type": "object" } },
        "views": { "type": "array", "items": { "type": "object" } },
        "settings": { "type": "array", "items": { "type": "object" } },
        "hooks": { "type": "array", "items": { "type": "object" } },
        "menus": { "type": "array", "items": { "type": "object" } },
        "tools": { "type": "array", "items": { "type": "object" } },
        "observationTypes": { "type": "array", "items": { "type": "object" } },
        "conceptCategories": { "type": "array", "items": { "type": "object" } },
        "agentTypes": { "type": "array", "items": { "type": "object" } },
        "providers": { "type": "array", "items": { "type": "object" } },
        "tuiAdapter": { "type": "array", "items": { "type": "object" } },
        "tuiAuthProvider": { "type": "array", "items": { "type": "object" } },
        "tuiMcpBridge": { "type": "array", "items": { "type": "object" } }
      },
      "additionalProperties": false
    }
  },
  "additionalProperties": false
}
```

### Project config (`amoena.json`)

Project-level configuration file placed at the repository root. Equivalent in purpose to `opencode.json` — it controls provider overrides, model selection, agent profiles, and tool permissions scoped to a specific project. Amoena merges this with user-level config, with project values taking precedence.

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://amoena.app/schemas/amoena.project.json",
  "type": "object",
  "properties": {
    "version": { "type": "integer", "minimum": 1 },
    "providers": {
      "type": "object",
      "description": "Provider-level overrides keyed by provider id",
      "additionalProperties": {
        "type": "object",
        "properties": {
          "enabled": { "type": "boolean" },
          "baseUrl": { "type": "string", "format": "uri" },
          "defaultModel": { "type": "string" },
          "env": { "type": "object", "additionalProperties": { "type": "string" } }
        },
        "additionalProperties": false
      }
    },
    "models": {
      "type": "object",
      "description": "Model aliases and selection rules",
      "properties": {
        "default": { "type": "string" },
        "fast": { "type": "string" },
        "reasoning": { "type": "string" },
        "embedding": { "type": "string" }
      },
      "additionalProperties": { "type": "string" }
    },
    "agents": {
      "type": "object",
      "description": "Agent profile overrides keyed by agent type",
      "additionalProperties": {
        "type": "object",
        "properties": {
          "model": { "type": "string" },
          "systemPrompt": { "type": "string" },
          "toolAccess": {
            "type": "array",
            "items": { "type": "string" },
            "uniqueItems": true
          },
          "stepsLimit": { "type": "integer", "minimum": 1 },
          "permissions": {
            "type": "object",
            "properties": {
              "mode": { "type": "string", "enum": ["default", "acceptEdits", "plan", "dontAsk", "bypassPermissions"] },
              "allowNetwork": { "type": "boolean" },
              "allowShell": { "type": "boolean" },
              "allowFileWrite": { "type": "boolean" }
            },
            "additionalProperties": false
          }
        },
        "additionalProperties": false
      }
    },
    "tools": {
      "type": "object",
      "description": "Tool permission overrides keyed by tool name",
      "additionalProperties": {
        "type": "object",
        "properties": {
          "enabled": { "type": "boolean" },
          "permission": { "type": "string", "enum": ["allowed", "denied", "ask"] },
          "timeout_ms": { "type": "integer", "minimum": 100 }
        },
        "additionalProperties": false
      }
    },
    "hooks": {
      "type": "array",
      "description": "Project-level hook definitions",
      "items": {
        "type": "object",
        "required": ["event", "handler"],
        "properties": {
          "event": { "type": "string" },
          "handler": { "type": "string", "enum": ["command", "http", "prompt", "agent"] },
          "config": { "type": "object" },
          "matcher": { "type": "string" },
          "priority": { "type": "integer" },
          "timeout_ms": { "type": "integer", "minimum": 100 }
        },
        "additionalProperties": false
      }
    }
  },
  "additionalProperties": false
}
```

### Provider auth config (`~/.amoena/providers/{provider-id}.json`)

Per-provider authentication configuration stored at the user level. Controls how Amoena obtains credentials for a given provider. Secrets themselves live in the OS keychain — this file only stores the auth strategy and non-sensitive metadata.

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://amoena.app/schemas/provider.auth.json",
  "type": "object",
  "required": ["providerId", "authType"],
  "properties": {
    "providerId": { "type": "string" },
    "authType": { "type": "string", "enum": ["oauth", "apikey", "env", "aws_chain"] },
    "oauth": {
      "type": "object",
      "properties": {
        "clientId": { "type": "string" },
        "authorizationUrl": { "type": "string", "format": "uri" },
        "tokenUrl": { "type": "string", "format": "uri" },
        "scopes": { "type": "array", "items": { "type": "string" } },
        "callbackPort": { "type": "integer", "minimum": 1024, "maximum": 65535 }
      },
      "additionalProperties": false
    },
    "apikey": {
      "type": "object",
      "properties": {
        "keychainService": { "type": "string" },
        "envVar": { "type": "string" },
        "headerName": { "type": "string", "default": "Authorization" },
        "headerPrefix": { "type": "string", "default": "Bearer" }
      },
      "additionalProperties": false
    },
    "aws": {
      "type": "object",
      "properties": {
        "profile": { "type": "string" },
        "region": { "type": "string" },
        "roleArn": { "type": "string" }
      },
      "additionalProperties": false
    },
    "baseUrl": { "type": "string", "format": "uri" },
    "healthCheckUrl": { "type": "string", "format": "uri" }
  },
  "additionalProperties": false
}
```

### Custom agent definition (`~/.amoena/agents/{agent-name}.json`)

User-level custom agent definitions. These extend the built-in agent catalog with user-defined agents that can be referenced in `amoena.json` or spawned via the UI.

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://amoena.app/schemas/agent.definition.json",
  "type": "object",
  "required": ["id", "name", "model", "systemPrompt"],
  "properties": {
    "id": { "type": "string", "pattern": "^[a-z][a-z0-9-]*$" },
    "name": { "type": "string" },
    "description": { "type": "string" },
    "model": { "type": "string" },
    "systemPrompt": { "type": "string" },
    "toolAccess": {
      "type": "array",
      "items": { "type": "string" },
      "uniqueItems": true
    },
    "stepsLimit": { "type": "integer", "minimum": 1, "default": 100 },
    "permissions": {
      "type": "object",
      "properties": {
        "mode": { "type": "string", "enum": ["default", "acceptEdits", "plan", "dontAsk", "bypassPermissions"] },
        "allowNetwork": { "type": "boolean", "default": false },
        "allowShell": { "type": "boolean", "default": false },
        "allowFileWrite": { "type": "boolean", "default": true }
      },
      "additionalProperties": false
    },
    "activationEvents": {
      "type": "array",
      "items": { "type": "string" },
      "description": "Events that trigger this agent (e.g., 'session:start', 'hook:pre_commit')"
    }
  },
  "additionalProperties": false
}
```

## TypeScript Interfaces

```typescript
export type ISODateString = string;
export type JsonText = string;

export type TuiType = 'claude-code' | 'opencode' | 'codex' | 'gemini' | 'native';
export type SessionStatus = 'created' | 'running' | 'paused' | 'completed' | 'failed' | 'cancelled' | 'archived';
export type MessageRole = 'system' | 'user' | 'assistant' | 'tool';
export type AttachmentReferenceKind = 'file_ref' | 'folder_ref';
export type AdapterMode = 'structured' | 'pty' | 'hybrid';

export type SessionType = 'primary' | 'child' | 'team';
export type SessionMode = 'wrapper' | 'native';
export type AuthType = 'oauth' | 'apikey' | 'env' | 'aws_chain';
export type AuthStatus = 'connected' | 'disconnected' | 'expired';
export type CredentialType = 'oauth_token' | 'api_key' | 'aws_profile';
export type AgentMode = 'primary' | 'subagent' | 'system';
export type AgentStatus = 'active' | 'idle' | 'completed' | 'failed' | 'cancelled';
export type TeamStatus = 'active' | 'completed' | 'failed' | 'cancelled';
export type PermissionDecision = 'allowed' | 'denied' | 'auto_approved' | 'user_approved';
export type HandlerType = 'command' | 'http' | 'prompt' | 'agent';
export type CloneType = 'cow' | 'worktree' | 'full';
export type WorkspaceStatus = 'active' | 'archived' | 'deleted';
export type GoalStatus = 'pending' | 'in_progress' | 'completed' | 'failed' | 'cancelled';
export type StoryStatus = 'pending' | 'in_progress' | 'completed' | 'failed' | 'skipped';

export type NotificationType = 'permission_request' | 'task_complete' | 'error' | 'session_event' | 'system_alert';
export type NotificationSeverity = 'info' | 'warning' | 'error' | 'critical';
export type GroupType = 'repo' | 'folder' | 'custom';
export type DeviceType = 'desktop' | 'mobile' | 'tablet' | 'unknown';

export type SettingScope = 'global' | 'per-tui' | 'per-session';
export type ScopeRef<TScope extends SettingScope> =
  TScope extends 'global' ? null :
  TScope extends 'per-tui' ? TuiType :
  string;

export type SessionControlEvent =
  | { kind: 'interrupt'; sessionId: string }
  | { kind: 'approve'; sessionId: string; requestId: string }
  | { kind: 'deny'; sessionId: string; requestId: string }
  | { kind: 'switch-model'; sessionId: string; model: string };

export interface SessionRecord {
  id: string;
  parent_session_id: string | null;
  session_type: SessionType;
  session_mode: SessionMode;
  tui_type: TuiType;
  provider_id: string | null;
  model_id: string | null;
  working_dir: string;
  compaction_count: number;
  context_token_count: number;
  workspace_id: string | null;
  created_at: ISODateString;
  updated_at: ISODateString;
  status: SessionStatus;
  metadata: Record<string, unknown>;
}

export interface MessageRecord {
  id: string;
  session_id: string;
  role: MessageRole;
  content: string;
  attachments: AttachmentReference[];
  tool_calls: Array<Record<string, unknown>>;
  tokens: number;
  cost: number;
  created_at: ISODateString;
}

export interface AttachmentReference {
  type: AttachmentReferenceKind;
  name: string;
  path: string;
  status?: 'modified' | 'added' | 'deleted' | 'renamed';
  previewSnippet?: string;
  itemCount?: number;
  truncated?: boolean;
  inferredTypes?: string[];
}

export interface UsageAnalyticsRecord {
  id: string;
  session_id: string | null;
  provider: string;
  model: string;
  input_tokens: number;
  output_tokens: number;
  cost: number;
  timestamp: ISODateString;
}

export interface UsageEventRecord {
  id: string;
  timestamp: ISODateString;
  tui: TuiType;
  provider: string;
  model: string;
  input_tokens: number;
  output_tokens: number;
  reasoning_tokens: number;
  cache_creation_tokens: number;
  cache_read_tokens: number;
  cost_usd: number;
  project_path: string | null;
  session_id: string | null;
  request_id: string | null;
}

export interface SettingRecord<TScope extends SettingScope = SettingScope, TValue = unknown> {
  key: string;
  value: TValue;
  scope: TScope;
  scope_ref: ScopeRef<TScope>;
  updated_at: ISODateString;
}

export interface PluginStateRecord {
  plugin_id: string;
  key: string;
  value: unknown;
  updated_at: ISODateString;
}

export interface DeviceRegistryRecord {
  device_id: string;
  name: string;
  type: DeviceType;
  paired_at: ISODateString;
  last_seen: ISODateString;
  jwt_token_hash: string;
}

export interface NotificationLogRecord {
  id: string;
  type: NotificationType;
  severity: NotificationSeverity;
  source_tui: TuiType | 'system';
  session_id: string | null;
  dispatched_to: string[];
  created_at: ISODateString;
}

export interface SessionGroupRecord {
  id: string;
  name: string;
  icon: string | null;
  type: GroupType;
  parent_group_id: string | null;
  sort_order: number;
  created_at: ISODateString;
}

export interface SessionGroupMembershipRecord {
  session_id: string;
  group_id: string;
  created_at: ISODateString;
}

export interface ProviderRecord {
  id: string;
  name: string;
  npm_package: string | null;
  auth_type: AuthType;
  auth_status: AuthStatus;
  model_count: number;
  last_refreshed_at: ISODateString | null;
  created_at: ISODateString;
}

export interface ModelCapabilityRecord {
  providerId: string;
  modelId: string;
  supportsReasoning: boolean;
  reasoningModes: Array<'off' | 'auto' | 'on'>;
  reasoningEffortSupported: boolean;
  reasoningEffortValues?: Array<'low' | 'medium' | 'high'>;
  reasoningTokenBudgetSupported: boolean;
}

export interface ModelReasoningConfig {
  providerId: string;
  modelId: string;
  mode: 'off' | 'auto' | 'on';
  effort?: 'low' | 'medium' | 'high';
}

export interface ProviderCredentialRecord {
  id: string;
  provider_id: string;
  credential_type: CredentialType;
  keychain_ref: string;
  expires_at: ISODateString | null;
  refresh_token_ref: string | null;
  created_at: ISODateString;
}

export interface ObservationRecord {
  id: string;
  session_id: string;
  type: string;
  title: string;
  subtitle: string | null;
  facts: string[];
  narrative: string | null;
  concepts: string[];
  files_read: string[];
  files_modified: string[];
  content_hash: string;
  prompt_number: number;
  discovery_tokens: number;
  created_at: ISODateString;
}

export interface ObservationEmbeddingRecord {
  observation_id: string;
  embedding: ArrayBuffer;
  model: string;
}

export interface SessionSummaryRecord {
  session_id: string;
  request: string;
  investigated: string[];
  learned: string[];
  completed: string[];
  next_steps: string[];
  files_read: string[];
  files_edited: string[];
}

export interface AgentRecord {
  id: string;
  session_id: string;
  parent_agent_id: string | null;
  type: string;
  mode: AgentMode;
  model: string;
  system_prompt: string | null;
  tool_access: string[];
  permission_config: Record<string, unknown>;
  status: AgentStatus;
  steps_limit: number | null;
}

export interface AgentTeamRecord {
  id: string;
  name: string;
  shared_task_list_path: string | null;
  status: TeamStatus;
}

export interface AgentMessageRecord {
  id: string;
  team_id: string;
  from_agent_id: string;
  to_agent_id: string | null;
  content: string;
  read_at: ISODateString | null;
}

export interface ToolExecutionRecord {
  id: string;
  session_id: string;
  agent_id: string | null;
  tool_name: string;
  input: Record<string, unknown>;
  output: Record<string, unknown> | null;
  permission_decision: PermissionDecision;
  duration_ms: number;
}

export interface HookRecord {
  id: string;
  event_name: string;
  handler_type: HandlerType;
  handler_config: Record<string, unknown>;
  matcher_regex: string | null;
  enabled: boolean;
  priority: number;
  timeout_ms: number;
}

export interface WorkspaceRecord {
  id: string;
  project_id: string;
  agent_id: string | null;
  clone_path: string;
  clone_type: CloneType;
  status: WorkspaceStatus;
  created_at: ISODateString;
}

export interface WorkspaceMergeReviewRecord {
  id: string;
  workspace_id: string;
  source_branch: string;
  target_branch: string;
  changed_files: number;
  conflicts: number;
  summary: string;
  files: Array<{ path: string; status: string }>;
  status: 'pending' | 'approved' | 'blocked' | 'applied' | 'dismissed';
  created_at: ISODateString;
  updated_at: ISODateString;
}

export interface AutopilotGoalRecord {
  id: string;
  description: string;
  status: GoalStatus;
  created_at: ISODateString;
}

export interface AutopilotStoryRecord {
  id: string;
  goal_id: string;
  title: string;
  description: string | null;
  sort_order: number;
  agent_id: string | null;
  status: StoryStatus;
  created_at: ISODateString;
}

export interface OpinionRecord {
  id: string;
  question: string;
  session_id: string | null;
  created_at: ISODateString;
}

export interface OpinionResponseRecord {
  id: string;
  opinion_id: string;
  model: string;
  provider: string;
  response: string;
  tokens_used: number;
  created_at: ISODateString;
}

export interface LinkedWorkspaceRecord {
  id: string;
  name: string;
  workspace_ids: string[];
  created_at: ISODateString;
}

export interface AmoenaProjectConfig {
  version?: number;
  providers?: Record<string, {
    enabled?: boolean;
    baseUrl?: string;
    defaultModel?: string;
    env?: Record<string, string>;
  }>;
  models?: {
    default?: string;
    fast?: string;
    reasoning?: string;
    embedding?: string;
    [alias: string]: string | undefined;
  };
  agents?: Record<string, {
    model?: string;
    systemPrompt?: string;
    toolAccess?: string[];
    stepsLimit?: number;
    permissions?: {
      mode?: 'default' | 'acceptEdits' | 'plan' | 'dontAsk' | 'bypassPermissions';
      allowNetwork?: boolean;
      allowShell?: boolean;
      allowFileWrite?: boolean;
    };
  }>;
  tools?: Record<string, {
    enabled?: boolean;
    permission?: 'allowed' | 'denied' | 'ask';
    timeout_ms?: number;
  }>;
}

export interface ProviderAuthConfig {
  providerId: string;
  authType: AuthType;
  oauth?: {
    clientId: string;
    authorizationUrl: string;
    tokenUrl: string;
    scopes?: string[];
    callbackPort?: number;
  };
  apikey?: {
    keychainService?: string;
    envVar?: string;
    headerName?: string;
    headerPrefix?: string;
  };
  aws?: {
    profile?: string;
    region?: string;
    roleArn?: string;
  };
  baseUrl?: string;
  healthCheckUrl?: string;
}

export interface AgentDefinition {
  id: string;
  name: string;
  description?: string;
  model: string;
  systemPrompt: string;
  toolAccess?: string[];
  stepsLimit?: number;
  permissions?: {
    mode?: 'default' | 'acceptEdits' | 'plan' | 'dontAsk' | 'bypassPermissions';
    allowNetwork?: boolean;
    allowShell?: boolean;
    allowFileWrite?: boolean;
  };
  activationEvents?: string[];
}

export interface SchemaMigrationRecord {
  version: number;
  description: string;
  applied_at: ISODateString;
  checksum: string;
}

export interface GlobalConfig {
  version: number;
  locale?: string;
  ui: {
    theme: string;
    density: 'compact' | 'comfortable' | 'spacious';
  };
  notifications: {
    afkTimeoutSeconds: number;
    desktopEnabled: boolean;
    soundEnabled: boolean;
  };
  telemetry: {
    enabled: boolean;
    retentionDays: number;
  };
  remoteAccess?: {
    enabled?: boolean;
    lanEnabled?: boolean;
    lanBindAddress?: string;
    relayEnabled?: boolean;
    relayEndpoint?: string;
    pairingPinTtlSeconds?: number;
  };
}

export interface PerTuiConfig {
  tui: TuiType;
  enabled: boolean;
  adapterMode: AdapterMode;
  binaryPath: string;
  defaultModel?: string;
  defaultWorkingDir?: string;
  args?: string[];
  env?: Record<string, string>;
  permissionPolicy: {
    mode: 'default' | 'acceptEdits' | 'plan' | 'dontAsk' | 'bypassPermissions';
    allowNetwork?: boolean;
    allowShell?: boolean;
    allowFileWrite?: boolean;
  };
}

export interface ThemeConfig {
  id: string;
  name: string;
  author?: string;
  mode: 'light' | 'dark';
  tokens: {
    color: Record<string, string>;
    spacing: Record<string, string>;
    radius: Record<string, string>;
    typography: Record<string, string>;
    shadow: Record<string, string>;
  };
}

export type PluginPermission =
  | 'fs.read'
  | 'fs.write'
  | 'network'
  | 'shell.execute'
  | 'notifications'
  | 'sessions.read'
  | 'sessions.write'
  | 'settings.read'
  | 'settings.write';

export interface PluginManifest {
  id: string;
  name: string;
  version: string;
  author?: string;
  description?: string;
  main: string;
  minAppVersion?: string;
  permissions: PluginPermission[];
  activationEvents: string[];
  contributes: {
    commands: Array<Record<string, unknown>>;
    views: Array<Record<string, unknown>>;
    settings: Array<Record<string, unknown>>;
    hooks: Array<Record<string, unknown>>;
    menus: Array<Record<string, unknown>>;
    tools?: Array<Record<string, unknown>>;
    observationTypes?: Array<Record<string, unknown>>;
    conceptCategories?: Array<Record<string, unknown>>;
    agentTypes?: Array<Record<string, unknown>>;
    providers?: Array<Record<string, unknown>>;
    tuiAdapter?: Array<Record<string, unknown>>;
    tuiAuthProvider?: Array<Record<string, unknown>>;
    tuiMcpBridge?: Array<Record<string, unknown>>;
  };
}
```

## Migration Strategy

Amoena uses sequential integer versions and an explicit upgrade path compatible with Tauri SQL plugin migration behavior.

- Version format: `1, 2, 3, ...` (strictly increasing, no branching versions).
- Source of truth: `schema_migrations.version`.
- Apply order: ascending version, each migration in a transaction.
- Failure mode: rollback entire transaction, keep previous stable schema.
- Drift protection: store and verify migration `checksum` before applying future versions.
- Backward compatibility: use additive changes first (new tables/columns/indexes), then phased deprecation.

Upgrade flow:
1. Open database connection and enable foreign keys.
2. Read latest `schema_migrations.version`.
3. Discover pending migrations from embedded migration manifest.
4. Apply each pending migration atomically.
5. Insert migration metadata row.
6. Continue app startup only when schema is fully current.

## Data Lifecycle

### Creation
- Session start inserts `sessions`; first user/assistant/tool outputs append to `messages`.
- Adapter pipelines write usage into both `usage_analytics` (simple provider/model trend line) and `usage_events` (full normalized event stream).
- Device pairing inserts `device_registry`; notification dispatch inserts `notification_log`.
- Group creation inserts `session_groups`; drag-and-drop assignment inserts `session_group_membership`.
- Provider registration inserts `providers`; credential storage inserts `provider_credentials` with an OS keychain reference.
- Agent spawn inserts `agents` with a link to session and optional parent agent; team creation inserts `agent_teams`.
- Each tool invocation inserts `tool_executions` with input/output payloads and permission decision.
- Knowledge captures during a session insert `observations`; embedding generation inserts `observation_embeddings`.
- Session compaction or conclusion inserts/upserts `session_summaries`.
- Autopilot workflows insert `autopilot_goals` and decompose into `autopilot_stories`.
- Multi-model queries insert `opinions` and collect `opinion_responses`.
- Workspace isolation inserts `workspaces`; grouping inserts `linked_workspaces`.
- Hook registration inserts `hooks`; inter-agent communication inserts `agent_messages`.

### Update
- Active sessions update `sessions.updated_at`, `status`, `metadata`, `compaction_count`, and `context_token_count`.
- Settings and plugin state are upserted on key-based identity (`settings` and `plugin_state`).
- Device heartbeats update `device_registry.last_seen`.
- Group reorder updates `session_groups.sort_order`.
- Provider credential refresh updates `provider_credentials.expires_at` and rotates the keychain reference; `providers.auth_status` and `providers.last_refreshed_at` are updated on sync.
- Agent status transitions update `agents.status`; story progress updates `autopilot_stories.status`.
- Goal completion updates `autopilot_goals.status`.
- Agent messages mark delivery via `agent_messages.read_at`.
- Workspace lifecycle updates `workspaces.status`.

### Deletion and retention
- Deleting a session cascades `messages`, `session_group_membership`, `observations`, `observation_embeddings`, `session_summaries`, `agents`, and `tool_executions`.
- Deleting a group removes membership rows but preserves sessions.
- Unpairing a device removes `device_registry` row and invalidates associated JWT token.
- Deleting a provider cascades `provider_credentials`; sessions referencing the provider have `provider_id` set to null.
- Deleting an agent sets `workspaces.agent_id` and `autopilot_stories.agent_id` to null; cascades `agent_messages` from that agent.
- Retention policies prune old `usage_events`, `usage_analytics`, low-severity `notification_log` records, and `tool_executions` older than the configured window.

### Cleanup jobs
- Daily job: purge analytics and logs older than configured retention windows.
- Weekly job: run integrity checks (`PRAGMA foreign_key_check`) and optimize (`VACUUM`/`ANALYZE`) during idle windows.
- Startup guard: reject boot if migration checksums do not match expected values.

## Notes on source interoperability

`usage_events` is the canonical cross-TUI analytics table and unifies:
- Claude Code session JSONL usage metadata.
- OpenCode SQLite/session stream usage data.
- Codex CLI SQLite + JSONL request accounting.
- Gemini CLI `usageMetadata` from stream output.

This keeps dashboards and cost reports provider-agnostic while preserving per-TUI specifics.
