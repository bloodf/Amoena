# Phase 2 — Time Saved & Streaks

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
**Same branch as:** `01-agent-leaderboard.md` and `02-run-comparison.md`

### What this feature does

Displays two motivational metrics in the Mission Control header/status bar:

1. **Time Saved** — a running total of estimated human-hours saved by automation, calculated
   on-demand from `task_runs`. Each completed task is multiplied by a complexity-based human
   estimate (S=1h, M=4h, L=8h).

2. **Streaks** — consecutive calendar days on which at least one `goal_run` completed
   successfully. Stored in a `settings` table, recalculated on each page load.

### Prerequisite: Phase 1 tables

```sql
CREATE TABLE IF NOT EXISTS task_runs (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  goal_run_id     INTEGER NOT NULL REFERENCES goal_runs(id),
  task_id         TEXT NOT NULL,
  task_title      TEXT NOT NULL,
  task_type       TEXT NOT NULL,
  agent_id        TEXT NOT NULL,
  status          TEXT NOT NULL,   -- 'success' | 'failed' | 'skipped'
  duration_ms     INTEGER NOT NULL DEFAULT 0,
  cost            REAL NOT NULL DEFAULT 0,
  complexity      TEXT NOT NULL DEFAULT 'M',   -- 'S' | 'M' | 'L'
  started_at      INTEGER NOT NULL,
  completed_at    INTEGER,
  workspace_id    INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS goal_runs (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  goal_id         TEXT NOT NULL,
  goal_title      TEXT NOT NULL,
  status          TEXT NOT NULL,
  task_count      INTEGER NOT NULL DEFAULT 0,
  tasks_succeeded INTEGER NOT NULL DEFAULT 0,
  total_cost      REAL NOT NULL DEFAULT 0,
  total_duration_ms INTEGER NOT NULL DEFAULT 0,
  started_at      INTEGER NOT NULL,
  completed_at    INTEGER,
  workspace_id    INTEGER NOT NULL DEFAULT 1
);
```

### New table: settings

Add a migration in `apps/dashboard/src/lib/migrations.ts`:

```sql
CREATE TABLE IF NOT EXISTS settings (
  key          TEXT NOT NULL,
  value        TEXT NOT NULL,
  workspace_id INTEGER NOT NULL DEFAULT 1,
  updated_at   INTEGER NOT NULL,
  PRIMARY KEY (key, workspace_id)
);
```

Used to persist streak state. Do not drop or alter existing tables.

### Database access pattern

```typescript
import { getDatabase } from "@/lib/db";

const db = getDatabase();
// better-sqlite3 — synchronous API only
const row = db.prepare("SELECT value FROM settings WHERE key = ? AND workspace_id = ?")
  .get("streak", 1) as { value: string } | undefined;
```

### File locations

```
apps/dashboard/src/
  app/api/mission-control/
    stats/route.ts               ← GET time-saved + streak data
  components/panels/mission-control/
    stats/
      TimeSavedBadge.tsx         ← hours saved display
      StreakBadge.tsx            ← streak display with flame icon
      StatsBar.tsx               ← container: TimeSavedBadge + StreakBadge
      index.ts                   ← re-exports
  lib/
    stats-queries.ts             ← all SQL queries + streak computation
```

`StatsBar` should be importable by the Mission Control panel header.

---

## COMPLEXITY MAPPING

This is the authoritative mapping — do not deviate:

| Complexity | Human estimate |
|------------|---------------|
| `S`        | 1 hour         |
| `M`        | 4 hours        |
| `L`        | 8 hours        |

Only count `task_runs` where `status = 'success'`.
Skipped and failed tasks save zero human-hours.

---

## ACCEPTANCE CRITERIA

### AC-1: Time saved API

`GET /api/mission-control/stats` returns:

```typescript
interface StatsResponse {
  time_saved: {
    total_hours: number;       // sum across all completed tasks
    total_tasks: number;       // count of successful task_runs
    breakdown: {
      S: number;               // count of S tasks completed
      M: number;               // count of M tasks completed
      L: number;               // count of L tasks completed
    };
  };
  streak: {
    current: number;           // consecutive days with >= 1 completed goal_run
    longest: number;           // historical longest streak
    last_active_date: string | null;  // ISO date string "2026-03-23" or null
    is_first_day: boolean;     // true when current = 1 and no prior streak exists
  };
}
```

- `total_hours` is a float: `(S_count * 1) + (M_count * 4) + (L_count * 8)`
- `total_hours` rounded to 1 decimal place
- All SQL in `stats-queries.ts`, route only calls query functions

### AC-2: Time saved calculation is correct

Calculation rules:
- Query: `SELECT complexity, COUNT(*) as cnt FROM task_runs WHERE status = 'success' GROUP BY complexity`
- Apply mapping: S→1, M→4, L→8
- Sum to `total_hours`
- Unknown complexity values (anything not S/M/L) are treated as M (4h) — do not throw

### AC-3: Streak calculation

Streak logic (implement in `stats-queries.ts` as a pure function `computeStreak`):

1. Fetch all distinct calendar dates (UTC) on which at least one `goal_run` with
   `status = 'completed'` exists: `DATE(completed_at, 'unixepoch') AS day`
