# Messages API

Messages are the individual turns in a session conversation. Each message has a role (`user` or `assistant`), content, and optional attachments.

---

## List Messages

Returns all messages in a session in chronological order.

```
GET /api/v1/sessions/{sessionId}/messages
Authorization: Bearer <token>
```

**Path parameters**

| Parameter | Description |
|-----------|-------------|
| `sessionId` | Session ID |

**Response `200`**

```json
[
  {
    "id": "msg_001",
    "role": "user",
    "content": "What is the capital of France?",
    "attachments": [],
    "createdAt": "2025-01-15T10:05:00Z"
  },
  {
    "id": "msg_002",
    "role": "assistant",
    "content": "The capital of France is Paris.",
    "attachments": [],
    "createdAt": "2025-01-15T10:05:02Z"
  }
]
```

**curl**

```bash
curl http://127.0.0.1:PORT/api/v1/sessions/sess_abc123/messages \
  -H "Authorization: Bearer $TOKEN"
```

---

## Create Message

Sends a user message and starts an AI turn. The response contains the persisted user message record. The AI reply arrives via the [SSE stream](./sessions.md#session-sse-stream) as `message.delta` events followed by a `message.complete` event.

```
POST /api/v1/sessions/{sessionId}/messages
Authorization: Bearer <token>
Content-Type: application/json
```

**Request body**

```json
{
  "content": "Explain async/await in Rust.",
  "taskType": "default",
  "reasoningMode": "auto",
  "reasoningEffort": "medium",
  "attachments": []
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `content` | `string` | Yes | The user message text |
| `taskType` | `string` | No | Task classification hint, e.g. `"default"`, `"code"` |
| `reasoningMode` | `string` | No | `"auto"`, `"enabled"`, `"disabled"` |
| `reasoningEffort` | `string` | No | `"low"`, `"medium"`, `"high"` |
| `attachments` | `array` | No | File or image attachments |

**Response `200`**

```json
{
  "id": "msg_003",
  "role": "user",
  "content": "Explain async/await in Rust.",
  "attachments": [],
  "createdAt": "2025-01-15T10:10:00Z"
}
```

**curl**

```bash
curl -X POST http://127.0.0.1:PORT/api/v1/sessions/sess_abc123/messages \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Explain async/await in Rust.",
    "taskType": "default"
  }'
```

**TypeScript**

```typescript
const message = await client.createSessionMessage(sessionId, {
  content: "Explain async/await in Rust.",
  reasoningMode: "auto",
  reasoningEffort: "medium",
});
```

After calling this, subscribe to `session.stream` to receive the AI response in real time:

```typescript
const es = new EventSource(client.sessionEventsUrl(sessionId));
es.onmessage = (e) => {
  const { eventType, payload } = JSON.parse(e.data);
  if (eventType === "message.delta") process.stdout.write(payload.delta);
  if (eventType === "message.complete") console.log("\nDone.");
};
```

---

## Get Transcript

Returns the raw event log for a session as stored in the transcript file. This includes all internal events (tool calls, stream deltas, etc.) in their original order — useful for debugging or replaying a session.

```
GET /api/v1/sessions/{sessionId}/transcript
Authorization: Bearer <token>
```

**Response `200`**

```json
[
  {
    "id": "evt-001",
    "eventType": "message.start",
    "sessionId": "sess_abc123",
    "occurredAt": "2025-01-15T10:05:00Z",
    "payload": { "role": "user", "content": "Hello" }
  },
  {
    "id": "evt-002",
    "eventType": "message.delta",
    "sessionId": "sess_abc123",
    "occurredAt": "2025-01-15T10:05:01Z",
    "payload": { "delta": "Hi there!" }
  }
]
```

**curl**

```bash
curl http://127.0.0.1:PORT/api/v1/sessions/sess_abc123/transcript \
  -H "Authorization: Bearer $TOKEN"
```

**TypeScript**

```typescript
const events = await client.getSessionTranscript(sessionId);
```

> **Note:** The transcript is the authoritative record of everything that happened. The `GET /messages` endpoint returns a higher-level, deduplicated view.
