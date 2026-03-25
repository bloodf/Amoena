# Memory

Amoena's memory system automatically captures, deduplicates, and retrieves observations across sessions. Every prompt, response, and tool result is a potential observation. Observations are stored with three-level summaries and optional vector embeddings, enabling both fast full-text search and semantic similarity ranking.

## Concepts

**Observation** — a discrete unit of memory representing something the AI learned, did, or noticed. Each observation has a title, a narrative, a list of facts, and metadata about which files were read/modified.

**Memory Tier** — each observation is summarized at three levels of detail:
- **L0** — compact one-line label (`~5 tokens`). Injected into every prompt.
- **L1** — detailed summary, truncated at 320 characters. Retrieved on demand via `MemoryExpand`.
- **L2** — full JSON representation, truncated at 2000 characters. Retrieved on demand via `MemoryExpand`.

**Observation Categories:**

| Category | Description |
|---|---|
| `profile` | Information about the user or project identity |
| `preference` | User preferences and settings discovered in conversation |
| `entity` | Entities (people, systems, files, concepts) mentioned |
| `pattern` | Recurring patterns or conventions discovered in the codebase |
| `tool_usage` | Results and outcomes from tool calls |
| `skill` | Learned capabilities or techniques |

## ObservationInput

The primary input type for capturing a memory:

```rust
pub struct ObservationInput {
    pub session_id: String,
    pub title: String,           // brief name for the observation
    pub narrative: String,       // full text description
    pub source: ObservationSource,
    pub facts: Vec<String>,      // extracted bullet facts
    pub files_read: Vec<String>, // file paths read during this observation
    pub files_modified: Vec<String>,
    pub prompt_number: i64,      // turn index within the session
}

pub enum ObservationSource {
    UserPrompt,
    AssistantResponse,
    ToolResult { tool_name: String },
    Manual,
}
```

## Capture Flow

`MemoryService::capture` is called automatically after each AI turn:

```
ObservationInput
    ↓
1. content_hash = SHA-256(title + narrative + concepts + category)
2. duplicate check: observations.latest_by_hash(session_id, hash)
   → if found, return existing (no-op)
3. near-duplicate check: last 10 observations for session
   → compute Jaccard similarity on token sets
   → if similarity >= 0.50 and same category, return existing
4. classify_category(input):
   ToolResult       → tool_usage
   Manual + "skill" → skill
   "prefer/settings" in narrative → preference
   "i am/my role"   → profile
   "pattern/always" → pattern
   else             → entity
5. extract_concepts(narrative):
   → tokenize, deduplicate, take first 12 tokens > 2 chars
6. Insert ObservationRecord with URI:
   amoena://memory/{scope}/{observation_id}
   (scope = workspace_id if set on session, else session_id)
7. Build and upsert MemoryTierRecord (L0/L1/L2 computed synchronously)
8. (async background) embed_observation:
   → BunWorkerBridge::generate_embedding(text-embedding-3-small)
   → ObservationEmbeddingRepository::upsert
```

## Memory Tiers in Detail

Tiers are built deterministically from the observation record — no LLM call required:

```rust
// L0: compact one-liner for injection
let l0 = format!("{} [{}] {}", title, category, created_at);
// Example: "JWT refresh token rotation [pattern] 2026-03-14T10:00:00Z"

// L1: medium detail, 320 char limit
let l1 = truncate(&format!("{}\n{}\n{}", title, subtitle, narrative), 320);

// L2: full JSON, 2000 char limit
let l2 = truncate(&json!({
    "title": title,
    "category": category,
    "facts": facts,
    "narrative": narrative,
    "concepts": concepts,
    "uri": uri,
    "parentUri": parent_uri
}).to_string(), 2000);
```

The `model` field in `MemoryTierRecord` is set to `"deterministic-fallback"` since no LLM is used. When an LLM-generated summary is available (future feature), this field will record the model used.

## Memory Injection

Before each AI turn, relevant L0 summaries are injected into the system prompt:

```
MemoryService::injection_bundle(worker, api_key, query, max_observations)
    ↓
1. classify_scope(query):
   contains "workspace/project/codebase" → Workspace
   contains "prefer/global"              → Global
   else                                  → SessionLocal
2. hybrid_search(worker, api_key, query, category=None)
3. take(max_observations) results
4. extract l0_summary from each MemoryTierRecord
5. sum token counts → token_budget_used
6. return InjectionBundle { scope, summaries, token_budget_used }
```

The injected block in the system prompt looks like:

```
<memory>
JWT refresh token rotation [pattern] 2026-03-14T10:00:00Z
User prefers TypeScript strict mode [preference] 2026-03-14T09:30:00Z
Project uses Fastify, not Express [entity] 2026-03-14T09:00:00Z
</memory>
```

When the AI needs more detail it calls `MemoryExpand`:

```json
{
  "toolName": "MemoryExpand",
  "args": {
    "observationId": "550e8400-...",
    "tier": "l1"
  }
}
```

This returns the L1 summary (320-char detail) or L2 full JSON without making additional API calls. The `HookEvent::MemoryInject` fires after each injection bundle is built.

## Hybrid Search

