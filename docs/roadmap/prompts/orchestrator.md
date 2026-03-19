# Lunaria Migration Orchestrator — Master Agent Prompt

## Purpose

This is the master orchestration prompt for the Lunaria Superset fork migration. It manages the 5-phase migration by spawning Claude Code agents in tmux panes, monitoring progress, and coordinating handoffs between phases.

**Run this prompt in a Claude Code session to orchestrate the entire migration.**

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    ORCHESTRATOR (this agent)                  │
│                    tmux session: lunaria-migration            │
│                                                              │
│  Responsibilities:                                           │
│  1. Spawn phase agents in tmux panes                        │
│  2. Monitor phase completion via git commits + file checks   │
│  3. Run verification between phases                         │
│  4. Coordinate Phase 3 parallelism (3 sub-agents)           │
│  5. Track progress in docs/roadmap/PROGRESS.md              │
│                                                              │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌───────┐ ┌──────┐│
│  │ Phase 1  │→│ Phase 2  │→│ Phase 3  │→│Phase 4│→│Phs 5 ││
│  │ Fork &   │ │ Monorepo │ │ Services │ │  UI   │ │Polish││
│  │ Rebrand  │ │ Restructr│ │ (3 panes)│ │ Integ │ │Release│
│  └──────────┘ └──────────┘ └──────────┘ └───────┘ └──────┘│
│       │              │         │ │ │          │         │    │
│       ▼              ▼         ▼ ▼ ▼          ▼         ▼    │
│  [verify]       [verify]   [verify x3]  [verify]   [verify] │
│  build+brand    build+DB   tests pass   screens    release   │
└─────────────────────────────────────────────────────────────┘
```

---

## Prerequisites

Before running this orchestrator:

1. **Superset repo cloned** or accessible for forking
2. **Lunaria repo** at `/Users/heitor/Developer/github.com/Lunaria/lunaria`
3. **Bun installed** (`bun --version` returns 1.3+)
4. **Claude Code** installed and authenticated
5. **tmux** installed (`tmux -V`)

---

## Tmux Session Setup

```bash
# Create the orchestration tmux session
tmux new-session -d -s lunaria-migration -n orchestrator

# Create panes for phase work
# We start with one pane and create more as needed
```

---

## Phase Execution Protocol

For each phase, the orchestrator:

1. **Reads** the phase prompt from `docs/roadmap/prompts/phase-{N}-*.md`
2. **Creates** a tmux pane for the phase agent
3. **Launches** Claude Code in that pane with the phase prompt
4. **Monitors** by checking for completion signals (specific files, git commits, build success)
5. **Verifies** acceptance criteria before moving to next phase
6. **Updates** `docs/roadmap/PROGRESS.md` with status
7. **Commits** phase completion

### Spawning a Phase Agent

```bash
# Create a new tmux window for the phase
tmux new-window -t lunaria-migration -n "phase-{N}"

# Launch Claude Code with the phase prompt
tmux send-keys -t lunaria-migration:phase-{N} \
  "cd /path/to/lunaria && claude --print 'Read docs/roadmap/prompts/phase-{N}-*.md and execute all instructions. When done, create a file .phase-{N}-complete with a summary of what was done.'" \
  Enter
```

### Alternative: Interactive Claude Code Sessions

```bash
# For interactive work where the agent may need human input:
tmux send-keys -t lunaria-migration:phase-{N} \
  "cd /path/to/lunaria && claude" \
  Enter

# Then in the Claude Code session, paste or reference the prompt:
# > Read and execute docs/roadmap/prompts/phase-{N}-*.md
```

---

## Phase 1: Fork & Rebrand

### Launch

```bash
tmux new-window -t lunaria-migration -n "phase-1"
tmux send-keys -t lunaria-migration:phase-1 \
  "cd /path/to/lunaria && claude 'Read docs/roadmap/prompts/phase-1-fork-rebrand.md and execute all instructions step by step. When each step is complete, commit the changes with a descriptive message. When all steps are done, create .phase-1-complete'" \
  Enter
```

### Verification (run from orchestrator)

```bash
# Check build
cd /path/to/lunaria && bun run build

# Check branding
grep -r "Superset" apps/desktop/src/ --include="*.ts" --include="*.tsx" | grep -v node_modules | wc -l
# Should be 0

# Check no cloud deps
grep -r "@electric-sql" package.json apps/desktop/package.json | wc -l
# Should be 0

# Check theme
grep "300 100% 36%" apps/desktop/src/renderer/styles/globals.css
# Should find magenta primary

# Check completion marker
test -f .phase-1-complete && echo "PHASE 1 COMPLETE" || echo "PHASE 1 IN PROGRESS"
```

### On Success

```bash
git add -A && git commit -m "feat: Phase 1 complete — fork & rebrand"
echo "Phase 1: COMPLETE $(date)" >> docs/roadmap/PROGRESS.md
```

---

## Phase 2: Monorepo Restructure

### Launch

```bash
tmux new-window -t lunaria-migration -n "phase-2"
tmux send-keys -t lunaria-migration:phase-2 \
  "cd /path/to/lunaria && claude 'Read docs/roadmap/prompts/phase-2-monorepo-restructure.md and execute all instructions. Commit after each major step (DB migrations, tRPC routers, UI placeholders, routes). Create .phase-2-complete when done.'" \
  Enter
