# Agentic Execution Playbook

How to build Amoena using AI agents at maximum parallelism. This document maps every implementation prompt to the best AI tool, execution order, and parallel batches.

## AI Toolchain

| Tool | Strengths | Use For |
|------|-----------|---------|
| **Claude Code (Opus) + OMC** | Deep reasoning, multi-file context, custom agents | Complex architecture work, cross-language bridges, agent loops |
| **Claude Code (Sonnet) + OMC** | Fast, accurate, good multi-file | Well-defined backend/frontend prompts, moderate complexity |
| **Codex App** | Sandboxed parallel agents, reads AGENTS.md | Isolated tasks, spikes, tests, docs — runs many in parallel |
| **Gemini CLI** | Second opinion, alternative approaches | Verification, security audit, architecture review between phases |

### Custom Agents (`.claude/agents/`)

| Agent | Assigned To |
|-------|------------|
| `tauri-backend` | All Rust/Tauri prompts (01-xx, 02-xx, 03-xx, 04-xx, 05-xx, 06-xx) |
| `react-ui` | All React/UI prompts (07-xx) |
| `spike-runner` | Phase 0 validation (00-01) |
| `test-engineer` | Test coverage prompts (07-13) and phase gate testing |
| `security-auditor` | Security review between phases |
| `prompt-runner` | Any prompt execution via Claude Code |

### OMC Agents

| Agent | When To Use |
|-------|------------|
| `executor` | Standard prompt implementation |
| `deep-executor` | Complex prompts (02-03, 03-02, 07-02) |
| `architect` | Pre-phase architecture review |
| `designer` | UI/UX design track (09-xx) |
| `code-reviewer` | Post-prompt code review |
| `security-reviewer` | Phase gate security audit |
| `test-engineer` | Test strategy per prompt |
| `build-fixer` | CI failures during implementation |

### MCP Servers

| Server | Required For |
|--------|-------------|
| **Context7** | Every prompt — live docs for Tauri 2, React 19, Vercel AI SDK |
| **Svelte** | Not needed (React project) |
| **GitHub** | PR creation, issue tracking |
| **Playwright** | UI verification (07-xx prompts) |
| **Serena** | Symbolic code navigation for large refactors |
| **Sequential Thinking** | Architecture decisions in complex prompts |

### Skills

| Skill | Required For |
|-------|-------------|
| `brainstorming` | Before each prompt to validate approach |
| `test-driven-development` | Every implementation prompt |
| `systematic-debugging` | When spikes fail or tests break |
| `oh-my-claudecode:ultrawork` | Parallel batch execution |
| `oh-my-claudecode:team` | Multi-agent prompt execution |
| `oh-my-claudecode:code-review` | Post-prompt review |
| `oh-my-claudecode:security-review` | Phase gate audits |

---

## Execution Tracks

Four independent tracks run simultaneously throughout the project:

```
BACKEND TRACK ──────────────────────────────────────────────────────────►
  01-01 → 01-02 → 01-03 → 01-04 → {02-01 ∥ 03-01} → 02-02 → 02-03 ...

FRONTEND TRACK ─────────────────────────────────────────────────────────►
  07-08 (immediate) ──────────► 07-01 (after 01-04) → {07-02 ∥ 07-03} ...

DESIGN TRACK ───────────────────────────────────────────────────────────►
  09-01, 09-03, 09-04 (immediate, no code deps)

DOCS TRACK ─────────────────────────────────────────────────────────────►
  08-01 → 08-02 → 08-03 (can start anytime)
```

---

## Phase 0 — Spike (All 8 in Parallel)

**Duration target:** 2–3 weeks
**Strategy:** Launch 8 Codex App agents simultaneously, one per spike.

| Spike | Agent | Tool | Notes |
|-------|-------|------|-------|
| specta type generation | spike-runner | Codex App | BLOCKER — must pass before MVP |
| SSE streaming latency | spike-runner | Codex App | BLOCKER if > 200ms |
| Bun daemon vs subprocess | spike-runner | Codex App | Informs architecture |
| Monaco vs CodeMirror 6 | spike-runner | Codex App | Test in Tauri webview CSP |
| SQLite-vec cross-platform | spike-runner | Codex App | BLOCKER for vector memory |
| Tauri IPC vs HTTP latency | spike-runner | Codex App | Informs IPC strategy |
| CoW clone + worktree | spike-runner | Codex App | Test APFS + ext4 + NTFS |
| xterm.js throughput | spike-runner | Codex App | 25MB/min target |

