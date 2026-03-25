# Error Recovery Architecture

## Purpose

This document defines how Amoena handles errors across its runtime components — from provider failures and tool crashes to workspace corruption and IPC disconnection. The goal is graceful degradation: every failure mode has a defined recovery path, and the user is always informed.

## Error Categories

| Category | Examples | Severity | Recovery |
|----------|----------|----------|----------|
| Provider | API timeout, auth expired, rate limit, malformed response | Recoverable | Retry with backoff, re-auth prompt, provider switch |
| Tool execution | Tool crash, timeout, permission denied, sandbox escape attempt | Recoverable | Kill tool, report to user, continue session |
| Streaming | SSE disconnect, backpressure, partial message | Recoverable | Reconnect, replay from last checkpoint |
| Workspace | Clone failure, disk full, git conflict, corrupt worktree | Recoverable | Fallback to git worktree, cleanup and retry |
| Database | SQLite lock contention, migration failure, corruption | Critical | WAL recovery, backup restore, fresh init |
| IPC | Bun daemon crash, Tauri invoke timeout, deserialization error | Recoverable | Watchdog restart, retry with backoff |
| System | Out of memory, disk full, permission denied | Critical | Surface to user, graceful shutdown |

## Provider Error Handling

### Retry Strategy

```
Attempt 1: immediate
Attempt 2: 1s delay
Attempt 3: 5s delay
Attempt 4: 30s delay (with user notification)
Max retries: 4
```

Exponential backoff with jitter. Rate limit errors (`429`) respect the provider's `Retry-After` header.

### Auth Expiry

When a provider returns `401`:
1. Attempt token refresh (OAuth providers).
2. If refresh fails, surface re-auth prompt in the UI.
3. Session pauses — no messages lost. Resume after re-auth.

### Provider Fallback

If the primary provider is unavailable:
- V1.0+: Offer to switch to an alternative configured provider.
- MVP: Surface error and wait for provider recovery.

## Tool Execution Errors

### Timeout

Each tool has a configurable timeout (default: 30s, max: 300s). On timeout:
1. Kill the tool process.
2. Send `tool_result` with `error: "timeout"` to the model.
3. Model decides whether to retry or proceed differently.

### Crash

If a tool process exits with non-zero:
1. Capture stderr output.
2. Send `tool_result` with error details to the model.
3. Log the crash for observability.

### Permission Denied

If the user denies a tool call:
1. Send `tool_result` with `error: "permission_denied"` to the model.
2. Model receives this as a normal tool result and adapts.

## Streaming Recovery

### SSE Disconnection (Desktop)

Desktop uses Tauri events, not HTTP SSE. Disconnection only happens if the webview crashes:
1. Tauri detects webview crash and restarts it.
2. Webview reconnects and replays from the last persisted message.
3. Any in-flight generation continues — the Rust backend doesn't stop.

### SSE Disconnection (Remote)

Remote clients use HTTP SSE. On disconnect:
1. Client reconnects with `Last-Event-ID` header.
2. Server replays events from the checkpoint.
3. If checkpoint is too old, send full session state refresh.

## Bun Daemon Recovery

### Crash Detection

The Tauri main process monitors the Bun daemon via:
- Process health check (heartbeat every 5s over the Unix socket).
- Watchdog timer: if no heartbeat for 15s, declare crash.

### Recovery Sequence

1. Log crash details (exit code, last active session).
2. Spawn new Bun daemon instance.
3. Restore active session state from Rust-side persistence.
4. Emit `daemon_recovered` event to connected clients.
5. In-flight streams receive an `error` event with `retryable: true`.

## Workspace Recovery

### Clone Failure

If CoW clone or git worktree creation fails:
1. Try the fallback method (CoW → worktree → full copy).
2. If all methods fail, surface error to user with disk space information.
3. Suggest cleanup of old workspaces.

### Corrupt Worktree

If a workspace is detected as corrupt (e.g., `.git` missing, index lock stale):
1. Attempt `git worktree repair`.
2. If repair fails, archive the corrupt workspace and create a new one.
3. Preserve any uncommitted changes if possible.

## Database Recovery

### SQLite WAL Recovery

On startup, if the WAL file exists but is inconsistent:
1. Run `PRAGMA wal_checkpoint(TRUNCATE)`.
2. If checkpoint fails, copy the main database file (backup) and attempt recovery.
3. If recovery fails, start with a fresh database and log the loss.

### Migration Failure

If a schema migration fails mid-execution:
1. Roll back the transaction (migrations are transactional).
2. Log the failure with the migration version number.
3. Surface to user: "Database update failed. Please report this issue."
4. App continues with the previous schema version if possible.

## User Communication

All errors visible to the user follow a consistent pattern:

```typescript
interface UserError {
  title: string;        // Brief description ("Provider unavailable")
  detail: string;       // What happened ("Anthropic API returned 503")
  action?: string;      // What the user can do ("Check your API key in Settings")
  retryable: boolean;   // Whether the user can retry
  sessionImpact: "none" | "paused" | "terminated";
}
```

Errors appear in the session workspace as inline notices, not modal dialogs — the user's context is preserved.

## Observability

All errors are logged with:
- Timestamp, error category, severity
- Session ID, agent ID (if applicable)
- Stack trace (for crashes)
- Recovery action taken

See `docs/architecture/observability.md` for the full logging strategy.
