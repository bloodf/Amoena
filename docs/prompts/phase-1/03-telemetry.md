# Phase 1 — Prompt 03: Telemetry (SQLite Schema + Writers)

## RALPH LOOP INSTRUCTIONS

You are running in an autonomous loop. These rules are non-negotiable:

1. **Never declare done without evidence.** Every claim of completion must be backed by passing test output or a build log you actually ran. Do not say "this should work" — run it and show the output.
2. **Self-correct on failure.** If a test fails, a type error fires, or a command errors, fix the root cause and re-run. Do not move on with known failures.
3. **No scope reduction.** If something is hard, find a way. Do not silently drop acceptance criteria because they seem difficult.
4. **Iterate until green.** Keep looping — fix, verify, fix, verify — until every acceptance criterion in this document is met. Then stop.
5. **Show your work.** After each significant step, output the verification command and its result.

---

## Component Overview

Add the Mission Control telemetry schema to the existing SQLite database and implement typed writer functions for all Mission Control tables. The dashboard already has a `better-sqlite3` database at `apps/dashboard/src/lib/db.ts` with a numbered migration system. This component adds a new migration and a new module for reading/writing Mission Control data.

---

## Repository Context

- **Database file:** `apps/dashboard/src/lib/db.ts` — exports `getDatabase(): Database.Database`
- **Migrations:** `apps/dashboard/src/lib/migrations.ts` — array of `{ id: string, up(db) }` objects
- **Current highest migration ID:** Read `migrations.ts` to find the current highest number (it was at `005_users` as of the last snapshot — verify and use the next sequential number)
- **SQLite library:** `better-sqlite3` (NOT `bun:sqlite` — different package used in `packages/local-db`)
- **Package manager:** Bun
- **TypeScript:** strict mode

---

## What to Build

### 1. Migration

Add a new migration to `apps/dashboard/src/lib/migrations.ts` with id `00N_mission_control` where N is the next sequential number after the current highest migration in the file.

**Important:** Read `migrations.ts` fully before writing to find the correct N.

### 2. New telemetry module

Create `apps/dashboard/src/lib/mission-control-telemetry.ts` — all typed functions for reading and writing Mission Control data.

### 3. Tests

Create `apps/dashboard/src/lib/__tests__/mission-control-telemetry.test.ts`.

---

## Schema DDL

The migration's `up` function must execute the following DDL in a single transaction:

```sql
-- One row per high-level goal submitted by the user
CREATE TABLE IF NOT EXISTS goal_runs (
  id          TEXT    PRIMARY KEY,          -- UUID
  description TEXT    NOT NULL,             -- original user goal text
  status      TEXT    NOT NULL DEFAULT 'pending',
                                            -- pending|running|completed|partial_failure|failed|cancelled
  base_ref    TEXT    NOT NULL DEFAULT 'main',
  started_at  INTEGER NOT NULL DEFAULT (unixepoch()),
  completed_at INTEGER,
  total_cost_usd REAL,                      -- sum of all task costs, filled at completion
  merge_strategy TEXT,                      -- 'auto'|'review_required'|null
  created_at  INTEGER NOT NULL DEFAULT (unixepoch())
);

-- One row per task within a goal run
CREATE TABLE IF NOT EXISTS task_runs (
  id            TEXT    PRIMARY KEY,         -- UUID
  goal_run_id   TEXT    NOT NULL REFERENCES goal_runs(id) ON DELETE CASCADE,
  task_type     TEXT    NOT NULL,            -- implementation|review|testing|documentation|analysis|refactoring
  complexity    TEXT    NOT NULL,            -- low|medium|high
  description   TEXT    NOT NULL,
  status        TEXT    NOT NULL DEFAULT 'queued',
                                             -- queued|running|completed|failed|timed_out|cancelled|skipped
  agent_type    TEXT,                        -- e.g. 'claude-code', 'codex', 'gemini'
  routing_reason TEXT   NOT NULL DEFAULT '',-- why this agent was chosen; written at dispatch
  attempt_count INTEGER NOT NULL DEFAULT 0,
  worktree_path TEXT,
  started_at    INTEGER,
  completed_at  INTEGER,
  duration_ms   INTEGER,
  input_tokens  INTEGER,
  output_tokens INTEGER,
  cost_usd      REAL,
  error_message TEXT,
  created_at    INTEGER NOT NULL DEFAULT (unixepoch())
);

-- Aggregated per-agent statistics, updated after each task completion/failure
-- agent_type is the unique key; one row per provider
CREATE TABLE IF NOT EXISTS agent_performance (
  agent_type        TEXT    PRIMARY KEY,
  total_tasks       INTEGER NOT NULL DEFAULT 0,
  completed_tasks   INTEGER NOT NULL DEFAULT 0,
  failed_tasks      INTEGER NOT NULL DEFAULT 0,
  timed_out_tasks   INTEGER NOT NULL DEFAULT 0,
  total_duration_ms INTEGER NOT NULL DEFAULT 0,
  total_cost_usd    REAL    NOT NULL DEFAULT 0,
  avg_duration_ms   REAL    NOT NULL DEFAULT 0,   -- recomputed on each update
  success_rate      REAL    NOT NULL DEFAULT 0,   -- recomputed on each update
  last_used_at      INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at        INTEGER NOT NULL DEFAULT (unixepoch())
);

-- Serialized GoalRunState blob for crash recovery
CREATE TABLE IF NOT EXISTS goal_run_state (
  goal_id     TEXT    PRIMARY KEY REFERENCES goal_runs(id) ON DELETE CASCADE,
  state_json  TEXT    NOT NULL,
  updated_at  INTEGER NOT NULL DEFAULT (unixepoch())
);
```

