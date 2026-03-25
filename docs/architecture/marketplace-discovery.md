# Marketplace Discovery & Registry Aggregation

## Overview

Amoena does not host its own marketplace backend. Instead, the **Marketplace Client** (see `system-architecture.md`) aggregates resources from multiple existing registries into a unified local search index. This gives users a single discovery surface for MCP servers, skills, plugins, agents, and extensions across all supported TUI runtimes (Claude Code, OpenCode, Codex CLI, Gemini CLI).

The system operates entirely client-side: poll remote registries, normalize results into a common schema, cache in SQLite with FTS5 full-text search, and present a unified browsable/searchable catalog in the Amoena UI.

## Registry Sources

> **MVP Recommendation**: Start with 2-3 verified registries only (npm + Smithery, optionally Glama). Add additional registries only after independently verifying their APIs exist and are stable. The full list of 11 registries below includes several unverified endpoints that may not have public APIs. See the Verification Status for each registry.

Amoena aggregates from up to 11 registry sources. Each source has distinct API access patterns, authentication requirements, and response formats.

### 1. Glama — MCP Server Registry

| Property | Value |
| --- | --- |
| Verification Status | ✅ Verified public API |
| URL | `https://glama.ai/api/mcp/servers` |
| Auth | None (public REST API) |
| Transport | HTTPS GET with pagination (`?page=1&limit=50`) |
| Response format | JSON array of server objects with `name`, `description`, `url`, `categories`, `securityRating`, `downloads`, `lastUpdated` |
| Rate limit | 60 requests/minute |
| Refresh interval | 1 hour |
| Unique value | Security ratings (A/B/C/D/F scale) and vulnerability assessments per MCP server |

### 2. Smithery — MCP Marketplace

| Property | Value |
| --- | --- |
| Verification Status | ✅ Verified public API |
| URL | `https://registry.smithery.ai/api/v1/servers` |
| Auth | Bearer token via `Authorization: Bearer <token>` header |
| Transport | HTTPS GET with cursor-based pagination (`?cursor=<id>&limit=50`) |
| Response format | JSON with `servers[]` array containing `id`, `name`, `description`, `author`, `version`, `installCommand`, `categories`, `downloads`, `stars` |
| Rate limit | 100 requests/minute |
| Refresh interval | 1 hour |
| Unique value | Curated install commands and verified publisher badges |

### 3. Official MCP Registry

| Property | Value |
| --- | --- |
| Verification Status | ✅ Verified public API |
| URL | `https://registry.modelcontextprotocol.io/api/servers` |
| Auth | None (public REST API) |
| Transport | HTTPS GET with offset pagination (`?offset=0&limit=100`) |
| Response format | JSON array with `name`, `description`, `repository`, `transport`, `categories`, `verified` |
| Rate limit | 30 requests/minute |
| Refresh interval | 6 hours |
| Unique value | Official community standard; `verified` flag indicates protocol compliance |

### 4. PulseMCP — MCP Directory

| Property | Value |
| --- | --- |
| Verification Status | ❓ Unverified — API existence not confirmed; verify before implementing |
| URL | `https://api.pulsemcp.com/v1/servers` |
| Auth | None (public REST API) |
| Transport | HTTPS GET with page-based pagination (`?page=1&per_page=50`) |
| Response format | JSON with `data[]` array containing `name`, `description`, `url`, `category`, `tags`, `addedAt`, `updatedAt` |
| Rate limit | 30 requests/minute |
| Refresh interval | 6 hours |
| Unique value | Rich category taxonomy and editorial curation |

### 5. LobeHub — Chat Plugins & MCP Servers

| Property | Value |
| --- | --- |
| Verification Status | ❓ Unverified — API existence not confirmed; verify before implementing |
| URL | `https://chat-plugins.lobehub.com/api/plugins` and `https://chat-plugins.lobehub.com/api/mcp` |
| Auth | None (public REST API) |
| Transport | HTTPS GET, full catalog returned in single response |
| Response format | JSON array with `identifier`, `meta.title`, `meta.description`, `meta.author`, `meta.tags`, `manifest`, `homepage` |
| Rate limit | 20 requests/minute |
| Refresh interval | 24 hours |
| Unique value | Dual catalog of chat plugins and MCP servers; rich metadata with avatar/icon URLs |

### 6. agentskills.io — Claude Code Skills

