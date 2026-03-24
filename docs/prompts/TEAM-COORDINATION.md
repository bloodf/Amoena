# Team Coordination Protocol — Mission Control Platform

> This file is for the human or Claude orchestrator managing multiple Codex GUI agents.
> It is NOT a component prompt. Do not paste it into a Codex GUI session.

---

## Overview

The Mission Control Platform is implemented across two phases using parallel Codex GUI agents.
This document governs how those agents coordinate: branch naming, merge order, conflict
resolution, phase gates, subagent delegation, and recovery procedures.

All agents run in **Ralph Mode** (see `RALPH-LOOP-TEMPLATE.md`). They self-correct and iterate
until their acceptance criteria pass. Your job as coordinator is to merge their work in the
right order and handle cases where an agent reports `RALPH BLOCKED`.

---

## Phase 1 — Core Loop (3 parallel agents)

### Agent Assignment

| Agent  | Branch | Components |
|--------|--------|------------|
| **Alpha** | `feature/mission-control-adapters-engine` | CLI adapters (Claude Code, Codex) + DAG execution engine + goal router |
| **Beta**  | `feature/mission-control-telemetry-reporter` | Telemetry collector (writes to `goal_runs`, `task_runs`, `agent_performance`) + RunReport component |
| **Gamma** | `feature/mission-control-ui` | Mission Control UI panel (GoalInput, TaskGraph, live status, orchestration bar) |

### What goes to which agent

**Alpha** owns everything that CALLS external agents and orchestrates task execution:
- `apps/dashboard/src/lib/adapters/` — Claude Code adapter, Codex adapter
- `apps/dashboard/src/lib/dag-engine.ts` — DAG execution, topological sort, dependency resolution
- `apps/dashboard/src/lib/goal-router.ts` — assigns tasks to agents based on type/capability

**Beta** owns everything that RECORDS what happened:
- `apps/dashboard/src/lib/telemetry.ts` — writes rows to `goal_runs`, `task_runs`, `agent_performance`
- `apps/dashboard/src/lib/migrations.ts` — the new Phase 1 migration adding telemetry tables
- `apps/dashboard/src/components/panels/mission-control/run-report/` — RunReport component

**Gamma** owns the UI that DISPLAYS and CONTROLS the mission control experience:
- `apps/dashboard/src/components/panels/mission-control/` — all UI components
- `apps/dashboard/src/app/api/mission-control/` — API routes for UI data needs
- `apps/dashboard/src/components/panels/mission-control/orchestration-bar.tsx` — if it exists,
  extend it; if not, create it

### Phase 1 Merge Order

**CRITICAL: merge in this exact order or you will have schema conflicts.**

```
Step 1: Merge BETA first   (feature/mission-control-telemetry-reporter → main)
        Reason: Beta owns the SQLite migration that creates the telemetry tables.
                Alpha and Gamma code depends on these tables existing.

Step 2: Merge ALPHA second (feature/mission-control-adapters-engine → main)
        Reason: Alpha writes to the telemetry tables Beta just created.
                Alpha imports from telemetry.ts; Beta must be merged first.

Step 3: Merge GAMMA last   (feature/mission-control-ui → main)
        Reason: Gamma's UI reads from the tables Alpha+Beta created.
                Gamma may import RunReport from Beta's component.
```

---

## Phase 2 — Intelligence Layer (2 parallel agents)

### Agent Assignment

| Agent    | Branch | Components |
|----------|--------|------------|
| **Delta**   | `feature/mission-control-intelligence` | Agent Leaderboard + Run Comparison + Time Saved & Streaks |
| **Epsilon** | `feature/mission-control-templates-reports` | Goal Templates + Shareable Reports |

### What goes to which agent

**Delta** owns read-only analytics that query Phase 1 telemetry tables:
- `apps/dashboard/src/lib/leaderboard-queries.ts`
- `apps/dashboard/src/lib/comparison-queries.ts`
- `apps/dashboard/src/lib/stats-queries.ts`
- `apps/dashboard/src/lib/secret-scrubber.ts` (no — this is Epsilon, see below)
- `apps/dashboard/src/components/panels/mission-control/leaderboard/`
- `apps/dashboard/src/components/panels/mission-control/comparison/`
- `apps/dashboard/src/components/panels/mission-control/stats/`

**Epsilon** owns new storage and export functionality:
- `apps/dashboard/src/lib/templates-data.ts` (static built-ins)
- `apps/dashboard/src/lib/template-queries.ts` (DB queries for custom templates)
- `apps/dashboard/src/lib/report-exporter.ts`
- `apps/dashboard/src/lib/secret-scrubber.ts`
- `apps/dashboard/src/components/panels/mission-control/templates/`
- `apps/dashboard/src/components/panels/mission-control/share/`
- New migration: `goal_templates` table

