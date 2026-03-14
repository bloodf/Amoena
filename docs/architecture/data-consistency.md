# Data Consistency and Concurrency

## Overview

Lunaria uses SQLite as its primary database with JSONL files for transcript persistence. This document defines how concurrent access is managed.

## SQLite Concurrency

### WAL Mode

SQLite runs in WAL (Write-Ahead Logging) mode:
- Multiple concurrent readers
- Single writer at a time
- Writers do not block readers
- Readers do not block writers

WAL mode is set at database creation and never changed:
```sql
PRAGMA journal_mode = WAL;
PRAGMA busy_timeout = 5000;
```

### Connection Pool

The Rust backend uses a connection pool (via `r2d2` or similar):
- Read connections: pool of 4 (configurable)
- Write connection: single dedicated connection
- Busy timeout: 5 seconds

### Transaction Boundaries

| Operation | Transaction Scope |
|-----------|------------------|
| Session create | Single transaction (session + initial metadata) |
| Message persist | Single transaction (message + token usage update) |
| Memory write | Single transaction (observation + index update) |
| Schema migration | Per-migration transaction with rollback |
| Workspace create | No transaction (filesystem operation) |

## JSONL Consistency

JSONL transcript files are append-only:
- Each line is a complete JSON object (message, tool call, or event)
- Writes are flushed after each line (no buffering)
- Corrupt last line (partial write) is detected and truncated on load
- JSONL is the replay source; SQLite metadata is the query source

### Sync Protocol

```
Session event → SQLite write (metadata) → JSONL append (full event)
                       ↓
               Success → acknowledge to client
               Failure → retry once → report error
```

Both writes must succeed for the event to be considered persisted. If JSONL write fails but SQLite succeeds, the metadata is marked as `incomplete` for later repair.

## Multi-Agent Concurrency

When multiple agents run concurrently (V1.5+):
- Each agent has its own workspace (filesystem isolation)
- Each agent has its own session (database row isolation)
- Mailbox messages are stored in SQLite with sender/receiver indexing
- No shared mutable state between agents except through the mailbox

## Locking Strategy

| Resource | Lock Type | Scope |
|----------|-----------|-------|
| SQLite database | WAL mode (internal) | Per-connection |
| Workspace directory | Advisory file lock | Per-agent session |
| Settings file | Read-write lock (Rust `RwLock`) | Process-wide |
| Provider credentials | Read-only (keychain) | Per-read |

## Recovery

See `docs/architecture/error-recovery.md` for recovery procedures when consistency is violated.
