# Phase 2 — Prompt 06: Agent Leaderboard

## RALPH LOOP INSTRUCTIONS

You are running in an autonomous loop. These rules are non-negotiable:

1. **Never declare done without evidence.** Every claim of completion must be backed by passing test output or a build log you actually ran. Do not say "this should work" — run it and show the output.
2. **Self-correct on failure.** If a test fails, a type error fires, or a command errors, fix the root cause and re-run. Do not move on with known failures.
3. **No scope reduction.** If something is hard, find a way. Do not silently drop acceptance criteria because they seem difficult.
4. **Iterate until green.** Keep looping — fix, verify, fix, verify — until every acceptance criterion in this document is met. Then stop.
5. **Show your work.** After each significant step, output the verification command and its result.

---

## Component Overview

Build the Agent Leaderboard — a ranked view of all AI agents (claude-code, codex, gemini) comparing their performance across all historical goal runs. The leaderboard reads from the `agent_performance` and `task_runs` tables created in Phase 1 and presents sortable metrics: success rate, average duration, total cost, tasks completed, and a composite "score" ranking.

---

## Repository Context

- **Monorepo root:** `/Users/heitor/Developer/github.com/Amoena/amoena`
- **Telemetry module (Phase 1):** `apps/dashboard/src/lib/mission-control-telemetry.ts` — exports `AgentPerformanceRow`, `getAgentPerformance()`, `getAgentPerformanceByType()`
- **Run reporter (Phase 1):** `apps/dashboard/src/lib/run-reporter.ts` — exports `AgentRunSummary`
- **Mission Control UI (Phase 1):** `apps/dashboard/src/components/panels/mission-control/`
- **Database:** `apps/dashboard/src/lib/db.ts` — `getDatabase(): Database.Database`
- **Design tokens:** `apps/dashboard/src/components/panels/mission-control/tokens.ts` — `AGENT_COLORS`, `STATUS_COLORS`
- **i18n:** `next-intl` v4.8.3 — `useTranslations("missionControl")`
- **Package manager:** Bun
- **Test framework:** Vitest v2.1.5

---

## What to Build

### 1. Leaderboard queries module

Create `apps/dashboard/src/lib/leaderboard-queries.ts`

### 2. Leaderboard UI component

Create `apps/dashboard/src/components/panels/mission-control/leaderboard/`

### 3. Tests

Create test files for both queries and components.

---

## Query Module (leaderboard-queries.ts)

All functions accept `db: Database.Database` as the first parameter.

### Types

```typescript
export interface LeaderboardEntry {
  agentType: string;
  rank: number;
  score: number;              // composite score 0-100
  totalTasks: number;
  completedTasks: number;
  failedTasks: number;
  timedOutTasks: number;
  successRate: number;         // 0-1
  avgDurationMs: number;
  totalCostUsd: number;
  avgCostPerTask: number;
  totalTokensUsed: number;
  lastUsedAt: number;
  trend: "improving" | "declining" | "stable";  // based on last 10 runs
}

export interface LeaderboardOptions {
  /** Minimum tasks to qualify for ranking (default: 3) */
  minTasks?: number;
  /** Time window in days (default: null = all time) */
  windowDays?: number | null;
  /** Sort field (default: "score") */
  sortBy?: keyof LeaderboardEntry;
  /** Sort direction (default: "desc") */
  sortDir?: "asc" | "desc";
}

export interface AgentTrendPoint {
  date: string;           // YYYY-MM-DD
  successRate: number;
  avgDurationMs: number;
  tasksCompleted: number;
}
```

### Functions

```typescript
/** Get ranked leaderboard of all agents */
export function getLeaderboard(
  db: Database.Database,
  options?: LeaderboardOptions,
): LeaderboardEntry[]

/** Get daily trend data for a specific agent (last N days) */
export function getAgentTrend(
  db: Database.Database,
  agentType: string,
  days?: number,  // default 30
): AgentTrendPoint[]

/** Compute composite score for an agent */
export function computeAgentScore(perf: {
  successRate: number;
  avgDurationMs: number;
  avgCostPerTask: number;
  totalTasks: number;
}): number
```

### Composite Score Formula

