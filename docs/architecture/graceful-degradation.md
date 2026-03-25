# Graceful Degradation

## Principle

When a subsystem is unavailable, Amoena continues operating with reduced functionality rather than failing entirely. The user is always informed of degraded state.

## Degradation Matrix

| Subsystem | Unavailable When | Degraded Behavior | User Notification |
|-----------|-----------------|-------------------|-------------------|
| LLM Provider | API down, auth expired, rate limited | Session paused, retry with backoff | Inline banner with retry button |
| Bun Daemon | Crash, startup failure | Native mode unavailable; wrapper mode still works | Toast notification + settings link |
| SQLite-vec | Extension load failure | Memory falls back to FTS5 only | Settings shows "Vector search unavailable" |
| Ollama (local models) | Not installed, not running | Fall back to cloud embedding model | Settings shows "Local models unavailable" |
| Git | Not installed (unlikely) | Workspace isolation uses full copy instead of worktree | Warning in workspace creation |
| Network | Offline | Remote access disabled, provider calls fail | Status bar shows "Offline" |
| Monaco/CodeMirror | CSP block (shouldn't happen) | Fall back to textarea for file editing | Degraded editor notice |

## Subsystem Health Checks

On startup, Amoena checks:
1. SQLite database: open and migrate
2. Bun daemon: spawn and verify heartbeat
3. Git: `git --version` (optional)
4. Ollama: probe well-known port (optional)

Results are cached and displayed in Settings > System Health.

## Feature Flags

Features that depend on optional subsystems are gated:

```rust
// Pseudo-code
if sqlite_vec_available() {
    enable_vector_search();
} else {
    log::warn!("SQLite-vec not available, falling back to FTS5");
    disable_vector_search();
}
```

No feature flag infrastructure is needed — these are runtime capability checks.