**Gate:** All BLOCKERs must pass. Review with `gemini-cli` for second opinion on results.

```bash
# Launch all 8 spikes in parallel via Codex App
codex --task "Execute spike: specta type generation. See docs/prompts/00-spike/01-phase-zero-validation.md spike #1" &
codex --task "Execute spike: SSE streaming latency. See docs/prompts/00-spike/01-phase-zero-validation.md spike #2" &
codex --task "Execute spike: Bun daemon vs subprocess. See docs/prompts/00-spike/01-phase-zero-validation.md spike #3" &
codex --task "Execute spike: Monaco vs CodeMirror 6. See docs/prompts/00-spike/01-phase-zero-validation.md spike #4" &
codex --task "Execute spike: SQLite-vec cross-platform. See docs/prompts/00-spike/01-phase-zero-validation.md spike #5" &
codex --task "Execute spike: Tauri IPC vs HTTP. See docs/prompts/00-spike/01-phase-zero-validation.md spike #6" &
codex --task "Execute spike: CoW clone + worktree. See docs/prompts/00-spike/01-phase-zero-validation.md spike #7" &
codex --task "Execute spike: xterm.js throughput. See docs/prompts/00-spike/01-phase-zero-validation.md spike #8" &
```

---

## MVP — Core Loop

**Duration target:** 6–8 weeks
**Strategy:** Backend track is the critical path. Frontend and design tracks run in parallel.

### Dependency Graph

```
                    ┌─────────┐
                    │  01-01  │ Runtime Bootstrap
                    └────┬────┘
                         │
                    ┌────▼────┐
                    │  01-02  │ SQLite Migrations
                    └────┬────┘
                         │
                    ┌────▼────┐
                    │  01-03  │ Settings, Config, Keychain
                    └────┬────┘
                         │
                    ┌────▼────┐
                    │  01-04  │ REST, SSE, Transcripts
                    └────┬────┘
                    ┌────┴────┐
               ┌────▼────┐ ┌─▼──────┐
               │  02-01  │ │ 03-01  │  ◄── PARALLEL
               │Provider │ │ Tools  │
               └────┬────┘ └───┬────┘
                    │          │
               ┌────▼────┐    │
               │  02-02  │    │
               │Bun Worker│   │
               └────┬────┘    │
                    └────┬────┘
                    ┌────▼────┐
                    │  02-03  │ Native Agent Loop
                    └────┬────┘
                    ┌────┴────┐
               ┌────▼────┐ ┌─▼──────┐
               │  04-01  │ │ 05-01  │  ◄── PARALLEL
               │Memory   │ │Workspace│
               └─────────┘ └───┬────┘
                               │
                          ┌────▼────┐
                          │  05-02  │ Merge Review
                          └─────────┘

  FRONTEND (parallel track):
  07-08 ─────────────────► 07-01 ──┬──► 07-02 ──► 07-05
  (immediate)          (after 01-04)├──► 07-03 ──┘
                                    │
  DESIGN (parallel track):          │
  09-01, 09-03, 09-04 ─────────────┘ (feed into 07-xx)
```

### Wave Execution

#### Wave 0 — Immediate (no dependencies)

| # | Prompt | Tool | Agent | Track |
|---|--------|------|-------|-------|
| 07-08 | UI Package Foundation & Storybook | Claude Code (Sonnet) | react-ui | Frontend |
| 09-01 | Master UI/UX Handoff | Claude Code + OMC designer | designer | Design |
| 09-03 | UX Pilot | Codex App | — | Design |
| 09-04 | Pencil | Codex App | — | Design |

**Parallelism: 4 agents simultaneously**

#### Wave 1 — Foundation Start

| # | Prompt | Tool | Agent | Deps |
|---|--------|------|-------|------|
| 01-01 | Runtime Bootstrap | Claude Code (Opus) | tauri-backend | none |

