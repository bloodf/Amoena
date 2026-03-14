# Memory System Architecture

## Purpose

This document defines Lunaria's memory system as a **Claude-mem compatible architecture**. The goal is not to borrow ideas loosely. The goal is to replicate the operational model closely enough that:

- Lunaria behaves like a first-class Claude-mem host in native mode
- Claude-mem-compatible plugins and workflows can run with minimal adaptation
- new upstream Claude-mem features can be reviewed, diffed, and ported intentionally

## Source Of Truth

When Lunaria's memory behavior is ambiguous, use this precedence order:

1. this document
2. [`system-architecture.md`](./system-architecture.md)
3. [`agent-backend-interface.md`](./agent-backend-interface.md)
4. [`data-model.md`](./data-model.md)
5. upstream Claude-mem behavior, when it does not conflict with Lunaria's desktop-first runtime model

## Product Decision

Lunaria's memory system is a **Claude-mem parity subsystem**, not a generic notes feature.

That means Lunaria must preserve the same conceptual pipeline:

1. observe
2. normalize
3. persist
4. index
5. retrieve
6. inject
7. summarize
8. evolve with upstream

## Core Principles

- **Desktop-owned**: the Axum runtime is the execution host and source of truth.
- **Session-aware**: memory is tied to sessions, workspaces, agents, and lineage.
- **Observation-first**: raw observations are the canonical primitive.
- **Deterministic injection**: the same context should produce the same retrieval set when inputs are unchanged.
- **Claude-mem parity**: when Claude-mem has a real feature, Lunaria should either implement it or explicitly document why it diverges.
- **Upstream watchability**: new Claude-mem releases must be reviewable and portable through a dedicated sync workflow.

## Compatibility Scope

Lunaria must mirror the following Claude-mem behaviors where technically possible:

- observation capture from session/tool activity
- persisted memory records on disk and in SQLite-backed metadata
- session-start and turn-time retrieval
- memory summaries
- explicit memory writes when the model requests durable recall
- relevance-based injection into the system prompt / turn context
- project-scoped memory boundaries

Lunaria extends Claude-mem in these ways:

- multi-agent lineage support
- workspace/worktree scoping
- hybrid FTS5 + SQLite-vec retrieval
- GUI inspection and filtering
- mobile visibility for summary-level remote workflows

## System Model

### Inputs

Memory can be created from:

- user prompts
- assistant outputs
- tool executions
- hook outputs
- manual user observations
- session summaries
- plugin-provided observation types

### Processing Stages

1. **Observation capture**
   - create a candidate observation from runtime events
2. **Normalization**
   - classify type, source, scope, and tags
3. **Deduplication**
   - hash normalized content and suppress redundant writes
4. **Persistence**
   - write canonical record to SQLite and optional Claude-compatible on-disk structures
5. **Indexing**
   - update FTS5 index immediately
   - enqueue embeddings/vector indexing when enabled
6. **Retrieval**
   - FTS, vector, or hybrid search depending on phase and configuration
7. **Injection**
   - select top-K relevant memories for the active turn
8. **Summary synthesis**
   - periodically generate session and continuity summaries

## Retrieval Modes

### MVP

- FTS5 keyword and phrase search
- deterministic ranking based on textual relevance plus recency
- explicit injection preview in the desktop UI

### V1

- SQLite-vec embeddings
- hybrid ranking: FTS score + vector score + recency + scope match
- per-session continuity summaries

## Embedding Model

| Context | Model | Rationale |
|---------|-------|-----------|
| Local (default) | `nomic-embed-text` via Ollama | Zero-cost, fast, good quality for code/text |
| Cloud fallback | OpenAI `text-embedding-3-small` | When local model unavailable or user preference |

Embedding model selection is a user-configurable setting with auto-detection: if Ollama is running with `nomic-embed-text` available, use it; otherwise fall back to the configured cloud provider.

## Hybrid Ranking

V1 retrieval uses **Reciprocal Rank Fusion (RRF)** to combine BM25 (FTS5) and cosine similarity (vector) scores:

```
RRF_score(d) = Σ 1 / (k + rank_i(d))
```

Where `k = 60` (standard RRF constant) and `rank_i(d)` is document `d`'s rank in result list `i` (FTS5 or vector).

Additional ranking signals (combined via weighted sum):
- Recency: exponential decay with half-life of 7 days
- Scope match: bonus for same-workspace, same-session, same-agent observations
- Explicit pins: pinned observations always rank first

