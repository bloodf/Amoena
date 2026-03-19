# Lunaria Migration Orchestrator — Master Agent Prompt

## Purpose

This is the master orchestration prompt for the Lunaria Superset fork migration. It manages the 5-phase migration by spawning Claude Code agents using the native `Agent` tool with git worktree isolation, coordinating handoffs between phases, and tracking progress.

**Run this prompt in a Claude Code session to orchestrate the entire migration.**

---

## Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                  ORCHESTRATOR (this Claude Code session)       │
│                                                               │
│  Uses: Agent tool, TeamCreate, SendMessage, TaskCreate        │
│                                                               │
│  Responsibilities:                                            │
│  1. Spawn phase agents via Agent tool (worktree isolation)    │
│  2. Monitor phase completion via TaskGet/TaskOutput            │
│  3. Run verification between phases                           │
│  4. Coordinate Phase 3 parallelism (3 parallel agents)        │
│  5. Track progress via TaskCreate/TaskUpdate                   │
│                                                               │
│  ┌──────────┐ ┌──────────┐ ┌──────────────┐ ┌─────┐ ┌─────┐│
│  │ Phase 1  │→│ Phase 2  │→│   Phase 3    │→│Phs 4│→│Phs 5││
│  │ Agent    │ │ Agent    │ │ 3 Agents     │ │Agent│ │Agent││
│  │(worktree)│ │(worktree)│ │ (parallel    │ │     │ │     ││
│  │          │ │          │ │  worktrees)  │ │     │ │     ││
│  └──────────┘ └──────────┘ └──────────────┘ └─────┘ └─────┘│
│       │              │         │ │ │           │        │    │
│       ▼              ▼         ▼ ▼ ▼           ▼        ▼    │
│  [verify]       [verify]   [merge+verify] [verify]  [verify]│
│  build+brand    build+DB   tests pass     screens   release  │
└──────────────────────────────────────────────────────────────┘
```

---

## Prerequisites

Before running this orchestrator:

1. **Superset repo** accessible at https://github.com/superset-sh/superset
2. **Lunaria repo** at current working directory
3. **Bun installed** (`bun --version` returns 1.3+)
4. **Claude Code** running with Agent tool access

---

## Phase Execution Protocol

For each phase, the orchestrator:

1. **Creates a task** via `TaskCreate` to track the phase
2. **Spawns an Agent** with `isolation: "worktree"` for code isolation
3. **Provides** the full phase prompt content to the agent
4. **Monitors** via `TaskOutput` / `TaskGet` for completion
5. **Verifies** acceptance criteria by reading agent output
6. **Merges** worktree changes back (agent handles this automatically)
7. **Updates** task status to `completed`

### Agent Spawning Pattern

For sequential phases (1, 2, 4, 5):

```
Agent(
  subagent_type: "oh-my-claudecode:executor",
  isolation: "worktree",
  mode: "bypassPermissions",
  prompt: "<full phase prompt content>"
)
```

For parallel Phase 3:

```
// Launch all 3 simultaneously in one message with 3 Agent tool calls
Agent(name: "phase-3a", isolation: "worktree", ...)
Agent(name: "phase-3b", isolation: "worktree", ...)
Agent(name: "phase-3c", isolation: "worktree", ...)
```

---

## Phase 1: Fork & Rebrand

### Launch

Spawn a single agent with the Phase 1 prompt:

```
Agent(
  description: "Phase 1: Fork and rebrand Superset",
  subagent_type: "oh-my-claudecode:executor",
  isolation: "worktree",
  mode: "bypassPermissions",
  name: "phase-1-fork-rebrand",
  prompt: "Read docs/roadmap/prompts/phase-1-fork-rebrand.md and execute ALL instructions.
    You are in an isolated git worktree. Make all changes, commit each step.
    When done, ensure the app builds with `bun run build`."
)
```

### Verification (orchestrator runs after agent completes)

```bash
# Check branding
grep -r "Superset" apps/desktop/src/ --include="*.ts" --include="*.tsx" | grep -v node_modules | wc -l
# Must be 0