| Property | Value |
| --- | --- |
| Verification Status | ❓ Unverified — API existence not confirmed; verify before implementing |
| URL | `https://agentskills.io/api/skills` |
| Auth | None (public REST API) |
| Transport | HTTPS GET with pagination (`?page=1&limit=50`) |
| Response format | JSON array with `name`, `description`, `author`, `repository`, `skillMdUrl`, `downloads`, `tags`, `compatibleTuis` |
| Rate limit | 30 requests/minute |
| Refresh interval | 1 hour |
| Unique value | SKILL.md format skills designed for Claude Code; direct download URLs for skill files |

### 7. AgentSkills.to — Skill Marketplace

| Property | Value |
| --- | --- |
| Verification Status | ❓ Unverified — API existence not confirmed; verify before implementing |
| URL | `https://agentskills.to/api/v1/skills` |
| Auth | None (public REST API) |
| Transport | HTTPS GET with cursor pagination (`?cursor=<id>&limit=50`) |
| Response format | JSON with `skills[]` array containing `id`, `name`, `description`, `author`, `version`, `downloads`, `rating`, `categories`, `installUrl` |
| Rate limit | 30 requests/minute |
| Refresh interval | 1 hour |
| Unique value | User ratings and reviews; curated skill collections |

### 8. agent-skills.cc — Community Skills

| Property | Value |
| --- | --- |
| Verification Status | ❓ Unverified — API existence not confirmed; verify before implementing |
| URL | `https://agent-skills.cc/api/skills` |
| Auth | None (public REST API) |
| Transport | HTTPS GET with page pagination (`?page=1&size=50`) |
| Response format | JSON array with `name`, `description`, `author`, `repo`, `tags`, `lastUpdated` |
| Rate limit | 20 requests/minute |
| Refresh interval | 6 hours |
| Unique value | Community-contributed skills with GitHub repository links |

### 9. Gemini Extensions Gallery

| Property | Value |
| --- | --- |
| Verification Status | ❓ Unverified, may not exist — `extensions.gemini.google.com` is not a documented public API; verify before implementing |
| URL | `https://extensions.gemini.google.com/api/v1/extensions` |
| Auth | OAuth2 Google account token or API key via `x-api-key` header |
| Transport | HTTPS GET with token-based pagination (`?pageToken=<token>&pageSize=50`) |
| Response format | JSON with `extensions[]` array containing `id`, `name`, `description`, `publisher`, `version`, `category`, `installCommand`, `rating` |
| Rate limit | 60 requests/minute |
| Refresh interval | 24 hours |
| Unique value | Gemini-specific extensions with native `gemini extensions install` support |

### 10. OpenCode Ecosystem

| Property | Value |
| --- | --- |
| Verification Status | ❓ Unverified, may not exist — `opencode.ai/api/v1/plugins` is not a documented public API; verify before implementing |
| URL | `https://opencode.ai/api/v1/plugins` |
| Auth | None (public REST API) |
| Transport | HTTPS GET with offset pagination (`?offset=0&limit=50`) |
| Response format | JSON array with `name`, `description`, `author`, `version`, `npmPackage`, `repository`, `downloads`, `categories` |
| Rate limit | 30 requests/minute |
| Refresh interval | 6 hours |
| Unique value | OpenCode-native plugins with npm package references and event hook declarations |

### 11. npm Registry — npm-distributed MCP Servers & Plugins

| Property | Value |
| --- | --- |
| Verification Status | ✅ Verified public API |
| URL | `https://registry.npmjs.org/-/v1/search?text=keywords:mcp-server+keywords:amoena-plugin` |
| Auth | None (public REST API) |
| Transport | HTTPS GET with offset pagination (`?from=0&size=50`) |
| Response format | JSON with `objects[]` array containing `package.name`, `package.description`, `package.version`, `package.author`, `package.keywords`, `package.links`, `downloads.weekly`, `score.final` |
| Rate limit | Generous (npm public API); 100 requests/minute practical limit |
| Refresh interval | 1 hour |
| Unique value | Largest package ecosystem; weekly download counts; npm quality/popularity/maintenance scores |

## Normalized Data Model

All registry sources are normalized into a single `MarketplaceResource` type for unified search, display, and installation.

### TypeScript Interface

