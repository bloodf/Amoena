# Mission Control Platform — Orchestration Playbook

> Master document for implementing the Amoena Mission Control Platform using Codex GUI
> with multiple agents, teams, and Ralph loop continuous execution.

## Overview

This playbook orchestrates the implementation of Amoena's Mission Control Platform across
2 implementation phases (plus a deferred Phase 3) using parallel Codex GUI agents. Each agent
gets a self-contained prompt with Ralph loop instructions so it keeps working until its
acceptance criteria are met.

**Source of truth:**
- Design doc: `~/.gstack/projects/AmoenaAi-amoena/heitor-main-design-20260323-110212.md`
- CEO plan: `~/.gstack/projects/AmoenaAi-amoena/ceo-plans/2026-03-23-mission-control-platform.md`
- Test plan: `~/.gstack/projects/AmoenaAi-amoena/heitor-main-eng-review-test-plan-20260323-114535.md`

## Agent Roles

| Role | Responsibility | Model Tier | When to Use |
|------|---------------|------------|-------------|
| **Executor** | Implement features, write code | Sonnet / Medium | All implementation work |
| **Architect** | Review architecture, verify integration | Opus / High | Cross-module integration, complex decisions |
| **Test Engineer** | Write tests, verify coverage | Sonnet / Medium | Test creation, coverage gaps |
| **Reviewer** | Code review, quality gates | Opus / High | Phase gate reviews, final verification |
| **Build Fixer** | Fix build/type/lint errors | Sonnet / Medium | When builds break during implementation |

## Team Structure

### Phase 1 — Core Loop (3 parallel agents)

```
TEAM ALPHA ─── Agent 1 (Executor/Sonnet)
│              CLI Adapters + DAG Engine Router
│              Prompt: docs/prompts/phase-1/01-cli-adapters.md
│                    + docs/prompts/phase-1/02-dag-engine.md
│
TEAM BETA ──── Agent 2 (Executor/Sonnet)
│              Telemetry Collector + Run Reporter
│              Prompt: docs/prompts/phase-1/03-telemetry.md
│                    + docs/prompts/phase-1/04-run-reporter.md
│
TEAM GAMMA ─── Agent 3 (Executor/Sonnet)
│              Mission Control UI
│              Prompt: docs/prompts/phase-1/05-mission-control-ui.md
│
COORDINATOR ── You (Human or Claude)
               Merge coordination, conflict resolution
               Prompt: docs/prompts/TEAM-COORDINATION.md
```

### Phase 2 — Intelligence Layer (2 parallel agents)

```
TEAM DELTA ─── Agent 4 (Executor/Sonnet)
│              Leaderboard + Run Comparison + Time Saved
│              Prompt: docs/prompts/phase-2/01-agent-leaderboard.md
│                    + docs/prompts/phase-2/02-run-comparison.md
│                    + docs/prompts/phase-2/04-time-saved-streaks.md
│
TEAM EPSILON ─ Agent 5 (Executor/Sonnet)
│              Goal Templates + Shareable Reports
│              Prompt: docs/prompts/phase-2/03-goal-templates.md
│                    + docs/prompts/phase-2/05-shareable-reports.md
```

## How to Use This Playbook

### Step 1: Set Up Codex GUI Sessions

For each agent in the phase, open a Codex GUI session and paste:

1. The **Ralph Loop Template** from `docs/prompts/RALPH-LOOP-TEMPLATE.md` (this goes first — it sets the behavioral rules)
2. The **agent-specific prompt** for that agent's task (this provides the context and acceptance criteria)

The Ralph loop template ensures the agent keeps working until ALL criteria pass.

### Step 2: Launch Phase 1 Agents in Parallel

Open 3 Codex GUI sessions simultaneously:

**Session 1 (Team Alpha):** Paste Ralph template + `phase-1/01-cli-adapters.md` + `phase-1/02-dag-engine.md`
**Session 2 (Team Beta):** Paste Ralph template + `phase-1/03-telemetry.md` + `phase-1/04-run-reporter.md`
**Session 3 (Team Gamma):** Paste Ralph template + `phase-1/05-mission-control-ui.md`

Each agent works independently on its own git branch:
- Team Alpha: `feature/mission-control-adapters-engine`
- Team Beta: `feature/mission-control-telemetry-reporter`
- Team Gamma: `feature/mission-control-ui`

### Step 3: Coordinate Merges

Follow `docs/prompts/TEAM-COORDINATION.md` for merge order and conflict resolution.

