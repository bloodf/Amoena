# Phase 1 — Prompt 02: DAG Engine

## RALPH LOOP INSTRUCTIONS

You are running in an autonomous loop. These rules are non-negotiable:

1. **Never declare done without evidence.** Every claim of completion must be backed by passing test output or a build log you actually ran. Do not say "this should work" — run it and show the output.
2. **Self-correct on failure.** If a test fails, a type error fires, or a command errors, fix the root cause and re-run. Do not move on with known failures.
3. **No scope reduction.** If something is hard, find a way. Do not silently drop acceptance criteria because they seem difficult.
4. **Iterate until green.** Keep looping — fix, verify, fix, verify — until every acceptance criterion in this document is met. Then stop.
5. **Show your work.** After each significant step, output the verification command and its result.

---

## Component Overview

Build the DAG (Directed Acyclic Graph) execution engine that takes a decomposed goal, schedules tasks respecting dependency order, enforces a concurrency limit of 3 agents, isolates each task in a git worktree, handles failures with retry/fallback, and persists state for crash recovery.

This is the coordination heart of the Mission Control Platform. All other components are either inputs to or outputs from this engine.

---

## Repository Context

- Monorepo root: `/Users/heitor/Developer/github.com/Amoena/amoena`
- New module location: `packages/amoena-service/src/orchestration/dag-engine/`
- Existing orchestration: `packages/amoena-service/src/orchestration/` — read `types.ts` and `agent-spawner.ts` for context before writing
- CLI adapters (built in Prompt 01): `packages/amoena-service/src/orchestration/cli-adapters/`
- SQLite telemetry (built in Prompt 03): `apps/dashboard/src/lib/db.ts` via `better-sqlite3`
- Package manager: Bun

---

## Architecture

```
dag-engine/
  index.ts              # re-exports GoalRun, DagScheduler, createGoalRun()
  types.ts              # DAG-specific types (GoalSpec, TaskSpec, RunState, etc.)
  goal-run.ts           # GoalRun: manages full lifecycle of one goal
  task-node.ts          # TaskNode: wraps one task in the DAG
  scheduler.ts          # DagScheduler: dependency resolution + concurrency
  router.ts             # Heuristic router: task_type/complexity → AgentAdapter
  worktree.ts           # Git worktree create/cleanup utilities
  merger.ts             # Post-run merge strategy
  recovery.ts           # Persist/resume state from goal_run_state table
```

---

## Types (types.ts)

```typescript
/** The user's high-level goal, decomposed into tasks before passing to the engine */
export interface GoalSpec {
  id: string;               // UUID
  description: string;      // Original natural-language goal
  tasks: TaskSpec[];        // Pre-decomposed task list
  baseRef: string;          // Git ref to base worktrees on (e.g. "main")
  timeoutMs?: number;       // Per-task timeout; default 300_000
  maxConcurrency?: number;  // Override global default of 3
  metadata?: Record<string, unknown>;
}

export interface TaskSpec {
  id: string;               // Stable task ID within the goal
  description: string;      // What this task should do
  dependsOn: string[];      // IDs of tasks that must complete before this one
  taskType: TaskType;
  complexity: TaskComplexity;
  preferredAgent?: string;  // Optional hint; overrides router
  metadata?: Record<string, unknown>;
}

export type TaskType =
  | "implementation"
  | "review"
  | "testing"
  | "documentation"
  | "analysis"
  | "refactoring";

export type TaskComplexity = "low" | "medium" | "high";

export type TaskStatus =
  | "queued"
  | "running"
  | "completed"
  | "failed"
  | "timed_out"
  | "cancelled"
  | "skipped";

export type GoalRunStatus =
  | "pending"
  | "running"
  | "completed"
  | "partial_failure"
  | "failed"
  | "cancelled";

export interface TaskRunState {
  taskId: string;
  status: TaskStatus;
  adapterId: string | null;
  attemptCount: number;
  startedAt: number | null;   // unixepoch ms
  completedAt: number | null;
  worktreePath: string | null;
  errorMessage: string | null;
  routingReason: string;      // written at dispatch, read by reporter
}

export interface GoalRunState {
  goalId: string;
  status: GoalRunStatus;
  tasks: Record<string, TaskRunState>;
  startedAt: number;
  completedAt: number | null;
  mergeResult: MergeResult | null;
}

export interface MergeResult {
  strategy: "auto" | "review_required";
  mergedTasks: string[];
  conflicts: ConflictInfo[];
  commitSha: string | null;
}

export interface ConflictInfo {
  taskId: string;
  files: string[];
  reason: string;
}
```

