# Phase 1 — Prompt 04: Run Reporter

## RALPH LOOP INSTRUCTIONS

You are running in an autonomous loop. These rules are non-negotiable:

1. **Never declare done without evidence.** Every claim of completion must be backed by passing test output or a build log you actually ran. Do not say "this should work" — run it and show the output.
2. **Self-correct on failure.** If a test fails, a type error fires, or a command errors, fix the root cause and re-run. Do not move on with known failures.
3. **No scope reduction.** If something is hard, find a way. Do not silently drop acceptance criteria because they seem difficult.
4. **Iterate until green.** Keep looping — fix, verify, fix, verify — until every acceptance criterion in this document is met. Then stop.
5. **Show your work.** After each significant step, output the verification command and its result.

---

## Component Overview

Build the run reporter that generates structured reports from telemetry data after a goal run completes (or is cancelled/fails). The reporter reads from SQLite tables populated by the telemetry module and produces both a structured JSON payload and a human-readable Markdown document.

The reporter lives at:

```
apps/dashboard/src/lib/run-reporter.ts
```

---

## Repository Context

- **Telemetry module** (built in Prompt 03): `apps/dashboard/src/lib/mission-control-telemetry.ts`
- **Database:** `apps/dashboard/src/lib/db.ts` — `getDatabase(): Database.Database`
- **Package manager:** Bun
- **TypeScript:** strict mode
- **No external markdown libraries** — write plain string templates; keep it simple

---

## What to Build

### Files to create

```
apps/dashboard/src/lib/run-reporter.ts
apps/dashboard/src/lib/__tests__/run-reporter.test.ts
```

---

## Output Types

```typescript
export interface RunReport {
  /** Metadata */
  goalId: string;
  goalDescription: string;
  generatedAt: number;           // Date.now()
  runStatus: GoalRunStatus;

  /** Timing */
  startedAt: number;
  completedAt: number | null;
  totalDurationMs: number | null;

  /** Cost */
  costSummary: CostSummary;

  /** Tasks */
  taskBreakdown: TaskReport[];

  /** Agent performance within this run */
  agentSummary: AgentRunSummary[];

  /** Routing insights */
  routingInsights: RoutingInsight[];

  /** Merge info */
  mergeInfo: MergeInfo | null;

  /** Highlighted issues */
  issues: RunIssue[];
}

export interface CostSummary {
  totalUsd: number;
  byAgent: Record<string, number>;    // agent_type → total cost USD
  byTaskType: Record<string, number>; // task_type → total cost USD
}

export interface TaskReport {
  taskId: string;
  description: string;
  taskType: string;
  complexity: string;
  status: TaskStatus;
  agentType: string | null;
  routingReason: string;
  whyThisAgent: string;        // human-readable explanation derived from routingReason
  attemptCount: number;
  durationMs: number | null;
  inputTokens: number | null;
  outputTokens: number | null;
  costUsd: number | null;
  errorMessage: string | null;
}

export interface AgentRunSummary {
  agentType: string;
  tasksAssigned: number;
  tasksCompleted: number;
  tasksFailed: number;
  totalDurationMs: number;
  totalCostUsd: number;
  avgDurationMs: number;
  successRate: number;
}

export interface RoutingInsight {
  taskId: string;
  decision: string;          // routing_reason verbatim
  explanation: string;       // human-readable expansion
  couldImprove: boolean;     // true if this routing decision looks suboptimal
  improvementHint: string;   // e.g. "Consider using claude-code for high-complexity tasks"
}

export interface MergeInfo {
  strategy: "auto" | "review_required" | null;
  autoMergedCount: number;
  conflictCount: number;
  conflictedTasks: string[];
}

export interface RunIssue {
  severity: "warning" | "error";
  taskId: string | null;         // null for goal-level issues
  message: string;
}
```

---

## Core Function

```typescript
export function generateReport(
  db: Database.Database,
  goalId: string,
): RunReport
```

Steps:
1. Load goal run row via `getGoalRun(db, goalId)`. Throw `ReportNotFoundError` if null.
2. Load all task runs via `getTaskRunsForGoal(db, goalId)`.
3. Build `taskBreakdown`: one `TaskReport` per task, calling `explainRoutingReason()` to populate `whyThisAgent`.
4. Build `costSummary`: aggregate cost by agent and task type.
5. Build `agentSummary`: group tasks by `agent_type`, compute per-agent totals.
6. Build `routingInsights`: one insight per task, calling `analyzeRoutingDecision()`.
7. Build `mergeInfo` from `goal_run.merge_strategy` and conflict data if available.
8. Build `issues`: scan for retries (`attempt_count > 1`), timed-out tasks, skipped tasks.
9. Return assembled `RunReport`.