**Why Opus:** Sets up the entire Tauri 2 app scaffold. Needs deep understanding of Tauri plugin system, Rust module organization, and the dual IPC architecture. Most consequential prompt — every other backend prompt builds on this.

**Skills:** `brainstorming` → `test-driven-development`, Tauri v2 skills, Rust skills

#### Wave 2 — Database Layer

| # | Prompt | Tool | Agent | Deps |
|---|--------|------|-------|------|
| 01-02 | SQLite Migrations & Repositories | Claude Code (Sonnet) | tauri-backend | 01-01 |

**Skills:** `test-driven-development`, Rust skills

#### Wave 3 — Config Layer

| # | Prompt | Tool | Agent | Deps |
|---|--------|------|-------|------|
| 01-03 | Settings, Config, & Keychain | Claude Code (Sonnet) | tauri-backend | 01-01, 01-02 |

**Skills:** `test-driven-development`, Trail of Bits security skills (keychain)

#### Wave 4 — Communication Layer

| # | Prompt | Tool | Agent | Deps |
|---|--------|------|-------|------|
| 01-04 | REST, SSE, & Transcripts | Claude Code (Opus) | tauri-backend | 01-01, 01-02, 01-03 |

**Why Opus:** Complex SSE streaming pipeline, bidirectional channels, JSONL serialization. The streaming architecture is one of Amoena's most critical paths.

**Skills:** `brainstorming`, `test-driven-development`

#### Wave 5 — AI Core + Permissions (PARALLEL)

| # | Prompt | Tool | Agent | Deps |
|---|--------|------|-------|------|
| 02-01 | Provider Registry & Auth | Claude Code (Sonnet) | tauri-backend | 01-02, 01-03, 01-04 |
| 03-01 | Tools & Permissions | Codex App | — | 01-02, 01-03, 01-04 |

**Parallelism: 2 agents simultaneously.** These touch different modules (provider vs permission system) with no file conflicts.

**02-01 Skills:** `test-driven-development`
**03-01 Skills:** Trail of Bits security skills (permission model)

#### Wave 6 — Bun Bridge

| # | Prompt | Tool | Agent | Deps |
|---|--------|------|-------|------|
| 02-02 | Bun AI Worker Bridge | Claude Code (Opus) | tauri-backend | 02-01 |

**Why Opus:** Cross-language bridge (Rust ↔ Bun via JSON-RPC over Unix socket). Persistent daemon lifecycle, watchdog restart, graceful shutdown. Needs Vercel AI SDK expertise.

**Skills:** `brainstorming`, `test-driven-development`, Context7 MCP (Vercel AI SDK docs)

#### Wave 7 — The Agent Loop

| # | Prompt | Tool | Agent | Deps |
|---|--------|------|-------|------|
| 02-03 | Native Agent Loop | Claude Code (Opus) + OMC deep-executor | tauri-backend | 01-04, 02-02, 03-01 |

**Why Opus + deep-executor:** The most complex MVP prompt. Full agentic loop with tool-use round-trips, streaming, permission gates, context management. This is the heart of Amoena.

**Skills:** `brainstorming` → `test-driven-development`, Sequential Thinking MCP, Context7 MCP

#### Wave 8 — Memory + Workspace (PARALLEL)

| # | Prompt | Tool | Agent | Deps |
|---|--------|------|-------|------|
| 04-01 | Claude-mem Parity Core | Codex App | — | 01-02, 02-03 |
| 05-01 | Workspace Lifecycle | Claude Code (Sonnet) | tauri-backend | 01-02 |

**Parallelism: 2 agents simultaneously.** Memory and workspace are independent subsystems.

**Note:** 05-01 formally depends on 03-02 (subagents), but for MVP scope it only needs basic workspace isolation. Stub the subagent integration point.

#### Wave 9 — Merge Safety

| # | Prompt | Tool | Agent | Deps |
|---|--------|------|-------|------|
| 05-02 | Merge Review & Recovery | Codex App | — | 05-01 |

#### Wave 10 — Desktop Shell (starts after Wave 4)

This runs on the **frontend track**, parallel with backend Waves 5–9.