---

## TaskNode (task-node.ts)

Wraps a single `TaskSpec` and tracks its runtime state. Responsibilities:

- Hold the `TaskRunState` for this task
- Reference to the `AgentSession` when running (null otherwise)
- Expose `isReady(completedIds: Set<string>): boolean` — true when all `dependsOn` IDs are in the completed set
- Expose `canRetry(): boolean` — true when `attemptCount < 2` (zero-indexed: first attempt = 0, one retry = 1)
- Hold reference to the worktree path once created

```typescript
export class TaskNode {
  readonly spec: TaskSpec;
  state: TaskRunState;
  session: AgentSession | null = null;

  constructor(spec: TaskSpec) { ... }
  isReady(completedIds: Set<string>): boolean { ... }
  canRetry(): boolean { ... }  // attemptCount < 2
}
```

---

## DagScheduler (scheduler.ts)

Drives task execution. Responsibilities:

1. **Cycle detection:** On construction, validate the dependency graph has no cycles. Throw `CyclicDependencyError` if detected. Use Kahn's algorithm (topological sort).
2. **Ready queue:** Maintain a set of tasks whose dependencies are all completed.
3. **Concurrency enforcement:** At most `maxConcurrency` (default 3, configurable) tasks running simultaneously.
4. **Dispatch loop:** Call `tick()` repeatedly (event-driven, not polling) to dispatch newly-ready tasks.
5. **Completion signals:** When a task completes, update the completed set and call `tick()` again to potentially unblock dependents.

```typescript
export class DagScheduler {
  private readonly nodes: Map<string, TaskNode>;
  private readonly maxConcurrency: number;
  private readonly completed = new Set<string>();
  private readonly failed = new Set<string>();
  private running = 0;

  constructor(nodes: TaskNode[], maxConcurrency = 3) { ... }

  /** Returns all tasks that are ready and within concurrency limit */
  getDispatchable(): TaskNode[] { ... }

  /** Mark a task completed; updates ready queue */
  markCompleted(taskId: string): void { ... }

  /** Mark a task failed; dependents become "skipped" */
  markFailed(taskId: string): void { ... }

  /** True when all non-skipped tasks are done */
  isFinished(): boolean { ... }

  /** Compute topological order for merge phase */
  topologicalOrder(): string[] { ... }
}
```

---

## Router (router.ts)

Maps `(taskType, complexity)` → preferred `AgentAdapter`. The routing matrix:

| taskType | complexity | preferred adapter | fallback adapter |
|---|---|---|---|
| implementation | low | codex | claude-code |
| implementation | medium | claude-code | codex |
| implementation | high | claude-code | null (no fallback) |
| review | any | claude-code | null |
| testing | low | codex | claude-code |
| testing | medium | claude-code | null |
| testing | high | claude-code | null |
| documentation | any | codex | claude-code |
| analysis | any | claude-code | null |
| refactoring | low | codex | claude-code |
| refactoring | medium/high | claude-code | null |

Router must:
1. Accept `preferredAgent` override on the task spec (skip matrix lookup if present)
2. Check `adapter.isAvailable()` before returning it — if preferred is unavailable, return fallback
3. Return `{ adapter: AgentAdapter; reason: string }` — the `reason` string becomes `routing_reason` in telemetry