Indexes to create in the same migration:

```sql
CREATE INDEX IF NOT EXISTS idx_task_runs_goal       ON task_runs(goal_run_id);
CREATE INDEX IF NOT EXISTS idx_task_runs_agent_type ON task_runs(agent_type);
CREATE INDEX IF NOT EXISTS idx_goal_runs_status     ON goal_runs(status);
```

**Migration execution pattern** — follow the existing style in `migrations.ts`:

```typescript
{
  id: "00N_mission_control",
  up: (db) => {
    db.transaction(() => {
      db.exec(`CREATE TABLE IF NOT EXISTS goal_runs ...`);
      db.exec(`CREATE TABLE IF NOT EXISTS task_runs ...`);
      db.exec(`CREATE TABLE IF NOT EXISTS agent_performance ...`);
      db.exec(`CREATE TABLE IF NOT EXISTS goal_run_state ...`);
      db.exec(`CREATE INDEX IF NOT EXISTS idx_task_runs_goal ...`);
      db.exec(`CREATE INDEX IF NOT EXISTS idx_task_runs_agent_type ...`);
      db.exec(`CREATE INDEX IF NOT EXISTS idx_goal_runs_status ...`);
    })();
  },
},
```

---

## Telemetry Module (mission-control-telemetry.ts)

All functions accept the database instance as first parameter (do not call `getDatabase()` internally — let the caller inject it). This makes testing trivial.

### Types

```typescript
import type Database from "better-sqlite3";

export type GoalRunStatus =
  | "pending" | "running" | "completed" | "partial_failure" | "failed" | "cancelled";

export type TaskStatus =
  | "queued" | "running" | "completed" | "failed" | "timed_out" | "cancelled" | "skipped";

export interface GoalRunRow {
  id: string;
  description: string;
  status: GoalRunStatus;
  base_ref: string;
  started_at: number;
  completed_at: number | null;
  total_cost_usd: number | null;
  merge_strategy: string | null;
  created_at: number;
}

export interface TaskRunRow {
  id: string;
  goal_run_id: string;
  task_type: string;
  complexity: string;
  description: string;
  status: TaskStatus;
  agent_type: string | null;
  routing_reason: string;
  attempt_count: number;
  worktree_path: string | null;
  started_at: number | null;
  completed_at: number | null;
  duration_ms: number | null;
  input_tokens: number | null;
  output_tokens: number | null;
  cost_usd: number | null;
  error_message: string | null;
  created_at: number;
}

export interface AgentPerformanceRow {
  agent_type: string;
  total_tasks: number;
  completed_tasks: number;
  failed_tasks: number;
  timed_out_tasks: number;
  total_duration_ms: number;
  total_cost_usd: number;
  avg_duration_ms: number;
  success_rate: number;
  last_used_at: number;
  updated_at: number;
}
```

### Goal Run Writers

```typescript
export function insertGoalRun(
  db: Database.Database,
  run: Pick<GoalRunRow, "id" | "description" | "base_ref">,
): void

export function updateGoalRunStatus(
  db: Database.Database,
  goalId: string,
  status: GoalRunStatus,
  completedAt?: number,
  totalCostUsd?: number,
  mergeStrategy?: string,
): void
```

### Task Run Writers