| # | Prompt | Tool | Agent | Deps |
|---|--------|------|-------|------|
| 07-01 | Desktop Shell & Navigation | Claude Code (Sonnet) + OMC designer | react-ui | 01-04 |

**Skills:** `brainstorming`, `frontend-design`, shadcn/ui skills, Playwright MCP

**Can start as soon as Wave 4 (01-04) ships.** While the backend team works on Waves 5–9, the frontend team builds the shell.

#### Wave 11 — Session + Settings (PARALLEL, after Wave 10 + backend ready)

| # | Prompt | Tool | Agent | Deps |
|---|--------|------|-------|------|
| 07-02 | Session Workspace Core | Claude Code (Opus) + OMC deep-executor | react-ui | 07-01 + backend stubs |
| 07-03 | Settings, Provider, Plugin Surfaces | Codex App | — | 07-01 |

**Parallelism: 2 agents simultaneously.** 07-02 and 07-03 both depend on 07-01 but touch different screen areas.

**07-02 Why Opus:** Most complex UI prompt — message timeline, composer, file editor, terminal, agent visibility. The primary user-facing screen.

**Note:** 07-02 formally depends on 03-02, 02-06, 04-02 (V1.0+). For MVP, stub these integration points and implement the UI shell with mock data.

#### Wave 12 — Storybook Verification

| # | Prompt | Tool | Agent | Deps |
|---|--------|------|-------|------|
| 07-05 | Storybook & UI Verification | Codex App | — | 07-01, 07-02, 07-03 |

### MVP Phase Gate

Before starting V1.0, run these verification agents:

| Check | Tool | Agent |
|-------|------|-------|
| Security audit | Claude Code | security-auditor + `oh-my-claudecode:security-review` |
| Architecture review | Gemini CLI | Second opinion on architecture decisions |
| Test coverage | Claude Code | test-engineer + `oh-my-claudecode:ultraqa` |
| Storybook visual review | Claude Code | OMC designer + Playwright MCP |

---

## V1.0 — Core Ecosystem

**Duration target:** 8–10 weeks

### Dependency Graph

```
  02-03 (MVP) ─────┬──► 02-04 Wrapper Framework ──► (V1.5: 02-05)
  03-01 (MVP) ─────┘         │
                              │
  03-01 + 02-03 ──► 03-02 Subagents ──► 03-03 Hook Engine
                              │
  04-01 + 02-02 + 02-03 ──► 04-02 Hybrid Retrieval
                              │
  04-01 ──────────────────► 04-03 Claude-mem Sync
```

### Wave Execution

#### Wave V1-1 (PARALLEL — 3 agents)

| # | Prompt | Tool | Agent | Deps |
|---|--------|------|-------|------|
| 02-04 | Wrapper Adapter Framework & Claude | Claude Code (Opus) | tauri-backend | 01-04, 03-01 |
| 04-02 | Hybrid Retrieval & Injection | Claude Code (Sonnet) | tauri-backend | 04-01, 02-02, 02-03 |
| 04-03 | Claude-mem Upstream Sync | Codex App | — | 04-01 |

**Parallelism: 3 agents.** Wrapper adapters, memory retrieval, and upstream sync are independent subsystems.

**02-04 Why Opus:** Claude Code integration via `--sdk-url`, adapter abstraction layer, process lifecycle management. Cross-process communication design.

#### Wave V1-2

| # | Prompt | Tool | Agent | Deps |
|---|--------|------|-------|------|
| 03-02 | Subagents, Teams, & Mailbox | Claude Code (Opus) + OMC deep-executor | tauri-backend | 03-01, 02-03 |

**Why Opus + deep-executor:** Complex orchestration — subagent spawning, depth limits, visibility hierarchy, task delegation. V1.0 scope is subagents only (not full teams/mailbox).

#### Wave V1-3

| # | Prompt | Tool | Agent | Deps |
|---|--------|------|-------|------|
| 03-03 | Hook Engine & Ecosystem Compat | Codex App | — | 03-01, 03-02 |

### V1.0 Phase Gate

Same security + architecture + test coverage checks as MVP gate.

---

## V1.5 — Extensibility

**Duration target:** 8–10 weeks

### Wave Execution

