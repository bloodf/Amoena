/**
 * Canonical status types shared across the Lunaria stack.
 *
 * These definitions are the source of truth — UI and service code should
 * import from here rather than defining their own copies.
 */

/**
 * Lifecycle state of an individual task within a goal run.
 *
 * - `queued`    — waiting for a free execution slot or dependency to resolve
 * - `running`   — currently executing in a worktree
 * - `completed` — finished with exit code 0
 * - `failed`    — finished with a non-zero exit code or thrown error
 * - `timed_out` — exceeded the per-task timeout
 * - `cancelled` — explicitly cancelled before completion
 * - `skipped`   — skipped because an upstream dependency failed
 */
export type TaskStatus =
  | "queued"
  | "running"
  | "completed"
  | "failed"
  | "timed_out"
  | "cancelled"
  | "skipped";

/**
 * Lifecycle state of an entire goal run.
 *
 * - `running`          — at least one task is still executing
 * - `completed`        — all tasks completed successfully
 * - `partial_failure`  — run finished but some tasks failed
 * - `failed`           — all tasks failed or a fatal error occurred
 * - `cancelled`        — the run was cancelled by the user
 */
export type GoalRunStatus =
  | "running"
  | "completed"
  | "partial_failure"
  | "failed"
  | "cancelled";