```

### Verification

```bash
# Check DB migrations exist
ls packages/local-db/drizzle/0037*.sql packages/local-db/drizzle/0043*.sql

# Check lunaria-service package
test -d packages/lunaria-service/src && echo "lunaria-service exists"

# Check tRPC namespace
grep -r "lunariaRouter\|lunaria:" apps/desktop/src/lib/trpc/ | head -5

# Check routes
ls apps/desktop/src/renderer/routes/_authenticated/memory/
ls apps/desktop/src/renderer/routes/_authenticated/agents/

# Build
bun run build
```

### On Success

```bash
git add -A && git commit -m "feat: Phase 2 complete — monorepo restructured"
echo "Phase 2: COMPLETE $(date)" >> docs/roadmap/PROGRESS.md
```

---

## Phase 3: Core Services (Parallel Execution)

Phase 3 is the largest phase (3 weeks). Split into 3 parallel sub-agents:

### Sub-Agent 3A: Memory + Remote Access

```bash
tmux new-window -t lunaria-migration -n "phase-3a"
tmux send-keys -t lunaria-migration:phase-3a \
  "cd /path/to/lunaria && claude 'Read docs/roadmap/prompts/phase-3-core-services.md. Focus ONLY on: Memory Service (section Week 3 item 1) and Remote Access Service (section Week 3 item 2). Implement both fully with unit tests. Commit each service separately. Create .phase-3a-complete when done.'" \
  Enter
```

### Sub-Agent 3B: Orchestration + Extensions + Kanban

```bash
tmux new-window -t lunaria-migration -n "phase-3b"
tmux send-keys -t lunaria-migration:phase-3b \
  "cd /path/to/lunaria && claude 'Read docs/roadmap/prompts/phase-3-core-services.md. Focus ONLY on: Orchestration Service (Week 4 item 3), Extension System (Week 4 item 4), and Kanban Service (Week 5 item 6). Implement all three with unit tests. Commit each separately. Create .phase-3b-complete when done.'" \
  Enter
```

### Sub-Agent 3C: Autopilot + CLI Integration + Replay + Opinions + Diagnostics

```bash
tmux new-window -t lunaria-migration -n "phase-3c"
tmux send-keys -t lunaria-migration:phase-3c \
  "cd /path/to/lunaria && claude 'Read docs/roadmap/prompts/phase-3-core-services.md. Focus ONLY on: Autopilot Engine (Week 5 item 5), CLI Integration (item 7), Session Replay (item 8), Opinions Service (item 9), and Diagnostics (item 10). Implement all with unit tests. Commit each separately. Create .phase-3c-complete when done.'" \
  Enter
```

### Merge Strategy for Parallel Phase 3

The 3 sub-agents work on different directories:

- 3A: `packages/lunaria-service/src/memory/` + `packages/lunaria-service/src/remote-access/`
- 3B: `packages/lunaria-service/src/orchestration/` + `packages/lunaria-service/src/extensions/` + `packages/lunaria-service/src/kanban/`
- 3C: `packages/lunaria-service/src/autopilot/` + `packages/lunaria-service/src/cli-integration/` + `packages/lunaria-service/src/replay/` + `packages/lunaria-service/src/opinions/` + `packages/lunaria-service/src/diagnostics/`

**No merge conflicts expected** — each agent works in isolated directories.

Use git worktrees for isolation:

```bash
# Create worktrees for parallel work
git worktree add ../lunaria-3a phase-3a
git worktree add ../lunaria-3b phase-3b
git worktree add ../lunaria-3c phase-3c

# After all complete, merge:
git merge phase-3a phase-3b phase-3c
```

### Verification

```bash
# Check all services exist
for dir in memory remote-access orchestration extensions autopilot kanban cli-integration replay opinions diagnostics; do
  test -d packages/lunaria-service/src/$dir && echo "$dir: OK" || echo "$dir: MISSING"
done

# Run tests
cd packages/lunaria-service && bun test

# Check all completion markers
test -f .phase-3a-complete && test -f .phase-3b-complete && test -f .phase-3c-complete && echo "PHASE 3 COMPLETE"
```

### On Success

```bash
git add -A && git commit -m "feat: Phase 3 complete — all core services ported"
echo "Phase 3: COMPLETE $(date)" >> docs/roadmap/PROGRESS.md
```

---

## Phase 4: UI Integration

### Launch

```bash
tmux new-window -t lunaria-migration -n "phase-4"
tmux send-keys -t lunaria-migration:phase-4 \
  "cd /path/to/lunaria && claude 'Read docs/roadmap/prompts/phase-4-ui-integration.md and execute all instructions. Build all 11 screens with real tRPC data. Commit after each screen is complete. Create .phase-4-complete when done.'" \
  Enter