---

## Routing Explanation

### explainRoutingReason(routingReason: string): string

Parses the structured `routing_reason` string and returns plain English:

```typescript
function explainRoutingReason(routingReason: string): string {
  if (routingReason.startsWith("matrix:")) {
    // "matrix:implementation/high→claude-code"
    // → "Assigned to claude-code by routing matrix: implementation task with high complexity"
  } else if (routingReason.startsWith("override:")) {
    // "override:codex"
    // → "Manually overridden to codex"
  } else if (routingReason.startsWith("fallback:")) {
    // "fallback:codex→claude-code"
    // → "Fell back to claude-code after codex was unavailable"
  } else {
    return routingReason; // passthrough for unknown formats
  }
}
```

### analyzeRoutingDecision(task: TaskRunRow): RoutingInsight

Flags suboptimal routing patterns:

```typescript
function analyzeRoutingDecision(task: TaskRunRow): RoutingInsight {
  const insight: RoutingInsight = {
    taskId: task.id,
    decision: task.routing_reason,
    explanation: explainRoutingReason(task.routing_reason),
    couldImprove: false,
    improvementHint: "",
  };

  // Flag: high-complexity task went to codex (matrix would prefer claude-code)
  if (
    task.complexity === "high" &&
    task.agent_type === "codex" &&
    !task.routing_reason.startsWith("override:")
  ) {
    insight.couldImprove = true;
    insight.improvementHint =
      "High-complexity tasks generally perform better with claude-code.";
  }

  // Flag: task required fallback (original agent unavailable)
  if (task.routing_reason.startsWith("fallback:")) {
    insight.couldImprove = true;
    const [, agents] = task.routing_reason.split(":");
    const [original] = agents.split("→");
    insight.improvementHint = `Ensure ${original} credentials are configured to avoid fallback routing.`;
  }

  // Flag: task was retried
  if (task.attempt_count > 1) {
    insight.couldImprove = true;
    insight.improvementHint = `Task required ${task.attempt_count} attempts. Check agent stability.`;
  }

  return insight;
}
```

---

## Markdown Renderer

```typescript
export function renderMarkdown(report: RunReport): string
```

Output format:

```markdown
# Mission Control Run Report

**Goal:** <description>
**Status:** completed ✓  (or: partial_failure ⚠  failed ✗  cancelled ✗  pending …)
**Duration:** 4m 23s
**Total Cost:** $0.0142 USD
**Generated:** 2026-03-23 14:32:11 UTC

---

## Summary

| Metric | Value |
|--------|-------|
| Total Tasks | 8 |
| Completed | 7 |
| Failed | 0 |
| Skipped | 1 |
| Timed Out | 0 |
| Cancelled | 0 |

---

## Agent Performance

| Agent | Tasks | Completed | Failed | Avg Duration | Cost |
|-------|-------|-----------|--------|--------------|------|
| claude-code | 5 | 5 | 0 | 42s | $0.0120 |
| codex | 3 | 2 | 1 | 18s | $0.0022 |

---

## Task Breakdown

### Task 1: Implement authentication module
- **Status:** completed
- **Agent:** claude-code
- **Why this agent:** Assigned to claude-code by routing matrix: implementation task with high complexity
- **Duration:** 1m 12s
- **Tokens:** 1,234 in / 4,567 out
- **Cost:** $0.0082

### Task 2: ...

---

## Routing Insights

> No routing improvements suggested.

OR:

### Possible Improvements

- **Task 3:** High-complexity tasks generally perform better with claude-code.
- **Task 5:** Ensure codex credentials are configured to avoid fallback routing.

---

## Issues

> No issues detected.

OR:

⚠ **Task 6** required 2 retry attempts.
✗ **Task 8** was skipped because its dependency (Task 6) failed.
```

Rules for the Markdown renderer:
- Duration: format as `Xm Ys` or `Xs` (no decimals under 60s, minutes+seconds over 60s)
- Cost: format as `$0.0000 USD` (4 decimal places)
- Token counts: formatted with thousands comma separators
- Status emoji: `completed` → `✓`, `failed` → `✗`, `partial_failure` → `⚠`, `cancelled` → `✗`, `pending` → `…`, `running` → `⟳`
- Empty sections: always include all sections, but replace with `> No [items] detected.` for empty lists

---

## Edge Cases

Handle these without throwing:

| Scenario | Behavior |
|---|---|
| Goal has zero tasks | Report shows 0 counts, empty task breakdown, empty agent summary |
| All tasks cancelled | Status is `cancelled`, issues list has one entry: "Goal was cancelled" |
| Goal is still running | `completedAt` is null; duration shows as "In progress" in Markdown |
| Task has no `cost_usd` | Cost shows as `—` in Markdown, excluded from totals (not counted as $0) |
| Task has no `agent_type` | `whyThisAgent` is "Not yet assigned", `agentType` shows as "—" |
| `routing_reason` is empty string | `whyThisAgent` is "Unknown" |
| Multiple retries on different agents | `issues` list enumerates each retry separately |

---

## Acceptance Criteria

1. **Happy path:** A goal with 5 completed tasks, 2 agents, various task types produces a `RunReport` with correct `taskBreakdown`, `agentSummary`, `costSummary`, and empty `issues`.
2. **Cost aggregation:** `costSummary.totalUsd` equals the sum of all non-null `task_runs.cost_usd` for the goal. Tasks with null cost are excluded from the sum.
3. **Routing explanation:** `explainRoutingReason("matrix:implementation/high→claude-code")` returns a string containing "claude-code" and "high complexity".
4. **Suboptimal routing flag:** A task with `complexity=high`, `agent_type=codex`, and `routing_reason="matrix:implementation/high→codex"` produces `RoutingInsight.couldImprove=true`.
5. **Retry issues:** A task with `attempt_count=3` produces an entry in `RunReport.issues`.
6. **Skipped tasks:** Skipped tasks appear in `taskBreakdown` with `status: "skipped"` and a corresponding issue entry.
7. **Cancelled goal:** `generateReport` on a cancelled goal produces `runStatus: "cancelled"` and an issue entry.
8. **Zero-task goal:** No crash; returns a valid report with empty arrays.
9. **Markdown output:** `renderMarkdown` returns a non-empty string starting with `# Mission Control Run Report` for any valid `RunReport`.
10. **ReportNotFoundError:** Calling `generateReport` for an unknown `goalId` throws `ReportNotFoundError`.
11. **No TypeScript errors:** `bun tsc --noEmit` in `apps/dashboard` passes clean.

---

## Test Requirements

Location: `apps/dashboard/src/lib/__tests__/run-reporter.test.ts`

Use in-memory SQLite (same pattern as telemetry tests — `makeTestDb()` helper with migrations run).

**Test cases:**

```
generateReport
  ✓ happy path: 5 completed tasks, correct totals
  ✓ unknown goalId throws ReportNotFoundError
  ✓ zero-task goal returns valid report
  ✓ all-cancelled goal sets status and issues
  ✓ partial failure: some tasks failed, some skipped
  ✓ costSummary.totalUsd excludes null-cost tasks
  ✓ agentSummary groups by agent_type correctly
  ✓ tasks with attemptCount > 1 appear in issues

explainRoutingReason
  ✓ "matrix:implementation/high→claude-code" → contains "high complexity"
  ✓ "override:codex" → contains "Manually overridden"
  ✓ "fallback:codex→claude-code" → contains "Fell back"
  ✓ unknown format → passthrough

analyzeRoutingDecision
  ✓ high-complexity task on codex → couldImprove=true
  ✓ fallback routing → couldImprove=true, mentions original agent
  ✓ attempt_count > 1 → couldImprove=true
  ✓ normal claude-code routing → couldImprove=false

renderMarkdown
  ✓ output starts with "# Mission Control Run Report"
  ✓ duration formatted as "Xm Ys"
  ✓ cost formatted as "$X.XXXX USD"
  ✓ empty issues section shows "> No issues detected."
  ✓ null cost shown as "—"
  ✓ running goal shows "In progress" for duration
```

---

## Dependencies on Other Components

- **Prompt 03 (Telemetry):** Imports and uses all reader functions from `mission-control-telemetry.ts`
- **No runtime dependency on DAG engine or CLI adapters** — reporter is read-only after the run

---

## What This Provides to Other Components

- `05-mission-control-ui.md` calls `generateReport(db, goalId)` to render the post-run view
- The `RunReport` JSON is also served via a tRPC endpoint (future work) for external consumers

---

## Files to Create

| Path | Purpose |
|---|---|
| `apps/dashboard/src/lib/run-reporter.ts` | Core reporter logic + Markdown renderer |
| `apps/dashboard/src/lib/__tests__/run-reporter.test.ts` | Tests |

---

## Verification Commands

```bash
# Type check
cd apps/dashboard && bun tsc --noEmit

# Run reporter tests
bun test src/lib/__tests__/run-reporter.test.ts

# Confirm no external markdown library imported
grep "import.*markdown\|require.*markdown" src/lib/run-reporter.ts
# Should return nothing
```