# Check no cloud deps in package.json
grep -E "@electric-sql|better-auth|@sentry|@outlit|stripe" apps/desktop/package.json | wc -l
# Must be 0

# Check theme
grep "300 100% 36%" apps/desktop/src/renderer/styles/globals.css
# Must find magenta

# Build
bun run build
```

### On Success

Update task status, proceed to Phase 2.

---

## Phase 2: Monorepo Restructure

### Launch

```
Agent(
  description: "Phase 2: Monorepo restructure",
  subagent_type: "oh-my-claudecode:executor",
  isolation: "worktree",
  mode: "bypassPermissions",
  name: "phase-2-monorepo",
  prompt: "Read docs/roadmap/prompts/phase-2-monorepo-restructure.md and execute ALL instructions.
    Create DB migrations 0037-0043, scaffold lunaria-service, wire tRPC routers,
    add UI placeholders and route files. Commit after each major step."
)
```

### Verification

```bash
# DB migrations exist
ls packages/local-db/drizzle/0037*.sql packages/local-db/drizzle/0043*.sql

# lunaria-service package exists
test -d packages/lunaria-service/src

# tRPC namespace wired
grep -r "lunaria" apps/desktop/src/lib/trpc/routers/index.ts

# Build passes
bun run build
```

---

## Phase 3: Core Services (Parallel Execution)

This is the largest phase. Split into 3 parallel agents, each in its own worktree. Launch ALL THREE simultaneously in a single message with 3 Agent tool calls.

### Sub-Agent 3A: Memory + Remote Access

```
Agent(
  description: "Phase 3A: Memory and Remote Access services",
  subagent_type: "oh-my-claudecode:executor",
  isolation: "worktree",
  mode: "bypassPermissions",
  name: "phase-3a-memory-remote",
  run_in_background: true,
  prompt: "Read docs/roadmap/prompts/phase-3-core-services.md.
    Focus ONLY on:
    1. Memory Service (store, hybrid search FTS5+cosine+RRF, tier management, dedup, cross-workspace)
    2. Remote Access Service (LAN discovery, PIN/QR, X25519 ECDH, XChaCha20-Poly1305, JWT rotation, WebSocket relay, heartbeat)

    Implement in packages/lunaria-service/src/memory/ and packages/lunaria-service/src/remote-access/.
    Write unit tests for both. Use libsodium-wrappers-sumo for crypto, jose for JWT.
    Commit each service separately."
)
```

### Sub-Agent 3B: Orchestration + Extensions + Kanban

```
Agent(
  description: "Phase 3B: Orchestration, Extensions, Kanban",
  subagent_type: "oh-my-claudecode:executor",
  isolation: "worktree",
  mode: "bypassPermissions",
  name: "phase-3b-orchestration",
  run_in_background: true,
  prompt: "Read docs/roadmap/prompts/phase-3-core-services.md.
    Focus ONLY on:
    1. Orchestration Service (agent spawning, permission ceiling, tool intersection, consensus voting — handle zero-weight edge case)
    2. Extension System (.luna binary parser, lifecycle, sandbox)
    3. Kanban Service (board/task CRUD, atomic SQL agent claim: UPDATE WHERE claimed_by IS NULL)

    Implement in packages/lunaria-service/src/orchestration/, extensions/, kanban/.
    Write unit tests. Commit each service separately."
)
```

### Sub-Agent 3C: Autopilot + CLI Integration + Replay + Opinions + Diagnostics

```
Agent(
  description: "Phase 3C: Autopilot, CLI, Replay, Opinions, Diagnostics",
  subagent_type: "oh-my-claudecode:executor",
  isolation: "worktree",
  mode: "bypassPermissions",
  name: "phase-3c-autopilot",
  run_in_background: true,
  prompt: "Read docs/roadmap/prompts/phase-3-core-services.md.
    Focus ONLY on:
    1. Autopilot Engine (6-phase pipeline, timeout watchdog 10min, rollback, 6 workflow templates)
    2. CLI Integration (output parsers for Claude Code/Codex/Gemini, structured event extraction)
    3. Session Replay (recording engine, gzip file storage, 100MB cap, metadata in SQLite)
    4. Opinions Service (persona CRUD, system prompts, model/temperature)
    5. Diagnostics (service health, structured JSON logging to ~/.lunaria/logs/)

    Implement in packages/lunaria-service/src/autopilot/, cli-integration/, replay/, opinions/, diagnostics/.
    Write unit tests. Commit each service separately."
)
```

### Merge Strategy

The 3 agents work in isolated worktrees on non-overlapping directories:

- 3A: `src/memory/` + `src/remote-access/`
- 3B: `src/orchestration/` + `src/extensions/` + `src/kanban/`
- 3C: `src/autopilot/` + `src/cli-integration/` + `src/replay/` + `src/opinions/` + `src/diagnostics/`

**No merge conflicts expected.** Each agent's worktree changes are automatically available when the agent completes. The orchestrator merges them sequentially.

### Verification (after all 3 complete)

```bash
# Check all service directories exist
for dir in memory remote-access orchestration extensions autopilot kanban cli-integration replay opinions diagnostics; do
  test -d packages/lunaria-service/src/$dir && echo "$dir: OK" || echo "$dir: MISSING"
