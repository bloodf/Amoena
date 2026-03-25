# Memory API

Amoena maintains a hierarchical memory system with three abstraction tiers (L0/L1/L2) for compressing and retrieving observations across sessions.

## Memory Tiers

| Tier | Description |
|------|-------------|
| L0 | Short summary (lowest token cost) |
| L1 | Medium-detail summary |
| L2 | Full content |

---

## Get Session Memory

Returns the memory entries associated with a session, including a token budget breakdown.

```
GET /api/v1/sessions/{sessionId}/memory
Authorization: Bearer <token>
```

**Path parameters**

| Parameter | Description |
|-----------|-------------|
| `sessionId` | Session ID |

**Response `200`**

```json
{
  "summary": null,
  "tokenBudget": {
    "total": 4096,
    "l0": 512,
    "l1": 1024,
    "l2": 2048
  },
  "entries": [
    {
      "id": "obs_001",
      "title": "User prefers functional programming",
      "observationType": "preference",
      "category": "preference",
      "createdAt": "2025-01-15T09:00:00Z",
      "l0Summary": "Prefers FP style",
      "l1Summary": "User consistently chooses functional patterns over OOP",
      "l2Content": "In multiple sessions, the user has expressed preference for immutable data, pure functions, and FP abstractions like map/filter/reduce over class-based OOP.",
      "l0Tokens": 5,
      "l1Tokens": 14,
      "l2Tokens": 42
    }
  ]
}
```

**curl**

```bash
curl http://127.0.0.1:PORT/api/v1/sessions/sess_abc123/memory \
  -H "Authorization: Bearer $TOKEN"
```

**TypeScript**

```typescript
const memory = await client.getSessionMemory(sessionId);
console.log(`Token budget: ${memory.tokenBudget.total}`);
memory.entries.forEach(e => console.log(e.title));
```

---

## Create Observation

Records a new memory observation. Observations are the primary input to the memory system — the runtime compresses them into the L0/L1/L2 hierarchy automatically.

```
POST /api/v1/memory/observe
Authorization: Bearer <token>
Content-Type: application/json
```

**Request body**

```json
{
  "sessionId": "sess_abc123",
  "title": "User prefers TypeScript over JavaScript",
  "narrative": "During the session, the user repeatedly asked to convert JavaScript files to TypeScript and expressed frustration with dynamic typing.",
  "category": "preference"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `sessionId` | `string` | Yes | Session where the observation was made |
| `title` | `string` | Yes | Short label for the observation |
| `narrative` | `string` | Yes | Full natural-language description |
| `category` | `string` | No | `"profile"`, `"preference"`, `"entity"`, `"pattern"`, `"tool_usage"`, `"skill"` |

**Response `200`** — The created observation record

**curl**

```bash
curl -X POST http://127.0.0.1:PORT/api/v1/memory/observe \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "sess_abc123",
    "title": "User uses Vim",
    "narrative": "User mentioned they use Vim with custom keybindings and prefer terminal-based tools.",
    "category": "preference"
  }'
```

---

## Search Observations

Performs semantic search across all stored observations.

```
GET /api/v1/memory/search?query={query}&category={category}
Authorization: Bearer <token>
```

**Query parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `query` | `string` | Yes | Natural language search query |
| `category` | `string` | No | Filter by category: `"profile"`, `"preference"`, `"entity"`, `"pattern"`, `"tool_usage"`, `"skill"` |

**Response `200`**

```json
[
  {
    "id": "obs_001",
    "title": "User prefers TypeScript",
    "observationType": "preference",
    "category": "preference",
    "score": 0.92,
    "l0Summary": "Prefers TypeScript",
    "createdAt": "2025-01-15T09:00:00Z"
  }
]
```

**curl**

```bash
curl "http://127.0.0.1:PORT/api/v1/memory/search?query=programming+language+preferences" \
  -H "Authorization: Bearer $TOKEN"
```

```bash
# With category filter
curl "http://127.0.0.1:PORT/api/v1/memory/search?query=tools&category=tool_usage" \
  -H "Authorization: Bearer $TOKEN"
```

## Observation Categories

| Category | Description |
|----------|-------------|
| `profile` | Facts about the user (name, role, background) |
| `preference` | User preferences and working style |
| `entity` | Named entities (projects, codebases, people) |
| `pattern` | Recurring behaviors or patterns |
| `tool_usage` | How the user interacts with tools |
| `skill` | Skills and expertise areas |
