# Performance Benchmarks and Latency Budgets

## Latency Budgets

| Operation | Target p95 | Maximum | Phase |
|-----------|-----------|---------|-------|
| Tauri `invoke()` round-trip | < 50ms | 100ms | MVP |
| SSE event delivery (emit → render) | < 20ms | 50ms | MVP |
| Remote HTTP request | < 100ms | 200ms | V2.0 |
| Session create | < 200ms | 500ms | MVP |
| Session list (100 sessions) | < 50ms | 100ms | MVP |
| Memory retrieval (FTS5, 10K obs) | < 50ms | 100ms | MVP |
| Memory retrieval (hybrid, 100K obs) | < 100ms | 200ms | V1.0 |
| Workspace clone (CoW, 500MB repo) | < 1s | 3s | MVP |
| Workspace clone (worktree) | < 5s | 10s | MVP |
| Tool execution overhead | < 10ms | 50ms | MVP |
| Bun daemon JSON-RPC round-trip | < 5ms | 20ms | MVP |
| Command palette open | < 50ms | 100ms | MVP |
| File tree render (1000 files) | < 100ms | 200ms | MVP |
| Terminal throughput | 25MB/min | — | MVP |

## Memory Budgets

| Component | Target | Maximum |
|-----------|--------|---------|
| Rust backend (idle) | 50MB | 100MB |
| Bun daemon (idle) | 30MB | 80MB |
| Webview (empty session) | 100MB | 200MB |
| Webview (active session, 1K messages) | 200MB | 400MB |
| Per additional agent (V1.5+) | 20MB | 50MB |
| SQLite database (10K sessions) | 50MB | — |

## Startup Time

| Phase | Target | What Happens |
|-------|--------|-------------|
| Window visible | < 500ms | Tauri creates window, loads webview |
| Interactive | < 2s | React hydration, initial data load |
| Full ready | < 5s | Bun daemon started, health checks complete |

## Benchmarking Strategy

- Phase 0 spikes establish baseline measurements.
- CI tracks key metrics (startup time, IPC latency) per commit.
- Regression alerts trigger when any metric exceeds 2x the baseline.
- Performance tests use synthetic workloads (not real LLM calls).

## Optimization Priorities

1. **Perceived performance:** Show UI immediately, load data progressively.
2. **Streaming latency:** Token-to-render path is the most latency-sensitive.
3. **Memory efficiency:** Long-running sessions must not leak memory.
4. **Startup time:** Users expect desktop apps to open fast.