done

# Run all tests
cd packages/lunaria-service && bun test

# Build
bun run build
```

---

## Phase 4: UI Integration

### Launch

```
Agent(
  description: "Phase 4: Build all 11 Lunaria screens",
  subagent_type: "oh-my-claudecode:executor",
  isolation: "worktree",
  mode: "bypassPermissions",
  name: "phase-4-ui",
  prompt: "Read docs/roadmap/prompts/phase-4-ui-integration.md and execute ALL instructions.
    Build all 11 screens with real tRPC data. Memory Graph Home must be the default landing.
    Implement all interaction states (loading/empty/error/success/partial).
    Use d3-force + Canvas for memory graph. Use @dnd-kit for kanban.
    Commit after each screen. Ensure the full app builds."
)
```

### Verification

```bash
# All route files exist
for route in memory agents autopilot marketplace kanban remote visual-editor opinions replay diagnostics; do
  test -f apps/desktop/src/renderer/routes/_authenticated/$route/index.tsx && echo "$route: OK"
done

# No placeholder/stub components remain
grep -r "placeholder\|STUB" packages/ui/src/components/lunaria/ | wc -l
# Must be 0

# Build
bun run build
```

---

## Phase 5: Polish & Release

### Launch

```
Agent(
  description: "Phase 5: Polish, mobile, i18n, release",
  subagent_type: "oh-my-claudecode:executor",
  isolation: "worktree",
  mode: "bypassPermissions",
  name: "phase-5-release",
  prompt: "Read docs/roadmap/prompts/phase-5-polish-release.md and execute ALL instructions.
    1. Update mobile app to connect to host-service via tRPC HTTP
    2. Full i18n: wrap ALL strings in t() calls, generate 5 language stubs
    3. Run and fix all tests (80%+ coverage target)
    4. Visual audit: no Superset references, magenta everywhere
    5. Update documentation
    6. Set version to 1.0.0
    Commit after each major task."
)
```

### Verification

```bash
# i18n
test -f packages/i18n/locales/en.json

# Tests pass
bun test

# Version
grep '"version": "1.0.0"' apps/desktop/package.json

# No Superset references
grep -ri "superset" apps/desktop/src/ --include="*.ts" --include="*.tsx" | grep -v "// forked from" | wc -l
# Must be 0

