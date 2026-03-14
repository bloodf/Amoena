# Runtime Server

The Axum runtime server is the engine of Lunaria. It starts on a random localhost port when the Tauri shell launches, exposes 110+ REST and SSE endpoints, manages the AI worker process, coordinates all subsystems, and serves as the single source of truth for session, agent, memory, and device state.

## Bootstrap Flow

When the Tauri shell initializes it calls `RuntimeServer::start()`, which:

1. Resolves paths (`RuntimePaths` — database file, workspace root, log dir)
2. Opens and migrates the SQLite database
3. Generates a single-use `bootstrap_token` (UUID) with a 60-second TTL
4. Constructs `SharedState` with all service instances
5. Builds the Axum router and binds a `TcpListener` on `127.0.0.1:0`
6. Returns a `LaunchContext` to the frontend via Tauri IPC:

```json
{
  "apiBaseUrl": "http://127.0.0.1:54321",
  "bootstrapPath": "/api/v1/bootstrap/auth",
  "bootstrapToken": "<uuid>",
  "expiresAtUnixMs": 1710000060000,
  "instanceId": "<uuid>"
}
```

The frontend immediately POSTs the bootstrap token to `/api/v1/bootstrap/auth` and receives a long-lived session JWT:

```json
{
  "apiBaseUrl": "http://127.0.0.1:54321",
  "authToken": "<jwt>",
  "instanceId": "<uuid>",
  "sseBaseUrl": "http://127.0.0.1:54321",
  "tokenType": "Bearer"
}
```

All subsequent requests use this token as `Authorization: Bearer <jwt>`.

## SharedState

`SharedState` is an `Arc<AppState>` threaded through every Axum handler via `State<SharedState>`. It contains:

```rust
pub struct AppState {
    // Core
    pub database: Arc<Database>,
    pub config: Arc<ConfigService>,

    // AI
    pub worker: BunWorkerBridge,

    // Subsystems
    pub memory: MemoryService,
    pub orchestration: OrchestrationService,
    pub tool_executor: ToolExecutor,
    pub permission_broker: PermissionBroker,
    pub hook_engine: HookEngine,
    pub workspace_manager: WorkspaceManager,
    pub workspace_reviews: WorkspaceReviewManager,
    pub remote: RemoteAccessService,
    pub terminal: RemoteTerminalManager,
    pub routing: ProviderRoutingService,
    pub providers: ProviderRegistryService,
    pub plugins: PluginRegistryService,
    pub wrappers: WrapperManager,

    // SSE
    pub sse_tx: broadcast::Sender<SseEvent>,

    // Repositories (direct access for handlers)
    pub sessions: SessionRepository,
    pub messages: MessageRepository,
    pub settings: SettingsRepository,
    pub usage: UsageAnalyticsRepository,
}
```

All fields are `Clone`-able — either cheaply via `Arc` or by design (repositories hold an `Arc<Database>`).

## Authentication Middleware

Every route except the two bootstrap paths (`/api/bootstrap/auth` and `/api/v1/bootstrap/auth`) is wrapped by `auth_middleware`:

```
Request
  → extract Authorization header
  → strip "Bearer " prefix
  → verify JWT signature against instance secret
  → check exp claim
  → insert AuthenticatedUser into request extensions
  → call next handler
  ↓ on failure → 401 Unauthorized
```

The bootstrap endpoints accept the one-time UUID token directly (no JWT). After exchange the token is consumed and cannot be reused.

Remote device endpoints additionally validate the token via `RemoteAccessService::authenticate_access_token`, which also checks that the device record is `Active` and the `token_family_id` matches (enabling refresh-token rotation invalidation).

## Route Registration

Routes are grouped by resource and registered with Axum's `Router::nest`:

