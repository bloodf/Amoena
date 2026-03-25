# Implementation Roadmap

## Purpose

This roadmap turns the architecture set into a phased delivery plan for Amoena as a dual-mode AI controller running inside a **Tauri 2 desktop application** — both a standalone native agent and a wrapper for existing AI coding TUIs. It is scope-bounded by architecture invariants in `docs/architecture/system-architecture.md` and by backend capability asymmetry in `docs/architecture/tui-capability-matrix.md`.

The roadmap is structured as five sequential phases with explicit dependency chains, go/no-go gates, and success criteria. Each phase builds on the stability guarantees of the previous one.

> **Osaurus-inspired additions:** Several features in V1.0–V2.0 originate from competitive analysis of the Osaurus project and similar local-first AI platforms. These items — MCP protocol support, API compatibility layer, sandbox execution, knowledge graph memory, automation primitives, voice input, cryptographic agent identity, and advanced plugin ABI — are marked with *(Osaurus-inspired)* below.

---

## Prompt Catalog

The detailed implementation prompts for each phase are maintained in [`docs/prompts/README.md`](../prompts/README.md), which contains the full execution order, dependency chains, and phase-to-prompt mapping.

---

## Phase Dependency Chain

1. Phase 0 validates feasibility of core technology choices before committing to production build-out.
2. MVP establishes the core agentic loop with Amoena Native mode only — single agent, single provider, essential workspace and memory features.
3. V1.0 layers multi-provider support, first wrapper backend, ecosystem compatibility, vector memory, basic subagent spawning, MCP protocol support, and an API compatibility layer.
4. V1.5 adds full agent orchestration (teams, mailbox), remaining wrappers, autopilot, plugin ecosystem, local model routing, sandbox execution, knowledge graph memory, and MCP client mode.
5. V2.0 delivers remote access, mobile app, visual workflows, marketplace, linked workspaces, automation primitives, voice input, cryptographic agent identity, and advanced plugin ABI.

---

## Phase 0 — Spike

**Goal:** de-risk core technology choices and prove the end-to-end streaming path from the Tauri main process through the Bun worker to the React webview.

**Estimated duration:** 2--3 weeks

**Key architecture references:**
- `docs/architecture/system-architecture.md` — Process Model, Dual IPC Strategy, Latency Budget
- `docs/architecture/agent-backend-interface.md` — Abstract Backend Interface, Native Backend
- `docs/architecture/data-model.md` — Core schema tables

### Key Deliverables

| Deliverable | Description |
|-------------|-------------|
| Tauri scaffold | Basic Tauri v2 app with webview, invoke commands, and event emission |
| Single provider auth | Anthropic API key validation and storage |
| Agentic loop spike | Basic agentic loop using Vercel AI SDK `streamText` with tool-use round-trip |
| Streaming pipeline | End-to-end token streaming from Bun worker through Tauri events to React webview |
| CoW workspace cloning | APFS clone on macOS with git worktree fallback for other platforms |

### Spike Items

| Spike | What to Prove | Go/No-Go |
|-------|---------------|----------|
| specta type generation | Rust struct to TypeScript bindings end-to-end | BLOCKER |
| SSE streaming latency | p95 < 100ms through full chain | BLOCKER if > 200ms |
| Bun daemon vs subprocess | Persistent worker overhead vs per-call spawn | Informs architecture |
| Monaco vs CodeMirror 6 | CSP compatibility in Tauri webview | Informs editor choice |
| SQLite-vec cross-platform | Extension builds on macOS, Windows, Linux | BLOCKER for vector |
| Tauri IPC vs HTTP | `invoke()` latency vs localhost HTTP | Informs IPC strategy |
| CoW clone + worktree | APFS + ext4 + NTFS validation | Informs workspace |
| xterm.js throughput | 25MB/min without frame drops | Informs terminal |

### Success Criteria

