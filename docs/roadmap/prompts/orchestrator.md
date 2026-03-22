# Lunaria Migration Orchestrator — Codex GUI Prompt

## Purpose

This is the master orchestration prompt for the Lunaria Superset fork migration. Run it in the Codex GUI app. The Codex chat is the orchestrator/leader. It owns sequencing, verification, and progress tracking across all 5 phases.

The orchestrator must not use tmux, OMX team mode, Cursor CLI, Claude task APIs, or git worktree isolation. When parallel help is useful, use Codex native subagents only for bounded, non-overlapping work.

---

## Operating Model

```
┌─────────────────────────────────────────────────────────────┐
│           ORCHESTRATOR (this Codex GUI chat)               │
│                                                             │
│  Responsibilities                                           │
│  1. Read roadmap docs and choose the active phase           │
│  2. Track status in docs/roadmap/PROGRESS.md                │
│  3. Run phase work directly or delegate bounded slices      │
│  4. Verify acceptance criteria before phase handoff         │
│  5. Keep the migration target in ../lunaria-desktop         │
│                                                             │
│  Phase 1  →  Phase 2  →  Phase 3A/3B/3C  →  Phase 4 → 5    │
│    │          │              │   │   │          │      │    │
│    └─verify───┴────verify────┴──verify──merge────verify───┘ │
└─────────────────────────────────────────────────────────────┘
```

### Repository Roles

- Source/reference repo: `/Users/heitor/Developer/github.com/Lunaria/lunaria`
- Migration target repo: `../lunaria-desktop`

The current repo stays the source of truth for roadmap docs, existing Lunaria code, assets, and Rust behavior references. Phase implementation happens in the sibling Superset-based workspace unless a phase prompt explicitly says otherwise.

---

## Prerequisites

Before beginning any phase:

1. Confirm the source repo is available at the current working directory.
2. Confirm `git`, `bun`, and network access are available.
3. Confirm `docs/roadmap/MIGRATION-PLAN.md`, `docs/roadmap/TODOS.md`, and `docs/roadmap/PROGRESS.md` are readable.
4. Confirm the migration target path `../lunaria-desktop` is available or can be created.

---

## Core Rules

1. Use the main Codex chat as the leader.
2. Do not rely on tmux, `Agent(...)`, `TaskCreate`, `TaskGet`, `TaskOutput`, `SendMessage`, `TeamCreate`, or automatic worktree merging.
3. Update `docs/roadmap/PROGRESS.md` when a phase starts, when it completes, and when a blocker changes status.
4. Preserve the phase prompts as the implementation spec for each phase.
5. Verify each phase before moving on.
6. Use Codex subagents only when the write scopes are disjoint or the task is clearly parallelizable.
7. If a phase is blocked, record the blocker in `PROGRESS.md` before switching context.

---

## Phase Execution Protocol

For each phase, the orchestrator must:

1. Read the corresponding phase prompt and the relevant sections of `MIGRATION-PLAN.md` and `TODOS.md`.
2. Mark the phase as `IN PROGRESS` in `docs/roadmap/PROGRESS.md`.
3. Execute the phase directly or delegate bounded slices to Codex subagents.
4. Run the verification commands or checks listed below and in the phase prompt.
5. Record completion evidence in `docs/roadmap/PROGRESS.md`.
6. Move to the next phase only after the current phase acceptance criteria are satisfied or an explicit blocker is recorded.

### Delegation Policy

Use Codex subagents for:

- Phase 3 parallel service slices:
  - 3A: memory + remote access
  - 3B: orchestration + extensions + kanban
  - 3C: autopilot + CLI integration + replay + opinions + diagnostics
- Focused read-heavy analysis where the result can be integrated without blocking the next local step

Keep work local for:

- Progress tracking
- Cross-phase verification
- Any change that touches the same files as another active task
- Final integration and acceptance review

---

## Phase Launch Notes

### Phase 1: Fork & Rebrand

Execution target: `../lunaria-desktop`

Launch sequence:

1. Create or reuse `../lunaria-desktop`.
2. Clone `https://github.com/LunariaAi/superset.git` into that path if it does not exist.
3. Execute `docs/roadmap/prompts/phase-1-fork-rebrand.md` against the sibling repo.
4. Keep the current repo read-only except for roadmap progress updates.

Verification:

```bash
grep -r "Superset" apps/desktop/src/ --include="*.ts" --include="*.tsx" | grep -v node_modules | wc -l
grep -E "@electric-sql|better-auth|@sentry|@outlit|stripe" apps/desktop/package.json | wc -l
grep "300 100% 36%" apps/desktop/src/renderer/styles/globals.css
bun run build
```

### Phase 2: Monorepo Restructure

Execution target: `../lunaria-desktop`

Verification:

```bash
ls packages/local-db/drizzle/0037*.sql packages/local-db/drizzle/0043*.sql
test -d packages/lunaria-service/src
grep -r "lunaria" apps/desktop/src/lib/trpc/routers/index.ts
bun run build
```

### Phase 3: Core Services

Execution target: `../lunaria-desktop`

Recommended delegation:

- One Codex subagent per slice: 3A, 3B, 3C
- The leader integrates and verifies after all three return

Verification:

- Service-specific unit tests pass
- Crypto test vectors pass
- Health checks pass
- `bun run build` passes

### Phase 4: UI Integration

Execution target: `../lunaria-desktop`

Verification:

- Routes exist and render
- Memory Graph Home is the default landing page
- UI states exist for loading/empty/error/success/partial
- `bun run build` passes

### Phase 5: Polish & Release

Execution target: `../lunaria-desktop`

Verification:

- Full i18n pass completed
- Regression, integration, and E2E suites pass
- Packaging succeeds for desktop targets
- Docs build succeeds

---

## Progress Tracking

Use `docs/roadmap/PROGRESS.md` as the only phase tracker. Do not create a parallel task system.

Minimum updates:

- When a phase starts: set status to `IN PROGRESS`, add start date, note owner as `Codex orchestrator`
- When a delegated slice starts: add a short note naming the slice
- When a phase completes: set status to `COMPLETE`, add completion date, summarize verification evidence
- When blocked: set status to `BLOCKED`, explain the blocker and next recovery step

---

## Failure Recovery

If a phase fails:

1. Read the failing command or verification output carefully.
2. Fix the issue in place in the active repo instead of restarting the entire phase.
3. Re-run the failed verification before resuming broader work.
4. If the blocker is external or not safely recoverable, record it in `PROGRESS.md` and stop phase advancement.

If a delegated slice fails:

1. Review the returned evidence or diff.
2. Repair locally or re-run a bounded delegation with tighter instructions.
3. Do not advance the phase until the slice verification passes.

---

## Immediate Kickoff

When asked to begin the project:

1. Update `docs/roadmap/PROGRESS.md` to mark Phase 1 as `IN PROGRESS`.
2. Prepare `../lunaria-desktop`.
3. Begin Phase 1 only.
4. Do not start Phase 2 until Phase 1 verification succeeds.
