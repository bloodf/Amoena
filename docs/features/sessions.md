# Sessions

A session is the fundamental unit of work in Lunaria. It represents a continuous conversation with an AI agent, tracks all exchanged messages, owns a working directory, and optionally links to a workspace clone and a parent session.

## Session Types

| Type | Description |
|---|---|
| `primary` | Top-level session started by the user |
| `child` | Spawned by an agent as part of multi-agent orchestration |
| `team` | A shared session coordinating a team of agents |

## Session Modes

| Mode | Description |
|---|---|
| `native` | AI turns run directly through the Bun worker bridge |
| `wrapper` | Delegates to an external CLI (claude-code, opencode, codex, gemini) |

The `tui_type` column records which CLI adapter is used for wrapper sessions: `claude-code`, `opencode`, `codex`, `gemini`, or `native` for native mode.

## Session Status Lifecycle

```
created ──→ running ──→ paused ──→ running (next turn)
                │
                ├──→ completed
                ├──→ failed
                └──→ cancelled

paused / completed ──→ archived
```

- **created** — session exists but no turn has started
- **running** — an AI turn is actively in progress
- **paused** — awaiting the next user prompt (turn complete)
- **completed** — session closed normally
- **failed** — an unrecoverable error occurred during a turn
- **cancelled** — user or orchestrator cancelled the session
- **archived** — soft-deleted; excluded from active session lists

## Creating a Session

```http
POST /api/v1/sessions
Content-Type: application/json
Authorization: Bearer <jwt>

{
  "sessionType": "primary",
  "sessionMode": "native",
  "tuiType": "native",
  "providerId": "anthropic",
  "modelId": "claude-opus-4-5",
  "workingDir": "/Users/dev/myproject",
  "metadata": {}
}
```

Response:

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "sessionType": "primary",
  "sessionMode": "native",
  "tuiType": "native",
  "providerId": "anthropic",
  "modelId": "claude-opus-4-5",
  "workingDir": "/Users/dev/myproject",
  "status": "created",
  "compactionCount": 0,
  "contextTokenCount": 0,
  "workspaceId": null,
  "parentSessionId": null,
  "metadata": {},
  "createdAt": "2026-03-14T10:00:00Z",
  "updatedAt": "2026-03-14T10:00:00Z"
}
```

## Sending a Message and Running a Turn

Messages and turn execution are two separate endpoints. First create the user message:

```http
POST /api/v1/sessions/{id}/messages
Content-Type: application/json

{
  "role": "user",
  "content": "Refactor the authentication module to use JWT."
}
```

Then trigger the AI turn:

```http
POST /api/v1/sessions/{id}/run
Content-Type: application/json

{
  "reasoningMode": "on",
  "reasoningEffort": "high"
}
```

Both `reasoningMode` and `reasoningEffort` are optional overrides of the routing-resolved defaults. Valid values:
- `reasoningMode`: `"off"` | `"auto"` | `"on"`
- `reasoningEffort`: `"low"` | `"medium"` | `"high"`

## Listing Sessions

```http
GET /api/v1/sessions?status=paused&limit=20&offset=0
```

Query parameters:
- `status` — filter by session status
- `tuiType` — filter by CLI adapter type
- `limit` — max results (default 50)
- `offset` — pagination offset

## Retrieving Messages

```http
GET /api/v1/sessions/{id}/messages?limit=100&before=<message_id>
```

Messages are returned in chronological order. Each message includes:

```json
{
  "id": "...",
  "sessionId": "...",
  "role": "assistant",
  "content": "Here is the refactored module...",
  "attachments": [],
  "toolCalls": [
    {
      "callId": "call_abc123",
      "toolName": "Read",
      "args": { "path": "src/auth.ts" }
    }
  ],
  "tokens": 1842,
  "cost": 0.0092,
  "createdAt": "2026-03-14T10:00:05Z"
}
```

## Parent/Child Hierarchy

Child sessions are created by the orchestration system when an agent spawns a subagent with its own dedicated session context. The `parent_session_id` foreign key links children to their parent. Child sessions inherit the working directory of the parent unless a workspace override is specified.

```
primary session (id: A)
  └── child session (id: B, parentSessionId: A)
        └── child session (id: C, parentSessionId: B)
```

Child sessions are listed alongside primary sessions. The frontend renders them as nested entries in the session tree.

## Session Metadata

The `metadata` JSON column stores arbitrary session-level data. Common fields set by the runtime:

```json
{
  "persona": {
    "name": "senior-engineer",
    "permissions": "shell_access",
    "division": "engineering"
  },
  "autopilot": {
    "enabled": true,
    "maxTurns": 50,
    "currentPhase": "implementation"
  },
  "compactionSummary": "..."
}
```

## Context Compaction

When `context_token_count` approaches the model's context window limit, the runtime performs compaction:

1. Summarize the oldest messages into a compact `SessionSummaryRecord`
2. Replace summarized messages with a single system message containing the summary
3. Increment `compaction_count`
4. Update `context_token_count`

The `HookEvent::PreCompact` is fired before compaction to allow hooks to snapshot or modify the transcript.

## Session Events via SSE

Subscribe to session events by connecting to the SSE stream and filtering by `sessionId`:

```javascript
const es = new EventSource('/events', {
  headers: { Authorization: `Bearer ${token}` }
});

es.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if (data.sessionId === mySessionId) {
    // handle event
  }
};
```

Session-scoped event types:

| Event Type | Description |
|---|---|
| `message.delta` | Token streaming from AI worker |
| `message.done` | Turn complete, final message written |
| `tool.pending` | Tool call awaiting user approval |
| `tool.resolved` | Approval decision made |
| `session.updated` | Session status or metadata changed |
| `hook.fired` | A hook was invoked for this session |

## Archiving and Deletion

```http
PATCH /api/v1/sessions/{id}
{ "status": "archived" }
```

Archiving sets `status = 'archived'` without deleting the underlying data. Messages, observations, and tool executions remain queryable.

Hard deletion is not exposed through the API; data is removed only when the database file is manually deleted or when `ON DELETE CASCADE` triggers fire (e.g., when a workspace is destroyed).

## Session Summary

After a session is archived or completed, a structured summary is available:

```http
GET /api/v1/sessions/{id}/summary
```

```json
{
  "sessionId": "...",
  "request": "Refactor the authentication module",
  "investigated": ["src/auth.ts", "src/middleware/jwt.ts"],
  "learned": ["Project uses Fastify, not Express", "JWT secret stored in .env.local"],
  "completed": ["Replaced session-based auth with JWT", "Added refresh token rotation"],
  "nextSteps": ["Write integration tests for /api/auth/refresh"],
  "filesRead": ["src/auth.ts", "src/middleware/jwt.ts", "package.json"],
  "filesEdited": ["src/auth.ts", "src/middleware/jwt.ts"]
}
```