Search combines FTS5 full-text search with cosine similarity over vector embeddings:

```
hybrid_search(worker, api_key, query, category)
    ↓
1. FTS5 search via observations_fts (Porter stemmer, BM25 ranking)
   → returns ranked list of ObservationSearchResult
2. if results empty → return []
3. generate query embedding:
   BunWorkerBridge::generate_embedding(EmbeddingRequest {
     provider_id: "openai",
     model_id: "text-embedding-3-small",
     input: query
   })
4. for each fts_result at rank i:
   vector_score = cosine_similarity(query_vector, stored_vector)
                  (0.0 if no embedding exists yet)
   rrf_score = 1.0 / (60.0 + i + 1) + vector_score
5. sort by rrf_score descending
6. return re-ranked results
```

The Reciprocal Rank Fusion (RRF) formula `1/(60 + rank)` is a standard technique for fusing multiple ranked lists. Adding the vector score on top biases results toward semantically similar observations.

### Full-Text Search Only

```http
GET /api/v1/memory/search?q=JWT+rotation&category=pattern
```

Uses `observations_fts` directly. Results are ranked by BM25 relevance. The `category` filter is optional.

## API Reference

### Capture a Manual Observation

```http
POST /api/v1/memory/observe
Authorization: Bearer <jwt>
Content-Type: application/json

{
  "sessionId": "...",
  "title": "Project uses PostgreSQL 16",
  "narrative": "The project's database is PostgreSQL 16 with pgvector extension installed.",
  "category": "entity",
  "source": "manual"
}
```

### Search Observations

```http
GET /api/v1/memory/search?q=postgresql&category=entity&limit=10
```

### Get Session Memory

```http
GET /api/v1/memory/session/{sessionId}?limit=50
```

Response:

```json
{
  "summary": {
    "sessionId": "...",
    "request": "Refactor the auth module",
    "investigated": ["src/auth.ts"],
    "learned": ["Project uses JWT with HS256"],
    "completed": ["Added refresh token rotation"],
    "nextSteps": ["Write tests for /api/auth/refresh"],
    "filesRead": ["src/auth.ts"],
    "filesEdited": ["src/auth.ts"]
  },
  "observations": [
    {
      "observation": {
        "id": "...",
        "sessionId": "...",
        "uri": "amoena://memory/ws-abc/obs-xyz",
        "parentUri": "amoena://memory/ws-abc",
        "type": "assistant_response",
        "category": "pattern",
        "title": "JWT refresh token rotation",
        "facts": ["Refresh tokens are rotated on each use", "Family ID tracks token lineage"],
        "narrative": "The auth module implements refresh token rotation...",
        "concepts": ["jwt", "rotation", "refresh", "token"],
        "filesRead": ["src/auth.ts"],
        "filesModified": ["src/auth.ts"],
        "contentHash": "a3f1...",
        "promptNumber": 3,
        "createdAt": "2026-03-14T10:00:05Z"
      },
      "tiers": {
        "observationId": "...",
        "l0Summary": "JWT refresh token rotation [pattern] 2026-03-14T10:00:05Z",
        "l1Summary": "JWT refresh token rotation\nassistant\nThe auth module implements...",
        "l2Content": "{\"title\":\"JWT refresh token rotation\",\"category\":\"pattern\",...}",
        "l0Tokens": 9,
        "l1Tokens": 42,
        "l2Tokens": 187,
        "generatedAt": "2026-03-14T10:00:05Z",
        "model": "deterministic-fallback"
      }
    }
  ]
}
```

## Session Summaries

A session summary is a structured record that accumulates across the session:

```http
GET /api/v1/memory/session/{sessionId}/summary
PATCH /api/v1/memory/session/{sessionId}/summary
```

Summaries are upserted after each turn by the runtime using structured output from the AI worker. Fields accumulate: `investigated`, `learned`, `completed`, `nextSteps`, `filesRead`, and `filesEdited` grow as the session progresses.

## Deduplication

Two deduplication passes prevent redundant observations:

1. **Exact dedup** — SHA-256 hash of `title + narrative + concepts + category`. If an identical observation already exists for the session, capture is a no-op and returns the existing record.

2. **Near-dup dedup** — Jaccard similarity on token sets of the narrative text against the 10 most recent observations in the same category. If similarity ≥ 0.50, the existing observation is returned instead of creating a new one.

This prevents the memory store from filling with slightly-rephrased versions of the same fact across multiple turns in a long session.

## Token Budget

The injection bundle tracks `token_budget_used`. The runtime enforces a configurable maximum to prevent memory injection from consuming too much of the model's context window. Observations are ranked by relevance and the list is truncated at the budget limit.

Configure via settings:

```http
PATCH /api/v1/settings/memory.injection.maxObservations
{ "value": "5", "scope": "global" }

PATCH /api/v1/settings/memory.injection.maxTokens
{ "value": "2000", "scope": "global" }
```

## Hook Events

| Event | When |
|---|---|
| `MemoryObserve` | An observation was captured (fires after DB insert) |
| `MemoryInject` | Memory summaries were injected into a prompt |

Hook payloads include the observation ID, category, and session ID.