```
/api/v1/
  bootstrap/auth          POST  — token exchange
  sessions                GET, POST
  sessions/:id            GET, PATCH, DELETE
  sessions/:id/messages   GET, POST
  sessions/:id/run        POST  — native turn execution
  sessions/:id/stream     GET   — SSE stream for session
  agents                  GET, POST
  agents/:id              GET, PATCH
  agents/:id/mailbox      GET, POST
  agents/:id/spawn        POST
  teams                   GET, POST
  teams/:id               GET
  teams/:id/consensus     GET
  memory/observe          POST
  memory/search           GET
  memory/session/:id      GET
  memory/inject           POST
  tools/execute           POST
  tools/approvals         GET
  tools/approvals/:id     PATCH
  workspaces              GET, POST
  workspaces/:id          GET
  workspaces/:id/archive  POST
  workspaces/:id/destroy  DELETE
  workspaces/:id/files    GET
  remote/lan/enable       POST
  remote/lan/disable      POST
  remote/lan/status       GET
  remote/pair/intent      POST
  remote/pair/complete    POST
  remote/pair/refresh     POST
  remote/devices          GET
  remote/devices/:id      DELETE
  remote/relay/room       POST
  remote/relay/:id/join   POST
  remote/relay/:id/send   POST
  remote/relay/:id/events GET
  terminal/create         POST
  terminal/:id/input      POST
  terminal/:id/events     GET
  terminal/:id/resize     POST
  terminal/:id/close      DELETE
  hooks                   GET, POST
  hooks/:id               PATCH, DELETE
  hooks/fire              POST
  extensions/install      POST
  extensions              GET
  extensions/:id          DELETE
  providers               GET
  providers/route         POST
  providers/:id/models    GET
  settings                GET, POST
  settings/:key           GET, PATCH, DELETE
  usage                   GET
events                    GET   — global SSE stream
```

## SSE Event Broker

A `tokio::sync::broadcast` channel (`capacity = 1024`) carries `SseEvent` values to all connected SSE consumers. The `/events` endpoint subscribes to this channel and returns an `axum::response::Sse` stream with 30-second keep-alive pings.

Events are structured as:

```json
{
  "type": "message.delta",
  "sessionId": "...",
  "data": { ... }
}
```

Common event types:

| Type | When |
|---|---|
| `message.delta` | Token arrives from AI worker |
| `message.done` | AI turn complete |
| `tool.pending` | Tool call waiting for approval |
| `tool.resolved` | Tool approval decision made |
| `agent.status` | Agent lifecycle state change |
| `hook.fired` | Hook invocation result |
| `session.updated` | Session metadata changed |

## CORS

CORS is configured to allow all origins (`*`) for local development. The Tauri WebView and the LAN listener share the same router, so the permissive policy is intentional — authentication is enforced via JWT rather than origin.

## Transcript Store

Each session maintains an in-memory transcript of `StreamMessage` values (`Vec<StreamMessage>`) that is the context window sent to the AI worker. The transcript is rebuilt from the `messages` table on each turn by loading all messages for the session, converting them to `StreamMessage` format, and prepending the system prompt.

## Native Turn Execution

`POST /api/v1/sessions/:id/run` is the main entry point for an AI turn in native mode:

```
1. Load session + validate status (must be Created or Paused)
2. Update session status → Running
3. Fire HookEvent::UserPromptSubmit with prompt payload
4. Build transcript from message history
5. Resolve routing decision (provider + model + reasoning mode)
6. Call BunWorkerBridge::stream_completion_with_handler
   a. Each stream.token → broadcast SSE message.delta
   b. stream.tool_call → ToolExecutor::execute
      - If Pending → broadcast SSE tool.pending, await approval
      - If Completed → append tool result to transcript, continue
7. Record final assistant message in DB
8. MemoryService::capture for the assistant response
9. Fire HookEvent::Stop
10. Update session status → Paused (awaiting next prompt)
```

## Wrapper Mode

In wrapper mode the runtime delegates to external CLI tools (claude-code, opencode, codex, gemini) via `WrapperManager`. Events from the wrapper process are normalized into `NormalizedWrapperEvent` and re-emitted as SSE. The session `session_mode` column distinguishes `'native'` from `'wrapper'`.

## Error Handling

All handlers return `Result<Json<Value>, AppError>`. `AppError` implements `IntoResponse` and maps error variants to appropriate HTTP status codes:

- `NotFound` → 404
- `Unauthorized` → 401
- `BadRequest` → 400
- `Conflict` → 409
- `InternalError` → 500

Errors are serialized as:

```json
{
  "error": "human-readable message",
  "code": "ERROR_CODE"
}
```

## Logging

Structured logging uses the `tracing` crate with `tracing-subscriber`. Log files are written to the runtime paths log directory. Request tracing includes session ID, agent ID, and tool name where applicable. The `RUST_LOG` environment variable controls verbosity.
