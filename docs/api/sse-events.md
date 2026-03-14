# SSE Events Reference

All real-time events are delivered as Server-Sent Events (SSE) on one of two channels:

| Channel | URL |
|---------|-----|
| Session-scoped | `GET /api/v1/sessions/{sessionId}/stream?authToken={token}` |
| Global | `GET /api/v1/events?authToken={token}` |

Every event uses the `EventEnvelope` wrapper:

```json
{
  "version": 1,
  "id": "evt-uuid",
  "channel": "session:sess_abc123",
  "eventType": "message.delta",
  "sessionId": "sess_abc123",
  "occurredAt": "2025-01-15T10:30:00Z",
  "payload": { ... }
}
```

| Field | Type | Description |
|-------|------|-------------|
| `version` | `number` | Envelope schema version (currently `1`) |
| `id` | `string` | Unique event ID |
| `channel` | `string` | Channel identifier |
| `eventType` | `string` | Event type string (see below) |
| `sessionId` | `string \| null` | Associated session ID, if applicable |
| `occurredAt` | `string` | ISO 8601 timestamp |
| `payload` | `object` | Event-specific data |

---

## Connecting

```typescript
// Session stream
const sessionUrl = client.sessionEventsUrl(sessionId);
const sessionEs = new EventSource(sessionUrl);

// Global stream
const globalUrl = client.globalEventsUrl();
const globalEs = new EventSource(globalUrl);

sessionEs.onmessage = (e) => {
  const envelope = JSON.parse(e.data) as EventEnvelope;
  handleEvent(envelope);
};
```

---

## Session Events

Events on the global channel about session lifecycle.

### `session.created`

Fired when a new session is created.

```json
{
  "eventType": "session.created",
  "payload": {
    "sessionId": "sess_abc123",
    "sessionMode": "chat",
    "workingDir": "/home/user/project",
    "providerId": "anthropic",
    "modelId": "claude-sonnet-4-5"
  }
}
```

### `session.updated`

Fired when session metadata or status changes.

```json
{
  "eventType": "session.updated",
  "payload": {
    "sessionId": "sess_abc123",
    "status": "active",
    "updatedFields": ["status", "updatedAt"]
  }
}
```

### `session.deleted`

Fired when a session is archived or deleted.

```json
{
  "eventType": "session.deleted",
  "payload": {
    "sessionId": "sess_abc123"
  }
}
```

---

## Stream Events

Events on the session channel during an AI turn.

### `message.delta`

Fired repeatedly during streaming, carrying each token/chunk as it arrives.

```json
{
  "eventType": "message.delta",
  "payload": {
    "messageId": "msg_002",
    "delta": "The capital of France is ",
    "index": 0
  }
}
```

| Field | Description |
|-------|-------------|
| `messageId` | The message being streamed |
| `delta` | The text fragment |
| `index` | Turn index within the session |

### `message.complete`

Fired when the AI finishes generating a complete message.

```json
{
  "eventType": "message.complete",
  "payload": {
    "messageId": "msg_002",
    "role": "assistant",
    "content": "The capital of France is Paris.",
    "usage": {
      "inputTokens": 12,
      "outputTokens": 8,
      "totalTokens": 20
    }
  }
}
```

### `tool.start`

Fired when the AI begins invoking a tool.

```json
{
  "eventType": "tool.start",
  "payload": {
    "toolCallId": "tc_001",
    "toolName": "read_file",
    "input": {
      "path": "/home/user/project/src/main.rs"
    }
  }
}
```

### `tool.result`

Fired when a tool call completes and returns its result.

```json
{
  "eventType": "tool.result",
  "payload": {
    "toolCallId": "tc_001",
    "toolName": "read_file",
    "output": "fn main() { ... }",
    "isError": false,
    "durationMs": 45
  }
}
```

### `usage`

Fired at the end of a turn with token usage statistics.

```json
{
  "eventType": "usage",
  "payload": {
    "sessionId": "sess_abc123",
    "inputTokens": 1024,
    "outputTokens": 256,
    "cacheReadTokens": 512,
    "cacheWriteTokens": 0,
    "providerId": "anthropic",
    "modelId": "claude-sonnet-4-5",
    "costUsd": 0.0018
  }
}
```

### `error`

Fired when a turn encounters an unrecoverable error.

