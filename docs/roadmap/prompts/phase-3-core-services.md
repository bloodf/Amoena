# Phase 3: Core Services Port — Agent Prompt

## Mission

Port all Lunaria backend services from Rust to TypeScript in lunaria-service. This is the heaviest phase — 5 core services must be fully functional with unit tests.

**Duration:** 3 weeks
**Prerequisite:** Phase 2 complete (monorepo structured, DB schema in place, stubs exist)
**Deliverable:** All core services functional in lunaria-service with unit tests. Memory search, remote pairing, agent orchestration, extensions, and autopilot work from tRPC.

## Context

## Source Reference — Rust Files to Port

| Service            | Rust Source File      | Lines | Path                                        |
| ------------------ | --------------------- | ----- | ------------------------------------------- |
| Memory             | memory.rs             | 494   | apps/desktop/src-tauri/src/memory.rs        |
| Remote Access      | remote/mod.rs         | 793   | apps/desktop/src-tauri/src/remote/mod.rs    |
| Orchestration      | orchestration.rs      | 406   | apps/desktop/src-tauri/src/orchestration.rs |
| Extensions         | extensions/ (5 files) | 613   | apps/desktop/src-tauri/src/extensions/      |
| Terminal           | terminal.rs           | ~200  | apps/desktop/src-tauri/src/terminal.rs      |
| Personas           | persona.rs            | 91    | apps/desktop/src-tauri/src/persona.rs       |
| Full API reference | runtime.rs            | 4,108 | apps/desktop/src-tauri/src/runtime.rs       |

Read the Rust source files BEFORE implementing the TypeScript port. The Rust code is the specification — match its behavior exactly.

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

## Execution Rules

1. **Commit after every completed step** — never batch multiple steps into one commit
2. **Use conventional commits**: `feat(lunaria): <step description>`
3. **Run `bun run build` before each commit** — never commit broken code
4. **If a step fails, fix it before moving on** — don't skip and come back later
5. **Read files before editing them** — use the Read tool to understand existing code before making changes

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

## Troubleshooting

### Build Failures

- Run `bunx tsc --noEmit` to find TypeScript errors
- Check for imports from deleted/moved packages
- Run `bun install` to refresh dependencies

### Test Failures

- Isolate: `bun test <specific-file>`
- Read error output carefully — most failures are import/type mismatches
- Fix implementation, not tests (unless tests are wrong)

### Commit Safety

- Commit after EVERY completed step (not at the end)
- Use conventional commits: `feat(lunaria): <description>`
- Run `bun run build` before committing to avoid broken commits
- If build breaks, fix before committing — never commit broken code

### Crypto Issues

- If `libsodium-wrappers-sumo` fails to install: try `bun add libsodium-wrappers` (smaller build, may lack some sumo-only functions)
- If crypto test vectors don't match Rust output: check endianness (Rust is little-endian by default), nonce length (24 bytes for XChaCha20), and key derivation parameters
- Compare byte-by-byte in hex: `Buffer.from(result).toString('hex')` vs Rust `hex::encode()`

### Service Dependencies

- Services should be implemented in dependency order: Memory → Orchestration → Kanban → Autopilot → CLI Integration → Replay
- If circular imports appear, use dependency injection or lazy imports

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
