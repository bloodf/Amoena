# Phase 2 — Run Comparison

> Paste this entire file into a Codex GUI session. It is self-contained.
> No other files are needed to begin implementation.

---

## RALPH LOOP INSTRUCTIONS

You are operating in **Ralph Mode** — a persistence loop that keeps working until ALL tasks are
verified complete. You do NOT stop when you think you're done. You stop when the EVIDENCE proves
you're done.

### Core Rules

1. **Never declare done without evidence.** After implementing, run the relevant verification
   (tests, build, typecheck) and READ the output. "Should work" is not evidence. Green output is.

2. **Self-correct on failure.** If a test fails, a build breaks, or typecheck errors — FIX IT
   and re-run. Do not ask for help unless you have tried 3 different approaches.

3. **No scope reduction.** Implement ALL acceptance criteria listed below. Do not skip edge cases,
   error handling, or tests.

4. **Track progress.** After completing each criterion, note it as DONE. Log iterations to
   `progress.txt` in your branch root.

5. **Iterate until green.** Loop: IMPLEMENT → VERIFY → FIX → VERIFY → ALL GREEN → DONE.

### Iteration Protocol

```
ITERATION N:
  1. Read the acceptance criteria below
  2. Identify which criteria are NOT yet met
  3. Implement the next unmet criterion
  4. Run verification:
     - npm run build          (must pass)
     - npm run test           (must pass)
     - npx tsc --noEmit       (must pass)
  5. Read the output. If ANY check fails:
     - Diagnose the failure
     - Fix the root cause
     - Go to step 4
  6. Mark criterion DONE
  7. If more criteria remain, go to step 2
  8. If ALL criteria are DONE, proceed to Final Verification
```

### Final Verification

```bash
npm run build
npm run test
npx tsc --noEmit
npm run lint
```

Read EVERY line of output. Only declare complete when all four pass.

### Completion Promise

When truly done, output EXACTLY:

```
RALPH COMPLETE ✓
- All acceptance criteria verified with evidence
- Build: PASS
- Tests: PASS
- TypeScript: PASS
- Files changed: [list]
- Iterations: [N]
```

### Failure Escalation

After hitting the same error 3 times with different approaches, output:

```
RALPH BLOCKED
- Error: [description]
- Attempted: [approach 1], [approach 2], [approach 3]
- Root cause hypothesis: [your best guess]
- Recommended action: [what the human should do]
```

---

## CONTEXT

**Project:** Amoena — Multi-agent orchestration platform
**Phase:** 2 (Intelligence Layer) — depends on Phase 1 being merged and smoke-tested
**Tech stack:** TypeScript, Next.js (App Router), better-sqlite3, Vitest, React
**Branch to create:** `feature/mission-control-intelligence`
**Same branch as:** `01-agent-leaderboard.md` — coordinate if running simultaneously

### Prerequisite: Phase 1 tables

The following SQLite tables must exist (created by Phase 1 Telemetry migrations):

```sql
CREATE TABLE IF NOT EXISTS goal_runs (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  goal_id         TEXT NOT NULL,
  goal_title      TEXT NOT NULL,
  status          TEXT NOT NULL,  -- 'running' | 'completed' | 'failed'
  task_count      INTEGER NOT NULL DEFAULT 0,
  tasks_succeeded INTEGER NOT NULL DEFAULT 0,
  total_cost      REAL NOT NULL DEFAULT 0,
  total_duration_ms INTEGER NOT NULL DEFAULT 0,
  started_at      INTEGER NOT NULL,
  completed_at    INTEGER,
  workspace_id    INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS task_runs (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  goal_run_id     INTEGER NOT NULL REFERENCES goal_runs(id),
  task_id         TEXT NOT NULL,
  task_title      TEXT NOT NULL,
  task_type       TEXT NOT NULL,
  agent_id        TEXT NOT NULL,
  status          TEXT NOT NULL,  -- 'success' | 'failed' | 'skipped'
  duration_ms     INTEGER NOT NULL DEFAULT 0,
  cost            REAL NOT NULL DEFAULT 0,
  complexity      TEXT NOT NULL DEFAULT 'M',
  started_at      INTEGER NOT NULL,
  completed_at    INTEGER,
  workspace_id    INTEGER NOT NULL DEFAULT 1
);
```