```typescript
export type ResourceType = 'mcp' | 'skill' | 'plugin' | 'agent' | 'extension';

export type SourceRegistry =
  | 'glama'
  | 'smithery'
  | 'mcp-registry'
  | 'pulsemcp'
  | 'lobehub'
  | 'agentskills-io'
  | 'agentskills-to'
  | 'agent-skills-cc'
  | 'gemini-extensions'
  | 'opencode-ecosystem'
  | 'npm';

export type SecurityRating = 'A' | 'B' | 'C' | 'D' | 'F' | 'unrated';

export type TuiCompatibility = 'claude-code' | 'opencode' | 'codex' | 'gemini' | 'universal';

export type InstallMethod =
  | 'mcp-config-inject'
  | 'skill-download'
  | 'npm-install'
  | 'gemini-extension-install'
  | 'plugin-manifest-install';

export interface MarketplaceResource {
  /** Stable composite key: `{source_registry}:{source_id}` */
  id: string;

  /** Canonical deduplicated ID (shared across registries for the same resource) */
  canonical_id: string | null;

  /** Human-readable name */
  name: string;

  /** Full description text */
  description: string;

  /** Resource classification */
  type: ResourceType;

  /** Which registry this record was fetched from */
  source_registry: SourceRegistry;

  /** Direct URL to the resource on the source registry */
  source_url: string;

  /** SemVer version string */
  version: string | null;

  /** Author name or organization */
  author: string;

  /** Total download count (aggregated if available) */
  downloads: number;

  /** GitHub stars or equivalent popularity metric */
  stars: number;

  /** Security rating from Glama or equivalent assessment */
  security_rating: SecurityRating;

  /** Category tags for filtering */
  categories: string[];

  /** Which TUI runtimes this resource is compatible with */
  compatible_tuis: TuiCompatibility[];

  /** How to install this resource */
  install_method: InstallMethod;

  /** URL to the resource manifest or package for installation */
  manifest_url: string;

  /** npm package name (if npm-distributed) */
  npm_package: string | null;

  /** GitHub repository URL */
  repository_url: string | null;

  /** Whether the resource is from an official/verified publisher */
  is_official: boolean;

  /** Computed quality score (0-100) */
  quality_score: number;

  /** ISO 8601 timestamp of last update at source */
  last_updated: string;

  /** ISO 8601 timestamp when Amoena last fetched this record */
  fetched_at: string;
}
```

### Rust Struct

```rust
pub struct MarketplaceResource {
    pub id: String,
    pub canonical_id: Option<String>,
    pub name: String,
    pub description: String,
    pub resource_type: ResourceType,
    pub source_registry: SourceRegistry,
    pub source_url: String,
    pub version: Option<String>,
    pub author: String,
    pub downloads: i64,
    pub stars: i64,
    pub security_rating: SecurityRating,
    pub categories: Vec<String>,
    pub compatible_tuis: Vec<TuiCompatibility>,
    pub install_method: InstallMethod,
    pub manifest_url: String,
    pub npm_package: Option<String>,
    pub repository_url: Option<String>,
    pub is_official: bool,
    pub quality_score: f64,
    pub last_updated: String,
    pub fetched_at: String,
}

pub enum ResourceType {
    Mcp,
    Skill,
    Plugin,
    Agent,
    Extension,
}

pub enum SourceRegistry {
    Glama,
    Smithery,
    McpRegistry,
    PulseMcp,
    LobeHub,
    AgentskillsIo,
    AgentskillsTo,
    AgentSkillsCc,
    GeminiExtensions,
    OpenCodeEcosystem,
    Npm,
}

pub enum SecurityRating {
    A,
    B,
    C,
    D,
    F,
    Unrated,
}

pub enum TuiCompatibility {
    ClaudeCode,
    OpenCode,
    Codex,
    Gemini,
    Universal,
}

pub enum InstallMethod {
    McpConfigInject,
    SkillDownload,
    NpmInstall,
    GeminiExtensionInstall,
    PluginManifestInstall,
}
```

## Deduplication Strategy

The same resource often appears in multiple registries (e.g., an MCP server listed on both Glama and Smithery). Amoena uses a multi-signal deduplication pipeline to assign a shared `canonical_id`.

### Deduplication Signals

1. **npm package name match**: If two resources reference the same npm package (e.g., `@modelcontextprotocol/server-filesystem`), they are the same resource. This is the strongest signal.

2. **GitHub repository URL match**: Normalize repository URLs (`github.com/org/repo` with trailing slashes, `.git` suffixes, and case removed) and match. Second strongest signal.

3. **Name + author fuzzy match**: Levenshtein distance ≤ 2 on lowercased `name` AND exact `author` match. Used when package/repo metadata is absent.

### Deduplication Algorithm

```
for each newly fetched resource R:
  1. if R.npm_package exists:
       find existing resources with same npm_package
       if found: assign R.canonical_id = existing.canonical_id
  2. else if R.repository_url exists:
       normalize URL (lowercase, strip .git, strip trailing slash)
       find existing resources with same normalized repository_url
       if found: assign R.canonical_id = existing.canonical_id
  3. else:
       compute fuzzy match against name+author of existing resources
       if match found with Levenshtein distance ≤ 2 on name AND exact author:
         assign R.canonical_id = existing.canonical_id
  4. if no match found:
       assign R.canonical_id = generate_new_canonical_id()
```