```json
{
  "eventType": "error",
  "payload": {
    "code": "provider_error",
    "message": "API rate limit exceeded",
    "retryAfterMs": 30000
  }
}
```

Common error codes:

| Code | Description |
|------|-------------|
| `provider_error` | The AI provider returned an error |
| `auth_error` | Invalid or expired API key |
| `context_overflow` | Message exceeded model context window |
| `interrupted` | Turn was interrupted by the user |
| `tool_error` | A tool execution failed |

---

## Permission Events

### `permission.requested`

Fired when the AI requests permission to perform a sensitive action (e.g., run a shell command). The client must respond with `POST /api/v1/sessions/{id}/permissions`.

```json
{
  "eventType": "permission.requested",
  "payload": {
    "requestId": "req_abc123",
    "toolName": "run_command",
    "input": {
      "command": "rm -rf ./dist"
    },
    "risk": "medium",
    "description": "Delete the dist directory"
  }
}
```

| Field | Description |
|-------|-------------|
| `requestId` | Use this ID when resolving the permission |
| `toolName` | The tool requiring permission |
| `input` | The tool's input parameters |
| `risk` | `"low"`, `"medium"`, `"high"` |
| `description` | Human-readable description of the action |

### `permission.resolved`

Fired when a permission request is resolved (approved or denied).

```json
{
  "eventType": "permission.resolved",
  "payload": {
    "requestId": "req_abc123",
    "decision": "approve",
    "reason": null
  }
}
```

---

## Agent Events

### `agent.spawned`

Fired when a sub-agent is spawned within a session.

```json
{
  "eventType": "agent.spawned",
  "payload": {
    "agentId": "agent_002",
    "parentAgentId": "agent_001",
    "agentType": "worker",
    "model": "claude-haiku-4-5",
    "division": "code-review"
  }
}
```

### `agent.status`

Fired when an agent's status changes.

```json
{
  "eventType": "agent.status",
  "payload": {
    "agentId": "agent_002",
    "status": "idle",
    "previousStatus": "active"
  }
}
```

Agent statuses: `idle`, `active`, `waiting`, `done`, `error`

---

## Autopilot Events

### `autopilot.phase`

Fired when autopilot transitions between phases.

```json
{
  "eventType": "autopilot.phase",
  "payload": {
    "sessionId": "sess_abc123",
    "phase": "executing",
    "previousPhase": "planning",
    "description": "Executing planned tasks"
  }
}
```

Autopilot phases: `planning`, `executing`, `reviewing`, `waiting`, `complete`, `error`

---

## Lifecycle Events

Sent on the session channel to mark the start and end of AI turns.

### `turn.start`

```json
{
  "eventType": "turn.start",
  "payload": {
    "sessionId": "sess_abc123",
    "turnIndex": 3,
    "triggeredBy": "user_message"
  }
}
```

### `turn.complete`

```json
{
  "eventType": "turn.complete",
  "payload": {
    "sessionId": "sess_abc123",
    "turnIndex": 3,
    "durationMs": 4200
  }
}
```

---

## Global Events

Events sent only on the global channel (`GET /api/v1/events`):

| Event Type | Description |
|------------|-------------|
| `session.created` | New session opened |
| `session.updated` | Session metadata changed |
| `session.deleted` | Session archived |
| `workspace.created` | Workspace registered |
| `workspace.archived` | Workspace archived |
| `workspace.destroyed` | Workspace permanently deleted |
| `extension.installed` | Extension installed |
| `extension.uninstalled` | Extension removed |
| `extension.toggled` | Extension enabled/disabled |
| `plugin.installed` | Plugin installed |
| `plugin.uninstalled` | Plugin removed |
| `hook.registered` | Hook registered |
| `hook.deleted` | Hook removed |
| `remote.paired` | New device paired |
| `remote.revoked` | Device revoked |

---

## Reconnection

SSE connections may drop due to network interruptions. Implement reconnection with exponential backoff:

```typescript
function connectWithRetry(url: string, onEvent: (e: EventEnvelope) => void) {
  let delay = 1000;

  function connect() {
    const es = new EventSource(url);
    es.onmessage = (e) => {
      delay = 1000; // Reset on success
      onEvent(JSON.parse(e.data));
    };
    es.onerror = () => {
      es.close();
      setTimeout(connect, Math.min(delay, 30000));
      delay = Math.min(delay * 2, 30000);
    };
  }

  connect();
}
```