```typescript
export function insertTaskRun(
  db: Database.Database,
  task: Pick<TaskRunRow, "id" | "goal_run_id" | "task_type" | "complexity" | "description">,
): void

export function updateTaskRunDispatched(
  db: Database.Database,
  taskId: string,
  agentType: string,
  routingReason: string,
  startedAt: number,
  worktreePath: string,
): void

export function updateTaskRunCompleted(
  db: Database.Database,
  taskId: string,
  result: {
    status: TaskStatus;
    completedAt: number;
    durationMs: number;
    inputTokens: number | null;
    outputTokens: number | null;
    costUsd: number | null;
    errorMessage: string | null;
    attemptCount: number;
  },
): void
```

### agent_performance Update

`agent_performance` is updated via `INSERT OR REPLACE` — **not** triggers. Call this function after each `updateTaskRunCompleted`:

```typescript
export function upsertAgentPerformance(
  db: Database.Database,
  agentType: string,
  delta: {
    durationMs: number;
    costUsd: number;
    status: TaskStatus;
  },
): void
```

Implementation:
1. Read current row for `agentType` (may not exist yet)
2. Compute new totals and derived fields:
   - `total_tasks += 1`
   - `completed_tasks += 1` if `status === "completed"`
   - `failed_tasks += 1` if `status === "failed"`
   - `timed_out_tasks += 1` if `status === "timed_out"`
   - `total_duration_ms += durationMs`
   - `total_cost_usd += costUsd ?? 0`
   - `avg_duration_ms = total_duration_ms / total_tasks`
   - `success_rate = completed_tasks / total_tasks`
3. `INSERT OR REPLACE INTO agent_performance (...) VALUES (...)`

### Crash Recovery Writers

```typescript
export function saveGoalRunState(
  db: Database.Database,
  goalId: string,
  stateJson: string,
): void
// INSERT OR REPLACE INTO goal_run_state (goal_id, state_json, updated_at)

export function loadGoalRunState(
  db: Database.Database,
  goalId: string,
): string | null
// Returns state_json or null if not found

export function deleteGoalRunState(
  db: Database.Database,
  goalId: string,
): void
// Called after successful completion to clean up recovery state
```

### Readers

```typescript
export function getGoalRun(
  db: Database.Database,
  goalId: string,
): GoalRunRow | null

export function listGoalRuns(
  db: Database.Database,
  limit?: number,
  offset?: number,
): GoalRunRow[]

export function getTaskRunsForGoal(
  db: Database.Database,
  goalId: string,
): TaskRunRow[]

export function getAgentPerformance(
  db: Database.Database,
): AgentPerformanceRow[]

export function getAgentPerformanceByType(
  db: Database.Database,
  agentType: string,
): AgentPerformanceRow | null
```

---

## Disk-Full Resilience

Every write function must wrap its DB statement in a `try/catch`. On `SQLITE_FULL` or any disk-related error:
- Log a warning: `console.warn("[mission-control-telemetry] write failed — disk may be full:", err)`
- Re-throw only if the caller is `saveGoalRunState` (crash recovery state is critical; surface the error)
- For all other write functions, swallow the error silently after logging

Implement a shared helper:

```typescript
function safeWrite(
  fn: () => void,
  critical = false,
): void {
  try {
    fn();
  } catch (err) {
    console.warn("[mission-control-telemetry] write failed:", err);
    if (critical) throw err;
  }
}
```

---

## Router→Reporter Contract

The `routing_reason` column in `task_runs` is the primary link between the DAG engine's routing decision and the reporter's explanation. The format is:

```
"matrix:<task_type>/<complexity>→<adapter_id>"
  e.g. "matrix:implementation/high→claude-code"

"override:<adapter_id>"
  e.g. "override:codex"

"fallback:<original_adapter_id>→<fallback_adapter_id>"
  e.g. "fallback:codex→claude-code"
```

The telemetry module does not produce these strings — the DAG engine router does. The telemetry module stores them verbatim. The reporter reads them verbatim. Document this contract in a comment at the top of `mission-control-telemetry.ts`:

```typescript
/**
 * routing_reason format (set by dag-engine/router.ts, read by run-reporter):
 *   "matrix:<task_type>/<complexity>→<adapter_id>"
 *   "override:<adapter_id>"
 *   "fallback:<original>→<fallback>"
 */
```

---

## Acceptance Criteria

