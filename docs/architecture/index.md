# Architecture Overview

Lunaria is a desktop-first AI development environment built on a layered architecture that keeps a native Rust/Axum backend in tight control of all system resources while a React 19 frontend handles the user interface. The two layers communicate entirely through a local HTTP/SSE API — the same API that remote devices use over LAN or relay.

## System Layers

```
┌─────────────────────────────────────────────────────────────────┐
│                        Tauri Shell (Rust)                       │
│  Window management · IPC bridge · OS keychain · App lifecycle   │
└───────────────────────────┬─────────────────────────────────────┘
                            │ Tauri commands + events
┌───────────────────────────▼─────────────────────────────────────┐
│                    React 19 Frontend (TypeScript)                │
│  Session workspace · Command palette · File editor · Settings   │
└───────────────────────────┬─────────────────────────────────────┘
                            │ HTTP REST + SSE  (localhost:random)
┌───────────────────────────▼─────────────────────────────────────┐
│                   Axum Runtime Server (Rust)                     │
│                                                                  │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────────────┐  │
│  │  AI Worker  │  │    Memory    │  │        Tools           │  │
│  │ (Bun/TS)   │  │  L0/L1/L2   │  │ Executor + Permission   │  │
│  └─────────────┘  └──────────────┘  │       Broker           │  │
│                                     └────────────────────────┘  │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────────────┐  │
│  │    Hooks    │  │  Extensions  │  │    Orchestration        │  │
│  │ 24 events  │  │  .luna files │  │  Agents + Teams        │  │
│  └─────────────┘  └──────────────┘  └────────────────────────┘  │
│                                                                  │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────────────┐  │
│  │ Workspaces  │  │    Remote    │  │       Terminal         │  │
│  │ CoW/Git/   │  │  LAN + Relay │  │   PTY multiplexer      │  │
│  │ Full clone  │  │  + JWT auth  │  │                        │  │
│  └─────────────┘  └──────────────┘  └────────────────────────┘  │
└───────────────────────────┬─────────────────────────────────────┘
                            │ rusqlite
┌───────────────────────────▼─────────────────────────────────────┐
│                     SQLite Database                              │
│  14 migrations · FTS5 full-text search · JSON columns           │
└─────────────────────────────────────────────────────────────────┘
```

## Layer Descriptions

### Tauri Shell

The Tauri 2 shell is the outermost layer. It manages the native application window, owns the OS keychain via the `tauri-plugin-keychain` integration, and provides the `LaunchContext` to the frontend at startup. The shell spawns the Axum runtime on a random localhost port and passes `api_base_url`, `bootstrap_token`, and `instance_id` to the WebView via a Tauri command. Once the frontend has exchanged the bootstrap token for a session JWT, all subsequent communication is pure HTTP — the Tauri IPC bridge is not used for session data.

### React 19 Frontend

The frontend is a Vite-built React 19 application embedded in the Tauri WebView. It communicates with the runtime exclusively over the REST/SSE API. The frontend consumes Server-Sent Events (SSE) for real-time message streaming, agent status updates, tool approval requests, and hook results. UI state is managed through React context backed by SWR-style polling plus SSE subscriptions for live data.

### Axum Runtime Server

The core of Lunaria. A Tokio-powered Axum server that binds to a random available port on `127.0.0.1` at startup. It registers 110+ routes across:

- `/api/v1/sessions/*` — session lifecycle and message management
- `/api/v1/agents/*` — agent orchestration and team management
- `/api/v1/memory/*` — observation capture and semantic retrieval
- `/api/v1/tools/*` — tool execution and permission approval
- `/api/v1/workspaces/*` — workspace clone and inspection
- `/api/v1/remote/*` — device pairing and relay
- `/api/v1/terminal/*` — PTY session management
- `/api/v1/hooks/*` — hook registration and firing
- `/api/v1/extensions/*` — `.luna` bundle installation
- `/api/v1/providers/*` — provider registry and routing
- `/api/v1/settings/*` — scoped settings storage
- `/events` — SSE broadcast stream

All routes (except the bootstrap endpoint) require a `Bearer` JWT in the `Authorization` header. The middleware validates the token against a per-instance secret generated at startup.

### AI Worker (Bun/TypeScript)

The AI worker is a Bun TypeScript process (`apps/desktop/worker/bridge.ts`) managed by `BunWorkerBridge`. Communication is line-delimited JSON-RPC 2.0 over stdin/stdout. The Rust runtime writes requests and reads streaming notifications from the worker process. The worker handles:

- `stream.start` — initiates a streaming completion; emits `stream.token`, `stream.tool_call`, and `stream.done` notifications
- `embed.generate` — generates embeddings using `text-embedding-3-small` via OpenAI
- `health.check` — returns process status and PID

If the worker process exits unexpectedly, `BunWorkerBridge` automatically respawns it on the next request.

### Memory System

Three-tier observation storage (L0/L1/L2) with hybrid FTS5 + vector search. Observations are captured automatically from user prompts, assistant responses, and tool results. See [Memory](../features/memory.md) for full details.

### Tool System

`ToolExecutor` runs built-in tools (`Read`, `Bash`, `MemoryExpand`, `echo`) and routes permission decisions through `PermissionBroker`, which suspends the AI turn with a `oneshot` channel until the user approves or denies the tool call. See [Tools](../features/tools.md).

### Hook Engine

The `HookEngine` fires 24 lifecycle events to registered handlers (shell commands, HTTP endpoints, prompt injections, or agent invocations). Hooks are persisted in SQLite and executed asynchronously with configurable timeouts. See the [Hook Events Reference](../reference/hook-events.md).

### Extension System

Extensions are distributed as single `.luna` binary files. The format is a custom binary container: 4-byte `LUNA` magic, 4-byte version, length-prefixed JSON manifest, then N length-prefixed asset blobs. Extensions can contribute commands, menu items, panels, settings, hooks, tools, and providers. See [Extensions](../extensions/).

### Workspace Manager

Creates isolated copies of project directories using a three-tier strategy: copy-on-write (`cp -cR` on APFS), `git worktree add --detach`, or full recursive copy. See [Workspaces](../features/workspaces.md).

### Remote Access

`RemoteAccessService` enables mobile and tablet clients to connect to the desktop runtime over LAN or an encrypted relay. Device pairing uses ephemeral PIN codes; tokens are short-lived JWTs (15-minute access, 30-day refresh) signed with a per-boot secret. See [Remote Access](../features/remote-access.md).

### Terminal Multiplexer

`RemoteTerminalManager` creates real PTY sessions via `portable_pty`. Each session has an independent reader thread that collects output into an event log. Clients poll for new events using `lastEventId`. See [Terminal](../features/terminal.md).

### SQLite Database

All persistent state lives in a single SQLite file under the app data directory. 14 migrations bootstrap the schema atomically using transactions. The repository pattern provides type-safe access to every table. See [Database](database.md).

## Request Lifecycle (Short Form)

```
Frontend → POST /api/v1/sessions/{id}/messages
         → Runtime validates JWT, creates MessageRecord
         → Fires HookEvent::UserPromptSubmit
         → BunWorkerBridge::stream_completion_with_handler
             → Worker streams stream.token events
             → Runtime broadcasts SSE events to frontend
             → Worker emits stream.tool_call
         → ToolExecutor::execute
             → PermissionBroker suspends turn if Ask mode
             → Frontend receives SSE tool approval request
             → User approves → ToolExecutor::await_and_execute
         → MemoryService::capture (observation recorded)
         → HookEvent::Stop fired
         → Final MessageRecord written to DB
```

For the full data flow see [Data Flow](data-flow.md).