### Phase 2 Merge Order

Either order is safe — both branches are additive. They do not share files.

```
Option A: Delta first, then Epsilon
Option B: Epsilon first, then Delta
```

Recommended: merge Delta first (leaderboard, comparison, stats are core analytics),
then Epsilon (templates, reports are value-add). Both options are valid.

---

## Branch Naming Convention

```
feature/mission-control-{scope}
```

Where `{scope}` is one of:
- `adapters-engine`    — Phase 1 Alpha
- `telemetry-reporter` — Phase 1 Beta
- `ui`                — Phase 1 Gamma
- `intelligence`       — Phase 2 Delta
- `templates-reports`  — Phase 2 Epsilon

Do not use generic names like `feature/phase-2` — they make merge history unreadable.

All branches are cut from `main` at the time of Phase start.

---

## Conflict Resolution Protocol

### If two branches touch the same file

Applies primarily to Phase 1, where Alpha, Beta, and Gamma all touch different parts of
the codebase but might collide on shared infrastructure files.

**Rule: the later-merging agent yields.**

Since Beta merges first, Alpha yields to Beta on shared files. Since Alpha merges second,
Gamma yields to Alpha on shared files.

**Common conflict zones in Phase 1:**

| File | Owner | Other agents yield |
|------|-------|-------------------|
| `apps/dashboard/src/lib/migrations.ts` | Beta | Alpha, Gamma |
| `apps/dashboard/src/lib/db.ts` | Beta (for type definitions) | Alpha, Gamma |
| `apps/dashboard/src/components/panels/mission-control/index.ts` | Gamma | Alpha, Beta |
| `apps/dashboard/src/app/api/mission-control/` | Gamma | Alpha, Beta |

**Resolution steps when a conflict occurs:**

1. Read both versions of the conflicting section
2. Understand what each agent was trying to do
3. Manually merge: keep both sets of changes where possible
4. If incompatible: apply the earlier-merging agent's version, then re-apply the
   later-merging agent's changes on top
5. Run `npm run build && npm run test` after manual merge
6. Commit the resolution with message: `chore: resolve merge conflict [file] between [branch-a] and [branch-b]`

**Phase 2 conflict protocol:** Delta and Epsilon own entirely separate files.
If they somehow collide (e.g. both added a migration), apply both migrations in sequence
and renumber if needed. The `migrations.ts` file uses version numbers — use
non-overlapping numbers by coordinating before agents start work.

---

## Phase Gate Checklist

### Phase 1 Gate (must pass before starting Phase 2)

All items below must be verified by the coordinator before opening Codex GUI sessions for Phase 2.

```
[ ] All Phase 1 branches merged to main in correct order (Beta → Alpha → Gamma)
[ ] npm run build — passes with zero errors
[ ] npm run test  — all tests pass, zero failures
[ ] npx tsc --noEmit — zero TypeScript errors
[ ] npm run lint  — zero lint errors (warnings OK)
[ ] Smoke test: manually navigate to Mission Control panel in the dashboard
[ ] Smoke test: run one goal with at least one task
[ ] Smoke test: verify the goal_runs and task_runs tables have rows in the DB
[ ] Smoke test: agent_performance table is updated after task completion
[ ] Smoke test: RunReport renders after goal completes
```

Do not start Phase 2 with a failing build or failing tests. Fix first.

### Phase 2 Gate (before shipping)

```
[ ] All Phase 2 branches merged to main
[ ] npm run build — passes
[ ] npm run test  — all tests pass
[ ] npx tsc --noEmit — zero errors
[ ] npm run lint  — zero lint errors
[ ] Smoke test: Agent Leaderboard renders (may show cold-start state if < 5 runs)
[ ] Smoke test: Run Comparison enables after 2+ completed runs
[ ] Smoke test: Goal Templates loads 5 built-in templates
[ ] Smoke test: Template launch fires lunaria:load-template event (check DevTools)
[ ] Smoke test: Time Saved badge shows in Mission Control header
[ ] Smoke test: Export a run report as HTML — verify file downloads and opens in browser
[ ] Smoke test: Export a run report as Markdown — verify file downloads
[ ] Smoke test: Plant a fake API key in a task title, export report, verify it is REDACTED
```

---

## Subagent Delegation

Within a Codex GUI session, the main agent (Alpha/Beta/etc.) can and should spawn subagents
for focused work. Guidelines:

