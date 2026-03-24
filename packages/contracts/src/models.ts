/**
 * Shared data models for Mission Control telemetry and reporting.
 */

import type { TaskStatus, GoalRunStatus } from "./status.js";

/** A single task execution record, as stored in telemetry and shown in the UI. */
export interface TaskRunRow {
  taskId: string;
  goalId: string;
  adapterId: string;
  description: string;
  taskType: string;
  complexity?: string;
  status: TaskStatus;
  startedAt?: number;
  completedAt?: number;
  durationMs?: number;
  /** Cost in USD for this task's token usage. */
  costUsd?: number;
  attempts?: number;
  dependsOn?: string[];
  routingReason?: string;
  couldImprove?: boolean;
}

/** A single goal run record, as stored in telemetry and shown in the UI. */
export interface GoalRunRow {
  goalId: string;
  description: string;
  status: GoalRunStatus;
  startedAt: number;
  completedAt?: number;
  durationMs?: number;
  totalCostUsd?: number;
  taskCount?: number;
}

/** Per-agent aggregated performance metrics for a goal run. */
export interface AgentPerformanceRow {
  adapterId: string;
  assigned: number;
  completed: number;
  failed: number;
  avgDurationMs?: number;
  totalCostUsd?: number;
  successRate?: number;
}

/** Full structured report for a completed goal run. */
export interface RunReport {
  goalId: string;
  description: string;
  status: GoalRunStatus;
  startedAt: number;
  completedAt?: number;
  durationMs?: number;
  totalCostUsd?: number;
  tasks: TaskRunRow[];
  agents: AgentPerformanceRow[];
  routing: RoutingDecision[];
}

/** Records how a task was routed to a specific adapter. */
export interface RoutingDecision {
  taskId: string;
  adapterId: string;
  reason: string;
  couldImprove: boolean;
}