# Build
bun run build
```

---

## Alternative: Team-Based Orchestration

For the entire migration as a coordinated team using Claude Code's native team feature:

```
TeamCreate(
  team_name: "lunaria-migration",
  prompt: "Coordinate the Lunaria Superset fork migration across 5 phases.
    Read docs/roadmap/MIGRATION-PLAN.md for full context.
    Execute phases sequentially (1→2→3→4→5), with Phase 3 parallelized across 3 agents.
    Each phase has a prompt in docs/roadmap/prompts/.
    Verify acceptance criteria between phases.
    Update docs/roadmap/PROGRESS.md after each phase completes."
)
```

Or use the OMC team skill for persistent execution:

```
/oh-my-claudecode:team 5:executor "Execute the Lunaria Superset fork migration.
Read docs/roadmap/MIGRATION-PLAN.md for the master plan.
Phase prompts are in docs/roadmap/prompts/phase-{1-5}-*.md.
Execute sequentially: Phase 1 → 2 → 3 (parallel) → 4 → 5.
Each agent reads its phase prompt and implements everything in it."
```

---

## Progress Tracking

The orchestrator tracks progress using Claude Code's task system:

```
TaskCreate("Phase 1: Fork & Rebrand", status: "in_progress")
TaskCreate("Phase 2: Monorepo Restructure", status: "pending")
TaskCreate("Phase 3A: Memory + Remote Access", status: "pending")
TaskCreate("Phase 3B: Orchestration + Extensions + Kanban", status: "pending")
TaskCreate("Phase 3C: Autopilot + CLI + Replay + Opinions", status: "pending")
TaskCreate("Phase 4: UI Integration (11 screens)", status: "pending")
TaskCreate("Phase 5: Polish & Release", status: "pending")
```

Update each task to `completed` after verification passes. Also update `docs/roadmap/PROGRESS.md` with timestamps.

---

## Error Recovery

### If an agent fails:

1. Read the agent's output via `TaskOutput` to understand the failure
2. Fix the issue in the main worktree or re-spawn the agent with additional context via `SendMessage`
3. Agents in worktrees are idempotent — re-running is safe

### If Phase 3 agents produce conflicting changes:

1. They work in separate directories, so conflicts are unlikely
2. If shared files (barrel exports, package.json) conflict, resolve manually after merge
3. Run `bun test` after merge to verify

### If a build breaks between phases:

1. `bun install` to refresh dependencies
2. `bun run typecheck` to find TypeScript errors
3. Check DB migrations in `packages/local-db/drizzle/meta/_journal.json`

---

## Decision Reference

All 20 architectural and design decisions are in `docs/roadmap/MIGRATION-PLAN.md`:

| #   | Decision            | Choice                                                 |
| --- | ------------------- | ------------------------------------------------------ |
| 1   | License             | Elastic-2.0                                            |
| 2   | Upstream tracking   | Selective sync at releases                             |
| 3   | Data layer          | tRPC subscriptions + react-query                       |
| 4   | Process model       | host-service + lunaria-service (separate daemons)      |
| 5   | AI runtime          | Mastra for chat, Lunaria orchestration for multi-agent |
| 6   | Crypto safety       | Cross-language test vectors                            |
| 7   | Database            | Single SQLite, migrations 0037-0043                    |
| 8   | Kanban              | Kanban owns tasks, agent API with atomic SQL claim     |
| 9   | tRPC                | Namespaced `trpc.lunaria.*`                            |
| 10  | i18n                | Full app — all screens                                 |
| 11  | Task concurrency    | Atomic SQL `UPDATE WHERE claimed_by IS NULL`           |
| 12  | Cloud removal       | Dedicated regression test suite                        |
| 13  | Graph rendering     | d3-force + Canvas 2D (Barnes-Hut)                      |
| 14  | Startup             | Eager load all services                                |
| 15  | Cross-daemon stream | WebSocket subscription                                 |
| 16  | CLI parser trust    | Full trust (no sandbox)                                |
| 17  | Replay storage      | File-based, gzip compressed                            |
| 18  | Observability       | Structured logging + Diagnostics page                  |
| 19  | DESIGN.md           | Create in Phase 1                                      |
| 20  | Replay UI           | Split-pane (terminal + event timeline)                 |