- Tauri app launches and webview renders a minimal React UI.
- A prompt sent from the React webview streams tokens back via Tauri events with visible incremental rendering.
- Vercel AI SDK `streamText` completes a tool-use round-trip (tool call -> tool result -> continuation).
- CoW clone creates an isolated workspace directory in under 1 second on APFS; git worktree fallback completes on non-APFS volumes.
- specta generates correct TypeScript bindings from Rust structs without manual intervention.
- Streaming latency is p95 < 100ms through the full chain (Bun worker -> Tauri main process -> Tauri event -> webview render).
- Bun daemon and subprocess approaches are benchmarked with a clear recommendation documented.
- Monaco and CodeMirror 6 are evaluated for CSP compatibility in the Tauri webview with a clear recommendation documented.
- SQLite-vec extension loads and runs basic vector operations on macOS, Windows, and Linux.
- Tauri IPC (`invoke()`) and localhost HTTP latency are benchmarked with a clear recommendation documented.
- CoW clone + worktree validation passes on APFS, ext4, and NTFS.
- xterm.js sustains 25MB/min throughput without frame drops.
- Error states (missing API key, provider unreachable, clone failure) are surfaced in the UI.

### Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| SSE backpressure under high token throughput | Dropped tokens or UI lag | Benchmark with sustained streaming; add flow control if needed |
| APFS clone unavailable on Linux CI | Workspace isolation path untested | Validate git worktree fallback in CI from day one |
| Vercel AI SDK Rust interop friction | Blocked agentic loop | Spike SDK integration in first week; fall back to direct HTTP if needed |
| specta generation failures for complex types | Blocked type safety across boundary | Spike in first week; evaluate ts-rs as fallback |
| SQLite-vec extension fails to build on a target platform | Blocked vector memory path | Test all three platforms in first week; document fallback to FTS5-only |
| Tauri CSP blocks editor component | Blocked editor integration | Test both Monaco and CodeMirror 6 under Tauri CSP in first week |

### Dependencies

- None (greenfield spike).

### Go / No-Go Criteria

- **Go** if all success criteria pass and no blocker is found in streaming pipeline, agentic loop, workspace cloning, specta generation, or SQLite-vec cross-platform.
- **Conditional Go** if only non-blocking issues remain with clear mitigations.
- **No-Go** if streaming cannot sustain real-time token delivery, the agentic loop cannot complete a tool-use round-trip, specta fails to generate usable bindings, or SQLite-vec cannot load on any target platform.

---

## MVP — Core Loop

**Goal:** ship a usable desktop experience with Amoena Native mode only -- single agent, single provider, essential session management.

**Estimated duration:** 6--8 weeks

**Key architecture references:**
- `docs/architecture/system-architecture.md` — Major Components, State Management, Dual IPC Strategy
- `docs/architecture/agent-backend-interface.md` — Native Backend
- `docs/architecture/data-model.md` — sessions, messages, settings, schema_migrations tables
- `docs/architecture/ui-screens.md` — Home, Session Workspace, Settings, Agent Management, Provider Setup screens

### Key Deliverables

| Deliverable | Description |
|-------------|-------------|
| Native mode | Single provider (Anthropic) with Vercel AI SDK agentic loop, tool execution, and SSE streaming |
| Session workspace UI | MessageTimeline, Composer, TerminalPanel, and simple file browser/editor |
| Basic memory system | FTS5 full-text search only (no vector) |
| Isolated workspaces | CoW clones (APFS / git worktree) per agent session |
| Basic permission model | Allow/deny per tool with UI prompt for unknown tools |
| JSONL transcript persistence | Session transcripts saved as JSONL files alongside SQLite metadata |
| Token monitoring dashboard | Real-time token usage and cost tracking per session |
| MCP server management | Configure and manage MCP servers from the UI |
| Config management with profiles | Named configuration profiles for different workflows |

**Explicitly excluded from MVP:** wrapper mode, reasoning UX, Claude Code integration, multi-agent, subagents.

