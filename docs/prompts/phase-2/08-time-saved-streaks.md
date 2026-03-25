# Phase 2 — Prompt 08: Time Saved & Streaks

## RALPH LOOP INSTRUCTIONS

You are running in an autonomous loop. These rules are non-negotiable:

1. **Never declare done without evidence.** Every claim of completion must be backed by passing test output or a build log you actually ran. Do not say "this should work" — run it and show the output.
2. **Self-correct on failure.** If a test fails, a type error fires, or a command errors, fix the root cause and re-run. Do not move on with known failures.
3. **No scope reduction.** If something is hard, find a way. Do not silently drop acceptance criteria because they seem difficult.
4. **Iterate until green.** Keep looping — fix, verify, fix, verify — until every acceptance criterion in this document is met. Then stop.
5. **Show your work.** After each significant step, output the verification command and its result.

---

## Component Overview

Build the Time Saved calculator and Streaks tracker — gamification features that motivate users by showing how much time Mission Control has saved them and recognizing achievement milestones. The Time Saved badge appears in the Mission Control panel header. Streaks track consecutive successful goal runs.

---

## Repository Context

- **Monorepo root:** `/Users/heitor/Developer/github.com/Amoena/amoena`
- **Telemetry module (Phase 1):** `apps/dashboard/src/lib/mission-control-telemetry.ts`
- **Mission Control UI (Phase 1):** `apps/dashboard/src/components/panels/mission-control/`
- **Database:** `apps/dashboard/src/lib/db.ts`
- **Design tokens:** `apps/dashboard/src/components/panels/mission-control/tokens.ts`
- **i18n:** `next-intl` v4.8.3
- **Package manager:** Bun
- **Test framework:** Vitest v2.1.5

---

## What to Build

### 1. Stats queries module

Create `apps/dashboard/src/lib/stats-queries.ts`

### 2. Stats UI components

Create `apps/dashboard/src/components/panels/mission-control/stats/`

### 3. Tests

---

## Stats Queries Module (stats-queries.ts)

### Types

```typescript
export interface TimeSavedStats {
  /** Total estimated time saved in milliseconds */
  totalTimeSavedMs: number;
  /** Time saved this week */
  weekTimeSavedMs: number;
  /** Time saved this month */
  monthTimeSavedMs: number;
  /** Total completed goals */
  totalGoals: number;
  /** Total tasks completed by agents */
  totalTasksCompleted: number;
  /** Average time saved per goal */
  avgTimeSavedPerGoalMs: number;
  /** Human-equivalent hours estimate */
  humanEquivalentHours: number;
}

export interface StreakInfo {
  /** Current streak of consecutive successful goals */
  currentStreak: number;
  /** Longest streak ever achieved */
  longestStreak: number;
  /** Whether the user is on an active streak (last run was successful) */
  isActive: boolean;
  /** Timestamp of the first goal in the current streak */
  streakStartedAt: number | null;
  /** Milestones achieved (5, 10, 25, 50, 100) */
  milestones: StreakMilestone[];
}

export interface StreakMilestone {
  count: number;
  achievedAt: number | null;  // null if not yet achieved
  label: string;              // "First Five", "Perfect Ten", etc.
}

export interface WeeklyDigest {
  weekStart: string;          // ISO date string (Monday)
  goalsCompleted: number;
  goalsFailed: number;
  totalTimeSavedMs: number;
  totalCostUsd: number;
  topAgent: string | null;    // agent with most tasks this week
  streakMaintained: boolean;
}
```

### Functions

```typescript
/** Calculate total time saved based on a human-equivalent estimate */
export function getTimeSaved(
  db: Database.Database,
): TimeSavedStats

/** Get current and longest streak info */
export function getStreakInfo(
  db: Database.Database,
): StreakInfo

/** Get weekly digest for the last N weeks */
export function getWeeklyDigests(
  db: Database.Database,
  weeks?: number,  // default 4
): WeeklyDigest[]
```

### Time Saved Calculation

The "time saved" estimate uses a conservative formula:

```
For each completed task:
  humanEstimateMs = complexityMultiplier[task.complexity] * baseTimeByType[task.taskType]
  timeSaved = humanEstimateMs - task.duration_ms
  // Only count positive savings (if agent was slower than human estimate, count as 0)
  timeSaved = Math.max(0, timeSaved)
```

