# Tasks API

Tasks are structured work items associated with a session. They support hierarchy (parent/child), priority ordering, and status tracking. Tasks are typically created by the AI or the user to track progress through a multi-step job.

---

## List Tasks

Returns all tasks for a session.

```
GET /api/v1/sessions/{sessionId}/tasks
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
    "id": "task_001",
    "title": "Refactor authentication module",
    "description": "Extract JWT logic into a separate service",
    "status": "in_progress",
    "priority": 10,
    "parentTaskId": null
  },
  {
    "id": "task_002",
    "title": "Write tests for auth service",
    "description": null,
    "status": "pending",
    "priority": 5,
    "parentTaskId": "task_001"
  }
]
```

**curl**

```bash
curl http://127.0.0.1:PORT/api/v1/sessions/sess_abc123/tasks \
  -H "Authorization: Bearer $TOKEN"
```

**TypeScript**

```typescript
const tasks = await client.listTasks(sessionId);
```

---

## Create Task

Creates a new task in a session.

```
POST /api/v1/sessions/{sessionId}/tasks
Authorization: Bearer <token>
Content-Type: application/json
```

**Request body**

```json
{
  "title": "Implement rate limiting",
  "description": "Add token bucket rate limiting to all API endpoints",
  "agentId": "agent_001",
  "priority": 8,
  "parentTaskId": null
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | `string` | Yes | Short task title |
| `description` | `string` | No | Longer description |
| `agentId` | `string` | No | Agent assigned to this task |
| `priority` | `number` | No | Priority score (higher = more urgent). Default: `0` |
| `parentTaskId` | `string` | No | Parent task ID for subtasks |

**Response `200`**

```json
{
  "id": "task_003",
  "title": "Implement rate limiting",
  "description": "Add token bucket rate limiting to all API endpoints",
  "status": "pending",
  "priority": 8,
  "parentTaskId": null
}
```

**curl**

```bash
curl -X POST http://127.0.0.1:PORT/api/v1/sessions/sess_abc123/tasks \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Implement rate limiting",
    "description": "Add token bucket rate limiting",
    "priority": 8
  }'
```

**TypeScript**

```typescript
const task = await client.createTask(sessionId, {
  title: "Implement rate limiting",
  description: "Add token bucket rate limiting to all API endpoints",
  parentTaskId: undefined,
});
```

---

## Update Task

Updates a task's fields. All fields are optional — only the provided fields are changed.

```
PUT /api/v1/sessions/{sessionId}/tasks/{taskId}
Authorization: Bearer <token>
Content-Type: application/json
```

**Path parameters**

| Parameter | Description |
|-----------|-------------|
| `sessionId` | Session ID |
| `taskId` | Task ID |

**Request body**

```json
{
  "title": "Implement rate limiting middleware",
  "description": "Use tower-governor crate for token bucket",
  "status": "in_progress",
  "priority": 10,
  "parentTaskId": null
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | `string` | No | Updated title |
| `description` | `string` | No | Updated description |
| `status` | `string` | No | `"pending"`, `"in_progress"`, `"done"`, `"cancelled"` |
| `priority` | `number` | No | Updated priority |
| `parentTaskId` | `string` | No | Move to a different parent |

**Response `200`** — Updated `TaskRecord`

**curl**

```bash
curl -X PUT http://127.0.0.1:PORT/api/v1/sessions/sess_abc123/tasks/task_003 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "done"}'
```

**TypeScript**

```typescript
const updated = await client.updateTask(sessionId, taskId, {
  status: "done",
});
```

---

## Delete Task

Removes a task permanently.

```
DELETE /api/v1/sessions/{sessionId}/tasks/{taskId}
Authorization: Bearer <token>
```

**Response `204`** — No content

**curl**

```bash
curl -X DELETE http://127.0.0.1:PORT/api/v1/sessions/sess_abc123/tasks/task_003 \
  -H "Authorization: Bearer $TOKEN"
```

**TypeScript**

```typescript
await client.deleteTask(sessionId, taskId);
```

---

## Reorder Tasks

Sets the priority order of tasks in a session by providing a complete ordered list of IDs.

```
POST /api/v1/sessions/{sessionId}/tasks/reorder
Authorization: Bearer <token>
Content-Type: application/json
```

**Request body**

```json
{
  "orderedIds": ["task_002", "task_001", "task_003"]
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `orderedIds` | `string[]` | Yes | All task IDs in the desired priority order |

**Response `204`** — No content

**curl**

```bash
curl -X POST http://127.0.0.1:PORT/api/v1/sessions/sess_abc123/tasks/reorder \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"orderedIds": ["task_002", "task_001", "task_003"]}'
```

**TypeScript**

```typescript
await client.reorderTasks(sessionId, ["task_002", "task_001", "task_003"]);
```

## Task Statuses

| Status | Description |
|--------|-------------|
| `pending` | Created, not yet started |
| `in_progress` | Currently being worked on |
| `done` | Completed successfully |
| `cancelled` | Abandoned without completion |
