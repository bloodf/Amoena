# Terminal Multiplexing

Lunaria provides full PTY terminal sessions via `RemoteTerminalManager`. Each session is a real pseudo-terminal process — not a command runner — supporting interactive programs, shell prompts, colours, and resize events. Sessions are accessible both locally and from paired remote devices.

## Architecture

```
RemoteTerminalManager
├── create()        → spawn PTY process via portable_pty
├── input()         → write bytes to PTY master
├── events_since()  → poll output event log (incremental)
├── resize()        → send SIGWINCH via PtySize update
└── close()         → kill child process, remove session
```

Each `TerminalSession` holds:
- `writer` — the PTY master write end (accepts keystrokes)
- `child` — the spawned shell process (for kill/wait)
- `master` — the PTY master (for resize operations)
- `events` — append-only event log (`Vec<TerminalOutputEvent>`)
- `next_event_id` — monotonically increasing counter

A background reader thread continuously reads from the PTY master and appends `TerminalOutputEvent` entries to the event log. Clients poll the log using `lastEventId` for efficient incremental retrieval.

## Creating a Terminal Session

```http
POST /api/v1/terminal/create
Content-Type: application/json
Authorization: Bearer <jwt>

{
  "shell": "/bin/zsh",
  "cwd": "/Users/dev/myproject",
  "cols": 120,
  "rows": 40
}
```

All parameters are optional:
- `shell` — defaults to `/bin/sh`
- `cwd` — defaults to the process working directory
- `cols` — defaults to 80, minimum 1
- `rows` — defaults to 24, minimum 1

Response:

```json
{
  "terminalSessionId": "550e8400-e29b-41d4-a716-446655440000"
}
```

The shell is spawned immediately. The reader thread begins collecting output right away, so any shell initialization output (e.g., `.zshrc` loading) is captured in the first events.

## Sending Input

```http
POST /api/v1/terminal/{sessionId}/input
Content-Type: application/json

{
  "data": "ls -la\n"
}
```

The `data` string is written as raw bytes to the PTY master using `spawn_blocking` (Tokio's blocking thread pool). The PTY master interprets control characters normally — `\r`, `\n`, `\x03` (Ctrl-C), `\x04` (Ctrl-D), escape sequences, and so on all work as in a real terminal.

## Reading Output

Output is delivered as an event log. Poll for new events using `lastEventId`:

```http
GET /api/v1/terminal/{sessionId}/events?lastEventId=0
```

Response:

```json
[
  {
    "eventId": 1,
    "data": "total 48\ndrwxr-xr-x  14 dev  staff   448 Mar 14 10:00 .\n",
    "stream": "stdout"
  },
  {
    "eventId": 2,
    "data": "\u001b[1;32mdev@machine\u001b[0m:\u001b[1;34m~/myproject\u001b[0m$ ",
    "stream": "stdout"
  }
]
```

Each event has:
- `eventId` — monotonically increasing, use as `lastEventId` on next poll
- `data` — raw terminal bytes as a string (may contain ANSI escape sequences)
- `stream` — always `"stdout"` currently (stderr is merged into the PTY master)

Pass the highest received `eventId` as `lastEventId` on each subsequent request. The server returns only events with `eventId > lastEventId`:

```http
GET /api/v1/terminal/{sessionId}/events?lastEventId=2
→ returns only events 3, 4, 5, ...
```

This makes polling efficient — requests for "no new events" return an empty array immediately.

## Resizing

When the frontend terminal emulator is resized, send a resize event to keep the PTY dimensions in sync:

```http
POST /api/v1/terminal/{sessionId}/resize
Content-Type: application/json

{
  "cols": 160,
  "rows": 50
}
```

Internally this calls `master.resize(PtySize { cols, rows, pixel_width: 0, pixel_height: 0 })`. The kernel sends `SIGWINCH` to the shell process, which updates its internal window size. Programs like `vim`, `htop`, and `less` respond to this signal and redraw accordingly.

## Closing a Session

```http
DELETE /api/v1/terminal/{sessionId}/close
```

Kills the child process and removes the session from the registry. After close, polling for events or sending input returns a 404.

## Frontend Integration with xterm.js

The desktop UI renders terminal sessions using xterm.js. The integration pattern:

```typescript
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';

const term = new Terminal({
  cols: 120,
  rows: 40,
  fontFamily: 'JetBrains Mono, monospace',
  theme: { background: '#1e1e2e' },
});
const fitAddon = new FitAddon();
term.loadAddon(fitAddon);
term.open(containerElement);
fitAddon.fit();

// Create session
const { terminalSessionId } = await api.createTerminalSession({
  shell: '/bin/zsh',
  cwd: workingDir,
  cols: term.cols,
  rows: term.rows,
});

// Stream output via polling
let lastEventId = 0;
const poll = async () => {
  const events = await api.getTerminalEvents(terminalSessionId, lastEventId);
  for (const event of events) {
    term.write(event.data);
    lastEventId = event.eventId;
  }
  setTimeout(poll, 50); // 50ms polling interval
};
poll();

// Send input
term.onData((data) => {
  api.sendTerminalInput(terminalSessionId, data);
});

// Handle resize
const resizeObserver = new ResizeObserver(() => {
  fitAddon.fit();
  api.resizeTerminal(terminalSessionId, term.cols, term.rows);
});
resizeObserver.observe(containerElement);
```

The 50ms polling interval gives ~20 FPS output refresh, which is sufficient for most use cases. For lower latency, implement exponential backoff: poll at 16ms when events are being received, backing off to 200ms when idle.

## Remote Terminal Access

Paired mobile and tablet devices can create and use terminal sessions with the same API, subject to having the `terminal:read` and `terminal:write` scopes. This enables full shell access to the development machine from a phone or tablet — useful for monitoring builds, running tests, or responding to alerts while away from the desk.

The terminal session is created on the desktop and output is delivered to the mobile client via the same polling API, optionally tunnelled through the relay with end-to-end encryption.

## Session Lifecycle

Terminal sessions are in-memory only — they are not persisted to the database. If the runtime restarts, all terminal sessions are lost. Sessions must be recreated on reconnect.

Sessions persist as long as the child process is alive. If the user exits the shell (e.g., types `exit` or `Ctrl-D`), the PTY reader thread detects the EOF and stops appending events. The session remains in the registry until explicitly closed via the API.

## Concurrency

Each terminal session's event log is protected by a `Mutex<Vec<TerminalOutputEvent>>`. The reader thread holds the lock only long enough to push a new event. Polling clients hold the lock only long enough to copy events since `lastEventId`. This means concurrent reads and writes are safe and non-blocking for typical workloads.

The writer is similarly protected by `Mutex<Box<dyn Write + Send>>`. Multiple concurrent input requests are serialized through this mutex, preserving byte order.

## API Reference

| Endpoint | Method | Description |
|---|---|---|
| `/api/v1/terminal/create` | POST | Create a new PTY session |
| `/api/v1/terminal/{id}/input` | POST | Send input bytes |
| `/api/v1/terminal/{id}/events` | GET | Poll output events |
| `/api/v1/terminal/{id}/resize` | POST | Resize the PTY |
| `/api/v1/terminal/{id}/close` | DELETE | Kill and remove session |