## Injection Budget

| Parameter | Default | Configurable |
|-----------|---------|-------------|
| Max injection per turn | 8 KB | Yes, via settings |
| Progressive disclosure layers | 3 | No |

### Progressive Disclosure (inspired by claude-mem)

Memory injection uses a 3-layer progressive disclosure pattern to minimize token cost:

1. **Index layer** (~100 tokens per observation): ID, title, type, timestamp — always injected for top-K matches
2. **Timeline layer** (~500 tokens per observation): Adds summary and key details — injected when the model requests more context on a specific observation
3. **Full detail layer** (~1000 tokens per observation): Complete observation content — injected only on explicit request

This pattern achieves ~10x token savings compared to always injecting full observations. The index layer provides enough signal for the model to decide which observations to expand.

## Scope Boundaries

Memory must respect:

- workspace identity
- linked-workspace policy
- agent lineage
- session lineage
- plugin permission scope

Child agents may inherit parent scope. Sibling agents must not silently read each other's private memory without explicit lineage rules.

## Persisted Shapes

The canonical persistence layer remains the data model in [`data-model.md`](./data-model.md), especially:

- `observations`
- `observation_embeddings`
- `session_summaries`
- memory-related settings keys

If Lunaria also writes Claude-compatible project memory files, those are a compatibility artifact, not the primary database.

## Injection Rules

Memory injection must be:

- deterministic
- bounded
- explainable
- visible in the GUI

Injection order:

1. explicit per-turn pinned context
2. session continuity summary
3. highest-ranked relevant observations
4. plugin or hook memory additions

The injection budget must never grow unbounded. When the context budget is constrained, summaries outrank raw low-value observations.

## Session Summary Rules

Session summaries must be generated:

- at session completion
- on explicit checkpoint
- before context compaction when useful
- after long-running autopilot or multi-agent runs

Each summary should preserve:

- goals
- decisions
- important file/workspace context
- unresolved risks
- next likely continuation point

## Three-Tier Context Loading (OpenViking-inspired)

Lunaria adopts a **three-tier progressive context loading** system inspired by OpenViking's AGFS (Agent File System) architecture. Every memory item — observation, skill, resource — is stored with three levels of detail, loaded on demand to minimize token cost.

### Tier Definitions

| Tier | Name | Token Budget | Content | When Loaded |
|------|------|-------------|---------|-------------|
| **L0** | Index | ~50–100 tokens | ID, title, type, timestamp, category tag | Always — injected for all top-K matches |
| **L1** | Summary | ~300–500 tokens | Key details, summary, relationship pointers | On model request or high-relevance score (>0.85) |
| **L2** | Full | ~800–2000 tokens | Complete observation content, all metadata | On explicit model request only |

This replaces the earlier "Progressive Disclosure" section with a more structured, URI-addressable tier system.

### Intent Analysis Before Retrieval

Before executing retrieval, the system classifies the query intent to determine scope:

| Intent Scope | Description | Retrieval Target |
|-------------|-------------|-----------------|
| **session-local** | Question about current conversation | Session-scoped observations only |
| **workspace** | Question about the project or codebase | Workspace-scoped observations + knowledge graph |
| **global** | Question about user preferences or cross-project patterns | Global observations + user profile entities |

Intent analysis uses a lightweight LLM call (routable to local model) that returns a structured `{ scope, categories, keywords }` object.

### Six-Category Extraction Taxonomy