### Canonical Record Selection

When multiple registry entries share a `canonical_id`, the UI displays one canonical record with merged metadata:

- **Name/description**: prefer the record from the highest-priority registry (Glama > Smithery > Official MCP Registry > npm > others).
- **Downloads**: sum across all registries (deduplicated by registry to avoid double-counting).
- **Stars**: take the maximum value (typically from GitHub).
- **Security rating**: prefer Glama's rating when available; otherwise `unrated`.
- **Categories**: union of all category tags across registries.
- **Compatible TUIs**: union of all compatibility declarations.
- **Source badges**: UI shows all registries where the resource is listed (e.g., "Available on Glama, Smithery, npm").

## Quality Scoring Algorithm

Each `MarketplaceResource` receives a `quality_score` from 0 to 100, computed as a weighted sum of normalized signals.

### Scoring Formula

```
quality_score = (
    download_score     * 0.25 +
    stars_score        * 0.15 +
    security_score     * 0.20 +
    recency_score      * 0.15 +
    official_score     * 0.10 +
    registry_count     * 0.10 +
    version_score      * 0.05
)
```

### Signal Normalization

| Signal | Calculation | Range |
| --- | --- | --- |
| `download_score` | `min(100, log10(downloads + 1) * 20)` | 0–100 |
| `stars_score` | `min(100, log10(stars + 1) * 25)` | 0–100 |
| `security_score` | A=100, B=80, C=60, D=30, F=0, unrated=40 | 0–100 |
| `recency_score` | `max(0, 100 - days_since_update * 0.5)` | 0–100 |
| `official_score` | official=100, community=0 | 0 or 100 |
| `registry_count` | `min(100, registries_listed_in * 25)` | 0–100 |
| `version_score` | has SemVer version=100, no version=0 | 0 or 100 |

## SQLite Cache Schema

### Resource Cache Table

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
  security_rating TEXT NOT NULL DEFAULT 'unrated' CHECK (security_rating IN ('A', 'B', 'C', 'D', 'F', 'unrated')),
  categories TEXT NOT NULL DEFAULT '[]',
  compatible_tuis TEXT NOT NULL DEFAULT '[]',
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