#### Wave V15-1 (PARALLEL — 4 agents)

| # | Prompt | Tool | Agent | Deps |
|---|--------|------|-------|------|
| 02-05 | Additional Wrapper Adapters | Codex App | — | 02-04 |
| 02-06 | Provider Reasoning & Routing | Claude Code (Opus) | tauri-backend | 02-01, 02-02, 02-03 |
| 07-04 | Advanced Screens, Mobile, Verification | Claude Code (Opus) + OMC designer | react-ui | 07-02, 07-03 |
| 07-13 | UI Test Coverage Hardening (95%) | Codex App | — | 07-08 |

**Parallelism: 4 agents.** All four prompts have independent dependency chains.

**07-04 includes React Native mobile UI** — this is where `packages/ui-native` gets built. Use the react-ui agent with NativeWind + react-native-reusables knowledge.

#### Wave V15-2

| # | Prompt | Tool | Agent | Deps |
|---|--------|------|-------|------|
| 03-02 | Subagents, Teams, & Mailbox (full) | Claude Code (Opus) | tauri-backend | previous 03-02 partial |
| 03-04 | Plugin Runtime & Deep Links | Claude Code (Sonnet) | tauri-backend | 03-03, 01-03 |

**03-02 (full):** Extends the V1.0 subagent-only implementation to include teams, mailbox communication, and task delegation.

---

## V2.0 — Remote + Marketplace

**Duration target:** 8–12 weeks

### Wave Execution

#### Wave V2-1 (PARALLEL — 2 tracks)

| # | Prompt | Tool | Agent | Deps |
|---|--------|------|-------|------|
| 06-01 | Device Pairing & LAN | Claude Code (Opus) | tauri-backend | 01-03, 01-04 |
| 08-01 | Docs Site Foundation | Codex App | — | none |

#### Wave V2-2

| # | Prompt | Tool | Agent | Deps |
|---|--------|------|-------|------|
| 06-02 | Relay & Remote Terminal | Claude Code (Opus) | tauri-backend | 06-01, 05-02 |
| 08-02 | Developer, Product, & Reference Docs | Codex App | — | 08-01 |

**06-02 Why Opus:** E2E encryption, relay protocol, remote terminal forwarding. Security-critical code.

#### Wave V2-3

| # | Prompt | Tool | Agent | Deps |
|---|--------|------|-------|------|
| 08-03 | Docs Governance & Generation | Codex App | — | 08-01, 08-02 |

---

## Maximum Parallelism Summary

| Phase | Total Prompts | Max Parallel Agents | Bottleneck |
|-------|--------------|--------------------:|------------|
| Phase 0 | 8 spikes | **8** | None — all independent |
| MVP | 16 prompts | **4** tracks (backend + frontend + design + docs) | Backend foundation chain (01-01→01-04) |
| V1.0 | 5 prompts | **3** | 03-02 depends on 02-03 |
| V1.5 | 6 prompts | **4** | 03-04 depends on 03-03 |
| V2.0 | 5 prompts | **2** tracks (remote + docs) | 06-02 depends on 06-01 |

### Critical Path (longest dependency chain)

```
01-01 → 01-02 → 01-03 → 01-04 → 02-01 → 02-02 → 02-03 → 03-02 → 03-03 → 03-04
                                                      ↓
                                                    07-02 → 07-05
```

**12 prompts on the critical path.** Everything else can run in parallel.

---

## Agent Assignment Cheat Sheet

### When to use Claude Code (Opus)

Prompts that need deep reasoning, cross-language bridges, or set architectural precedent:

| Prompt | Why Opus |
|--------|----------|
| 01-01 Runtime Bootstrap | Sets up entire app scaffold |
| 01-04 REST, SSE, Transcripts | Complex streaming pipeline |
| 02-02 Bun AI Worker Bridge | Cross-language Rust ↔ Bun bridge |
| 02-03 Native Agent Loop | Heart of the product — full agent loop |
| 02-04 Wrapper Adapter Framework | Cross-process adapter abstraction |
| 02-06 Provider Reasoning | Complex routing logic |
| 03-02 Subagents/Teams | Complex orchestration |
| 06-01 Device Pairing | Security-critical pairing protocol |
| 06-02 Relay & Remote Terminal | E2E encryption, relay protocol |
| 07-02 Session Workspace Core | Most complex UI screen |
| 07-04 Advanced + Mobile | React Native mobile UI |

