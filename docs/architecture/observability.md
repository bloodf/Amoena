# Observability and Logging

## Overview

Amoena uses structured logging for debugging, performance monitoring, and audit trails. All logs are local — nothing is sent to external services without explicit user opt-in.

## Log Levels

| Level | Usage |
|-------|-------|
| ERROR | Unrecoverable failures, data loss risk |
| WARN | Recoverable failures, degraded performance |
| INFO | Session lifecycle events, significant state changes |
| DEBUG | Tool execution details, IPC messages, query results |
| TRACE | Token-level streaming, raw provider responses |

Default log level: INFO for release builds, DEBUG for development.

## Structured Log Format

All logs are structured JSON (one line per entry):

```json
{
  "ts": "2025-03-11T19:00:00.000Z",
  "level": "INFO",
  "target": "amoena::session",
  "session_id": "abc123",
  "agent_id": "primary",
  "msg": "Session created",
  "fields": { "provider": "anthropic", "model": "claude-sonnet-4-20250514" }
}
```

## Log Destinations

| Destination | Content | Retention |
|-------------|---------|-----------|
| Rust `tracing` | All runtime logs | Configurable (default: 7 days of files) |
| SQLite `audit_log` | Permission decisions, security events | 90 days |
| JSONL transcripts | Full session history | Until user deletes session |
| Console (dev mode) | All logs | Session lifetime |

## Key Metrics

| Metric | Source | Purpose |
|--------|--------|---------|
| Token usage per session | Provider responses | Cost tracking |
| Tool execution latency | Tool executor | Performance monitoring |
| IPC round-trip time | Tauri invoke / JSON-RPC | Latency budgets |
| SSE event delivery time | Streaming pipeline | Streaming health |
| Memory retrieval latency | Memory manager | Query optimization |
| Workspace clone time | Workspace manager | UX responsiveness |

## Token & Cost Monitoring

Every provider response includes token counts:
- Prompt tokens, completion tokens, total tokens
- Cached tokens (if applicable)
- Cost calculation based on provider pricing (user-configurable)

Displayed in:
- Per-session token counter in the session workspace
- Aggregated usage dashboard (Settings > Usage)
- Per-agent breakdown (multi-agent mode)

## Audit Trail

Security-relevant events are stored in the SQLite `audit_log` table:
- Permission decisions (allow/deny/ask)
- Remote device connections and disconnections
- Provider authentication events
- Plugin installations and permission grants
- Workspace creation and destruction

## Performance Tracing

For debugging latency issues, enable TRACE level on specific targets:

```bash
RUST_LOG=amoena::ipc=trace,amoena::streaming=trace
```

This captures per-event timing through the full pipeline.

## Privacy

- Logs may contain file paths and code snippets from the user's project.
- Logs never contain API keys, tokens, or credentials.
- Log files are stored in the Tauri app data directory (OS-specific).
- Users can clear all logs from Settings.
