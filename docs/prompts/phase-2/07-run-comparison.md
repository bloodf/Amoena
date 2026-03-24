# Phase 2 — Prompt 07: Run Comparison

## RALPH LOOP INSTRUCTIONS

You are running in an autonomous loop. These rules are non-negotiable:

1. **Never declare done without evidence.** Every claim of completion must be backed by passing test output or a build log you actually ran. Do not say "this should work" — run it and show the output.
2. **Self-correct on failure.** If a test fails, a type error fires, or a command errors, fix the root cause and re-run. Do not move on with known failures.
3. **No scope reduction.** If something is hard, find a way. Do not silently drop acceptance criteria because they seem difficult.
4. **Iterate until green.** Keep looping — fix, verify, fix, verify — until every acceptance criterion in this document is met. Then stop.
5. **Show your work.** After each significant step, output the verification command and its result.

---

## Component Overview

Build the Run Comparison feature — a side-by-side diff view that lets users pick two (or more) completed goal runs and compare them across every dimension: duration, cost, agent allocation, task outcomes, routing decisions, and issues. This is the "git diff for goal runs" — it highlights what changed between runs and surfaces regressions or improvements.

---

## Repository Context

- **Monorepo root:** `/Users/heitor/Developer/github.com/Lunaria/lunaria`
- **Telemetry module (Phase 1):** `apps/dashboard/src/lib/mission-control-telemetry.ts`
- **Run reporter (Phase 1):** `apps/dashboard/src/lib/run-reporter.ts` — exports `RunReport`, `generateReport()`
- **Mission Control UI (Phase 1):** `apps/dashboard/src/components/panels/mission-control/`
- **Design tokens:** `apps/dashboard/src/components/panels/mission-control/tokens.ts`
- **i18n:** `next-intl` v4.8.3 — `useTranslations("missionControl")`
- **Package manager:** Bun
- **Test framework:** Vitest v2.1.5

---

## What to Build

### 1. Comparison queries module

Create `apps/dashboard/src/lib/comparison-queries.ts`

### 2. Comparison UI components

Create `apps/dashboard/src/components/panels/mission-control/comparison/`

### 3. Tests

---

## Query Module (comparison-queries.ts)

### Types

```typescript
export interface RunComparisonResult {
  runs: RunSummary[];
  deltas: ComparisonDelta[];
  taskDiffs: TaskDiff[];
  agentDiffs: AgentDiff[];
  verdict: ComparisonVerdict;
}

export interface RunSummary {
  goalId: string;
  description: string;
  status: GoalRunStatus;
  startedAt: number;
  completedAt: number | null;
  totalDurationMs: number | null;
  totalCostUsd: number;
  taskCount: number;
  completedCount: number;
  failedCount: number;
}

export interface ComparisonDelta {
  metric: string;             // "duration" | "cost" | "success_rate" | "task_count"
  label: string;              // human-readable label
  values: (number | null)[];  // one per run, same order as runs[]
  change: number | null;      // percentage change between first and last run
  direction: "better" | "worse" | "neutral";
}

export interface TaskDiff {
  taskType: string;
  complexity: string;
  /** One entry per run: the task's status+agent+duration in that run. null if task type not present. */
  entries: (TaskDiffEntry | null)[];
}

export interface TaskDiffEntry {
  taskId: string;
  status: TaskStatus;
  agentType: string | null;
  durationMs: number | null;
  costUsd: number | null;
  attemptCount: number;
}

export interface AgentDiff {
  agentType: string;
  /** Per-run stats for this agent */
  perRun: AgentRunStats[];
}

export interface AgentRunStats {
  goalId: string;
  tasksAssigned: number;
  tasksCompleted: number;
  tasksFailed: number;
  totalDurationMs: number;
  totalCostUsd: number;
  successRate: number;
}

export interface ComparisonVerdict {
  summary: string;            // e.g. "Run B was 23% faster and 12% cheaper than Run A"
  improvements: string[];     // list of things that got better
  regressions: string[];      // list of things that got worse
  unchanged: string[];        // list of things that stayed the same
}
```