Base times (human equivalent):
| Task Type | Base Time |
|-----------|-----------|
| implementation | 45 min |
| review | 20 min |
| testing | 30 min |
| documentation | 25 min |
| analysis | 35 min |
| refactoring | 40 min |

Complexity multipliers:
| Complexity | Multiplier |
|-----------|-----------|
| low | 0.5 |
| medium | 1.0 |
| high | 2.0 |

### Streak Calculation

A "streak" is consecutive completed goal runs (status = "completed") ordered by `started_at`. A goal with status "partial_failure", "failed", or "cancelled" breaks the streak.

---

## UI Components

### Directory Structure

```
apps/dashboard/src/components/panels/mission-control/stats/
  index.tsx                     # StatsPanel — container for all stats
  TimeSavedBadge.tsx           # Compact badge for panel header
  TimeSavedDetail.tsx          # Expanded time saved view
  StreakDisplay.tsx            # Current streak + milestone badges
  WeeklyDigestCard.tsx         # Weekly summary card
  MilestoneToast.tsx           # Celebration toast for new milestones
```

### TimeSavedBadge

```typescript
interface TimeSavedBadgeProps {
  totalTimeSavedMs: number;
  isCompact?: boolean;  // default true — used in header
}
```

- Compact mode: shows "⏱ 4.2h saved" in the Mission Control panel header
- Format: hours with one decimal (< 1h shows minutes: "32m saved")
- Tooltip on hover: "Estimated time saved vs. manual work"
- Subtle pulse animation when the number increases during a run

### TimeSavedDetail

- Card showing full breakdown: total, this week, this month, per goal average
- Human equivalent callout: "That's like having an extra developer for X hours"
- Mini bar chart: time saved per week (last 4 weeks)

### StreakDisplay

```typescript
interface StreakDisplayProps {
  streak: StreakInfo;
}
```

- Shows current streak as a large number with flame emoji (🔥) when active
- "Best: N" subtitle showing longest streak
- Milestone badges: unlocked milestones shown as colored badges, locked ones as gray
- Milestone definitions:
  - 5: "First Five" ⭐
  - 10: "Perfect Ten" 🌟
  - 25: "Quarter Century" 💫
  - 50: "Half Century" 🏆
  - 100: "Centurion" 👑

### MilestoneToast

- Shown when a new milestone is achieved (check on goal completion)
- Animated celebration: confetti-like CSS animation (no external libraries)
- Auto-dismisses after 5 seconds, click to dismiss immediately
- Shows milestone name + icon + streak count

### WeeklyDigestCard

- Shows one week's summary in a compact card
- Goals completed, cost, time saved, top agent
- Green checkmark if streak maintained, red X if broken

---

## Integration with Mission Control Panel