Every observation is classified into one of six categories (inspired by OpenViking's AGFS taxonomy):

| Category | Description | Examples |
|----------|-------------|---------|
| **Profile** | Persistent information about the user | Role, expertise, working style, background |
| **Preferences** | User choices and configuration patterns | Coding style, tool preferences, review standards |
| **Entities** | Named things: people, projects, technologies | "Lunaria", "React 19", "Tauri 2" |
| **Patterns** | Recurring behaviors, workflows, anti-patterns | Debugging approach, commit style, review process |
| **Tools** | Tool usage patterns and configurations | MCP servers, CLI tools, IDE settings |
| **Skills** | Learned capabilities and domain knowledge | Languages known, frameworks mastered, domain expertise |

Categories are assigned during the normalization stage (§ Processing Stages, step 2) and stored as a column on the `observations` table.

### LLM-Based Memory Deduplication

Beyond the existing hash-based deduplication (§ Processing Stages, step 3), the system performs **semantic deduplication** using LLM comparison:

1. When a new observation's embedding similarity exceeds 0.90 against an existing observation, trigger a dedup check.
2. Send both observations to the LLM with a structured prompt asking: "Are these the same fact? Should they be merged?"
3. If the LLM returns `merge`, combine the observations — keep the newer timestamp, merge facts arrays, preserve the richer narrative.
4. If the LLM returns `distinct`, both observations are kept with a `related_to` link.

This prevents memory bloat from semantically identical observations captured across different sessions.

### MCP Tool-to-Skill Conversion Pipeline

Inspired by OpenViking's skill system, Lunaria can convert MCP tool definitions into reusable agent skills:

1. **Discovery**: When an MCP server registers tools, capture the tool schema (name, description, input schema).
2. **Skill wrapping**: Generate a skill definition that wraps the MCP tool call with: pre-conditions, post-conditions, usage examples, and failure handling.
3. **Skill persistence**: Store the generated skill in the `observations` table with category `skill` and type `tool_usage`.
4. **Skill injection**: When the model's intent analysis detects a task matching a known skill, inject the skill's L1 summary into context.

### Architectural Inspiration

The three-tier loading system, six-category taxonomy, and AGFS hierarchical namespace are inspired by [OpenViking](https://github.com/openviking/openviking). OpenViking's key insight is that every context item (memory, skill, resource) can be treated as a "file" with a URI, parent URI, metadata, and tiered content — unifying what would otherwise be separate storage systems.

## Competitive Reference: Osaurus Memory Model

[Osaurus](https://github.com/osaurus-ai/osaurus) implements a 4-layer memory system worth studying as a design reference.

### Layer 1: User Profile

Persistent information about the user — preferences, background, working style. Survives across all sessions and agents. Updated incrementally as the system learns more about the user.

### Layer 2: Working Memory

Current conversation context and recent interactions. Scoped to the active session. Discarded or archived when the session ends.

### Layer 3: Conversation Summaries

Historical summaries generated from past sessions. Provides long-term recall across sessions without replaying full conversation history.

### Layer 4: Knowledge Graph

Semantic relationship tracking between entities extracted from conversations:

- **Entity extraction**: people, projects, technologies, preferences, facts
- **Typed relationships**: directed edges like `user → prefers → TypeScript`
- **Contradiction detection**: new facts are checked against existing knowledge for conflicts
- **Contextual recall**: relevant knowledge is retrieved during inference based on the current conversation
- **Accumulative intelligence**: agents improve over time as the knowledge graph grows

Osaurus uses VecturaKit for vector embeddings across all layers.

### Lunaria ↔ Osaurus Layer Mapping

Lunaria's Claude-mem parity model covers most of Osaurus's layers through different abstractions:

| Osaurus Layer | Lunaria Equivalent | Status |
|---|---|---|
| User Profile | Observations scoped to workspace/global + pinned context | Covered — observation types and scope boundaries already support persistent user-level knowledge |
| Working Memory | Session-scoped observations + turn injection pipeline | Covered — the observe → inject pipeline handles active context |
| Conversation Summaries | `session_summaries` table + continuity summaries | Covered — session summary rules explicitly define generation triggers and preserved content |
| Knowledge Graph | No direct equivalent | Gap — see Knowledge Graph Layer below |

The primary architectural gap is Layer 4. Lunaria's hybrid FTS5 + sqlite-vec retrieval handles similarity-based recall effectively, but does not model structured relationships between entities or detect factual contradictions.

## Knowledge Graph Layer (Future)

This section proposes a knowledge graph extension to Lunaria's memory system. It builds on the existing SQLite + FTS5 + sqlite-vec stack and does not require new infrastructure.

### Motivation

Observation-based memory captures **what was said**. A knowledge graph captures **what is known** — structured facts, entities, and the relationships between them. This enables:

- answering relational queries ("which projects use React?") without scanning raw observations
- detecting contradictions when new facts conflict with existing knowledge
- improving retrieval precision by combining semantic similarity with graph traversal
- accumulating durable knowledge that outlives individual sessions

### SQLite Schema

The knowledge graph lives in the same SQLite database as observations. All tables use the existing `workspace_id` scoping pattern from `data-model.md`.

#### Entities

```sql
CREATE TABLE kg_entities (
    id              TEXT PRIMARY KEY,
    name            TEXT NOT NULL,
    kind            TEXT NOT NULL CHECK (kind IN (
                        'person', 'project', 'technology', 'preference',
                        'fact', 'organization', 'file', 'concept'
                    )),
    description     TEXT,            -- short canonical description of the entity
    aliases         TEXT,            -- JSON array of alternate names, e.g. '["TS","typescript"]'
    workspace_id    TEXT NOT NULL,
    first_seen      TEXT NOT NULL,   -- ISO 8601
    last_seen       TEXT NOT NULL,   -- ISO 8601
    mention_count   INTEGER NOT NULL DEFAULT 1,
    metadata        TEXT,            -- JSON blob for kind-specific attributes
    FOREIGN KEY (workspace_id) REFERENCES workspaces(id)
);

CREATE INDEX idx_kg_entities_workspace ON kg_entities(workspace_id);
CREATE INDEX idx_kg_entities_kind      ON kg_entities(kind);
```

Entity embeddings are stored in a sqlite-vec virtual table, keyed by entity ID:

```sql
CREATE VIRTUAL TABLE kg_entity_embeddings USING vec0(
    entity_id TEXT PRIMARY KEY,
    embedding FLOAT[768]            -- matches nomic-embed-text dimensionality
);
```

FTS5 indexes entity names, aliases, and descriptions for keyword retrieval:

```sql
CREATE VIRTUAL TABLE kg_entities_fts USING fts5(
    name,
    aliases,
    description,
    content='kg_entities',
    content_rowid='rowid',
    tokenize='porter unicode61'
);
```

#### Relationships

```sql
CREATE TABLE kg_relationships (
    id                      TEXT PRIMARY KEY,
    source_id               TEXT NOT NULL,
    target_id               TEXT NOT NULL,
    relation                TEXT NOT NULL,
    confidence              REAL NOT NULL DEFAULT 1.0 CHECK (confidence BETWEEN 0.0 AND 1.0),
    weight                  REAL NOT NULL DEFAULT 1.0,  -- decayed by recency during ranking
    source_observation_id   TEXT,
    created_at              TEXT NOT NULL,               -- ISO 8601
    superseded_by           TEXT,                        -- FK to newer relationship if contradicted
    FOREIGN KEY (source_id)              REFERENCES kg_entities(id),
    FOREIGN KEY (target_id)              REFERENCES kg_entities(id),
    FOREIGN KEY (source_observation_id)  REFERENCES observations(id),
    FOREIGN KEY (superseded_by)          REFERENCES kg_relationships(id)
);

CREATE INDEX idx_kg_rel_source   ON kg_relationships(source_id);
CREATE INDEX idx_kg_rel_target   ON kg_relationships(target_id);
CREATE INDEX idx_kg_rel_relation ON kg_relationships(relation);
```

#### Entity Aliases (for resolution)

```sql
CREATE TABLE kg_entity_aliases (
    alias       TEXT NOT NULL,
    entity_id   TEXT NOT NULL,
    PRIMARY KEY (alias, entity_id),
    FOREIGN KEY (entity_id) REFERENCES kg_entities(id)
);

CREATE INDEX idx_kg_alias_lower ON kg_entity_aliases(alias COLLATE NOCASE);
```

### Relationship Type Taxonomy

Relationships use a fixed taxonomy of directed edge labels. New types require a schema migration.

| Category | Relation | Example | Inverse |
|----------|----------|---------|---------|
| **Preference** | `prefers` | `user → prefers → TypeScript` | — |
| **Usage** | `uses` | `project-lunaria → uses → Tauri 2` | `used-by` |
| **Ownership** | `owns` | `user → owns → project-lunaria` | `owned-by` |
| **Participation** | `works-on` | `user → works-on → project-lunaria` | — |
| **Dependency** | `depends-on` | `project-lunaria → depends-on → sqlite-vec` | `dependency-of` |
| **Knowledge** | `knows` | `user → knows → Rust` | — |
| **Association** | `relates-to` | `React 19 → relates-to → RSC` | `relates-to` (symmetric) |
| **Composition** | `part-of` | `auth-module → part-of → project-lunaria` | `contains` |
| **Contradiction** | `contradicts` | `rel-42 → contradicts → rel-17` | `contradicts` (symmetric) |
| **Supersession** | `supersedes` | `"user prefers TS" → supersedes → "user prefers JS"` | `superseded-by` |
| **Creation** | `created-by` | `auth-module → created-by → user` | `created` |
| **Temporal** | `preceded-by` | `v2-migration → preceded-by → v1-release` | `followed-by` |

When the LLM extraction produces a relation not in this taxonomy, it must be mapped to the closest match or dropped with a warning log.

### Entity Extraction Pipeline

Entity extraction runs as an **asynchronous post-processing task** after observation persistence. It must not block the observe → persist → inject hot path. Failed extractions are retried up to 3 times with exponential backoff, then dropped without affecting core memory operations.

#### Step 1 — LLM-Based Extraction with Structured Output

Each new observation is sent to the LLM with a structured output schema requesting entities and relationships. The prompt includes the observation content and a sample of nearby existing entities (by embedding similarity) to encourage resolution over duplication.

Expected structured output format:

```json
{
  "entities": [
    {
      "name": "Lunaria",
      "kind": "project",
      "description": "Desktop AI assistant built with Tauri 2",
      "aliases": ["lunaria-app"]
    },
    {
      "name": "TypeScript",
      "kind": "technology",
      "description": "Typed superset of JavaScript",
      "aliases": ["TS"]
    }
  ],
  "relationships": [
    {
      "source": "Lunaria",
      "target": "TypeScript",
      "relation": "uses",
      "confidence": 0.95
    }
  ]
}
```

The LLM is constrained to the relationship taxonomy (§ Relationship Type Taxonomy). Unknown relation types in the output are mapped to the closest taxonomy entry or dropped.

#### Step 2 — Entity Resolution

For each extracted entity, the pipeline attempts to match it against existing entities:

1. **Exact name match**: case-insensitive lookup in `kg_entity_aliases`
2. **Embedding similarity**: compute embedding for the candidate name + description, query `kg_entity_embeddings` for cosine similarity > 0.85
3. **LLM disambiguation** (optional, for ambiguous cases): if multiple candidates score above 0.85, ask the LLM to select the best match given context

Resolution thresholds:

| Signal | Threshold | Action |
|--------|-----------|--------|
| Exact alias match | — | Merge unconditionally |
| Embedding similarity ≥ 0.92 | High | Auto-merge, update `last_seen` and `mention_count` |
| Embedding similarity 0.85–0.92 | Medium | LLM disambiguation pass |
| Embedding similarity < 0.85 | Low | Create new entity |

#### Step 3 — Persistence

After resolution, the pipeline writes in a single transaction:

1. `INSERT` or `UPDATE` entities in `kg_entities`
2. `INSERT` embeddings in `kg_entity_embeddings`
3. Update `kg_entities_fts` triggers
4. `INSERT` relationships in `kg_relationships`
5. `INSERT` aliases in `kg_entity_aliases`

#### Step 4 — Contradiction Check

New relationships are compared against existing edges for the same source entity and relation type. See § Contradiction Detection for the full algorithm.

### Contradiction Detection

Contradictions arise when a new relationship asserts a fact that conflicts with an existing edge. The detection algorithm uses a two-phase approach: fast candidate filtering followed by LLM verification.

#### Phase 1 — Candidate Filtering

For each newly extracted relationship `(source, relation, target)`:

1. Query existing relationships with the same `source_id` and `relation`:
   ```sql
   SELECT id, target_id, confidence, created_at
   FROM kg_relationships
   WHERE source_id = ?
     AND relation = ?
     AND superseded_by IS NULL;
   ```
2. For each existing edge, compute embedding similarity between the new target entity and the existing target entity using `kg_entity_embeddings`.
3. If the targets are **different entities** (similarity < 0.85) and the relation type is **single-valued** (e.g., `prefers` — a user typically has one active preference per domain), the pair is a contradiction candidate.

Single-valued relations: `prefers`, `owns` (per domain), `works-on` (primary).
Multi-valued relations: `uses`, `knows`, `relates-to`, `depends-on` — these are not contradictions when multiple targets exist.

#### Phase 2 — LLM Verification

Contradiction candidates are sent to the LLM for verification:

```json
{
  "existing_fact": "user → prefers → JavaScript (confidence: 0.90, from 2024-12-01)",
  "new_fact": "user → prefers → TypeScript (confidence: 0.95, from 2025-01-15)",
  "observation_context": "User said: 'I've switched to TypeScript for all new projects.'"
}
```

The LLM returns a structured verdict:

```json
{
  "is_contradiction": true,
  "resolution": "supersede",
  "reasoning": "User explicitly stated a preference change. The new fact supersedes the old one."
}
```

Possible resolutions:

| Resolution | Action |
|------------|--------|
| `supersede` | Set `superseded_by` on the old relationship, pointing to the new one. Create a `supersedes` edge. |
| `coexist` | Both facts are valid (e.g., preferences in different domains). No contradiction edge created. |
| `conflict` | Genuine unresolved conflict. Create a `contradicts` edge between the two relationships. Surface in GUI for user review. |

#### Contradiction Observation

When a `conflict` resolution is returned, the system creates a contradiction observation:

```sql
INSERT INTO observations (id, kind, content, workspace_id, created_at)
VALUES (
    ?,
    'contradiction',
    'Conflict detected: existing "user → prefers → JavaScript" vs new "user → prefers → TypeScript". Requires user review.',
    ?,
    datetime('now')
);
```

Contradiction observations appear in the desktop GUI as a dedicated review surface. The user can resolve them by confirming the supersession, marking both as valid, or dismissing the new fact.

### Retrieval Integration

Knowledge graph queries are a third retrieval signal alongside FTS5 and sqlite-vec. The three signals are combined using **3-way Reciprocal Rank Fusion (RRF)**, extending the existing 2-way RRF from § Hybrid Ranking.

#### Three Retrieval Channels

1. **FTS5 (BM25)**: keyword search over observations via `observations_fts`
2. **Vector similarity**: cosine similarity over `observation_embeddings` via sqlite-vec
3. **Graph traversal**: given the current turn's detected entities, walk 1–2 hops in `kg_relationships` to collect related entities and their source observations

#### Graph Traversal Query

For each entity mentioned in the current turn, retrieve connected facts:

```sql
-- 1-hop: direct relationships from a given entity
SELECT r.id, r.relation, r.confidence, r.source_observation_id,
       t.name AS target_name, t.kind AS target_kind
FROM kg_relationships r
JOIN kg_entities t ON r.target_id = t.id
WHERE r.source_id = :entity_id
  AND r.superseded_by IS NULL
  AND r.confidence >= 0.5
ORDER BY r.confidence DESC, r.created_at DESC
LIMIT 20;

-- 2-hop: entities reachable through an intermediate node
SELECT r2.id, r2.relation, r2.confidence, r2.source_observation_id,
       e2.name AS hop2_name, e2.kind AS hop2_kind
FROM kg_relationships r1
JOIN kg_relationships r2 ON r1.target_id = r2.source_id
JOIN kg_entities e2 ON r2.target_id = e2.id
WHERE r1.source_id = :entity_id
  AND r1.superseded_by IS NULL
  AND r2.superseded_by IS NULL
  AND r2.target_id != :entity_id   -- avoid cycles
ORDER BY (r1.confidence * r2.confidence) DESC
LIMIT 10;
```

#### 3-Way RRF Fusion

Each channel produces a ranked list of observation IDs. The fused score for each observation `d`:

```
RRF_score(d) = w_fts  · 1/(k + rank_fts(d))
             + w_vec  · 1/(k + rank_vec(d))
             + w_graph · 1/(k + rank_graph(d))
```

Where:

| Parameter | Default | Description |
|-----------|---------|-------------|
| `k` | 60 | Standard RRF smoothing constant |
| `w_fts` | 1.0 | FTS5 channel weight |
| `w_vec` | 1.0 | Vector similarity channel weight |
| `w_graph` | 0.8 | Graph channel weight (slightly lower — graph results are indirect) |

If an observation does not appear in a channel's result list, it receives no contribution from that channel (not a penalty). The additional ranking signals from § Hybrid Ranking (recency decay, scope match, explicit pins) are applied after RRF fusion as a final re-ranking pass.

The injection budget (§ Injection Budget) governs how many graph-derived facts are included per turn. Graph facts compete with observation-based memories for injection slots.

### Query Examples

These queries demonstrate common knowledge graph operations. All assume `workspace_id` scoping via a `:ws` parameter.

#### Find all technologies used by a project

```sql
SELECT e.name, e.kind, r.confidence, r.created_at
FROM kg_relationships r
JOIN kg_entities e ON r.target_id = e.id
WHERE r.source_id = (SELECT id FROM kg_entities WHERE name = 'Lunaria' AND workspace_id = :ws)
  AND r.relation = 'uses'
  AND r.superseded_by IS NULL
ORDER BY r.confidence DESC;
```

#### Find all entities related to a keyword (hybrid FTS + graph)

```sql
-- Step 1: FTS5 lookup for matching entities
SELECT e.id, e.name, e.kind
FROM kg_entities_fts fts
JOIN kg_entities e ON e.rowid = fts.rowid
WHERE kg_entities_fts MATCH :query
  AND e.workspace_id = :ws
LIMIT 10;

-- Step 2: expand each matched entity via 1-hop graph traversal (application code)
```

#### Find unresolved contradictions for user review

```sql
SELECT
    r_new.id          AS contradiction_id,
    e_src.name        AS source_entity,
    r_old.relation,
    e_old_tgt.name    AS existing_target,
    e_new_tgt.name    AS conflicting_target,
    r_new.created_at  AS detected_at
FROM kg_relationships r_contra
JOIN kg_relationships r_old ON r_contra.source_id = r_old.id
JOIN kg_relationships r_new ON r_contra.target_id = r_new.id
JOIN kg_entities e_src     ON r_old.source_id = e_src.id
JOIN kg_entities e_old_tgt ON r_old.target_id = e_old_tgt.id
JOIN kg_entities e_new_tgt ON r_new.target_id = e_new_tgt.id
WHERE r_contra.relation = 'contradicts'
  AND r_old.superseded_by IS NULL
  AND e_src.workspace_id = :ws
ORDER BY r_new.created_at DESC;
```

#### Semantic entity search (sqlite-vec nearest neighbors)

```sql
SELECT entity_id, distance
FROM kg_entity_embeddings
WHERE embedding MATCH :query_embedding
  AND k = 10;
```

The `entity_id` results are joined back to `kg_entities` and filtered by `workspace_id` in application code, since sqlite-vec virtual tables do not support compound WHERE clauses.

#### Entity resolution — find potential duplicates

```sql
SELECT a.entity_id AS candidate_id, e.name, e.kind
FROM kg_entity_aliases a
JOIN kg_entities e ON a.entity_id = e.id
WHERE a.alias = :candidate_name COLLATE NOCASE
  AND e.workspace_id = :ws;
```

#### User knowledge profile — summarize what the system knows about a person

```sql
SELECT r.relation, e.name AS target, e.kind, r.confidence
FROM kg_relationships r
JOIN kg_entities e ON r.target_id = e.id
WHERE r.source_id = :user_entity_id
  AND r.superseded_by IS NULL
ORDER BY r.relation, r.confidence DESC;
```

### Scope Rules

Knowledge graph entities and relationships inherit the same scope boundaries as observations:

- workspace isolation
- agent lineage visibility
- plugin permission scope

Cross-workspace entity references require explicit linked-workspace policy, consistent with § Scope Boundaries.

### Implementation Phases

| Phase | Scope | Depends On |
|-------|-------|------------|
| KG-1 | Entity table, extraction pipeline, basic relationship storage | V1 retrieval (sqlite-vec) |
| KG-2 | Contradiction detection, GUI review surface | KG-1 |
| KG-3 | Graph-aware retrieval fusion, multi-hop traversal | KG-2, hybrid ranking |

This is not a V1 feature. It is a post-V1 extension that builds on the hybrid retrieval foundation.

## Claude-mem Upstream Sync Policy

Lunaria must maintain a dedicated **upstream parity workflow** for Claude-mem.

When Claude-mem releases new features:

1. inspect the upstream repository and release notes
2. compare the new behavior with Lunaria's current implementation
3. classify each change:
   - already supported
   - missing and should be ported
   - intentionally divergent
4. document the gap
5. create or update an implementation prompt to port the missing behavior

## Required Upstream Review Prompt

The prompt catalog must include a dedicated prompt that tells an implementation agent to:

- inspect the upstream Claude-mem repository
- identify new features or behavior changes
- compare them with Lunaria's memory subsystem
- implement or document parity gaps

That prompt is not optional. It is part of the memory maintenance model.

## Acceptance Criteria

The memory subsystem is architecturally complete when:

- the observe -> persist -> retrieve -> inject pipeline is specified
- Claude-mem parity is an explicit product decision
- upstream sync is a first-class maintenance workflow
- storage, retrieval, and injection rules are deterministic
- multi-agent and workspace scoping are defined