CREATE INDEX IF NOT EXISTS idx_marketplace_canonical_id ON marketplace_resources(canonical_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_resource_type ON marketplace_resources(resource_type);
CREATE INDEX IF NOT EXISTS idx_marketplace_source_registry ON marketplace_resources(source_registry);
CREATE INDEX IF NOT EXISTS idx_marketplace_quality_score ON marketplace_resources(quality_score DESC);
CREATE INDEX IF NOT EXISTS idx_marketplace_npm_package ON marketplace_resources(npm_package) WHERE npm_package IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_marketplace_repository_url ON marketplace_resources(repository_url) WHERE repository_url IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_marketplace_compatible_tuis ON marketplace_resources(compatible_tuis);
```

### FTS5 Full-Text Search Table

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

-- Triggers to keep FTS index synchronized with resource cache
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

### Registry Sync State Table

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
  sync_status TEXT NOT NULL CHECK (sync_status IN ('idle', 'syncing', 'error')) DEFAULT 'idle',
  error_message TEXT,
  consecutive_failures INTEGER NOT NULL DEFAULT 0
);
```

## Search Engine

### Architecture

The search engine operates entirely locally using SQLite FTS5, enabling offline search after initial sync.

```
User query → Query preprocessor → FTS5 MATCH → Quality-weighted ranking → Filtered results
```

### Query Preprocessing

1. **Tokenization**: Split query on whitespace and punctuation using the `porter unicode61` tokenizer (same as FTS5 index).
2. **Fuzzy expansion**: For each query token, generate prefix matches using FTS5 prefix queries (`term*`). This handles partial matches and common typos.
3. **Phrase detection**: Quoted strings are passed as FTS5 phrase queries (`"exact phrase"`).
4. **Boolean operators**: Support `AND` (default), `OR`, and `NOT` via FTS5 query syntax.

### Search Query Execution

```sql
-- Primary search with BM25 ranking boosted by quality_score
SELECT
  r.*,
  bm25(marketplace_fts, 10.0, 5.0, 2.0, 1.0) AS relevance_score,
  (bm25(marketplace_fts, 10.0, 5.0, 2.0, 1.0) * -1 * 0.7 + r.quality_score * 0.3) AS combined_score
FROM marketplace_resources r
JOIN marketplace_fts ON marketplace_fts.rowid = r.rowid
WHERE marketplace_fts MATCH :query
ORDER BY combined_score DESC
LIMIT :limit OFFSET :offset;
```

BM25 column weights: `name` (10.0), `description` (5.0), `author` (2.0), `categories` (1.0).

### Fuzzy Matching

For typo tolerance beyond FTS5 prefix matching, the search engine applies a secondary pass:

1. If FTS5 returns fewer than 5 results, compute trigram similarity between the query and all resource names in the cache.
2. Trigram similarity threshold: 0.3 (30% overlap).
3. Merge fuzzy results with FTS5 results, deduplicating by `id`.

```sql
-- Trigram similarity is computed in Rust using the strsim crate
-- Results are inserted into a temp table and joined with marketplace_resources
CREATE TEMP TABLE IF NOT EXISTS fuzzy_matches (
  resource_id TEXT PRIMARY KEY,
  similarity REAL NOT NULL
);
```

## Filter System

### Available Filters

| Filter | Values | Implementation |
| --- | --- | --- |
| Resource type | `mcp`, `skill`, `plugin`, `agent`, `extension` | `WHERE resource_type = :type` |
| Compatible TUI | `claude-code`, `opencode`, `codex`, `gemini`, `universal` | `WHERE compatible_tuis LIKE '%:tui%'` (JSON array contains) |
| Source registry | Any of the 11 registries | `WHERE source_registry = :registry` |
| Official only | `true` / `false` | `WHERE is_official = 1` |
| Category | Free-text category tag | `WHERE categories LIKE '%:category%'` (JSON array contains) |
| Security rating | `A`, `B`, `C`, `D`, `F`, `unrated` | `WHERE security_rating = :rating` or `WHERE security_rating IN ('A', 'B')` |
| Minimum quality | Integer 0–100 | `WHERE quality_score >= :min_quality` |
| Has version | `true` / `false` | `WHERE version IS NOT NULL` |
| Updated within | `7d`, `30d`, `90d`, `365d` | `WHERE last_updated >= :cutoff_date` |

### Compound Filter Query

Filters compose with `AND` logic. The UI presents filter chips that map to SQL WHERE clauses appended to the base search or browse query.

```sql
SELECT r.*
FROM marketplace_resources r
JOIN marketplace_fts ON marketplace_fts.rowid = r.rowid
WHERE marketplace_fts MATCH :query
  AND r.resource_type = :type
  AND r.compatible_tuis LIKE '%' || :tui || '%'
  AND r.security_rating IN ('A', 'B')
  AND r.quality_score >= 50
ORDER BY r.quality_score DESC
LIMIT 50;
```

## Quality Indicators

### Displayed in UI

| Indicator | Source | Display |
| --- | --- | --- |
| Security rating | Glama security assessments | Letter badge (A–F) with color coding |
| Download count | Aggregated from all registries | Formatted number with magnitude suffix (1.2k, 45k) |
| GitHub stars | Repository metadata | Star icon with count |
| Official badge | Registry `verified`/`official` flags | Checkmark badge |
| Version recency | SemVer version string + `last_updated` | Version tag with "Updated X days ago" |
| Maintenance status | Computed from `last_updated` | Active (< 90 days), Stale (90–365 days), Unmaintained (> 365 days) |
| Registry presence | Count of registries listing this resource | "Listed on N registries" with registry icons |
| Quality score | Computed composite score | Progress bar or numeric badge (0–100) |

### Maintenance Status Computation

```
if days_since_update < 90:
    status = "active"
elif days_since_update < 365:
    status = "stale"
else:
    status = "unmaintained"
```

## Installation Flow per Resource Type

### MCP Servers (`install_method: mcp-config-inject`)

MCP server installation injects configuration into the TUI-specific config file. Each TUI has a different config format and location (see `tui-capability-matrix.md` for MCP configuration details).

#### Claude Code

- **Config file**: `~/.claude.json` (global) or project-level `.mcp.json`
- **CLI command**: `claude mcp add --transport <stdio|http|sse> <name> <url_or_command>`
- **Programmatic injection**: Write to `mcpServers` key in config JSON

```json
{
  "mcpServers": {
    "server-name": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/path"],
      "transport": "stdio"
    }
  }
}
```

#### OpenCode

- **Config file**: `opencode.json` in project root or `~/.config/opencode/config.json`
- **CLI command**: `opencode mcp add`
- **Programmatic injection**: Write to `mcp` key in config JSON

```json
{
  "mcp": {
    "server-name": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/path"],
      "type": "stdio"
    }
  }
}
```

#### Codex CLI

- **Config file**: `~/.codex/config.toml`
- **CLI command**: `codex mcp add <name>`
- **Programmatic injection**: Write to `[mcp_servers.<name>]` section in TOML

```toml
[mcp_servers.server-name]
command = "npx"
args = ["-y", "@modelcontextprotocol/server-filesystem", "/path"]
transport = "stdio"
```

#### Gemini CLI

- **Config file**: `~/.gemini/settings.json`
- **Programmatic injection**: Write to `mcpServers` key in settings JSON

```json
{
  "mcpServers": {
    "server-name": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/path"],
      "transport": "stdio"
    }
  }
}
```

#### Installation Sequence

```
1. User clicks "Install" on MCP server resource
2. Amoena prompts: "Install for which TUI?" (multi-select from compatible TUIs)
3. For each selected TUI:
   a. Read current TUI config file
   b. Parse existing MCP server entries
   c. Check for name conflicts (prompt rename if conflict)
   d. Inject new server entry with appropriate format
   e. Write config file atomically (write to temp, rename)
   f. If TUI has CLI command: optionally run `<tui> mcp add` instead
4. Emit event(marketplace:installed) for UI update
5. If TUI session is active: notify user to restart session for MCP changes
```

### Skills (`install_method: skill-download`)

Skills are SKILL.md files (and optional supporting files) downloaded to the TUI's skills directory.

#### Claude Code

- **Skills directory**: `~/.claude/skills/` (global) or `.claude/skills/` (project-level)
- **File format**: `SKILL.md` with optional supporting files in a subdirectory
- **Installation**: Download SKILL.md and supporting files to `~/.claude/skills/<skill-name>/SKILL.md`

#### OpenCode

- **Skills directory**: `~/.config/opencode/skills/` (global) or `.opencode/skills/` (project-level)
- **File format**: Skill markdown files
- **Installation**: Download skill files to `~/.config/opencode/skills/<skill-name>/`

#### Installation Sequence

```
1. User clicks "Install" on skill resource
2. Amoena determines target TUI from compatible_tuis
3. Fetch SKILL.md content from manifest_url
4. If skill has supporting files: fetch all files listed in manifest
5. Create skill directory: <tui_skills_dir>/<skill-name>/
6. Write SKILL.md and supporting files
7. Persist installation record in plugin_state table
8. Emit event(marketplace:installed)
```

### Plugins (`install_method: npm-install`)

Amoena plugins follow the manifest schema defined in `plugin-framework.md`.

#### Installation Paths

- **Plugin directory**: `~/.amoena/plugins/<plugin-id>/`
- **npm install target**: `~/.amoena/plugins/<plugin-id>/node_modules/`

#### Installation Sequence

```
1. User clicks "Install" on plugin resource
2. Fetch plugin manifest from manifest_url
3. Validate manifest against plugin.manifest.schema.json
4. Check minAppVersion compatibility
5. Display requested permissions for user approval
6. If approved:
   a. Create plugin directory: ~/.amoena/plugins/<plugin-id>/
   b. Run: npm install <npm_package> --prefix ~/.amoena/plugins/<plugin-id>/
   c. Copy/validate manifest.json
   d. Insert plugin record into plugin_state table
   e. Trigger Plugin Host onLoad -> onActivate lifecycle
7. Emit event(plugin:lifecycle) and event(marketplace:installed)
```

### Gemini Extensions (`install_method: gemini-extension-install`)

Gemini-specific extensions use the Gemini CLI's native extension system.

#### Installation Sequence

```
1. User clicks "Install" on Gemini extension
2. Amoena invokes: gemini extensions install <extension-id>
3. Monitor CLI output for success/failure
4. Persist installation record in plugin_state table
5. Emit event(marketplace:installed)
```

### Installation State Tracking

All installations are tracked in the existing `plugin_state` table (see `data-model.md`):

```sql
-- Track installed marketplace resources
INSERT INTO plugin_state (plugin_id, key, value, updated_at)
VALUES (
  'marketplace',
  'installed:<resource_id>',
  '{"resource_id":"...","install_method":"...","installed_at":"...","tui_targets":["claude-code"],"version":"..."}',
  datetime('now')
);
```

## Caching Strategy

### TTL-Based Refresh Schedule

| Registry | Refresh interval | Rationale |
| --- | --- | --- |
| Glama | 1 hour | High-traffic registry, security ratings change frequently |
| Smithery | 1 hour | Active marketplace with frequent new submissions |
| Official MCP Registry | 6 hours | Stable, slower-moving official registry |
| PulseMCP | 6 hours | Curated directory with moderate update frequency |
| LobeHub | 24 hours | Large catalog, infrequent changes |
| agentskills.io | 1 hour | Active skill submissions |
| AgentSkills.to | 1 hour | Active marketplace |
| agent-skills.cc | 6 hours | Community-driven, moderate activity |
| Gemini Extensions | 24 hours | Google-managed, stable release cadence |
| OpenCode Ecosystem | 6 hours | Growing ecosystem, moderate activity |
| npm Registry | 1 hour | Largest source, frequent publishes |

### Stale-While-Revalidate Pattern

The cache follows a stale-while-revalidate strategy for offline resilience:

1. **Cache hit (fresh)**: Return cached data immediately. TTL not expired.
2. **Cache hit (stale)**: Return cached data immediately AND trigger background refresh. TTL expired but data exists.
3. **Cache miss**: Block on network fetch. If network fails, return empty result with error indicator.
4. **Network failure during revalidation**: Keep stale data, increment `consecutive_failures` in sync state, schedule retry with exponential backoff.

### Sync Orchestration

```
on app_startup:
  for each registry in marketplace_sync_state:
    if now >= next_sync_at:
      schedule_sync(registry, priority=background)

on user_opens_marketplace_ui:
  for each registry in marketplace_sync_state:
    if now >= next_sync_at:
      schedule_sync(registry, priority=foreground)

on manual_refresh:
  for each registry:
    schedule_sync(registry, priority=foreground, force=true)
```

### Cache Size Management

- Maximum cache size: 50,000 resources across all registries.
- When cache exceeds limit: evict resources with lowest `quality_score` from registries with the most entries.
- Run `VACUUM` on marketplace tables during weekly cleanup job (aligned with `data-model.md` cleanup schedule).

## Rate Limiting

### Per-Registry Rate Limiter

Each registry has an independent rate limiter implemented as a token bucket in Rust.

```rust
pub struct RegistryRateLimiter {
    pub registry: SourceRegistry,
    pub max_requests_per_minute: u32,
    pub tokens: AtomicU32,
    pub last_refill: AtomicU64,
}
```

### Rate Limit Configuration

| Registry | Max requests/min | Burst size | Backoff base |
| --- | --- | --- | --- |
| Glama | 60 | 10 | 1s |
| Smithery | 100 | 15 | 1s |
| Official MCP Registry | 30 | 5 | 2s |
| PulseMCP | 30 | 5 | 2s |
| LobeHub | 20 | 5 | 3s |
| agentskills.io | 30 | 5 | 2s |
| AgentSkills.to | 30 | 5 | 2s |
| agent-skills.cc | 20 | 5 | 3s |
| Gemini Extensions | 60 | 10 | 1s |
| OpenCode Ecosystem | 30 | 5 | 2s |
| npm Registry | 100 | 20 | 1s |

### Exponential Backoff

When a request fails (HTTP 429 or 5xx), the rate limiter applies exponential backoff:

```
retry_delay = min(backoff_base * 2^attempt, 300s)
```

- Maximum retry attempts per sync cycle: 5.
- After 5 consecutive failures: mark registry as `error` in sync state, skip until next scheduled sync window.
- `Retry-After` header is respected when present and overrides computed backoff.

### Request Queue

All registry requests flow through a priority queue in the Rust Marketplace Client:

```
Priority levels:
  1. foreground (user-initiated search/browse) — immediate execution
  2. background (scheduled sync) — rate-limited, yields to foreground
  3. prefetch (predictive loading) — lowest priority, cancelled if queue depth > 50
```

## Registry Aggregator Architecture

### Component Diagram

```mermaid
flowchart TD
  UI[Marketplace UI]
  MC[Marketplace Client - Rust]
  RQ[Request Queue]
  RL[Rate Limiter Pool]
  NM[Normalizer]
  DD[Deduplicator]
  QS[Quality Scorer]
  DB[(SQLite Cache + FTS5)]

  R1[Glama API]
  R2[Smithery API]
  R3[MCP Registry API]
  R4[PulseMCP API]
  R5[LobeHub API]
  R6[agentskills.io API]
  R7[AgentSkills.to API]
  R8[agent-skills.cc API]
  R9[Gemini Extensions API]
  R10[OpenCode API]
  R11[npm Registry API]

  UI -->|search/browse/install| MC
  MC --> RQ
  RQ --> RL
  RL --> R1 & R2 & R3 & R4 & R5 & R6 & R7 & R8 & R9 & R10 & R11
  R1 & R2 & R3 & R4 & R5 & R6 & R7 & R8 & R9 & R10 & R11 -->|raw responses| NM
  NM -->|MarketplaceResource| DD
  DD -->|deduplicated| QS
  QS -->|scored| DB
  DB -->|query results| MC
  MC -->|events| UI
```

### Sync Flow Sequence

```mermaid
sequenceDiagram
  participant S as Scheduler
  participant MC as Marketplace Client
  participant RL as Rate Limiter
  participant API as Registry API
  participant NM as Normalizer
  participant DB as SQLite Cache

  S->>MC: trigger_sync(registry)
  MC->>DB: read sync_state(registry)
  DB-->>MC: last_cursor, last_sync_at
  MC->>RL: acquire_token(registry)
  RL-->>MC: token granted
  MC->>API: GET /api/servers?cursor=last_cursor
  API-->>MC: JSON response
  MC->>NM: normalize(raw_response, registry)
  NM-->>MC: Vec<MarketplaceResource>
  MC->>DB: upsert resources + update FTS5
  MC->>DB: update sync_state(registry, new_cursor)
  MC-->>S: sync_complete
```

## IPC Commands

The Marketplace Client exposes Tauri commands consumed by the React UI (aligned with the IPC architecture in `system-architecture.md`).

| Command | Purpose |
| --- | --- |
| `marketplace_search` | Full-text search with filters, returns paginated `MarketplaceResource[]` |
| `marketplace_browse` | Browse by category/type/TUI with sorting and pagination |
| `marketplace_get_resource` | Get full details for a single resource by ID |
| `marketplace_install` | Install a resource for specified TUI targets |
| `marketplace_uninstall` | Remove an installed resource |
| `marketplace_check_installed` | Check installation status of a resource |
| `marketplace_sync` | Trigger manual sync for one or all registries |
| `marketplace_sync_status` | Get current sync state for all registries |

### Tauri Events

| Event | Payload | Purpose |
| --- | --- | --- |
| `marketplace:sync_progress` | `{ registry, progress, total }` | Sync progress updates |
| `marketplace:sync_complete` | `{ registry, new_resources, updated_resources }` | Sync finished |
| `marketplace:sync_error` | `{ registry, error }` | Sync failure notification |
| `marketplace:installed` | `{ resource_id, install_method, tui_targets }` | Resource installed |
| `marketplace:uninstalled` | `{ resource_id }` | Resource removed |

## Config File Safety

Marketplace installations write to TUI config files (e.g., `~/.claude.json`, `~/.codex/config.toml`, `~/.gemini/settings.json`). Unsafe or malicious config values could redirect MCP server URLs, inject shell commands, or exfiltrate credentials. The following controls are mandatory:

- **No direct config file writes**: Marketplace installation flows MUST NOT write directly to TUI config files. Instead, the Rust backend generates a proposed config change using Amoena's managed config layer, validates it, and presents a diff to the user before applying.
- **User diff review**: Before any config change is applied, the UI shows the user a clear before/after diff of exactly what will be written. The user must explicitly confirm. No silent background config mutations.
- **Allowlist schema validation**: All config values are validated against an allowlist schema before writing. The schema enforces:
  - MCP server `command` fields: must be an absolute path or a known safe binary name (e.g., `npx`, `node`, `python`). No shell metacharacters (`; | & > <`).
  - MCP server `args` fields: each argument validated individually; no shell expansion.
  - MCP server transport URLs: must be `http://` or `https://` only. `file://` URLs and localhost-redirect patterns are rejected.
  - No `env` entries that override security-sensitive variables (e.g., `PATH`, `LD_PRELOAD`, `DYLD_INSERT_LIBRARIES`).
- **URL validation for MCP server entries**: MCP server URLs must pass strict validation:
  - Reject `file://` scheme (local file execution via MCP).
  - Reject URLs resolving to loopback (`127.0.0.1`, `::1`, `localhost`) unless the user explicitly opts in with a warning.
  - Reject URLs with credentials in the URL string (`https://user:pass@host`).
- **Atomic writes**: Config files are written atomically (write to temp file, then rename) to prevent partial writes on crash.

## Architectural Invariants

- Amoena never hosts or proxies registry data to third parties; all aggregation is client-local.
- Registry API credentials (Smithery bearer token, Gemini OAuth token) are stored in the Rust-managed auth boundary, never exposed to the webview.
- FTS5 index is always synchronized with the resource cache via SQLite triggers; no separate index rebuild step.
- Installation flows always validate manifests and check permissions before writing to TUI config files.
- Rate limiters operate per-registry and never share token budgets across registries.
- Offline mode serves stale cache data with clear UI indicators; no silent failures.
- The `plugin_state` table (from `data-model.md`) is the single source of truth for installation state.
- Deduplication runs on every sync cycle; `canonical_id` assignments are stable across syncs.