**External tool integration (MVP):**
- Design quality audit gate: all screens must pass a 7-domain design quality audit (typography, color, spatial, motion, interaction, responsive, UX writing) before MVP ship. Audit framework inspired by [impeccable](https://github.com/impeccable-ai/impeccable).

### Success Criteria

- User can create a session in native mode, send a prompt, stream a response with tool use, and resume later.
- Session list shows all sessions with metadata; delete operations are reflected in SQLite and JSONL.
- Memory observations are stored and retrievable via FTS5 search within sessions.
- Each agent session operates in an isolated workspace directory.
- Permission prompts appear for tool calls; allow/deny decisions persist for the session.
- Token usage is visible per-session and aggregated.
- MCP servers can be added, configured, and toggled.
- JSONL transcripts are written on each message and can be replayed for session reconstruction.
- Config profiles can be created, switched, and persisted.

### Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| FTS5 search quality insufficient for memory recall | Poor context injection | Accept FTS5 for MVP; vector search planned for V1.0 |
| JSONL file growth on long sessions | Disk usage and replay performance | Implement rotation/compaction before V1.0; monitor file sizes in MVP |
| CoW clone race conditions with concurrent agents | Workspace corruption | Serialize clone operations per project directory in MVP |
| Single-provider dependency on Anthropic API stability | Service disruption blocks all usage | Implement graceful error handling and retry; multi-provider in V1.0 |
| Tauri event throughput under sustained streaming | Dropped events or UI lag | Benchmark in Phase 0; implement event batching if needed |

### Dependencies

- Requires successful Phase 0 Go decision.
- V1.0 cannot start until MVP event contracts and DB schema are stable.

---

## V1.0 — Core Ecosystem

**Goal:** expand to multi-provider, first wrapper backend, ecosystem compatibility, vector memory, basic subagent spawning, MCP server mode, and API compatibility layer.

**Estimated duration:** 8--10 weeks

**Key architecture references:**
- `docs/architecture/agent-backend-interface.md` — Native Backend, Claude Code Backend, Dual-Mode Architecture
- `docs/architecture/tui-capability-matrix.md` — Claude Code entry, Integration Mode Classification
- `docs/architecture/plugin-framework.md` — Plugin Manifest, Lifecycle Hooks, Permission System
- `docs/architecture/setup-wizard.md` — Wizard State Machine, Detection, Auth steps
- `docs/architecture/data-model.md` — Full schema including memory tables
- `docs/architecture/mcp-protocol.md` — MCP Server Mode (stdio + SSE)
- `docs/architecture/api-compatibility.md` — OpenAI/Anthropic/Ollama API Compatibility Layer

### Key Deliverables

| Deliverable | Description |
|-------------|-------------|
| Multi-provider auth | Anthropic + OpenAI + Google with OAuth + API keys |
| First wrapper backend | Claude Code via `--sdk-url` bidirectional integration |
| Ecosystem compat layer | `.claude/`, `CLAUDE.md` directory reading and import |
| Vector memory | SQLite-vec embeddings with hybrid ranking (FTS5 + vector) and progressive disclosure |
| Hook engine | Basic lifecycle hooks (Claude-compatible) |
| Subagent spawning | Depth-2 subagent support for native mode |
| Setup wizard | First-run detection, installation, auth, and default selection |
| MCP protocol support *(Osaurus-inspired)* | MCP server mode (stdio + SSE transports) enabling ecosystem integration with Cursor, Claude Desktop, and VS Code. See [`docs/architecture/mcp-protocol.md`](mcp-protocol.md) |
| API compatibility layer *(Osaurus-inspired)* | Drop-in OpenAI, Anthropic, and Ollama-compatible HTTP endpoints making Amoena a local AI gateway. See [`docs/architecture/api-compatibility.md`](api-compatibility.md) |
| Agent persona library *(agency-agents inspired)* | 130+ bundled agent personas organized by division (engineering, design, QA, product, security, devops, AI) with visual identity fields (color, emoji, vibe) |
| L0/L1/L2 memory tiers *(OpenViking inspired)* | Three-tier progressive context loading with precomputed summaries, intent-scoped retrieval, and 6-category observation taxonomy |
| Extended agent state machine *(MiroFish inspired)* | 10-state agent lifecycle (`created → preparing → active → running ⇄ paused → stopped → completed → failed`) with collaboration metadata |
| Session compression categories | Six-category extraction taxonomy (profile, preference, entity, pattern, tool_usage, skill) for structured memory classification |

### Success Criteria

- Users can authenticate with Anthropic, OpenAI, and Google and switch between them mid-session.
- Claude Code wrapper sessions stream responses via `--sdk-url` with graceful degradation to headless `-p` mode.
- Projects with existing `.claude/` directories are detected and their configuration is imported.
- Memory system returns relevant context via vector similarity search with measurable recall improvement over FTS5.
- Hooks fire on documented lifecycle events; custom handlers execute within timeout bounds.
- Subagent trees execute at depth 2 with parent permission inheritance enforced.
- Setup wizard can onboard a new machine to first session without manual config editing.
- MCP server mode accepts connections over stdio and SSE; Cursor and Claude Desktop can discover and invoke Amoena-exposed tools.
- API compatibility endpoints pass provider-specific test suites (OpenAI chat completions, Anthropic messages, Ollama generate).

### Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| SQLite-vec compatibility across platforms | Vector search unavailable on some targets | Bundle pre-built extensions; fall back to FTS5 if load fails |
| Claude Code `--sdk-url` instability | Wrapper mode breaks on Claude Code updates | Pin tested Claude Code version; implement graceful degradation to headless `-p` mode |
| OAuth token refresh race conditions | Auth failures mid-session | Implement token refresh mutex with retry; surface re-auth prompt |
| Hook handler timeout/crash cascades | Session hangs or crashes | Enforce per-handler timeout with kill; isolate handler processes |
| Embedding model latency for vector indexing | Slow observation storage | Batch embedding calls; index asynchronously after storage |

### Dependencies

- Requires stable MVP event contracts and DB schema.
- SQLite-vec extension must be validated on all target platforms (spike in Phase 0).
- Ecosystem compat layer requires analysis of Claude Code config file format stability.

---

## V1.5 — Extensibility

**Goal:** full agent orchestration, remaining wrappers, autopilot, plugin ecosystem, local model routing, sandbox execution, knowledge graph memory, and MCP client mode.

**Estimated duration:** 8--10 weeks

**Key architecture references:**
- `docs/architecture/agent-backend-interface.md` — All backend implementations
- `docs/architecture/tui-capability-matrix.md` — All TUI entries
- `docs/architecture/plugin-framework.md` — Plugin Manifest, Marketplace Integration
- `docs/architecture/multi-agent-runtime.md` — Subagents, Teams, Mailbox, GUI Visibility
- `docs/architecture/sandbox-execution.md` — Docker/OCI Isolated Execution Environments
- `docs/architecture/memory-system.md` — Knowledge Graph Memory Layer
- `docs/architecture/mcp-protocol.md` — MCP Client Mode

### Key Deliverables

| Deliverable | Description |
|-------------|-------------|
| Remaining wrapper backends | OpenCode; evaluate Codex CLI and Gemini CLI |
| Full agent orchestration | Teams, mailbox messaging, task lists |
| Autopilot | Goal decomposition into stories with autonomous execution |
| Plugin ecosystem | Auto-discovery, per-plugin enable/disable, priority ordering |
| Tab-switchable agents | Aggregate agent profiles, Tab/Shift+Tab cycling |
| Local model routing | Ollama auto-detection, model routing for lightweight system tasks |
| Multi-model opinions | Committee queries across providers |
| Sandbox execution *(Osaurus-inspired)* | Docker/OCI-based isolated execution environments for agent-generated code with resource limits and network policies. See [`docs/architecture/sandbox-execution.md`](sandbox-execution.md) |
| Knowledge graph memory *(Osaurus-inspired)* | 4th memory layer with entity extraction, relationship tracking, and contradiction detection on top of existing FTS5 + vector store. See [`docs/architecture/memory-system.md`](memory-system.md) (Knowledge Graph section) |
| MCP client mode *(Osaurus-inspired)* | Aggregate and invoke tools from external MCP servers, enabling Amoena as an MCP tool hub. See [`docs/architecture/mcp-protocol.md`](mcp-protocol.md) |
| Multi-format persona export *(agency-agents inspired)* | Export Amoena agent profiles to Claude Code, Cursor, Aider, Windsurf, Gemini CLI, and OpenCode formats — define once, use everywhere |
| Design steering agent *(impeccable inspired)* | Bundled "Design Auditor" agent with 18 steering skills (`/audit`, `/animate`, `/bolder`, `/clarify`, `/colorize`, `/critique`, `/delight`, `/distill`, `/extract`, `/harden`, `/normalize`, `/onboard`, `/optimize`, `/polish`, `/quieter`, `/adapt`) |
| LLM memory deduplication *(OpenViking inspired)* | Semantic dedup using LLM comparison when embedding similarity > 0.90, with merge/distinct resolution |
| MCP tool-to-skill converter *(OpenViking inspired)* | Pipeline that converts MCP tool definitions into reusable agent skills with pre/post-conditions and usage examples |
| Team personality profiles *(MiroFish inspired)* | Collaboration metadata (`collaborationStyle`, `communicationPreference`, `decisionWeight`) for weighted team consensus and role-based delegation |

### Success Criteria

- OpenCode wrapper sessions run via supported integration mode with graceful degradation.
- Codex CLI and Gemini CLI feasibility is evaluated with a documented recommendation.
- Subagent trees execute with mailbox messaging and task lifecycle tracking.
- Autopilot decomposes a goal into stories and executes them with human checkpoint approval.
- Plugins from multiple ecosystems can be discovered, installed, and run simultaneously.
- Tab switching between agent profiles works with Tab/Shift+Tab and shows agents from all enabled sources.
- Local models (e.g., Qwen via Ollama) handle lightweight system tasks with measurable latency improvement over cloud models.
- The desktop GUI shows live subagent status, task ownership, mailbox traffic, and current tool activity without collapsing them into a single summary badge.
- Agent-generated code executes inside sandboxed Docker/OCI containers with enforced resource limits; escape attempts are logged and blocked.
- Knowledge graph memory extracts entities and relationships from conversation context; contradiction detection flags conflicting facts before context injection.
- MCP client mode discovers and connects to external MCP servers; tools from multiple servers appear in the unified tool palette.

### Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Codex CLI Rust rewrite changes API surface | Codex backend breaks or is infeasible | Abstract behind backend interface; defer Codex backend if API unstable |
| Autopilot producing unsafe tool sequences | Unintended file modifications | Require human approval at story boundaries; sandbox tool execution |
| Plugin conflict resolution complexity | Inconsistent behavior with multiple plugins | Implement priority ordering and explicit conflict resolution rules |
| Local model quality insufficient for system tasks | Poor title/compaction/observation quality | Benchmark against cloud models; allow per-task model override |
| Mailbox message ordering under concurrent agents | Lost or misordered inter-agent messages | Implement sequence numbers with gap detection; log all mailbox traffic |

### Dependencies

- Requires V1.0 stability: hooks engine, permission model, and memory system must be production-ready.
- Local model integration requires Ollama/llama.cpp API stability testing across platforms.
- Plugin ecosystem requires hook engine and permission model from V1.0 to be stable.

---

## V2.0 — Remote + Marketplace

**Goal:** E2E encrypted remote access, mobile app, visual workflows, marketplace, linked workspaces, automation primitives, voice input, cryptographic agent identity, and advanced plugin ABI.

**Estimated duration:** 8--12 weeks

**Key architecture references:**
- `docs/architecture/remote-control-protocol.md` — Remote Control Protocol, mDNS, PIN + JWT auth
- `docs/architecture/marketplace-discovery.md` — Registry Sources, Search Engine, Caching Strategy
- `docs/architecture/plugin-framework.md` — Marketplace Integration
- `docs/architecture/system-architecture.md` — Axum Remote Coordination Layer, Bidirectional Communication Channels
- `docs/architecture/automation.md` — Schedules and Filesystem Watchers
- `docs/architecture/voice-input.md` — On-device Whisper.cpp Transcription
- `docs/architecture/agent-identity.md` — Cryptographic Agent Identity, Chain of Trust
- `docs/architecture/plugin-framework.md` — Advanced Plugin ABI v2

### Key Deliverables

| Deliverable | Description |
|-------------|-------------|
| Remote access | LAN pairing first, then E2E encrypted relay |
| Mobile app | React Native + NativeWind (separate ui-native package) |
| Visual workflows | Preview browser with element selection and screenshot-driven tool use |
| Marketplace | Plugin, theme, agent profile, and MCP server discovery |
| Linked workspaces | Workspace groups with shared context |
| Documentation platform | Static docs site |
| Automation: schedules & watchers *(Osaurus-inspired)* | Cron-like recurring tasks and filesystem event triggers for autonomous agent invocation. See [`docs/architecture/automation.md`](automation.md) |
| Voice input *(Osaurus-inspired)* | On-device Whisper.cpp transcription with push-to-talk and voice-activity-detection modes. See [`docs/architecture/voice-input.md`](voice-input.md) |
| Cryptographic agent identity *(Osaurus-inspired)* | Ed25519 key pairs per agent, chain-of-trust verification, and scoped access tokens for inter-agent and remote auth. See [`docs/architecture/agent-identity.md`](agent-identity.md) |
| Advanced plugin ABI *(Osaurus-inspired)* | v2-style host API surface including HTTP route registration, SQLite access, and inference dispatch. See [`docs/architecture/plugin-framework.md`](plugin-framework.md) |

### Success Criteria

- Paired device can connect directly over LAN, authenticate with QR/PIN, and control session lifecycle.
- Paired device can connect via relay with E2E encryption when LAN is unavailable.
- React Native mobile app provides session monitoring, permission handling, and terminal access.
- Preview browser captures screenshots and enables element selection as tool input.
- Linked workspaces share memory and context injection without reintroducing multi-repo architecture.
- Marketplace shows installable resources from aggregated registries with search, quality scoring, and install flow.
- Axum remote coordination layer activates on demand and proxies all remote requests to the Tauri main process core managers.
- Mobile clients receive the same event types as desktop via SSE with E2E encryption.
- Cron-scheduled tasks execute on time within ±5s accuracy; filesystem watchers trigger agent sessions on matching file events.
- Voice input transcribes spoken prompts on-device with Whisper.cpp; push-to-talk and VAD modes both produce usable session input.
- Each agent holds a unique Ed25519 identity; scoped access tokens limit tool and resource access per identity.
- Advanced plugin ABI v2 plugins can register HTTP routes, access SQLite, and dispatch inference requests through the host API.

### Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Relay server operational cost | Ongoing infrastructure expense | Design for self-hosting; offer hosted relay as optional paid service |
| E2E encryption key management complexity | Security vulnerabilities or usability friction | Use established protocol (Noise or similar); audit before launch |
| Linked-workspace context explosion | Memory/performance degradation | Limit linked workspace groups; implement context budget per workspace |
| Marketplace supply-chain attacks | Malicious plugins distributed | Automated scanning, sandboxed execution, and review queue |
| React Native platform limitations | Missing native capabilities on mobile | Evaluate React Native ecosystem early; document known gaps |
| Axum server resource consumption when idle | Unnecessary memory/CPU usage | Lazy-start Axum only when remote access is enabled; shut down when last remote client disconnects |

### Dependencies

- Requires V1.5 stability: full agent orchestration, plugin ecosystem, and permission model must be production-ready.
- Relay server requires infrastructure provisioning and security audit.
- Marketplace requires plugin framework to be production-ready.
- Mobile app uses separate ui-native package mirroring packages/ui patterns; requires design token sync testing.

---

## Cross-Phase Risk Focus Matrix

| Phase | Highest Attention Risks | Why |
|-------|------------------------|-----|
| Phase 0 | Streaming pipeline, specta generation, SQLite-vec cross-platform, CoW cloning, Tauri IPC latency | Feasibility depends on core streaming, type safety, vector capability, and workspace isolation |
| MVP | Provider stability, FTS5 limits, JSONL growth, single-provider dependency, Tauri event throughput | Core loop depends on reliable streaming, persistence, and Anthropic API availability |
| V1.0 | SQLite-vec compat, Claude Code `--sdk-url` stability, OAuth refresh, hook isolation, embedding latency, MCP server transport reliability, API compat surface coverage | Multi-provider, wrapper mode, extension points, MCP server, and API gateway introduce integration complexity |
| V1.5 | API churn (Codex), autopilot safety, plugin conflicts, local model quality, mailbox ordering, sandbox container escape, knowledge graph entity accuracy, MCP client discovery | Full breadth introduces orchestration, automation, ecosystem, sandbox, and memory complexity |
| V2.0 | Relay cost, E2E key mgmt, context explosion, supply-chain, React Native limitations, Axum lifecycle, cron scheduling drift, Whisper.cpp model size, Ed25519 key rotation, plugin ABI backward compat | Remote access, marketplace, mobile, automation, voice, identity, and plugin ABI add operational, security, and platform risk |

---

## Exit Criteria for This Roadmap

- Every phase has explicit goals, key deliverables, success criteria, risks, and dependencies.
- MVP scope is clearly bounded to Amoena Native mode only with single-agent sessions.
- Phase 0 validates the streaming pipeline, type generation, and critical technology choices before committing to MVP.
- Phase sequencing preserves desktop authority and the Dual IPC architecture invariant (Tauri `invoke` for local, Axum for remote only).
- V1.0 introduces multi-provider and the first wrapper backend after MVP stability.
- V1.5 extensibility features depend on V1.0 platform stability.
- V2.0 remote and marketplace features depend on V1.5 orchestration stability.
- The Axum HTTP server is not activated until V2.0 remote access; all prior phases use Tauri native IPC exclusively.