2. Sort dates descending
3. Starting from today's UTC date, count consecutive days
4. If today has no completed run, check if yesterday does — if yes, streak is still alive
   (user hasn't had a chance to run today yet)
5. If yesterday also has no run, streak is broken: current = 0
6. `longest` is stored in settings table under key `streak_longest`; update it whenever
   `current > longest`

Persist to settings:
```
key = "streak_current"   value = "7"
key = "streak_longest"   value = "14"
key = "streak_last_date" value = "2026-03-23"
```

### AC-4: First-day state

`is_first_day = true` when:
- `current = 1` AND
- `longest <= 1` AND
- The settings table has no prior `streak_longest` > 1

This is the "Start your streak!" state.

### AC-5: TimeSavedBadge renders correctly

Props:
```typescript
interface TimeSavedBadgeProps {
  total_hours: number;
  total_tasks: number;
}
```

Display rules:
- `total_hours = 0`: show "0h saved"
- `total_hours < 1`: show "30m saved" (convert to minutes, round to nearest 30)
- `1 <= total_hours < 100`: show "12.5h saved" (1 decimal)
- `total_hours >= 100`: show "142h saved" (no decimal)
- Tooltip on hover: "Based on [N] completed tasks (S=1h, M=4h, L=8h estimate)"
- Icon: clock or lightning bolt (use an SVG inline icon, no icon library)

### AC-6: StreakBadge renders correctly

Props:
```typescript
interface StreakBadgeProps {
  current: number;
  longest: number;
  is_first_day: boolean;
}
```

Display rules:
- `current = 0`: show "Start your streak!" in muted text (gray)
- `is_first_day = true`: show "1-day streak! 🔥 Keep going!" in amber
- `current >= 2 and current < 7`: show "[N]-day streak 🔥" in amber
- `current >= 7`: show "[N]-day streak 🔥" in orange, bold
- `current >= 30`: show "[N]-day streak 🔥" in red, bold, with pulse animation class
- Tooltip: "Longest streak: [longest] days"
- Use Tailwind CSS for all styling — no inline styles

### AC-7: StatsBar integrates both badges

`StatsBar`:
- Fetches from `/api/mission-control/stats` via `useEffect` + `useState`
- Shows a skeleton placeholder (two gray rounded rectangles) while loading
- Renders `<TimeSavedBadge>` and `<StreakBadge>` side-by-side
- If fetch fails: shows "Stats unavailable" in muted text, does not throw
- Accepts an optional `className` prop for positioning by the parent panel

### AC-8: Streak reset logic

Streak resets (current = 0) when:
- There are no completed goal_runs at all (cold start)
- The most recent completed goal_run's date is before yesterday (UTC)

Streak does NOT reset if:
- Today has no completed run but yesterday does (streak is "alive today")
- The user completed multiple runs on the same day (still counts as 1 day)

### AC-9: Tests pass

Test file: `apps/dashboard/src/components/panels/mission-control/stats/StatsBar.test.tsx`

Required test cases (use Vitest + React Testing Library):
- `TimeSavedBadge shows "0h saved" when total_hours is 0`
- `TimeSavedBadge shows minutes when total_hours < 1`
- `TimeSavedBadge shows hours to 1 decimal when 1 <= total_hours < 100`
- `TimeSavedBadge shows rounded hours when total_hours >= 100`
- `StreakBadge shows "Start your streak!" when current is 0`
- `StreakBadge shows first-day message when is_first_day is true`
- `StreakBadge shows amber styling for streaks 2-6`
- `StreakBadge shows bold orange for streaks >= 7`
- `computeStreak returns 0 when no completed runs exist`
- `computeStreak counts consecutive days correctly`
- `computeStreak keeps streak alive when today has no run but yesterday does`
- `computeStreak resets to 0 when last run was 2+ days ago`
- `computeTimeSaved multiplies S by 1, M by 4, L by 8`
- `computeTimeSaved counts only success status tasks`
- `computeTimeSaved treats unknown complexity as M`
- `StatsBar shows skeleton while loading`
- `StatsBar shows "Stats unavailable" on fetch error`

Test `computeStreak` and `computeTimeSaved` as pure functions — pass arrays of fixture data
directly, no DB mocking needed for the pure functions.

For component tests, mock the `fetch` call to return fixture data.

### AC-10: TypeScript strict compliance

- No `any` types except raw SQLite row casts
- All props and response interfaces exported from `index.ts`
- `npx tsc --noEmit` passes with zero errors

---

## IMPLEMENTATION NOTES

### Pure calculation functions (no DB access)

```typescript
// Pure — easy to test
export function computeTimeSaved(tasks: Array<{ complexity: string; status: string }>): {
  total_hours: number;
  total_tasks: number;
  breakdown: { S: number; M: number; L: number };
} {
  const HOURS: Record<string, number> = { S: 1, M: 4, L: 8 };
  const breakdown = { S: 0, M: 0, L: 0 };
  let total_hours = 0;
  let total_tasks = 0;

  for (const task of tasks) {
    if (task.status !== "success") continue;
    const complexity = task.complexity in HOURS ? task.complexity : "M";
    const hours = HOURS[complexity];
    breakdown[complexity as keyof typeof breakdown]++;
    total_hours += hours;
    total_tasks++;
  }

  return {
    total_hours: Math.round(total_hours * 10) / 10,
    total_tasks,
    breakdown,
  };
}

// Pure — easy to test
export function computeStreak(
  completedDates: string[],  // ISO date strings "2026-03-23", sorted descending
  todayUTC: string           // ISO date string for today
): { current: number; is_first_day: boolean } {
  // implement consecutive-day counting logic here
}
```

### Settings persistence

```typescript
export function getSetting(key: string, workspaceId = 1): string | null {
  const db = getDatabase();
  const row = db.prepare(
    "SELECT value FROM settings WHERE key = ? AND workspace_id = ?"
  ).get(key, workspaceId) as { value: string } | undefined;
  return row?.value ?? null;
}

export function setSetting(key: string, value: string, workspaceId = 1): void {
  const db = getDatabase();
  const now = Math.floor(Date.now() / 1000);
  db.prepare(
    "INSERT INTO settings (key, value, workspace_id, updated_at) VALUES (?, ?, ?, ?) ON CONFLICT(key, workspace_id) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at"
  ).run(key, value, workspaceId, now);
}
```

### Styling conventions

Match existing dashboard panels: Tailwind CSS, `bg-gray-900` background,
`border-gray-700` borders. `StatsBar` should render as a compact horizontal strip
suitable for embedding in a panel header: `flex items-center gap-4 px-4 py-2`.

### No new dependencies

Do not add new npm packages. Use only what is already installed.

---

## VERIFICATION COMMANDS

```bash
# From repo root
npm run build
npm run test -- --testPathPattern=stats
npx tsc --noEmit
npm run lint
```

All must pass before declaring complete.