```

### Verification

```bash
# Check all routes render
for route in memory agents autopilot marketplace kanban remote visual-editor opinions replay diagnostics; do
  grep -l "$route" apps/desktop/src/renderer/routes/_authenticated/$route/index.tsx && echo "$route: OK"
done

# Check Memory Graph Home is default
grep -r "MemoryGraph\|memoryGraph" apps/desktop/src/renderer/routes/ | head -3

# Build
bun run build

# Check no placeholder components remain
grep -r "placeholder\|TODO\|STUB" packages/ui/src/components/lunaria/ | wc -l
# Should be 0
```

### On Success

```bash
git add -A && git commit -m "feat: Phase 4 complete — all UI screens integrated"
echo "Phase 4: COMPLETE $(date)" >> docs/roadmap/PROGRESS.md
```

---

## Phase 5: Polish & Release

### Launch

```bash
tmux new-window -t lunaria-migration -n "phase-5"
tmux send-keys -t lunaria-migration:phase-5 \
  "cd /path/to/lunaria && claude 'Read docs/roadmap/prompts/phase-5-polish-release.md and execute all instructions. Commit after each major task (i18n, mobile, tests, docs). Create .phase-5-complete when done.'" \
  Enter
```

### Verification

```bash
# Check i18n
test -f packages/i18n/locales/en.json && echo "i18n: OK"

# Run full test suite
bun test

# Check version
grep '"version": "1.0.0"' apps/desktop/package.json

# Build all platforms
bun run build

# Check no Superset references
grep -ri "superset" apps/desktop/src/ --include="*.ts" --include="*.tsx" | grep -v "// forked from" | wc -l
# Should be 0
```

### On Success

```bash
git add -A && git commit -m "feat: Phase 5 complete — Lunaria v1.0.0 ready"
echo "Phase 5: COMPLETE $(date)" >> docs/roadmap/PROGRESS.md
git tag v1.0.0
```

---

## Progress Tracking

The orchestrator maintains `docs/roadmap/PROGRESS.md`:

```markdown
# Lunaria Migration Progress

## Status: IN PROGRESS

| Phase                          | Status      | Started | Completed | Notes |
| ------------------------------ | ----------- | ------- | --------- | ----- |
| 1: Fork & Rebrand              | NOT STARTED | —       | —         |       |
| 2: Monorepo Restructure        | NOT STARTED | —       | —         |       |
| 3A: Memory + Remote            | NOT STARTED | —       | —         |       |
| 3B: Orchestration + Extensions | NOT STARTED | —       | —         |       |
| 3C: Autopilot + CLI + Replay   | NOT STARTED | —       | —         |       |
| 4: UI Integration              | NOT STARTED | —       | —         |       |
| 5: Polish & Release            | NOT STARTED | —       | —         |       |
```

---

## Error Recovery

### If a phase agent fails:

1. Check the tmux pane for error output
2. Read the agent's last commit message for context
3. Fix the issue manually or re-launch the agent with additional context
4. Resume from where it stopped (agents are designed to be idempotent)

### If a build breaks between phases:

1. Run `bun install` to refresh dependencies
2. Check for TypeScript errors: `bun run typecheck`
3. Check for lint errors: `bun run lint`
4. If DB migrations conflict, check `packages/local-db/drizzle/meta/_journal.json`

### If parallel Phase 3 agents conflict:

1. They shouldn't — each works in separate directories
2. If shared files (like index.ts barrel exports) conflict, merge manually
3. Run `bun test` after merge to verify

---

## Quick Start

```bash
# 1. Set up tmux session
tmux new-session -s lunaria-migration -n orchestrator

# 2. Start Phase 1
tmux new-window -n phase-1
tmux send-keys "cd /path/to/lunaria && claude" Enter
# In Claude: "Read and execute docs/roadmap/prompts/phase-1-fork-rebrand.md"

# 3. Monitor from orchestrator window
tmux select-window -t orchestrator
# Watch progress, run verifications

# 4. After Phase 1, start Phase 2, etc.
# Follow the phase execution protocol above
```

---

## Decision Reference

All architectural and design decisions are documented in:

- `docs/roadmap/MIGRATION-PLAN.md` — 20 locked decisions from eng + CEO + design reviews
- `docs/roadmap/TODOS.md` — 6 tracked items for implementation-time resolution
- Key decisions summary:
  - License: Elastic-2.0
  - Process model: host-service + lunaria-service (separate daemons)
  - Database: Single SQLite, migrations 0037-0043
  - tRPC: Namespaced under `trpc.lunaria.*`
  - Data layer: tRPC + react-query (no Electric SQL)
  - Graph rendering: d3-force + Canvas 2D
  - Crypto: libsodium-wrappers-sumo + jose
  - Terminal observation: WebSocket subscription cross-daemon
  - CLI parser: Full trust (no sandbox)
  - Replay storage: File-based, gzip compressed
  - i18n: Full app (all screens)
  - Logging: Structured JSON to ~/.lunaria/logs/