```typescript
export interface RoutingDecision {
  adapter: AgentAdapter;
  reason: string;  // e.g. "matrix:implementation/high→claude-code" or "override:claude-code"
}

export async function routeTask(
  spec: TaskSpec,
  adapters: Map<string, AgentAdapter>,
): Promise<RoutingDecision> { ... }
```

---

## Worktree (worktree.ts)

Each task gets its own git worktree so concurrent tasks don't share the working tree.

```typescript
export interface WorktreeInfo {
  path: string;        // absolute path to worktree
  branch: string;      // branch name, e.g. "mc/goal-{goalId}/task-{taskId}"
  taskId: string;
}

/** Create a new worktree branching from baseRef */
export async function createWorktree(
  repoRoot: string,
  goalId: string,
  taskId: string,
  baseRef: string,
): Promise<WorktreeInfo> {
  // git worktree add <path> -b <branch> <baseRef>
  // path = repoRoot + "/.amoena-worktrees/" + goalId + "/" + taskId
}

/** Remove a worktree (after merge or 24h cleanup) */
export async function removeWorktree(
  repoRoot: string,
  worktreePath: string,
): Promise<void> {
  // git worktree remove --force <path>
}

/** List all worktrees older than 24h (for cleanup job) */
export async function listStaleWorktrees(
  repoRoot: string,
  maxAgeMs = 86_400_000,
): Promise<WorktreeInfo[]> { ... }
```

All git operations must use `child_process.execFile("git", args, { cwd: repoRoot })`. Do not use string interpolation to build shell commands (injection risk).

---

## Merger (merger.ts)

After all tasks complete (or as many as possible), merge worktrees back in topological order.

**Strategy:**
1. For each task in topological order, collect changed files: `git diff --name-only <baseRef>...<branch>`
2. If a file appears in two or more completed task branches → flag as `review_required` for those tasks
3. Tasks with no overlap → `git merge --no-ff <branch>` into the base worktree
4. Tasks with overlap → skip auto-merge, add to `conflicts` in `MergeResult`, emit a warning event

```typescript
export async function mergeTaskResults(
  repoRoot: string,
  goalId: string,
  completedTasks: TaskNode[],
  topologicalOrder: string[],
  baseRef: string,
): Promise<MergeResult> { ... }
```

---

## GoalRun (goal-run.ts)

Orchestrates the full lifecycle of one goal. This is the main class external callers use.

```typescript
export class GoalRun extends EventEmitter {
  readonly goalId: string;
  private state: GoalRunState;
  private scheduler: DagScheduler;
  private adapters: Map<string, AgentAdapter>;

  constructor(spec: GoalSpec, adapters: Map<string, AgentAdapter>) { ... }

  /** Start execution; resolves when all tasks finish or goal is cancelled */
  async run(): Promise<GoalRunState> { ... }

  /** Cancel all running tasks */
  async cancel(): Promise<void> { ... }

  /** Serialize current state to goal_run_state table */
  async persistState(): Promise<void> { ... }

  /** Resume from persisted state (called on restart) */
  static async resume(goalId: string, adapters: Map<string, AgentAdapter>): Promise<GoalRun> { ... }
}
```

**Events emitted by GoalRun:**

| Event | Payload | Description |
|---|---|---|
| `task:dispatched` | `{ taskId, adapterId, routingReason }` | Task handed to adapter |
| `task:output` | `OutputChunk` | Forwarded from AgentSession |
| `task:completed` | `TaskRunState` | Task finished successfully |
| `task:failed` | `TaskRunState` | Task failed (after retries exhausted) |
| `task:retrying` | `{ taskId, attempt, fallback }` | Retry being attempted |
| `goal:completed` | `GoalRunState` | All tasks done |
| `goal:cancelled` | `GoalRunState` | Goal was cancelled |

---

## Retry / Failure Logic

Per task:
1. First failure → retry with the **same adapter** (attempt 1 → 2)
2. Second failure → retry with the **fallback adapter** if one exists in the routing matrix (attempt 2 → 3)
3. Third failure (or no fallback) → mark task `failed`; dependents become `skipped`

