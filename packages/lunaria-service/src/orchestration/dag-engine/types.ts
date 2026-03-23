/** The user's high-level goal, decomposed into tasks before passing to the engine */
export interface GoalSpec {
  id: string; // UUID
  description: string; // Original natural-language goal
  tasks: TaskSpec[]; // Pre-decomposed task list
  baseRef: string; // Git ref to base worktrees on (e.g. "main")
  timeoutMs?: number; // Per-task timeout; default 300_000
  maxConcurrency?: number; // Override global default of 3
  metadata?: Record<string, unknown>;
}

export interface TaskSpec {
  id: string; // Stable task ID within the goal
  description: string; // What this task should do
  dependsOn: string[]; // IDs of tasks that must complete before this one
  taskType: TaskType;
  complexity: TaskComplexity;
  preferredAgent?: string; // Optional hint; overrides router
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
  startedAt: number | null; // unixepoch ms
  completedAt: number | null;
  worktreePath: string | null;
  errorMessage: string | null;
  routingReason: string; // written at dispatch, read by reporter
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
