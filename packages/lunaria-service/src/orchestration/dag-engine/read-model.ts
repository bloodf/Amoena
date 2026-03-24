import type { GoalRunStatus, TaskStatus } from "./types.js";

export interface GoalRunView {
  goalRunId: string;
  description: string;
  taskCount: number;
  status: GoalRunStatus;
  startedAt: number;
  completedAt: number | null;
  totalCost: number;
  totalDurationMs: number;
  taskIds: string[];
}

export interface TaskView {
  taskId: string;
  goalRunId: string;
  status: TaskStatus;
  adapterId: string | null;
  routingReason: string;
  attemptCount: number;
  startedAt: number | null;
  completedAt: number | null;
  durationMs: number | null;
  tokenCount: number | null;
  cost: number;
  error: string | null;
  outputChunks: string[];
}

export interface AgentPerformanceView {
  adapterId: string;
  tasksCompleted: number;
  tasksFailed: number;
  totalCost: number;
  totalDurationMs: number;
}

export interface OrchestrationReadModel {
  goalRuns: Map<string, GoalRunView>;
  tasks: Map<string, TaskView>;
  agentPerformance: Map<string, AgentPerformanceView>;
}

export function createEmptyReadModel(): OrchestrationReadModel {
  return {
    goalRuns: new Map(),
    tasks: new Map(),
    agentPerformance: new Map(),
  };
}
