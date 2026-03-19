# Phase 3: Core Services Port — Agent Prompt

## Mission

Port all Lunaria backend services from Rust to TypeScript in lunaria-service. This is the heaviest phase — 5 core services must be fully functional with unit tests.

**Duration:** 3 weeks
**Prerequisite:** Phase 2 complete (monorepo structured, DB schema in place, stubs exist)
**Deliverable:** All core services functional in lunaria-service with unit tests. Memory search, remote pairing, agent orchestration, extensions, and autopilot work from tRPC.

## Context

### Source Code (Rust → TypeScript)

- `memory.rs` (494 lines) → `packages/lunaria-service/src/memory/`
- `remote/mod.rs` (793 lines) → `packages/lunaria-service/src/remote-access/`
- `orchestration.rs` (406 lines) → `packages/lunaria-service/src/orchestration/`
- `extensions/format.rs` → `packages/lunaria-service/src/extensions/`
- Autopilot (new, no Rust equivalent) → `packages/lunaria-service/src/autopilot/`

### Architecture Decisions

- lunaria-service runs as separate daemon process, communicates with host-service via WebSocket for terminal observation
- Single SQLite database (same file as local-db)
- Cross-language crypto test vectors (Rust fixtures → TypeScript must match) for Remote Access
- Mastra stays for chat, Lunaria orchestration handles multi-agent/consensus
- Eager load all services at startup
- Memory: FTS5 + cosine similarity + RRF fusion, cross-workspace queries with global tier
- Crypto: libsodium-wrappers-sumo for X25519 ECDH + XChaCha20-Poly1305
- JWT: jose library for HS256
- Consensus edge case: handle all-abstain (return Inconclusive, don't divide by zero)
- Autopilot: add timeout watchdog (10min default per phase)
- Remote relay: add heartbeat/ping, cleanup orphaned rooms

### Libraries to Use

- better-sqlite3 + Drizzle ORM (database)
- libsodium-wrappers-sumo (crypto)
- jose (JWT)
- ws (WebSocket relay)
- qrcode (QR generation)
- Node.js native crypto (SHA-256)

## Services to Implement

### Week 3: Memory Service + Remote Access

1. **Memory Service** — store, search (hybrid FTS5+cosine+RRF), tier management, deduplication (SHA-256 exact + Jaccard near-duplicate), graph data generation, cross-workspace queries
2. **Remote Access Service** — LAN discovery, PIN/QR pairing, X25519 ECDH key exchange, XChaCha20-Poly1305 AEAD, JWT rotation with reuse detection, WebSocket relay with E2E encryption, device manager with revocation, heartbeat/disconnect handling

### Week 4: Orchestration + Extensions

3. **Orchestration Service** — Agent spawning with lifecycle, permission ceiling enforcement (ReadOnly < ReadWrite < ShellAccess < Admin), tool registry + intersection, tool executor with approval flow, weighted consensus voting (handle zero-weight edge case), AI worker bridge via child process JSON-RPC
4. **Extension System** — .luna binary format parser (Buffer API: magic bytes "LUNA", version u16 LE, manifest length u32 LE, JSON manifest, asset blob), extension lifecycle (install/enable/disable/uninstall), permission-scoped sandbox

### Week 5: Autopilot + Kanban + Remaining

5. **Autopilot Engine** — 6-phase pipeline (Analyze→Plan→Implement→Test→Review→Finalize), phase runner with sequential execution, timeout watchdog (Promise.race), rollback on failure, 6 built-in workflow templates
6. **Kanban Service** — Board/column/task CRUD, agent-facing claim API (atomic SQL), status transition validation
7. **CLI Integration** — Output parsers for Claude Code, Codex CLI, Gemini CLI, structured event extraction into Memory + Kanban, WebSocket subscription to host-service terminal output
8. **Session Replay** — Recording engine (capture terminal output + tool calls + file changes), file-based storage (gzip compressed, 100MB cap), metadata in SQLite
9. **Opinions Service** — Persona CRUD, system prompt templates, model/temperature preferences
10. **Diagnostics** — Service health checks, structured JSON logging to ~/.lunaria/logs/

## Testing Requirements

- Unit tests for every service (Vitest)
- Cross-language crypto test vectors (generate fixtures from Rust before deleting)
- Concurrent task claim test (Promise.all with multiple agents)
- FTS5 special character sanitization tests
- Target: 80%+ coverage

## Acceptance Criteria

- [ ] All 10 services implemented and functional
- [ ] Memory hybrid search returns ranked results
- [ ] Remote Access pairing completes successfully
- [ ] Agent spawning respects permission ceiling
- [ ] .luna binary files parse correctly
- [ ] Autopilot runs through all 6 phases
- [ ] Kanban atomic task claim works under concurrency
- [ ] CLI parser extracts events from Claude Code output
- [ ] Session recordings save/load correctly
- [ ] Cross-language crypto test vectors pass
- [ ] All unit tests pass (80%+ coverage)
- [ ] lunaria-service starts and responds to health checks
