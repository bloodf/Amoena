# Phase 2 — Agent Leaderboard

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

**Project:** Lunaria — Multi-agent orchestration platform
**Phase:** 2 (Intelligence Layer) — depends on Phase 1 being merged and smoke-tested
**Tech stack:** TypeScript, Next.js (App Router), better-sqlite3, Vitest, React
**Branch to create:** `feature/mission-control-intelligence`

### Prerequisite: Phase 1 tables

Phase 1 must be merged before starting this work. The following SQLite tables are expected to
exist in `apps/dashboard/src/lib/db.ts` (via migrations):

```sql
-- Written by Phase 1 Telemetry agent
CREATE TABLE IF NOT EXISTS goal_runs (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  goal_id       TEXT NOT NULL,
  goal_title    TEXT NOT NULL,
  status        TEXT NOT NULL,  -- 'running' | 'completed' | 'failed'
  task_count    INTEGER NOT NULL DEFAULT 0,
  tasks_succeeded INTEGER NOT NULL DEFAULT 0,
  total_cost    REAL NOT NULL DEFAULT 0,
  total_duration_ms INTEGER NOT NULL DEFAULT 0,
  started_at    INTEGER NOT NULL,  -- unix epoch seconds
  completed_at  INTEGER,
  workspace_id  INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS task_runs (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  goal_run_id     INTEGER NOT NULL REFERENCES goal_runs(id),
  task_id         TEXT NOT NULL,
  task_title      TEXT NOT NULL,
  task_type       TEXT NOT NULL,  -- 'code' | 'test' | 'review' | 'refactor' | 'docs' | etc.
  agent_id        TEXT NOT NULL,
  status          TEXT NOT NULL,  -- 'success' | 'failed' | 'skipped'
  duration_ms     INTEGER NOT NULL DEFAULT 0,
  cost            REAL NOT NULL DEFAULT 0,
  complexity      TEXT NOT NULL DEFAULT 'M',  -- 'S' | 'M' | 'L'
  started_at      INTEGER NOT NULL,
  completed_at    INTEGER,
  workspace_id    INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS agent_performance (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  agent_id        TEXT NOT NULL,
  task_type       TEXT NOT NULL,
  total_runs      INTEGER NOT NULL DEFAULT 0,
  success_count   INTEGER NOT NULL DEFAULT 0,
  avg_duration_ms REAL NOT NULL DEFAULT 0,
  avg_cost        REAL NOT NULL DEFAULT 0,
  last_updated    INTEGER NOT NULL,
  workspace_id    INTEGER NOT NULL DEFAULT 1,
  UNIQUE(agent_id, task_type, workspace_id)
);
```

If these tables do not exist when you run tests, add a migration in
`apps/dashboard/src/lib/migrations.ts` that creates them with `CREATE TABLE IF NOT EXISTS`.
Do not drop or alter existing tables.

### Database access pattern

Always import and call `getDatabase()` from `apps/dashboard/src/lib/db.ts`:

```typescript
import { getDatabase } from "@/lib/db";

const db = getDatabase();
const rows = db.prepare("SELECT ...").all() as SomeType[];
```

Use `better-sqlite3` synchronous API throughout — no async/await on DB calls.

### File locations

```
apps/dashboard/src/
  app/api/mission-control/leaderboard/route.ts   ← Next.js API route
  components/panels/mission-control/
    leaderboard/
      LeaderboardPanel.tsx       ← main panel component
      LeaderboardTable.tsx       ← sortable/filterable table
      SuccessRateBar.tsx         ← inline bar chart
      CostComparisonChart.tsx    ← bar chart for cost
      DurationComparisonChart.tsx← bar chart for duration
      index.ts                   ← re-exports
  lib/
    leaderboard-queries.ts       ← all SQL queries, pure functions
```

---

## ACCEPTANCE CRITERIA

### AC-1: API route returns agent performance data

`GET /api/mission-control/leaderboard` returns JSON:

```typescript
interface LeaderboardEntry {
  agent_id: string;
  task_type: string;
  total_runs: number;
  success_count: number;
  success_rate: number;      // success_count / total_runs, 0-1
  avg_duration_ms: number;
  avg_cost: number;
}

interface LeaderboardResponse {
  entries: LeaderboardEntry[];
  total_runs: number;        // sum across all entries
  cold_start: boolean;       // true when total_runs < 5
}
```

- Returns 200 with `cold_start: true` and empty `entries: []` when `total_runs < 5`
- Supports query params: `?task_type=code` and `?agent_id=claude` for filtering
- Supports `?sort=success_rate|cost|speed` (default: `success_rate` DESC)
- All SQL in `leaderboard-queries.ts`, route only calls query functions

### AC-2: Cold-start empty state

When `cold_start: true`, the panel renders:

```
[icon] Run more goals to build agent stats
       Complete at least 5 tasks to see the leaderboard.
```

No table, no charts — just the empty state message with a subtle icon.

### AC-3: Success rate bars render correctly

`SuccessRateBar` component:
- Props: `rate: number` (0-1), `label: string`
- Renders a horizontal bar, width proportional to rate
- Color: green (`#22c55e`) for rate >= 0.8, amber (`#f59e0b`) for >= 0.5, red (`#ef4444`) below
- Accessible: `role="meter"`, `aria-valuenow`, `aria-valuemin="0"`, `aria-valuemax="100"`
- Shows percentage label: "85%" aligned right

### AC-4: Cost and duration comparison charts

`CostComparisonChart` and `DurationComparisonChart`:
- Props: `entries: LeaderboardEntry[]`, `highlightBest?: boolean`
- Render a horizontal bar chart using only inline SVG or CSS — no charting library imports
- Best performer highlighted with a star or bold label when `highlightBest` is true
- Duration displayed as "1.2s" or "340ms" (auto-scale)
- Cost displayed as "$0.0034" (4 significant figures)

### AC-5: Sortable table

`LeaderboardTable` component:
- Columns: Agent, Task Type, Runs, Success Rate, Avg Cost, Avg Duration
- Clicking a column header sorts by that column (toggle asc/desc)
- Active sort column shows arrow indicator (↑ or ↓)
- Default sort: success rate descending

### AC-6: Filterable by task type and agent

Above the table, render two `<select>` dropdowns:
- "All task types" / specific task type values derived from data
- "All agents" / specific agent_id values derived from data
- Filtering is client-side (no additional API calls)
- When both filters active, show count: "Showing 3 of 12 entries"

### AC-7: Tests pass

Test file: `apps/dashboard/src/components/panels/mission-control/leaderboard/LeaderboardPanel.test.tsx`

Required test cases:
- `renders cold-start empty state when total_runs < 5`
- `renders table when data is present`
- `sorts by success rate by default`
- `sorts by cost when cost column header clicked`
- `filters entries by task_type`
- `filters entries by agent_id`
- `SuccessRateBar renders correct color for rate >= 0.8`
- `SuccessRateBar renders correct color for rate < 0.5`
- `API route returns cold_start: true when total_runs < 5` (test the query function directly)

Use Vitest + React Testing Library. Mock `getDatabase()` with an in-memory SQLite database
populated with fixture data. Do not use `vi.mock` on entire modules — mock at the boundary
(the query functions or the API handler).

### AC-8: TypeScript strict compliance

- No `any` types except where interfacing with raw SQLite row objects (cast with `as RowType`)
- All props interfaces defined and exported from `index.ts`
- `npx tsc --noEmit` passes with zero errors

---

## IMPLEMENTATION NOTES

### Query pattern for leaderboard

```typescript
// apps/dashboard/src/lib/leaderboard-queries.ts
import { getDatabase } from "@/lib/db";

export interface LeaderboardEntry {
  agent_id: string;
  task_type: string;
  total_runs: number;
  success_count: number;
  success_rate: number;
  avg_duration_ms: number;
  avg_cost: number;
}

export function getLeaderboardEntries(opts: {
  task_type?: string;
  agent_id?: string;
  sort?: "success_rate" | "cost" | "speed";
}): LeaderboardEntry[] {
  const db = getDatabase();
  // Build query from agent_performance table
  // JOIN with task_runs if needed for freshness
  // Return typed rows
}

export function getTotalRunCount(): number {
  const db = getDatabase();
  const row = db.prepare(
    "SELECT COALESCE(SUM(total_runs), 0) AS total FROM agent_performance"
  ).get() as { total: number };
  return row.total;
}
```

### Component structure

`LeaderboardPanel` is the top-level component. It:
1. Fetches from `/api/mission-control/leaderboard` via `useSWR` or `useEffect`
2. Shows loading skeleton while fetching
3. Shows `cold_start` empty state if appropriate
4. Renders `LeaderboardTable` with sort/filter controls
5. Renders `CostComparisonChart` and `DurationComparisonChart` below the table

### Styling conventions

Match the existing dashboard panels in `apps/dashboard/src/components/panels/`.
Use Tailwind CSS classes. Background: `bg-gray-900`, borders: `border-gray-700`,
text: `text-gray-100` / `text-gray-400`. Cards use `rounded-lg border border-gray-700 p-4`.

### No new dependencies

Do not add new npm packages. Use only:
- React (already installed)
- Tailwind CSS (already installed)
- Inline SVG for charts
- `better-sqlite3` (already installed)
- Vitest + React Testing Library (already installed)

---

## VERIFICATION COMMANDS

```bash
# From repo root
npm run build
npm run test -- --testPathPattern=leaderboard
npx tsc --noEmit
npm run lint
```

All must pass before declaring complete.