If these tables do not exist when you run tests, add a migration in
`apps/dashboard/src/lib/migrations.ts` using `CREATE TABLE IF NOT EXISTS`.

### Database access pattern

```typescript
import { getDatabase } from "@/lib/db";

const db = getDatabase();
// better-sqlite3 — synchronous API only, no async/await
const rows = db.prepare("SELECT ...").all() as SomeType[];
const row  = db.prepare("SELECT ...").get(id) as SomeType | undefined;
```

### File locations

```
apps/dashboard/src/
  app/api/mission-control/
    runs/route.ts                 ← list completed runs for selector
    runs/[id]/route.ts            ← single run detail
    compare/route.ts              ← comparison endpoint
  components/panels/mission-control/
    comparison/
      ComparisonPanel.tsx          ← main panel, run selectors + result
      RunSelector.tsx              ← dropdown to select a completed run
      ComparisonResult.tsx         ← side-by-side display
      AxisIndicator.tsx            ← green/red win indicator per axis
      TaskBreakdownTable.tsx       ← per-task diff table
      index.ts                     ← re-exports
  lib/
    comparison-queries.ts          ← all SQL queries, pure functions
```

---

## ACCEPTANCE CRITERIA

### AC-1: List completed runs API

`GET /api/mission-control/runs?status=completed` returns:

```typescript
interface RunSummary {
  id: number;
  goal_id: string;
  goal_title: string;
  task_count: number;
  tasks_succeeded: number;
  total_cost: number;
  total_duration_ms: number;
  completed_at: number;  // unix epoch seconds
}

interface RunsResponse {
  runs: RunSummary[];
  has_enough: boolean;   // true when runs.length >= 2
}
```

- Only returns runs with `status = 'completed'`
- Ordered by `completed_at DESC`
- Limit 50

### AC-2: Single run detail API

`GET /api/mission-control/runs/[id]` returns:

```typescript
interface RunDetail extends RunSummary {
  tasks: TaskRunDetail[];
}

interface TaskRunDetail {
  task_id: string;
  task_title: string;
  task_type: string;
  agent_id: string;
  status: string;
  duration_ms: number;
  cost: number;
}
```

- Returns 404 with `{ error: "Run not found" }` when id does not exist
- Includes all task_runs rows joined to the goal_run

### AC-3: Comparison API

`GET /api/mission-control/compare?run_a=1&run_b=2` returns:

```typescript
interface ComparisonResponse {
  run_a: RunDetail;
  run_b: RunDetail;
  axes: {
    cost:    { winner: "a" | "b" | "tie"; delta_pct: number };
    time:    { winner: "a" | "b" | "tie"; delta_pct: number };
    success: { winner: "a" | "b" | "tie"; delta_pct: number };
  };
}
```

Winner logic:
- **cost**: lower `total_cost` wins
- **time**: lower `total_duration_ms` wins
- **success**: higher `tasks_succeeded / task_count` wins
- Tie when values are equal (or both task_count = 0)
- `delta_pct`: absolute percentage difference, e.g. `0.23` means 23% better

Returns 400 with `{ error: "Two distinct completed run IDs are required" }` if:
- `run_a` or `run_b` missing
- `run_a === run_b`
- Either run does not exist or is not `status = 'completed'`

### AC-4: Disabled state when fewer than 2 completed runs

`ComparisonPanel` checks `has_enough` from the runs list API.

When `has_enough: false`, renders:

```
[icon] Not enough data yet
       Complete at least 2 goal runs to enable comparison.
```

The run selector dropdowns are rendered but disabled (`disabled` attribute set).

### AC-5: Run selectors

`RunSelector` component:
- Props: `runs: RunSummary[]`, `value: number | null`, `onChange: (id: number) => void`,
  `disabled?: boolean`, `label: string`
- Renders a `<select>` with each run as an option
- Option label format: `"[goal_title] — [date] ($[cost])"` where date is locale short date
- Placeholder option: `"Select a run..."` with value `""`
- When the same run is selected in both selectors, shows a warning:
  `"Select two different runs to compare"`

### AC-6: Side-by-side comparison display

`ComparisonResult` component receives `ComparisonResponse` and renders:

