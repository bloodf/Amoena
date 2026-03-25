# Database

Amoena uses a single SQLite database file for all persistent state. The database lives in the platform app data directory and is opened at runtime startup. Schema evolution is managed by a versioned migration system — 14 migrations ship with the current release.

## Migration System

Migrations are defined as compile-time `&[Migration]` constants in `persistence/migrations.rs`. Each migration has a version number, a description, and a SQL string executed inside a single transaction. A `schema_migrations` table tracks which migrations have been applied, along with a SHA-256 checksum of the SQL for integrity verification.

```rust
pub struct Migration {
    pub version: i64,
    pub description: &'static str,
    pub sql: &'static str,
}
```

At startup `apply_migrations` is called. It loads applied versions from `schema_migrations`, skips those already present, and applies pending migrations in order. Each migration is wrapped in a transaction — if the SQL fails the transaction is rolled back and the error propagates, preventing a partially-migrated database.

## Repository Pattern

Every table has a dedicated repository struct that holds an `Arc<Database>` and exposes typed methods. Repositories never return raw SQLite rows — they deserialize into domain record types. This means callers never write SQL outside of a repository file.

Example pattern:

```rust
pub struct SessionRepository {
    db: Arc<Database>,
}

impl SessionRepository {
    pub fn get(&self, id: &str) -> Result<Option<SessionRecord>> { ... }
    pub fn insert(&self, record: &SessionRecord) -> Result<()> { ... }
    pub fn update(&self, record: &SessionRecord) -> Result<()> { ... }
    pub fn list(&self) -> Result<Vec<SessionRecord>> { ... }
}
```

## Schema Reference

### sessions
Core session state. The `session_type` column distinguishes between `primary`, `child`, and `team` sessions. The `session_mode` column indicates whether the session runs via the native AI worker (`native`) or delegates to an external CLI (`wrapper`). The `tui_type` column records which CLI adapter is in use: `claude-code`, `opencode`, `codex`, `gemini`, or `native`.

```sql
CREATE TABLE sessions (
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
```

### messages
Every message exchanged in a session. `role` is one of `system`, `user`, `assistant`, `tool`. `tool_calls` and `attachments` are JSON arrays. Token and cost accounting are stored per-message.

```sql
CREATE TABLE messages (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('system', 'user', 'assistant', 'tool')),
  content TEXT NOT NULL,
  attachments TEXT NOT NULL DEFAULT '[]',
  tool_calls TEXT NOT NULL DEFAULT '[]',
  tokens INTEGER NOT NULL DEFAULT 0,
  cost REAL NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
);
```

### settings
Scoped key-value store. Settings can be `global`, `per-tui` (keyed by `tui_type`), or `per-session`. The composite primary key `(key, scope, scope_ref)` allows the same key to have different values at different scopes.

```sql
CREATE TABLE settings (
  key TEXT NOT NULL,
  value TEXT NOT NULL,
  scope TEXT NOT NULL CHECK (scope IN ('global', 'per-tui', 'per-session')),
  scope_ref TEXT,
  updated_at TEXT NOT NULL,
  PRIMARY KEY (key, scope, scope_ref)
);
```

### providers / provider_models / provider_credentials
Provider registry. `provider_models` tracks context window size, cost, and reasoning capabilities per model. `provider_credentials` stores keychain references rather than raw secrets.

### usage_analytics
Token and cost accounting aggregated by provider and model. Used to power the usage dashboard.

### tool_executions
Audit log of every tool call, including the input args, output, permission decision, and duration in milliseconds. `permission_decision` is one of `allowed`, `denied`, `auto_approved`, or `user_approved`.

### pending_approvals
Tool calls awaiting user approval. Status transitions: `pending` → `approved` or `denied`. The `PermissionBroker` blocks the AI turn on a `oneshot` channel until a resolution arrives.

### agent_profiles
Named agent personas with their system prompt, tool access list, permission ceiling, collaboration style, communication preference, and decision weight. Profiles can be created by users or loaded from bundled persona TOML/Markdown files.

### agents
Running agent instances. `mode` is `primary`, `subagent`, or `system`. Subagents reference their parent via `parent_agent_id`. The `steps_limit` column enforces a maximum number of turns for subagents. Status transitions follow the `AgentLifecycleStatus` enum: `created` → `preparing` → `active` → `idle` / `running` → `completed` / `failed` / `cancelled`.

### agent_teams
Teams of agents working toward a shared goal. The `threshold` column (default `0.6`) is the weighted approval fraction required for a decision to pass consensus. `shared_task_list_path` points to an optional task list file shared by all team members.

### agent_messages / mailbox_flags
Inter-agent mailbox. `message_type` is `message`, `decision_request`, or `decision_response`. When an agent with `collaboration_style = 'critical'` sends a decision response, a `mailbox_flag` of type `concern` is inserted and must be resolved before consensus can be evaluated.

### hooks
Registered lifecycle hooks. `handler_type` is one of `command` (shell), `http` (webhook), `prompt` (static text injection), or `agent` (spawn agent). `timeout_ms` defaults to 30 000. `priority` controls execution order when multiple hooks match the same event.

### plugins
Plugin registry for installed extensions. `ecosystem` is one of `claude-code`, `opencode`, `amoena`, or `custom`. Health tracking columns (`health_status`, `error_count`, `last_error`, `latency_ms_avg`) enable the plugin health dashboard.

### observations
Memory observations captured during sessions. Each observation has a `uri` in the form `amoena://memory/{scope}/{id}` and a `parent_uri`. `category` is one of `profile`, `preference`, `entity`, `pattern`, `tool_usage`, or `skill`.

### observations_fts
A `fts5` virtual table mirroring `observations` with Porter stemmer tokenization. Kept in sync via INSERT/UPDATE/DELETE triggers.

### memory_tiers
Three-tier summaries for each observation:
- `l0_summary` — compact one-line label (`~5 tokens`)
- `l1_summary` — detailed summary truncated at 320 characters
- `l2_content` — full JSON representation truncated at 2000 characters

### observation_embeddings
Vector embeddings (from `text-embedding-3-small`) stored as JSON arrays. Used for cosine similarity ranking in hybrid search.

### session_summaries
Per-session structured summary tracking: request, investigated items, learned facts, completed tasks, next steps, files read, and files edited.

### workspaces
Workspace clone records. `clone_type` is `cow`, `worktree`, or `full`. `run_summary` is a JSON blob written when the workspace is archived.

### workspace_merge_reviews
Code review records for workspace-to-main merges. Tracks changed files, conflicts, contributing agents, team consensus score, and flagged/acknowledged decisions.

### device_registry
Paired remote devices. Each device has a `refresh_token_hash` (SHA-256 of the current refresh token) and a `token_family_id` enabling refresh-token rotation with reuse detection.

### message_queue
Queue for messages to be sent to a session from either the app (`app`) or CLI (`cli`). Status: `pending` → `processing` → `sent` / `cancelled`.

### tasks
Structured task list entries associated with a session and optionally an agent. Supports parent/child hierarchy via `parent_task_id`. Status: `pending`, `in_progress`, `completed`, `blocked`, `cancelled`.

## Indexes

Every foreign key and frequently-filtered column has a covering index. Notable indexes:

- `idx_sessions_status` — fast status filtering
- `idx_messages_session_created` — session timeline queries
- `idx_observations_content_hash` — deduplication
- `idx_device_registry_token_family` — refresh-token family lookup
- `idx_provider_models_reasoning` — routing queries for reasoning-capable models