```
score = (successRate * 40) + (speedScore * 25) + (costScore * 20) + (volumeScore * 15)

where:
  speedScore = clamp(1 - (avgDurationMs / 300000), 0, 1)  // 5min = 0, 0s = 1
  costScore  = clamp(1 - (avgCostPerTask / 0.05), 0, 1)   // $0.05 = 0, $0 = 1
  volumeScore = clamp(totalTasks / 50, 0, 1)               // 50+ tasks = 1.0
```

### Trend Calculation

Compare the agent's success rate over the last 10 completed runs vs the 10 before that:
- If recent success rate > previous + 0.05 → `"improving"`
- If recent success rate < previous - 0.05 → `"declining"`
- Otherwise → `"stable"`

---

## UI Components

### Directory Structure

```
apps/dashboard/src/components/panels/mission-control/leaderboard/
  index.tsx                    # LeaderboardPanel — main container
  LeaderboardTable.tsx         # Sortable table of agents
  AgentScoreCard.tsx          # Detailed card for one agent
  AgentTrendChart.tsx         # Sparkline/mini chart of trend
  LeaderboardEmpty.tsx        # Empty state when < minTasks
```

### LeaderboardPanel (index.tsx)

```typescript
interface LeaderboardPanelProps {
  db: Database.Database;
}
```

- Fetches leaderboard data on mount and when options change
- Provides filter controls: time window (7d / 30d / 90d / All), minimum tasks slider (1-20)
- Renders `LeaderboardTable` with the filtered data
- Shows `LeaderboardEmpty` when no agents qualify

### LeaderboardTable

```typescript
interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
  sortBy: keyof LeaderboardEntry;
  sortDir: "asc" | "desc";
  onSort: (field: keyof LeaderboardEntry) => void;
  onSelectAgent: (agentType: string) => void;
}
```

- Sortable columns: Rank, Agent, Score, Success Rate, Avg Duration, Cost/Task, Tasks, Trend
- Click column header to sort (toggle asc/desc)
- Agent name colored with `AGENT_COLORS[agentType]`
- Score displayed as a progress bar (0-100)
- Success rate as percentage with color coding (>80% green, 50-80% yellow, <50% red)
- Trend shown as arrow icon: ↑ green (improving), ↓ red (declining), → gray (stable)
- Click row to select agent → shows `AgentScoreCard`

### AgentScoreCard

```typescript
interface AgentScoreCardProps {
  entry: LeaderboardEntry;
  trend: AgentTrendPoint[];
  onClose: () => void;
}
```

- Slide-out panel or modal showing detailed agent stats
- Metric cards: Score, Success Rate, Avg Duration, Total Cost, Tasks Completed
- `AgentTrendChart` showing 30-day performance trend
- Breakdown: tasks by type (pie chart or bar), tasks by complexity (grouped bar)
- "Best at" tag: the task type where this agent has highest success rate

### AgentTrendChart

- Render a simple SVG sparkline (no charting library)
- X-axis: dates, Y-axis: success rate (0-100%)
- Hover shows tooltip with exact values
- Green line if trend is improving, red if declining, gray if stable

### LeaderboardEmpty

- Shown when no agents qualify (fewer than `minTasks` completed tasks)
- Message: "Not enough data yet. Run a few goals to see agent rankings."
- Illustration: simple placeholder SVG

---

## i18n Keys

Add under `missionControl.leaderboard` namespace:
- `title`: "Agent Leaderboard"
- `rank`: "Rank"
- `agent`: "Agent"
- `score`: "Score"
- `successRate`: "Success Rate"
- `avgDuration`: "Avg Duration"
- `costPerTask`: "Cost/Task"
- `tasks`: "Tasks"
- `trend`: "Trend"
- `improving`: "Improving"
- `declining`: "Declining"
- `stable`: "Stable"
- `timeWindow`: "Time Window"
- `allTime`: "All Time"
- `minTasks`: "Min Tasks"
- `emptyTitle`: "Not enough data yet"
- `emptyDescription`: "Run a few goals to see agent rankings."
- `bestAt`: "Best at"
- `details`: "Details"

---

## Acceptance Criteria