**Header row:**
```
[Run A title]           [Run B title]
[date]                  [date]
```

**Three axis rows** (rendered by `AxisIndicator`):
```
Cost:     $0.0124  🟢  vs  $0.0187  🔴   (A wins, 34% cheaper)
Time:     1.2s     🔴  vs  0.8s     🟢   (B wins, 50% faster)
Success:  90%      🟢  vs  70%      🔴   (A wins, 29% higher)
```

`AxisIndicator` props:
```typescript
interface AxisIndicatorProps {
  label: string;
  value_a: string;   // formatted string
  value_b: string;   // formatted string
  winner: "a" | "b" | "tie";
  delta_pct: number;
  unit: string;      // "cheaper" | "faster" | "higher"
}
```

Green circle for winner, red circle for loser, yellow circle for tie.
Both sides yellow on tie, delta shows "equal".

### AC-7: Per-task breakdown table

`TaskBreakdownTable` component:

Columns: Task, Type, Run A Agent, Run A Result, Run B Agent, Run B Result

- Matches tasks between the two runs by `task_id`
- Tasks present in run A but not B: show "—" in B columns
- Tasks present in run B but not A: show "—" in A columns
- Agent cell: show `agent_id`
- Result cell: "✓ success" (green) or "✗ failed" (red) or "⊘ skipped" (gray)
- Table is scrollable if more than 10 rows

### AC-8: Tests pass

Test file: `apps/dashboard/src/components/panels/mission-control/comparison/ComparisonPanel.test.tsx`

Required test cases:
- `renders disabled state when fewer than 2 completed runs`
- `renders run selectors when runs are available`
- `shows warning when same run selected in both selectors`
- `ComparisonResult renders correct winner indicators`
- `AxisIndicator shows tie state correctly`
- `TaskBreakdownTable matches tasks by task_id`
- `TaskBreakdownTable shows dash for tasks only in one run`
- `comparison API returns 400 when run_a equals run_b`
- `comparison API returns 400 when a run is not completed`
- `winner logic: lower cost wins`
- `winner logic: lower duration wins`
- `winner logic: higher success rate wins`
- `delta_pct calculation is correct`

Use Vitest + React Testing Library. Mock `getDatabase()` at the query-function boundary.

### AC-9: TypeScript strict compliance

- No `any` types except raw SQLite row casts
- All props interfaces exported from `index.ts`
- `npx tsc --noEmit` passes with zero errors

---

## IMPLEMENTATION NOTES

### Comparison query functions

```typescript
// apps/dashboard/src/lib/comparison-queries.ts

export function getCompletedRuns(workspaceId = 1): RunSummary[] { ... }

export function getRunDetail(id: number, workspaceId = 1): RunDetail | null { ... }

export function computeComparison(
  run_a: RunDetail,
  run_b: RunDetail
): ComparisonResponse["axes"] {
  // Pure function — no DB access
  // Compute winner and delta_pct for each axis
}
```

Keep `computeComparison` as a pure function with no DB access so it is trivially testable.

### Delta percentage formula

```
delta_pct = Math.abs(a - b) / Math.max(a, b)
```

When `Math.max(a, b) === 0`, delta_pct = 0 (tie).

### Formatting helpers

```typescript
function formatCost(cost: number): string {
  if (cost === 0) return "$0.00";
  if (cost < 0.01) return `$${cost.toFixed(4)}`;
  return `$${cost.toFixed(2)}`;
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

function formatSuccessRate(succeeded: number, total: number): string {
  if (total === 0) return "N/A";
  return `${Math.round((succeeded / total) * 100)}%`;
}
```

### Styling conventions

Match existing dashboard panels: Tailwind CSS, `bg-gray-900` background,
`border-gray-700` borders, `text-gray-100` primary text, `text-gray-400` secondary.
Winner highlight: `text-green-400`. Loser: `text-red-400`. Tie: `text-yellow-400`.

### No new dependencies

Do not add new npm packages. Use only what is already installed:
React, Tailwind, better-sqlite3, Vitest, React Testing Library.

---

## VERIFICATION COMMANDS

```bash
# From repo root
npm run build
npm run test -- --testPathPattern=comparison
npx tsc --noEmit
npm run lint
```

All must pass before declaring complete.