The `TimeSavedBadge` must be added to the Mission Control panel header (Phase 1's `index.tsx`). The integration approach:

1. Export `TimeSavedBadge` from `stats/index.tsx`
2. In the Mission Control panel header, conditionally render the badge when `totalTimeSavedMs > 0`
3. The badge fetches its own data via a `useTimeSaved()` hook

Create a hook: `apps/dashboard/src/components/panels/mission-control/hooks/use-time-saved.ts`

---

## i18n Keys

Add under `missionControl.stats` namespace:
- `timeSaved`: "Time Saved"
- `hoursSaved`: "{hours}h saved"
- `minutesSaved`: "{minutes}m saved"
- `thisWeek`: "This Week"
- `thisMonth`: "This Month"
- `perGoal`: "Per Goal"
- `humanEquivalent`: "That's like having an extra developer for {hours} hours"
- `streak`: "Streak"
- `currentStreak`: "Current Streak"
- `longestStreak`: "Best"
- `streakBroken`: "Streak broken"
- `milestoneAchieved`: "Milestone achieved!"
- `firstFive`: "First Five"
- `perfectTen`: "Perfect Ten"
- `quarterCentury`: "Quarter Century"
- `halfCentury`: "Half Century"
- `centurion`: "Centurion"
- `weeklyDigest`: "Weekly Digest"
- `goalsCompleted`: "Goals Completed"
- `topAgent`: "Top Agent"

---

## Acceptance Criteria

1. **Time saved calculation:** A completed "implementation/high" task that took 30s shows ~89.5 min saved (90min human estimate - 0.5min actual).
2. **Negative time not counted:** A task slower than human estimate contributes 0 to time saved, not negative.
3. **Badge renders:** `TimeSavedBadge` shows in the panel header with formatted time.
4. **Badge format:** 4.2 hours → "4.2h saved". 32 minutes → "32m saved". 0 → badge hidden.
5. **Streak counting:** 3 consecutive "completed" goals → `currentStreak: 3`. Then a "failed" goal → `currentStreak: 0`, `longestStreak: 3`.
6. **Milestone tracking:** After 5th consecutive success, "First Five" milestone is marked as achieved with timestamp.
7. **Milestone toast:** When streak reaches a milestone, `MilestoneToast` renders with correct name and icon.
8. **Weekly digest:** Returns correct aggregation per ISO week.
9. **Top agent per week:** The agent with the most completed tasks that week is identified.
10. **i18n:** All strings through `t()`.
11. **Accessibility:** Badge has `aria-label`. Streak display has descriptive labels. Toast has `role="alert"`.
12. **No TypeScript errors:** Clean build.

---

## Test Requirements

### Query tests (`stats-queries.test.ts`)

```
getTimeSaved
  ✓ sums time saved across all completed tasks
  ✓ negative savings clamped to 0
  ✓ complexity multiplier applied correctly
  ✓ weekTimeSavedMs filters to current week only
  ✓ returns zeros when no completed tasks exist

getStreakInfo
  ✓ consecutive completions counted correctly
  ✓ failed goal breaks streak
  ✓ cancelled goal breaks streak
  ✓ partial_failure breaks streak
  ✓ longestStreak preserved after streak break
  ✓ milestones marked as achieved with timestamp

getWeeklyDigests
  ✓ returns one entry per week
  ✓ topAgent is the agent with most completed tasks
  ✓ streakMaintained reflects goal outcomes that week
```

### Component tests

```
TimeSavedBadge
  ✓ renders hours format for > 60 minutes
  ✓ renders minutes format for < 60 minutes
  ✓ hidden when 0 time saved

StreakDisplay
  ✓ renders current streak count
  ✓ shows flame icon when streak is active
  ✓ milestone badges shown for achieved milestones

MilestoneToast
  ✓ renders milestone name and icon
  ✓ auto-dismisses after 5 seconds
```

---

## Files to Create

| Path | Purpose |
|---|---|
| `apps/dashboard/src/lib/stats-queries.ts` | Time saved + streak queries |
| `apps/dashboard/src/lib/__tests__/stats-queries.test.ts` | Query tests |
| `apps/dashboard/src/components/panels/mission-control/stats/index.tsx` | Stats container |
| `apps/dashboard/src/components/panels/mission-control/stats/TimeSavedBadge.tsx` | Header badge |
| `apps/dashboard/src/components/panels/mission-control/stats/TimeSavedDetail.tsx` | Expanded view |
| `apps/dashboard/src/components/panels/mission-control/stats/StreakDisplay.tsx` | Streak + milestones |
| `apps/dashboard/src/components/panels/mission-control/stats/WeeklyDigestCard.tsx` | Weekly card |
| `apps/dashboard/src/components/panels/mission-control/stats/MilestoneToast.tsx` | Celebration toast |
| `apps/dashboard/src/components/panels/mission-control/hooks/use-time-saved.ts` | Data hook |
| `apps/dashboard/src/components/panels/mission-control/stats/__tests__/TimeSavedBadge.test.tsx` | Tests |
| `apps/dashboard/src/components/panels/mission-control/stats/__tests__/StreakDisplay.test.tsx` | Tests |
| `apps/dashboard/src/components/panels/mission-control/stats/__tests__/MilestoneToast.test.tsx` | Tests |

---

## Verification Commands

```bash
cd apps/dashboard && bun tsc --noEmit
bunx vitest run src/lib/__tests__/stats-queries.test.ts
bunx vitest run src/components/panels/mission-control/stats/__tests__
```