1. **Leaderboard renders:** With 3+ agents having 3+ tasks each, the leaderboard shows all qualifying agents ranked by composite score.
2. **Sorting works:** Clicking any column header sorts the table. Clicking again reverses direction. Active sort column is visually indicated.
3. **Score formula:** `computeAgentScore({ successRate: 0.9, avgDurationMs: 60000, avgCostPerTask: 0.01, totalTasks: 20 })` returns a score between 70-85 (verify exact value in test).
4. **Trend calculation:** An agent with recent success rate 0.95 and previous 0.80 shows `trend: "improving"`.
5. **Time window filter:** Selecting "7d" window filters to only tasks from the last 7 days. Agent with no tasks in window is excluded.
6. **Min tasks filter:** Setting `minTasks: 5` excludes agents with fewer than 5 completed tasks.
7. **Agent detail card:** Clicking a row opens the `AgentScoreCard` with correct metrics and trend chart.
8. **Empty state:** When no agents qualify, `LeaderboardEmpty` renders with the correct message.
9. **Agent colors:** Each agent row uses the correct color from `AGENT_COLORS`.
10. **i18n:** All user-visible strings use `t()` from the `missionControl` namespace.
11. **Accessibility:** Table has proper ARIA: `role="table"`, sortable headers have `aria-sort`, trend arrows have `aria-label`.
12. **No TypeScript errors:** `bun tsc --noEmit` in `apps/dashboard` passes clean (ignoring pre-existing errors).

---

## Test Requirements

Location: `apps/dashboard/src/lib/__tests__/leaderboard-queries.test.ts` and `apps/dashboard/src/components/panels/mission-control/leaderboard/__tests__/`

### Query tests

```
getLeaderboard
  ✓ returns agents ranked by composite score
  ✓ excludes agents below minTasks threshold
  ✓ windowDays filters to recent tasks only
  ✓ sortBy/sortDir changes ordering
  ✓ returns empty array when no agents qualify

computeAgentScore
  ✓ perfect agent (100% success, fast, cheap, high volume) scores near 100
  ✓ poor agent (low success, slow, expensive, low volume) scores near 0
  ✓ score clamps between 0 and 100

getAgentTrend
  ✓ returns daily aggregates for the last N days
  ✓ days with no tasks are excluded (not zero-filled)

trend calculation
  ✓ improving: recent >> previous success rate
  ✓ declining: recent << previous success rate
  ✓ stable: similar success rates
```

### Component tests (React Testing Library + Vitest)

```
LeaderboardTable
  ✓ renders a row per agent
  ✓ clicking header calls onSort
  ✓ active sort column has aria-sort attribute
  ✓ agent names show correct color

AgentScoreCard
  ✓ renders all metric cards
  ✓ close button calls onClose

LeaderboardEmpty
  ✓ renders empty state message
```

---

## Dependencies on Other Components

- **Phase 1 (Telemetry):** Reads `agent_performance` and `task_runs` tables
- **Phase 1 (UI):** Integrates into Mission Control panel layout, uses shared design tokens
- **No dependency on Phase 2 components** — leaderboard is standalone

---

## What This Provides to Other Components

- `07-run-comparison.md` may link to leaderboard for agent context
- `08-time-saved-streaks.md` uses the same `agent_performance` data

---

## Files to Create

| Path | Purpose |
|---|---|
| `apps/dashboard/src/lib/leaderboard-queries.ts` | Query functions |
| `apps/dashboard/src/lib/__tests__/leaderboard-queries.test.ts` | Query tests |
| `apps/dashboard/src/components/panels/mission-control/leaderboard/index.tsx` | Main panel |
| `apps/dashboard/src/components/panels/mission-control/leaderboard/LeaderboardTable.tsx` | Sortable table |
| `apps/dashboard/src/components/panels/mission-control/leaderboard/AgentScoreCard.tsx` | Detail card |
| `apps/dashboard/src/components/panels/mission-control/leaderboard/AgentTrendChart.tsx` | SVG sparkline |
| `apps/dashboard/src/components/panels/mission-control/leaderboard/LeaderboardEmpty.tsx` | Empty state |
| `apps/dashboard/src/components/panels/mission-control/leaderboard/__tests__/LeaderboardTable.test.tsx` | Component tests |
| `apps/dashboard/src/components/panels/mission-control/leaderboard/__tests__/AgentScoreCard.test.tsx` | Component tests |

---

## Verification Commands

```bash
# Type check
cd apps/dashboard && bun tsc --noEmit

# Query tests
bunx vitest run src/lib/__tests__/leaderboard-queries.test.ts

# Component tests
bunx vitest run src/components/panels/mission-control/leaderboard/__tests__

# Check i18n: no raw strings in JSX
grep -rn '"[A-Z][a-z]' src/components/panels/mission-control/leaderboard/
```