On timeout (`timeoutMs` exceeded): count as a failure. The adapter's `cancel()` is called (which sends SIGTERM→5s→SIGKILL). Status becomes `timed_out`, not `failed`. Timeout still counts toward retry budget.

---

## Cancel / Rollback

When `GoalRun.cancel()` is called:
1. Call `session.cancel()` on all currently running sessions (SIGTERM → 5s → SIGKILL)
2. Do **not** remove completed worktrees — preserve them for potential partial resume
3. Mark all queued/running tasks as `cancelled` in state
4. Set goal status to `cancelled`
5. Persist state to `goal_run_state` table
6. Emit `goal:cancelled`

---

## Crash Recovery (recovery.ts)

On application restart, the dashboard checks for incomplete `goal_runs` in the DB:

```typescript
export async function findIncompleteGoalRuns(): Promise<string[]> {
  // SELECT goal_id FROM goal_runs WHERE status IN ('running', 'pending')
}

export async function loadGoalRunState(goalId: string): Promise<GoalRunState | null> {
  // SELECT state_json FROM goal_run_state WHERE goal_id = ?
  // JSON.parse the stored blob
}

export async function saveGoalRunState(state: GoalRunState): Promise<void> {
  // INSERT OR REPLACE INTO goal_run_state (goal_id, state_json, updated_at)
  // VALUES (?, ?, unixepoch())
}
```

`GoalRun.persistState()` must be called:
- After each task state transition
- Before the process exits (register a `process.on("SIGTERM")` handler in `goal-run.ts`)

On resume, tasks that were `completed` stay completed. Tasks that were `running` at crash time are reset to `queued` (they will re-run from scratch — worktrees may have partial output).

---

## Acceptance Criteria

1. **Cycle detection:** Constructing a `DagScheduler` with a cyclic dependency graph throws `CyclicDependencyError` with the cycle path in the message.
2. **Topological scheduling:** In a graph of A→B→C (C depends on B, B depends on A), tasks dispatch in order A, then B, then C. B never dispatches before A is completed.
3. **Concurrency limit:** With 10 independent tasks and `maxConcurrency=3`, at most 3 tasks are in `running` state simultaneously at any point.
4. **Router availability check:** If the preferred adapter returns `isAvailable() = false`, the fallback adapter is used. If both are unavailable, the task fails immediately with a descriptive error.
5. **Retry logic:** A task that fails twice with the same adapter, then succeeds on the third attempt with the fallback, is recorded as `completed` with `attemptCount = 3`.
6. **Timeout→cancel:** When a task's adapter session exceeds `timeoutMs`, the session is cancelled and the task status is `timed_out`.
7. **Goal cancel:** Calling `GoalRun.cancel()` mid-run causes all running sessions to receive SIGTERM. Completed worktrees are preserved. Goal status becomes `cancelled`.
8. **Crash recovery:** After calling `persistState()`, calling `loadGoalRunState()` and constructing a new `GoalRun` via `resume()` produces a run with correct task statuses from before the "crash".
9. **Merge auto:** Two tasks modifying non-overlapping files produce `MergeResult.strategy = "auto"` and `conflicts = []`.
10. **Merge flag:** Two tasks modifying the same file produce `MergeResult.strategy = "review_required"` and the file appears in `conflicts[0].files`.
11. **Worktree cleanup:** `listStaleWorktrees()` returns worktrees older than 24h and excludes recent ones.
12. **No TypeScript errors:** `bun tsc --noEmit` in `packages/amoena-service` passes clean.

---

## Test Requirements

Location: `packages/amoena-service/src/orchestration/dag-engine/__tests__/`

