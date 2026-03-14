# Queue API

The message queue holds pending user messages that will be dispatched to the AI in order. It supports reordering, editing, and flushing — useful for autopilot mode and batch task execution.

---

## List Queue Messages

Returns all queued messages for a session in their current order.

```
GET /api/v1/sessions/{sessionId}/queue
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
    "id": "qmsg_001",
    "content": "Refactor the database layer",
    "queueType": "standard",
    "status": "pending",
    "orderIndex": 0
  },
  {
    "id": "qmsg_002",
    "content": "Add unit tests for the refactored layer",
    "queueType": "standard",
    "status": "pending",
    "orderIndex": 1
  }
]
```

**curl**

```bash
curl http://127.0.0.1:PORT/api/v1/sessions/sess_abc123/queue \
  -H "Authorization: Bearer $TOKEN"
```

**TypeScript**

```typescript
const queue = await client.listQueueMessages(sessionId);
```

---

## Enqueue Message

Adds a new message to the end of the queue.

```
POST /api/v1/sessions/{sessionId}/queue
Authorization: Bearer <token>
Content-Type: application/json
```

**Request body**

```json
{
  "content": "Write a changelog for the last 10 commits",
  "queueType": "standard"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `content` | `string` | Yes | Message content |
| `queueType` | `string` | No | Queue type identifier. Default: `"standard"` |

**Response `200`**

```json
{
  "id": "qmsg_003",
  "content": "Write a changelog for the last 10 commits",
  "queueType": "standard",
  "status": "pending",
  "orderIndex": 2
}
```

**curl**

```bash
curl -X POST http://127.0.0.1:PORT/api/v1/sessions/sess_abc123/queue \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"content": "Write a changelog for the last 10 commits"}'
```

**TypeScript**

```typescript
const msg = await client.enqueueMessage(sessionId, {
  content: "Write a changelog for the last 10 commits",
});
```

---

## Edit Queue Message

Updates the content of a pending queue message.

```
PUT /api/v1/sessions/{sessionId}/queue/{msgId}
Authorization: Bearer <token>
Content-Type: application/json
```

**Path parameters**

| Parameter | Description |
|-----------|-------------|
| `sessionId` | Session ID |
| `msgId` | Queue message ID |

**Request body**

```json
{
  "content": "Write a detailed changelog for the last 10 commits"
}
```

**Response `200`** — Updated `QueueMessage` object

**curl**

```bash
curl -X PUT http://127.0.0.1:PORT/api/v1/sessions/sess_abc123/queue/qmsg_003 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"content": "Write a detailed changelog"}'
```

**TypeScript**

```typescript
const updated = await client.editQueueMessage(sessionId, messageId, {
  content: "Write a detailed changelog",
});
```

---

## Remove Queue Message

Removes a message from the queue before it is dispatched.

```
DELETE /api/v1/sessions/{sessionId}/queue/{msgId}
Authorization: Bearer <token>
```

**Response `204`** — No content

**curl**

```bash
curl -X DELETE http://127.0.0.1:PORT/api/v1/sessions/sess_abc123/queue/qmsg_003 \
  -H "Authorization: Bearer $TOKEN"
```

**TypeScript**

```typescript
await client.removeQueueMessage(sessionId, messageId);
```

---

## Reorder Queue

Sets the execution order of queued messages by providing a complete ordered list of IDs.

```
POST /api/v1/sessions/{sessionId}/queue/reorder
Authorization: Bearer <token>
Content-Type: application/json
```

**Request body**

```json
{
  "orderedIds": ["qmsg_002", "qmsg_001", "qmsg_003"]
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `orderedIds` | `string[]` | Yes | All queue message IDs in the desired execution order |

**Response `204`** — No content

**curl**

```bash
curl -X POST http://127.0.0.1:PORT/api/v1/sessions/sess_abc123/queue/reorder \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"orderedIds": ["qmsg_002", "qmsg_001", "qmsg_003"]}'
```

**TypeScript**

```typescript
await client.reorderQueue(sessionId, ["qmsg_002", "qmsg_001", "qmsg_003"]);
```

---

## Flush Queue

Removes all pending messages from the queue.

```
POST /api/v1/sessions/{sessionId}/queue/flush
Authorization: Bearer <token>
```

**Response `204`** — No content

**curl**

```bash
curl -X POST http://127.0.0.1:PORT/api/v1/sessions/sess_abc123/queue/flush \
  -H "Authorization: Bearer $TOKEN"
```

**TypeScript**

```typescript
await client.flushQueue(sessionId);
```
