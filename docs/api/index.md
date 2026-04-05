# Amoena Runtime API

The Amoena desktop app exposes a local HTTP API for the Electron renderer and companion clients. All API calls go to `http://127.0.0.1:{PORT}`, where `PORT` is assigned dynamically at startup. The exact base URL is provided to the UI through the Electron launch-context bridge.

## Base URL

```
http://127.0.0.1:{PORT}
```

The port is ephemeral — it changes on every launch. Always read it from `LaunchContext.apiBaseUrl`.

## Authentication

Amoena uses a two-step auth flow: Bootstrap → Session token (JWT).

### Step 1 — Bootstrap

At startup the runtime mints a short-lived bootstrap token (TTL: 60 s). Use it **once** to exchange for a long-lived session token.

```
POST /api/v1/bootstrap/auth
Content-Type: application/json

{ "token": "<bootstrapToken>" }
```

Response:

```json
{
  "apiBaseUrl": "http://127.0.0.1:52341",
  "authToken": "lnr-session-...",
  "instanceId": "550e8400-e29b-41d4-a716-446655440000",
  "sseBaseUrl": "http://127.0.0.1:52341",
  "tokenType": "Bearer"
}
```

The launch context exposed to the renderer contains `bootstrapToken` and `bootstrapPath` so you never need to hard-code them.

### Step 2 — Bearer token

All subsequent requests must include the session token:

```
Authorization: Bearer lnr-session-...
```

A few endpoints (`/api/v1/remote/pairing/intents`, `/api/v1/remote/pair/complete`, `/api/v1/remote/auth/refresh`) are intentionally unauthenticated — they are part of the remote pairing flow.

## Content Types

| Direction         | Content-Type          |
| ----------------- | --------------------- |
| Request bodies    | `application/json`    |
| SSE streams       | `text/event-stream`   |
| Extension install | `multipart/form-data` |

## Error Format

All errors return a JSON body:

```json
{
  "error": "human-readable message"
}
```

Common status codes:

| Code  | Meaning                        |
| ----- | ------------------------------ |
| `200` | OK                             |
| `204` | No content (DELETE, flush)     |
| `400` | Bad request / validation error |
| `401` | Missing or invalid auth token  |
| `404` | Resource not found             |
| `500` | Internal server error          |

## SSE Streams

Two SSE channels are available:

| Channel        | URL                                                  |
| -------------- | ---------------------------------------------------- |
| Session-scoped | `GET /api/v1/sessions/{id}/stream?authToken=<token>` |
| Global         | `GET /api/v1/events?authToken=<token>`               |

The auth token is passed as a query parameter (not a header) because `EventSource` in browsers does not support custom headers.

Every event is wrapped in an `EventEnvelope`:

```json
{
  "version": 1,
  "id": "evt-uuid",
  "channel": "session:abc123",
  "eventType": "message.delta",
  "sessionId": "abc123",
  "occurredAt": "2025-01-15T10:30:00Z",
  "payload": { ... }
}
```

See [SSE Events Reference](./sse-events.md) for all event types and payloads.

## TypeScript Client

The `@lunaria/runtime-client` package wraps all endpoints:

```bash
npm install @lunaria/runtime-client
```

```typescript
import { createRuntimeClient } from '@lunaria/runtime-client';

const client = createRuntimeClient({
  baseUrl: launchContext.apiBaseUrl,
  authToken: bootstrapSession.authToken,
});

const sessions = await client.listSessions();
```

The client handles `Authorization` headers, JSON serialization, and status-code errors automatically.

## Endpoint Index

| Category             | Reference                        |
| -------------------- | -------------------------------- |
| Sessions             | [sessions.md](./sessions.md)     |
| Messages             | [messages.md](./messages.md)     |
| Agents               | [agents.md](./agents.md)         |
| Memory               | [memory.md](./memory.md)         |
| Hooks                | [hooks.md](./hooks.md)           |
| Workspaces           | [workspaces.md](./workspaces.md) |
| Queue                | [queue.md](./queue.md)           |
| Tasks                | [tasks.md](./tasks.md)           |
| Extensions           | [extensions.md](./extensions.md) |
| Plugins              | [plugins.md](./plugins.md)       |
| Remote Access        | [remote.md](./remote.md)         |
| Terminal             | [terminal.md](./terminal.md)     |
| Settings & Providers | [settings.md](./settings.md)     |
| SSE Events           | [sse-events.md](./sse-events.md) |