Merge order (Phase 1):
1. **Team Beta first** (Telemetry + Reporter) — defines the SQLite schema everything depends on
2. **Team Alpha second** (CLI Adapters + DAG Engine) — writes to telemetry tables
3. **Team Gamma last** (UI) — reads from telemetry, depends on engine events

### Step 4: Phase Gate

Before starting Phase 2:
- All Phase 1 branches merged to `main`
- Full test suite passes: `npm run test`
- Build succeeds: `npm run build`
- Smoke test: manually run one goal with Claude Code + Codex adapters

### Step 5: Launch Phase 2 Agents

Open 2 Codex GUI sessions:

**Session 4 (Team Delta):** Paste Ralph template + Phase 2 prompts (leaderboard, comparison, streaks)
**Session 5 (Team Epsilon):** Paste Ralph template + Phase 2 prompts (templates, reports)

Both work on branches:
- Team Delta: `feature/mission-control-intelligence`
- Team Epsilon: `feature/mission-control-templates-reports`

### Step 6: Final Integration

Merge Phase 2 branches (order doesn't matter — both are additive read-only features).
Run full verification. Ship.

### Phase 3 — Proactive Companion (DEFERRED)

Phase 3 is intentionally deferred until Phases 1-2 ship and stabilize. It includes:

- **Suggest Next Goal** — codebase analysis (stale deps, failing tests, TODOs, code smells) with proactive suggestions. This is the highest-risk, highest-reward feature. It introduces a fundamentally new product surface (proactive companion vs reactive tool).
- **Full content analysis with secret scrubbing** — reads file contents to generate deeper suggestions, using the secret-scrubbing layer from Phase 2's shareable reports.

**Why deferred:** Suggest Next Goal depends on a proven execution layer (Phase 1) and sufficient telemetry data to inform suggestions. Building it before the core loop works risks building intelligence on a broken foundation.

**When to start:** After Phase 2 ships, the leaderboard shows meaningful agent stats (10+ runs), and the execution engine has handled real-world edge cases.

No agent prompts are provided for Phase 3 — they should be written once Phases 1-2 learnings are incorporated.

## Ralph Loop Integration

Every agent prompt in this playbook includes Ralph loop instructions. The key behaviors:

1. **Agent never stops early.** It implements, verifies, fixes, re-verifies until ALL criteria pass.
2. **Agent self-corrects.** Test failure → diagnose → fix → re-test. Not "I tried, it failed."
3. **Agent tracks progress.** Each iteration logged to `progress.txt` in the branch.
4. **Agent produces evidence.** Completion includes actual test/build output, not "should work."

## Subagent Patterns

Within each Codex GUI session, the agent can spawn subagents for:

- **Quick lookups:** "What does function X return?" → spawn lightweight subagent
- **Test writing:** "Write tests for module Y" → spawn test-engineer subagent
- **Build fixing:** "Fix this TypeScript error" → spawn build-fixer subagent

The parent agent coordinates and verifies. Subagents do focused work.

## Emergency Procedures

**Agent stuck in loop:** If an agent reports RALPH BLOCKED after 3 attempts:
1. Read the error and root cause hypothesis
2. Provide guidance or unblock externally
3. Agent resumes from where it stopped

**Merge conflict:** Follow TEAM-COORDINATION.md conflict resolution protocol.

**Phase gate failure:** Do NOT start the next phase. Fix the failing tests/build first.

## File Index

| File | Purpose |
|------|---------|
| `docs/prompts/00-ORCHESTRATION-PLAYBOOK.md` | This file — master process |
| `docs/prompts/RALPH-LOOP-TEMPLATE.md` | Reusable Ralph loop instructions |
| `docs/prompts/TEAM-COORDINATION.md` | Merge coordination protocol |
| `docs/prompts/phase-1/01-cli-adapters.md` | CLI adapter implementation prompt |
| `docs/prompts/phase-1/02-dag-engine.md` | DAG execution engine prompt |
| `docs/prompts/phase-1/03-telemetry.md` | Telemetry collector prompt |
| `docs/prompts/phase-1/04-run-reporter.md` | Run reporter prompt |
| `docs/prompts/phase-1/05-mission-control-ui.md` | Mission Control UI prompt |
| `docs/prompts/phase-2/01-agent-leaderboard.md` | Agent leaderboard prompt |
| `docs/prompts/phase-2/02-run-comparison.md` | Run comparison prompt |
| `docs/prompts/phase-2/03-goal-templates.md` | Goal templates prompt |
| `docs/prompts/phase-2/04-time-saved-streaks.md` | Time saved + streaks prompt |
| `docs/prompts/phase-2/05-shareable-reports.md` | Shareable reports prompt |