### When to use Claude Code (Sonnet)

Well-defined prompts with clear scope:

| Prompt | Why Sonnet |
|--------|-----------|
| 01-02 SQLite Migrations | Standard CRUD + migrations |
| 01-03 Settings & Keychain | Well-defined config system |
| 02-01 Provider Registry | Registry pattern, clear scope |
| 03-01 Tools & Permissions | Permission model, well-specified |
| 04-01 Claude-mem Core | FTS5 integration, clear spec |
| 05-01 Workspace Lifecycle | Git operations, clear scope |
| 07-01 Desktop Shell | App shell layout, standard patterns |
| 07-03 Settings Surfaces | Form-heavy UI, well-defined |
| 03-04 Plugin Runtime | Plugin loading, clear API |

### When to use Codex App

Isolated, well-scoped tasks that benefit from sandboxed parallel execution:

| Prompt | Why Codex |
|--------|----------|
| All 8 Phase 0 spikes | Independent, throwaway, highly parallel |
| 03-01 Tools & Permissions | Can parallel with 02-01 |
| 03-03 Hook Engine | Well-defined lifecycle hooks |
| 04-02 Hybrid Retrieval | Clear spec, isolated subsystem |
| 04-03 Claude-mem Sync | Maintenance task, clear scope |
| 05-02 Merge Review | Well-defined safety checks |
| 07-05 Storybook Verification | Testing/docs, isolated |
| 07-08 UI Package Foundation | No deps, isolated setup |
| 07-13 UI Test Coverage | Testing, isolated |
| 08-01, 08-02, 08-03 | Documentation, independent track |
| 09-03, 09-04 | Design tasks, independent |

### When to use Gemini CLI

Verification, second opinions, and cross-checking:

| Task | Why Gemini |
|------|-----------|
| Phase gate security review | Independent security perspective |
| Architecture review between phases | Cross-check decisions against docs |
| Spike result verification | Validate benchmark methodology |
| Code review on critical prompts | Second opinion on 02-03, 03-02, 06-02 |

---

## Workflow Per Prompt

Every prompt follows this workflow regardless of which AI tool executes it:

```
1. READ prompt file completely
2. READ all "Required Reading" architecture docs
3. BRAINSTORM approach (use brainstorming skill or /brainstorming)
4. TDD: Write failing tests first
5. IMPLEMENT to make tests pass
6. VERIFY: Run all acceptance criteria from prompt
7. REVIEW: Code review via OMC code-reviewer or Gemini CLI
8. UPDATE STATUS.md: Mark prompt as complete
9. COMMIT: feat: implement {prompt-id} — {prompt-name}
```

### Multi-Agent Prompt Execution (for complex prompts)

For prompts marked as Opus + deep-executor, use the OMC team skill:

```
/oh-my-claudecode:team

Orchestrator: Read prompt, break into tasks
├── Agent 1 (tauri-backend): Rust implementation
├── Agent 2 (react-ui): Frontend stubs/integration
├── Agent 3 (test-engineer): Test suite
└── Orchestrator: Merge, verify acceptance criteria
```

---

## Quick Start

```bash
# 1. Verify your toolchain
claude --version          # Claude Code installed
codex --version           # Codex CLI installed
gemini --version          # Gemini CLI installed

# 2. Phase 0 — Launch all 8 spikes in Codex App
# (see Phase 0 section above for commands)

# 3. While spikes run, start frontend + design tracks in Claude Code
# Terminal 1: Frontend track
claude "Execute prompt docs/prompts/07-ui-implementation/08-ui-package-foundation-and-storybook.md using react-ui agent"

# Terminal 2: Design track
claude "Execute prompt docs/prompts/09-browser-ui-ux/01-master-ui-ux-handoff.md as a design review"

# 4. After spikes pass, start MVP backend
claude "Execute prompt docs/prompts/01-foundation/01-runtime-bootstrap.md using tauri-backend agent"

# 5. Continue through waves, launching parallel agents when deps are met
```