### When to spawn a subagent

- Writing tests for a module that is now complete
- Fixing a specific TypeScript error that requires deep type analysis
- Researching an API or library behavior (read-only lookup)
- Writing documentation or comments for a completed function

### When NOT to spawn a subagent

- Core implementation work — the main agent must own this
- Decisions that affect the component architecture
- Work that touches files the main agent is responsible for

### Subagent instructions to include

When the main agent spawns a subagent, it must include:
1. The specific task (what to implement or fix)
2. The file(s) to work on
3. The expected output (e.g. "add tests to this file", "fix this type error")
4. Constraints: "do not change the function signatures", "do not add new dependencies"

The main agent MUST verify the subagent's output before considering that criterion done.

---

## Communication Protocol

### How agents signal completion

Each agent produces a `RALPH COMPLETE ✓` block as their final output:

```
RALPH COMPLETE ✓
- All acceptance criteria verified with evidence
- Build: PASS
- Tests: PASS (N tests)
- TypeScript: PASS
- Files changed: [list of files]
- Iterations: [N]
```

As coordinator, you must READ this output, not just look for the heading.
"Build: PASS" without the actual build output shown is NOT acceptable.
Ask the agent to re-run if it declares complete without showing evidence.

### Coordinator log

Maintain a brief log of agent status. Example:

```
2026-03-23 14:00 — Phase 1 launched. Alpha, Beta, Gamma sessions opened.
2026-03-23 15:30 — Beta: RALPH COMPLETE. Merging to main.
2026-03-23 16:00 — Alpha: RALPH COMPLETE. Merging to main.
2026-03-23 17:15 — Gamma: RALPH BLOCKED (TypeScript error in orchestration-bar.tsx, 3 attempts).
                   Action taken: provided guidance on type mismatch, agent resumed.
2026-03-23 18:00 — Gamma: RALPH COMPLETE. Merging to main.
2026-03-23 18:15 — Phase 1 gate: PASS. Starting Phase 2.
```

---

## Recovery Procedures

### When an agent reports RALPH BLOCKED

```
RALPH BLOCKED
- Error: [description]
- Attempted: [approach 1], [approach 2], [approach 3]
- Root cause hypothesis: [hypothesis]
- Recommended action: [action]
```

Coordinator response steps:

1. **Read the error carefully.** Understand what the agent was trying to do and why it failed.

2. **Check if it's an environment issue** (wrong Node version, missing package, wrong cwd).
   If so, fix the environment and tell the agent to retry.

3. **Check if it's a design issue** (the acceptance criterion is ambiguous or contradicts
   another part of the system). If so, clarify the criterion and allow the agent to proceed
   with a modified approach. Document the clarification in this coordination file.

4. **Check if it's a knowledge gap** (the agent does not know how a specific API works).
   Provide the relevant documentation excerpt or a concrete code example, then tell the
   agent to retry.

5. **If still blocked after your guidance:** escalate to an Architect agent with full context:
   - The RALPH BLOCKED output
   - The files the agent modified
   - The acceptance criterion
   - All three failed approaches
   The Architect provides a solution path. The blocked agent implements it.

6. **Never skip a criterion to unblock.** If criterion 3 is blocked, do not move to
   criterion 4 and come back. Resolve criterion 3 first — Phase 2 depends on Phase 1 being
   complete.

### When a merge produces a broken build

1. Do not continue to the next merge step.
2. Identify which file(s) caused the break: `npm run build 2>&1 | head -50`
3. If it is a conflict artifact (e.g. `<<<<<<<` markers left in a file): fix manually.
4. If it is a genuine incompatibility: identify which agent's code is correct based on
   the architecture, fix the incorrect side, commit the fix before continuing.
5. Run the full gate checklist again after fixing.

### When a smoke test fails

1. Identify whether it is a frontend or backend issue (check browser console + server logs).
2. Route to the responsible agent's branch for a fix PR.
3. Do not start the next phase until the smoke test passes.

---

## Summary: Merge Commands

```bash
# Phase 1 — run in this order
git checkout main && git pull
git merge --no-ff feature/mission-control-telemetry-reporter
git merge --no-ff feature/mission-control-adapters-engine
git merge --no-ff feature/mission-control-ui

# Phase 1 gate check
npm run build && npm run test && npx tsc --noEmit

# Phase 2 — either order
git merge --no-ff feature/mission-control-intelligence
git merge --no-ff feature/mission-control-templates-reports

# Phase 2 gate check
npm run build && npm run test && npx tsc --noEmit
```

Use `--no-ff` on all merges to preserve branch history and make the merge graph readable.
