# Sessions API

Sessions represent individual AI conversations. Each session has a mode (`chat`, `autopilot`, etc.), an associated provider/model, a working directory, and optional parent/child relationships for sub-agents.

---

## List Sessions

```
GET /api/v1/sessions
Authorization: Bearer <token>
```

Returns all sessions for the current instance.

**Response `200`**

```json
[
  {
    "id": "sess_abc123",
    "sessionMode": "chat",
    "tuiType": "default",
    "workingDir": "/home/user/project",
    "status": "idle",
    "createdAt": "2025-01-15T10:00:00Z",
    "updatedAt": "2025-01-15T10:05:00Z",
    "metadata": {},
    "providerId": "anthropic",
    "modelId": "claude-sonnet-4-5"
  }
]
```

**curl**

```bash
curl http://127.0.0.1:PORT/api/v1/sessions \
  -H "Authorization: Bearer $TOKEN"
```

---

## Create Session

```
POST /api/v1/sessions
Authorization: Bearer <token>
Content-Type: application/json
```

**Request body**

```json
{
  "workingDir": "/home/user/project",
  "sessionMode": "chat",
  "tuiType": "default",
  "providerId": "anthropic",
  "modelId": "claude-sonnet-4-5",
  "metadata": {},
  "parentSessionId": null
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `workingDir` | `string` | Yes | Absolute path used as the session's working directory |
| `sessionMode` | `string` | No | `"chat"` (default) or `"autopilot"` |
| `tuiType` | `string` | No | TUI variant, e.g. `"default"` |
| `providerId` | `string` | No | Provider ID from the provider registry |
| `modelId` | `string` | No | Model ID within the chosen provider |
| `metadata` | `object` | No | Arbitrary key-value metadata |
| `parentSessionId` | `string` | No | ID of the parent session (for sub-agent sessions) |

**Response `200`**

```json
{
  "id": "sess_abc123",
  "sessionMode": "chat",
  "tuiType": "default",
  "workingDir": "/home/user/project",
  "status": "idle",
  "createdAt": "2025-01-15T10:00:00Z",
  "updatedAt": "2025-01-15T10:00:00Z",
  "metadata": {},
  "providerId": "anthropic",
  "modelId": "claude-sonnet-4-5"
}
```

**curl**

```bash
curl -X POST http://127.0.0.1:PORT/api/v1/sessions \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "workingDir": "/home/user/project",
    "providerId": "anthropic",
    "modelId": "claude-sonnet-4-5"
  }'
```

---

## Delete Session

Deletes (archives) a session. The session record is retained for transcript purposes.

```
DELETE /api/v1/sessions/{sessionId}
Authorization: Bearer <token>
```

**Path parameters**

| Parameter | Description |
|-----------|-------------|
| `sessionId` | Session ID |

**Response `204`** — No content

**curl**

```bash
curl -X DELETE http://127.0.0.1:PORT/api/v1/sessions/sess_abc123 \
  -H "Authorization: Bearer $TOKEN"
```

---

## Toggle Autopilot

Enable or disable autopilot mode for a session. When enabled, the session autonomously processes queued messages without user confirmation.

```
POST /api/v1/sessions/{sessionId}/autopilot
Authorization: Bearer <token>
Content-Type: application/json
```

**Request body**

```json
{
  "enabled": true
}
```

**Response `200`** — Updated `SessionSummary` object (same shape as Create Session response)

**curl**

```bash
curl -X POST http://127.0.0.1:PORT/api/v1/sessions/sess_abc123/autopilot \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"enabled": true}'
```

---

## Interrupt Session

Stops the currently running AI turn immediately. Useful when a session is generating a long response and the user wants to cancel it.

```
POST /api/v1/sessions/{sessionId}/interrupt
Authorization: Bearer <token>
```

**Response `200`**

```json
{ "ok": true }
```

**curl**

```bash
curl -X POST http://127.0.0.1:PORT/api/v1/sessions/sess_abc123/interrupt \
  -H "Authorization: Bearer $TOKEN"
```

---

## Session SSE Stream

Subscribe to real-time events for a specific session. The auth token is passed as a query parameter because `EventSource` does not support custom request headers.

```
GET /api/v1/sessions/{sessionId}/stream?authToken={token}
```

Returns a `text/event-stream` response. Each event is an `EventEnvelope` JSON payload.

**Example event**

```
data: {"version":1,"id":"evt-1","channel":"session:sess_abc123","eventType":"message.delta","sessionId":"sess_abc123","occurredAt":"2025-01-15T10:05:00Z","payload":{"delta":"Hello"}}
```

**TypeScript**

```typescript
const url = client.sessionEventsUrl(sessionId);
const es = new EventSource(url);
es.onmessage = (e) => {
  const envelope = JSON.parse(e.data);
  console.log(envelope.eventType, envelope.payload);
};
```

See [SSE Events Reference](./sse-events.md) for all event types.

---

## List Session Children

Returns direct child sessions (sub-agent sessions spawned from this session).

```
GET /api/v1/sessions/{sessionId}/children
Authorization: Bearer <token>
```

**Response `200`** — Array of `SessionSummary` objects

---

## Get Session Tree

Returns the full hierarchical tree of sessions rooted at this session.

```
GET /api/v1/sessions/{sessionId}/tree
Authorization: Bearer <token>
```

**Response `200`** — Nested tree structure of session summaries