```
scheduler.test.ts
  ✓ linear chain: A→B→C dispatches in order
  ✓ parallel branches: A→{B,C}→D — B and C dispatch together after A
  ✓ concurrency cap: 10 tasks, cap 3 → never more than 3 running
  ✓ cycle detection: A→B→A throws CyclicDependencyError
  ✓ failed task → dependents become skipped

router.test.ts
  ✓ implementation/high → claude-code when available
  ✓ implementation/low → codex when available, falls back to claude-code
  ✓ preferredAgent override bypasses matrix
  ✓ unavailable preferred → uses fallback → reason string reflects this

goal-run.test.ts
  ✓ successful run: all tasks complete, goal status "completed"
  ✓ partial failure: one task fails, dependents skipped, status "partial_failure"
  ✓ cancel mid-run: sessions receive cancel(), goal status "cancelled"
  ✓ retry: task fails once, retries with same adapter, succeeds
  ✓ fallback retry: task fails twice, third attempt uses fallback adapter
  ✓ persistState → loadGoalRunState round-trips correctly

worktree.test.ts
  ✓ createWorktree creates a directory and branch
  ✓ removeWorktree cleans up
  ✓ listStaleWorktrees age filter works

merger.test.ts
  ✓ no-overlap tasks auto-merge
  ✓ overlapping files flagged as review_required
```

**Mock strategy:** Do not run real git commands in unit tests. Mock `child_process.execFile` to return canned outputs. Keep one integration test (`worktree.integration.test.ts`) that runs real git in a `tmp` directory — mark it with `// @integration` and exclude from the default test run.

---

## Dependencies on Other Components

- **Prompt 01 (CLI Adapters):** Imports `AgentAdapter`, `AgentSession`, `AdapterTask`, `SessionResult` from `packages/amoena-service/src/orchestration/cli-adapters/`
- **Prompt 03 (Telemetry):** Calls telemetry write functions after each task state transition and on goal completion. Import from `apps/dashboard/src/lib/db.ts` via the shared package boundary, or better: accept a `TelemetryWriter` interface injected via constructor to avoid a hard dependency on the dashboard package.

---

## What This Provides to Other Components

- `04-run-reporter.md` reads `GoalRunState` from SQLite (written by this engine via `saveGoalRunState`)
- `05-mission-control-ui.md` subscribes to `GoalRun` events forwarded over WebSocket
- Goal decomposition (future Prompt) calls `new GoalRun(spec, adapters)` and `.run()`

---

## Files to Create

| Path | Purpose |
|---|---|
| `packages/amoena-service/src/orchestration/dag-engine/types.ts` | DAG-specific types |
| `packages/amoena-service/src/orchestration/dag-engine/task-node.ts` | TaskNode class |
| `packages/amoena-service/src/orchestration/dag-engine/scheduler.ts` | DagScheduler |
| `packages/amoena-service/src/orchestration/dag-engine/router.ts` | Heuristic router |
| `packages/amoena-service/src/orchestration/dag-engine/worktree.ts` | Git worktree utilities |
| `packages/amoena-service/src/orchestration/dag-engine/merger.ts` | Post-run merge strategy |
| `packages/amoena-service/src/orchestration/dag-engine/recovery.ts` | Crash recovery utilities |
| `packages/amoena-service/src/orchestration/dag-engine/goal-run.ts` | GoalRun class |
| `packages/amoena-service/src/orchestration/dag-engine/index.ts` | Re-exports |
| `packages/amoena-service/src/orchestration/dag-engine/__tests__/scheduler.test.ts` | Tests |
| `packages/amoena-service/src/orchestration/dag-engine/__tests__/router.test.ts` | Tests |
| `packages/amoena-service/src/orchestration/dag-engine/__tests__/goal-run.test.ts` | Tests |
| `packages/amoena-service/src/orchestration/dag-engine/__tests__/worktree.test.ts` | Tests |
| `packages/amoena-service/src/orchestration/dag-engine/__tests__/merger.test.ts` | Tests |

---

## Verification Commands

```bash
# Type check
cd packages/amoena-service && bun tsc --noEmit

# Unit tests only (exclude integration)
bun test src/orchestration/dag-engine/__tests__ --exclude "*.integration.*"

# Check no raw shell string interpolation in worktree.ts (security)
grep -n "execSync\|exec(" src/orchestration/dag-engine/worktree.ts
# Should show only execFile calls, never execSync or exec with string templates
```