### Functions

```typescript
/** Compare two or more completed goal runs */
export function compareRuns(
  db: Database.Database,
  goalIds: string[],  // 2-5 goal IDs
): RunComparisonResult

/** List completed runs available for comparison */
export function listComparableRuns(
  db: Database.Database,
  limit?: number,  // default 20
): RunSummary[]

/** Generate the natural-language verdict */
export function generateVerdict(
  runs: RunSummary[],
  deltas: ComparisonDelta[],
): ComparisonVerdict
```

### Delta Direction Rules

| Metric | "better" when | "worse" when |
|--------|--------------|-------------|
| duration | decreased (faster) | increased (slower) |
| cost | decreased (cheaper) | increased (more expensive) |
| success_rate | increased (more reliable) | decreased (less reliable) |
| task_count | neutral always | neutral always |

Change threshold: ignore changes < 2% (treat as "neutral").

---

## UI Components

### Directory Structure

```
apps/dashboard/src/components/panels/mission-control/comparison/
  index.tsx                     # ComparisonPanel — main container
  RunPicker.tsx                # Dropdown/multi-select to pick runs
  ComparisonGrid.tsx           # Side-by-side metric grid
  DeltaBar.tsx                 # Visual bar showing change direction
  TaskDiffTable.tsx            # Task-by-task diff table
  AgentDiffTable.tsx           # Agent-by-agent diff table
  VerdictCard.tsx              # Natural-language summary card
  ComparisonEmpty.tsx          # Empty state (< 2 runs available)
```

### ComparisonPanel (index.tsx)

- Shows `RunPicker` at top to select 2-5 runs
- Enabled only when `listComparableRuns()` returns 2+ runs
- On selection change, calls `compareRuns()` and renders results
- Three sections: Verdict → Metrics Grid → Task Diff → Agent Diff

### RunPicker

```typescript
interface RunPickerProps {
  availableRuns: RunSummary[];
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  maxSelections?: number;  // default 5
}
```

- Multi-select dropdown with search/filter
- Each run shown as: description (truncated 40 chars) + date + status badge
- Minimum 2, maximum 5 selections
- "Compare" button activates when 2+ selected

### ComparisonGrid

- Shows key metrics as rows, runs as columns
- Cells colored: green = better, red = worse, gray = neutral
- Metrics: Duration, Cost, Success Rate, Tasks Completed, Tasks Failed

### DeltaBar

- Horizontal bar showing percentage change between runs
- Green bar extends right for improvements, red bar extends left for regressions
- Label shows "+23% faster" or "-12% more expensive"

### TaskDiffTable

- Rows: task types present in any run
- Columns: one per selected run
- Cells show: status icon + agent name + duration
- Highlighting: red cell if task failed in this run but succeeded in another

### VerdictCard

- Card at top of comparison view
- Shows `verdict.summary` as headline
- Bullet lists: improvements (green), regressions (red), unchanged (gray)

### ComparisonEmpty

- Shown when fewer than 2 completed runs exist
- Message: "Complete at least two goal runs to compare them."

---

## i18n Keys

Add under `missionControl.comparison` namespace:
- `title`: "Run Comparison"
- `selectRuns`: "Select runs to compare"
- `compare`: "Compare"
- `duration`: "Duration"
- `cost`: "Cost"
- `successRate`: "Success Rate"
- `tasksCompleted`: "Tasks Completed"
- `tasksFailed`: "Tasks Failed"
- `better`: "better"
- `worse`: "worse"
- `neutral`: "unchanged"
- `improvements`: "Improvements"
- `regressions`: "Regressions"
- `unchanged`: "Unchanged"
- `verdict`: "Verdict"
- `emptyTitle`: "Not enough runs to compare"
- `emptyDescription`: "Complete at least two goal runs to compare them."
- `taskDiff`: "Task Comparison"
- `agentDiff`: "Agent Comparison"

---

