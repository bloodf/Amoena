# Hooks API

Hooks allow external processes to react to runtime events. A hook registers an event name, a handler type (e.g., `shell`, `http`), and an optional regex matcher. When the event fires, the hook engine invokes all matching handlers.

---

## List Hooks

Returns all registered hooks.

```
GET /api/v1/hooks
Authorization: Bearer <token>
```

**Response `200`**

```json
[
  {
    "id": "hook_001",
    "eventName": "tool.result",
    "handlerType": "shell",
    "handlerConfig": {
      "command": "notify-send 'Tool finished'"
    },
    "matcherRegex": null,
    "enabled": true,
    "priority": 0,
    "timeoutMs": 5000
  }
]
```

**curl**

```bash
curl http://127.0.0.1:PORT/api/v1/hooks \
  -H "Authorization: Bearer $TOKEN"
```

**TypeScript**

```typescript
const hooks = await client.listHooks();
```

---

## Register Hook

Creates a new hook.

```
POST /api/v1/hooks
Authorization: Bearer <token>
Content-Type: application/json
```

**Request body**

```json
{
  "eventName": "message.complete",
  "handlerType": "shell",
  "handlerConfig": {
    "command": "osascript -e 'display notification \"AI response ready\"'"
  },
  "matcherRegex": null,
  "priority": 10,
  "timeoutMs": 3000
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `eventName` | `string` | Yes | Event to subscribe to (see [SSE Events](./sse-events.md) for names) |
| `handlerType` | `string` | Yes | `"shell"` or `"http"` |
| `handlerConfig` | `object` | Yes | Handler-specific configuration |
| `matcherRegex` | `string` | No | Optional regex to match against event payload |
| `priority` | `number` | No | Execution priority (higher = runs first). Default: `0` |
| `timeoutMs` | `number` | No | Max execution time in milliseconds. Default: `5000` |

**Handler config for `shell`**

```json
{
  "command": "echo $AMOENA_EVENT_PAYLOAD"
}
```

**Handler config for `http`**

```json
{
  "url": "https://webhook.example.com/amoena",
  "method": "POST",
  "headers": { "X-Secret": "abc123" }
}
```

**Response `200`** — The created `HookRecord`

**curl**

```bash
curl -X POST http://127.0.0.1:PORT/api/v1/hooks \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "eventName": "message.complete",
    "handlerType": "shell",
    "handlerConfig": {"command": "say Done"},
    "priority": 0,
    "timeoutMs": 5000
  }'
```

**TypeScript**

```typescript
const hook = await client.registerHook({
  eventName: "message.complete",
  handlerType: "shell",
  handlerConfig: { command: "say Done" },
  enabled: true,
  priority: 0,
  timeoutMs: 5000,
});
```

---

## Delete Hook

Removes a hook permanently.

```
DELETE /api/v1/hooks/{hookId}
Authorization: Bearer <token>
```

**Response `204`** — No content

**curl**

```bash
curl -X DELETE http://127.0.0.1:PORT/api/v1/hooks/hook_001 \
  -H "Authorization: Bearer $TOKEN"
```

**TypeScript**

```typescript
await client.deleteHook(hookId);
```

---

## Fire Hook Event

Manually fires a hook event. All hooks registered for this event name are invoked synchronously. Useful for testing hook integrations.

```
POST /api/v1/hooks/fire
Authorization: Bearer <token>
Content-Type: application/json
```

**Request body**

```json
{
  "event": "message.complete",
  "payload": {
    "sessionId": "sess_abc123",
    "messageId": "msg_001"
  }
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `event` | `string` | Yes | Event name to fire |
| `payload` | `object` | No | Arbitrary event payload |

**Response `200`**

```json
[
  {
    "hookId": "hook_001",
    "eventName": "message.complete",
    "status": "success",
    "output": "",
    "error": null
  }
]
```

**curl**

```bash
curl -X POST http://127.0.0.1:PORT/api/v1/hooks/fire \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"event": "message.complete", "payload": {"test": true}}'
```

**TypeScript**

```typescript
const results = await client.fireHook("message.complete", { test: true });
```

---

## Import Claude Hooks

Imports hook definitions from a Claude-format hooks file (e.g., `.claude/hooks.json`).

```
POST /api/v1/hooks/import/claude
Authorization: Bearer <token>
Content-Type: application/json
```

**Response `200`** — Number of hooks imported

---

## Import OpenCode Hooks

Imports hook definitions from an OpenCode-format hooks file.

```
POST /api/v1/hooks/import/opencode
Authorization: Bearer <token>
Content-Type: application/json
```

**Response `200`** — Number of hooks imported
