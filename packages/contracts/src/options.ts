/**
 * Option and capability types for goal execution and agent routing.
 */

/** Options that control how a goal run is executed. */
export interface GoalOptions {
  /** Maximum number of tasks that may run concurrently. */
  maxConcurrency?: number;
  /** Per-task timeout in milliseconds. */
  timeoutMs?: number;
}

/** The result of routing a task to a specific adapter. */
export interface RoutingDecision {
  taskId: string;
  adapterId: string;
  reason: string;
  couldImprove: boolean;
}

/**
 * Capability tags that an adapter exposes.
 * Used by the router to match tasks to adapters.
 */
export type AdapterCapabilities =
  | "code-generation"
  | "code-review"
  | "refactoring"
  | "analysis"
  | "documentation"
  | "testing";