## Acceptance Criteria

1. **Comparison renders:** Selecting 2 completed runs shows the full comparison view with verdict, metrics grid, task diff, and agent diff.
2. **Delta calculation:** Comparing a run with 60s duration to one with 45s shows a ~25% improvement with `direction: "better"`.
3. **Verdict generation:** `generateVerdict()` produces a summary string mentioning the faster/cheaper run, plus itemized improvements and regressions.
4. **Task diff highlighting:** A task that succeeded in Run A but failed in Run B is highlighted red in Run B's column.
5. **Agent diff:** Per-agent stats show correct aggregation per run.
6. **Run picker:** Only completed runs appear. Minimum 2 selections required. Maximum 5.
7. **Empty state:** When < 2 completed runs, `ComparisonEmpty` renders.
8. **3+ run comparison:** Selecting 3 runs renders 3 columns in all tables. Deltas show change from first to last.
9. **Neutral threshold:** Changes under 2% show as "neutral" direction.
10. **i18n:** All strings through `t()`.
11. **Accessibility:** Tables have proper ARIA. DeltaBars have `aria-label` describing the change.
12. **No TypeScript errors:** Clean build.

---

## Test Requirements

### Query tests (`comparison-queries.test.ts`)

```
compareRuns
  ✓ two runs with different durations shows correct delta
  ✓ delta direction: faster = "better"
  ✓ delta direction: more expensive = "worse"
  ✓ changes under 2% threshold → "neutral"
  ✓ task diff: task present in run A but not B → null entry
  ✓ agent diff: correct per-run aggregation

listComparableRuns
  ✓ returns only completed runs
  ✓ respects limit parameter
  ✓ returns empty array when no completed runs

generateVerdict
  ✓ mentions faster run in summary
  ✓ lists improvements and regressions separately
  ✓ all-neutral shows "Runs performed similarly"
```

### Component tests

```
RunPicker
  ✓ renders available runs
  ✓ allows selecting 2-5 runs
  ✓ compare button disabled with < 2 selections

ComparisonGrid
  ✓ renders one column per run
  ✓ better cells have green styling
  ✓ worse cells have red styling

VerdictCard
  ✓ renders summary text
  ✓ renders improvement and regression lists
```

---

## Files to Create

| Path | Purpose |
|---|---|
| `apps/dashboard/src/lib/comparison-queries.ts` | Query functions |
| `apps/dashboard/src/lib/__tests__/comparison-queries.test.ts` | Query tests |
| `apps/dashboard/src/components/panels/mission-control/comparison/index.tsx` | Main panel |
| `apps/dashboard/src/components/panels/mission-control/comparison/RunPicker.tsx` | Run selector |
| `apps/dashboard/src/components/panels/mission-control/comparison/ComparisonGrid.tsx` | Metrics grid |
| `apps/dashboard/src/components/panels/mission-control/comparison/DeltaBar.tsx` | Change indicator |
| `apps/dashboard/src/components/panels/mission-control/comparison/TaskDiffTable.tsx` | Task diff |
| `apps/dashboard/src/components/panels/mission-control/comparison/AgentDiffTable.tsx` | Agent diff |
| `apps/dashboard/src/components/panels/mission-control/comparison/VerdictCard.tsx` | Summary card |
| `apps/dashboard/src/components/panels/mission-control/comparison/ComparisonEmpty.tsx` | Empty state |
| `apps/dashboard/src/components/panels/mission-control/comparison/__tests__/RunPicker.test.tsx` | Tests |
| `apps/dashboard/src/components/panels/mission-control/comparison/__tests__/ComparisonGrid.test.tsx` | Tests |
| `apps/dashboard/src/components/panels/mission-control/comparison/__tests__/VerdictCard.test.tsx` | Tests |

---

## Verification Commands

```bash
cd apps/dashboard && bun tsc --noEmit
bunx vitest run src/lib/__tests__/comparison-queries.test.ts
bunx vitest run src/components/panels/mission-control/comparison/__tests__
```
