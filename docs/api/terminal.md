# Terminal API

The Terminal API provides a programmatic interface to create and interact with PTY (pseudo-terminal) sessions. Terminal sessions support input, resize, and event polling — enabling remote terminal access from mobile or web clients.

---

## Create Terminal Session

Spawns a new PTY session with the specified shell, working directory, and initial terminal dimensions.

```
POST /api/v1/terminal/sessions
Authorization: Bearer <token>
Content-Type: application/json
```

**Request body**

```json
{
  "shell": "/bin/zsh",
  "cwd": "/home/user/project",
  "cols": 220,
  "rows": 50
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `shell` | `string` | No | Shell executable path. Defaults to the user's default shell |
| `cwd` | `string` | No | Initial working directory. Defaults to the runtime working directory |
| `cols` | `number` | No | Terminal width in columns. Default: `80` |
| `rows` | `number` | No | Terminal height in rows. Default: `24` |

**Response `200`**

```json
{
  "terminalSessionId": "term_abc123"
}
```

**curl**

```bash
curl -X POST http://127.0.0.1:PORT/api/v1/terminal/sessions \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "shell": "/bin/zsh",
    "cwd": "/home/user/project",
    "cols": 220,
    "rows": 50
  }'
```

**TypeScript**

```typescript
const { terminalSessionId } = await client.createTerminalSession({
  shell: "/bin/zsh",
  cwd: "/home/user/project",
  cols: 220,
  rows: 50,
});
```

---

## Send Terminal Input

Sends raw input bytes to the terminal session. This is equivalent to typing in the terminal.

```
POST /api/v1/terminal/sessions/{terminalSessionId}/input
Authorization: Bearer <token>
Content-Type: application/json
```

**Path parameters**

| Parameter | Description |
|-----------|-------------|
| `terminalSessionId` | Terminal session ID from create response |

**Request body**

```json
{
  "data": "ls -la\n"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `data` | `string` | Yes | Raw input string. Use `\n` for Enter, `\x03` for Ctrl+C, etc. |

**Response `204`** — No content

**curl**

```bash
curl -X POST http://127.0.0.1:PORT/api/v1/terminal/sessions/term_abc123/input \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"data": "ls -la\n"}'
```

**TypeScript**

```typescript
await client.sendTerminalInput(terminalSessionId, "ls -la\n");

// Send Ctrl+C
await client.sendTerminalInput(terminalSessionId, "\x03");

// Send Ctrl+D (EOF)
await client.sendTerminalInput(terminalSessionId, "\x04");
```

---

## Resize Terminal

Updates the terminal dimensions. Call this whenever the terminal view is resized to prevent text wrapping issues.

```
POST /api/v1/terminal/sessions/{terminalSessionId}/resize
Authorization: Bearer <token>
Content-Type: application/json
```

**Request body**

```json
{
  "cols": 240,
  "rows": 60
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `cols` | `number` | Yes | New terminal width in columns |
| `rows` | `number` | Yes | New terminal height in rows |

**Response `204`** — No content

**curl**

```bash
curl -X POST http://127.0.0.1:PORT/api/v1/terminal/sessions/term_abc123/resize \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"cols": 240, "rows": 60}'
```

**TypeScript**

```typescript
await client.resizeTerminalSession(terminalSessionId, 240, 60);
```

---

## Get Terminal Events

Polls for terminal output events since the last retrieved event. Uses a cursor-based pagination model via `lastEventId`.

```
GET /api/v1/terminal/sessions/{terminalSessionId}/events?lastEventId={lastEventId}
Authorization: Bearer <token>
```

**Query parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `lastEventId` | `number` | No | Return only events with ID greater than this value. Default: `0` (all events) |

**Response `200`**

```json
[
  {
    "eventId": 1,
    "data": "user@host:/project$ "
  },
  {
    "eventId": 2,
    "data": "ls -la\r\n"
  },
  {
    "eventId": 3,
    "data": "total 48\r\ndrwxr-xr-x  8 user group 256 Jan 15 10:05 .\r\n"
  }
]
```

| Field | Type | Description |
|-------|------|-------------|
| `eventId` | `number` | Monotonically increasing event cursor |
| `data` | `string` | Raw terminal output (VT100/ANSI sequences included) |

**curl**

```bash
# Get all events from the start
curl "http://127.0.0.1:PORT/api/v1/terminal/sessions/term_abc123/events" \
  -H "Authorization: Bearer $TOKEN"

# Poll for new events since event 42
curl "http://127.0.0.1:PORT/api/v1/terminal/sessions/term_abc123/events?lastEventId=42" \
  -H "Authorization: Bearer $TOKEN"
```

**TypeScript — polling loop**

```typescript
let lastEventId = 0;

async function pollTerminal(terminalSessionId: string) {
  const events = await client.listTerminalEvents(terminalSessionId, lastEventId);
  for (const event of events) {
    terminal.write(event.data); // xterm.js or similar
    lastEventId = event.eventId;
  }
}

// Poll every 100ms
setInterval(() => pollTerminal(terminalSessionId), 100);
```

---

## Close Terminal Session

Terminates the PTY process and cleans up the terminal session.

```
DELETE /api/v1/terminal/sessions/{terminalSessionId}
Authorization: Bearer <token>
```

**Response `204`** — No content

**curl**

```bash
curl -X DELETE http://127.0.0.1:PORT/api/v1/terminal/sessions/term_abc123 \
  -H "Authorization: Bearer $TOKEN"
```

---

## xterm.js Integration Example

```typescript
import { Terminal } from "xterm";

const xterm = new Terminal({ cols: 220, rows: 50 });
xterm.open(document.getElementById("terminal"));

// Create session
const { terminalSessionId } = await client.createTerminalSession({
  cols: 220, rows: 50,
});

// Send user input to server
xterm.onData((data) => client.sendTerminalInput(terminalSessionId, data));

// Handle resize
xterm.onResize(({ cols, rows }) =>
  client.resizeTerminalSession(terminalSessionId, cols, rows)
);

// Poll output
let lastEventId = 0;
setInterval(async () => {
  const events = await client.listTerminalEvents(terminalSessionId, lastEventId);
  for (const { eventId, data } of events) {
    xterm.write(data);
    lastEventId = eventId;
  }
}, 50);
```