1. **Migration runs cleanly:** Starting from a fresh DB (delete the test DB), running all migrations creates all four tables and three indexes with no errors.
2. **Migration is idempotent:** Running migrations twice (simulated via double-call) does not throw — `IF NOT EXISTS` guards are present on all DDL.
3. **insertGoalRun + getGoalRun round-trip:** Insert a row and read it back; all fields match.
4. **Task lifecycle:** `insertTaskRun` → `updateTaskRunDispatched` → `updateTaskRunCompleted` with status `completed` → row has all fields set correctly.
5. **upsertAgentPerformance aggregation:** After 3 task completions (2 succeeded, 1 failed) for the same agent, `agent_performance` row shows `total_tasks=3, completed_tasks=2, failed_tasks=1, success_rate≈0.667`.
6. **upsertAgentPerformance creates row if absent:** First call for a new agent type creates the row; no pre-existing row required.
7. **saveGoalRunState → loadGoalRunState → deleteGoalRunState:** Round-trip works; delete removes the row.
8. **Disk-full resilience:** Simulate a write error by wrapping `db.prepare` to throw. Non-critical writes are swallowed after logging. `saveGoalRunState` re-throws.
9. **Foreign key enforcement:** Inserting a `task_run` with a non-existent `goal_run_id` throws (FK constraint enabled in db.ts via `PRAGMA foreign_keys = ON`).
10. **No TypeScript errors:** `bun tsc --noEmit` in `apps/dashboard` passes clean.

---

## Test Requirements

Location: `apps/dashboard/src/lib/__tests__/mission-control-telemetry.test.ts`

Use an in-memory SQLite database for all tests:

```typescript
import Database from "better-sqlite3";
import { runMigrations } from "../migrations";

function makeTestDb(): Database.Database {
  const db = new Database(":memory:");
  db.pragma("foreign_keys = ON");
  runMigrations(db);
  return db;
}
```

Test cases:

```
migration
  ✓ creates goal_runs table
  ✓ creates task_runs table
  ✓ creates agent_performance table
  ✓ creates goal_run_state table
  ✓ creates idx_task_runs_goal index
  ✓ double-migration is idempotent (no error)

goal_runs CRUD
  ✓ insertGoalRun creates row with default status "pending"
  ✓ updateGoalRunStatus sets status and completed_at
  ✓ getGoalRun returns null for unknown id
  ✓ listGoalRuns respects limit/offset

task_runs CRUD
  ✓ insertTaskRun creates row with status "queued"
  ✓ updateTaskRunDispatched sets agent_type, routing_reason, started_at, worktree_path, status "running"
  ✓ updateTaskRunCompleted sets duration_ms, tokens, cost, status
  ✓ getTaskRunsForGoal returns all tasks for a goal
  ✓ FK violation on unknown goal_run_id throws

agent_performance
  ✓ upsertAgentPerformance creates row on first call
  ✓ multiple completions accumulate correctly
  ✓ success_rate and avg_duration_ms are recomputed correctly
  ✓ failed status increments failed_tasks not completed_tasks

crash recovery
  ✓ saveGoalRunState + loadGoalRunState round-trip
  ✓ deleteGoalRunState removes row; subsequent load returns null

disk-full resilience
  ✓ failed insertGoalRun is swallowed (non-critical)
  ✓ failed saveGoalRunState re-throws (critical)
```

---

## Dependencies on Other Components

- **None** — this component has no runtime dependencies on other Phase 1 components
- **Receives from:** DAG engine calls these writer functions after state transitions
- **Shared DB instance:** Uses `getDatabase()` from `apps/dashboard/src/lib/db.ts` in production; accepts injected `Database.Database` for tests

---

## What This Provides to Other Components

- `02-dag-engine.md` calls writer functions after each task state transition
- `04-run-reporter.md` calls reader functions to generate post-run reports
- `05-mission-control-ui.md` calls reader functions on WS reconnect for state rehydration

---

## Files to Modify / Create

| Path | Action |
|---|---|
| `apps/dashboard/src/lib/migrations.ts` | Add new migration (append to array) |
| `apps/dashboard/src/lib/mission-control-telemetry.ts` | New file: all typed writer/reader functions |
| `apps/dashboard/src/lib/__tests__/mission-control-telemetry.test.ts` | New test file |

---

## Verification Commands

```bash
# Type check dashboard
cd apps/dashboard && bun tsc --noEmit

# Run telemetry tests
bun test src/lib/__tests__/mission-control-telemetry.test.ts

# Verify migration number is sequential (no gaps or duplicates)
grep "id:" src/lib/migrations.ts | grep -E "^.*\"[0-9]+"
```
