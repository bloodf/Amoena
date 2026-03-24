import type { OrchestrationEvent } from "./events.js";
import type {
  OrchestrationReadModel,
  GoalRunView,
  TaskView,
  AgentPerformanceView,
} from "./read-model.js";
import { createEmptyReadModel } from "./read-model.js";

/**
 * Pure function: given the current read model and one event, return a NEW
 * read model with the event applied. Never mutates the input.
 */
export function project(
  readModel: OrchestrationReadModel,
  event: OrchestrationEvent,
): OrchestrationReadModel {
  switch (event.type) {
    case "goal.created": {
      const goal: GoalRunView = {
        goalRunId: event.goalRunId,
        description: event.description,
        taskCount: event.taskCount,
        status: "pending",
        startedAt: event.timestamp,
        completedAt: null,
        totalCost: 0,
        totalDurationMs: 0,
        taskIds: [],
      };
      return {
        ...readModel,
        goalRuns: new Map(readModel.goalRuns).set(event.goalRunId, goal),
      };
    }

    case "goal.cancelled": {
      const existing = readModel.goalRuns.get(event.goalRunId);
      if (!existing) return readModel;
      const updated: GoalRunView = {
        ...existing,
        status: "cancelled",
        completedAt: event.timestamp,
      };
      return {
        ...readModel,
        goalRuns: new Map(readModel.goalRuns).set(event.goalRunId, updated),
      };
    }

    case "goal.completed": {
      const existing = readModel.goalRuns.get(event.goalRunId);
      if (!existing) return readModel;
      const updated: GoalRunView = {
        ...existing,
        status: event.status,
        completedAt: event.timestamp,
        totalCost: event.totalCost,
        totalDurationMs: event.totalDurationMs,
      };
      return {
        ...readModel,
        goalRuns: new Map(readModel.goalRuns).set(event.goalRunId, updated),
      };
    }

    case "task.dispatched": {
      const existing = readModel.tasks.get(event.taskId);
      const prev: TaskView = existing ?? {
        taskId: event.taskId,
        goalRunId: event.goalRunId,
        status: "queued",
        adapterId: null,
        routingReason: "",
        attemptCount: 0,
        startedAt: null,
        completedAt: null,
        durationMs: null,
        tokenCount: null,
        cost: 0,
        error: null,
        outputChunks: [],
      };
      const updated: TaskView = {
        ...prev,
        status: "running",
        adapterId: event.adapterId,
        routingReason: event.routingReason,
        attemptCount: prev.attemptCount + 1,
        startedAt: event.timestamp,
        error: null,
      };
      // Register taskId in goal's taskIds list
      const goal = readModel.goalRuns.get(event.goalRunId);
      const updatedGoal: GoalRunView | undefined = goal
        ? goal.taskIds.includes(event.taskId)
          ? goal
          : { ...goal, taskIds: [...goal.taskIds, event.taskId] }
        : undefined;
      return {
        ...readModel,
        tasks: new Map(readModel.tasks).set(event.taskId, updated),
        goalRuns: updatedGoal
          ? new Map(readModel.goalRuns).set(event.goalRunId, updatedGoal)
          : readModel.goalRuns,
      };
    }

    case "task.output.appended": {
      const existing = readModel.tasks.get(event.taskId);
      if (!existing) return readModel;
      const updated: TaskView = {
        ...existing,
        outputChunks: [...existing.outputChunks, event.text],
      };
      return {
        ...readModel,
        tasks: new Map(readModel.tasks).set(event.taskId, updated),
      };
    }

    case "task.completed": {
      const existing = readModel.tasks.get(event.taskId);
      if (!existing) return readModel;
      const updated: TaskView = {
        ...existing,
        status: "completed",
        completedAt: event.timestamp,
        durationMs: event.durationMs,
        tokenCount: event.tokenCount,
        cost: event.cost,
        error: null,
      };
      // Update agent performance
      const agentId = existing.adapterId ?? "unknown";
      const perfEntry = readModel.agentPerformance.get(agentId);
      const updatedPerf: AgentPerformanceView = {
        adapterId: agentId,
        tasksCompleted: (perfEntry?.tasksCompleted ?? 0) + 1,
        tasksFailed: perfEntry?.tasksFailed ?? 0,
        totalCost: (perfEntry?.totalCost ?? 0) + event.cost,
        totalDurationMs: (perfEntry?.totalDurationMs ?? 0) + event.durationMs,
      };
      return {
        ...readModel,
        tasks: new Map(readModel.tasks).set(event.taskId, updated),
        agentPerformance: new Map(readModel.agentPerformance).set(agentId, updatedPerf),
      };
    }

    case "task.failed": {
      const existing = readModel.tasks.get(event.taskId);
      if (!existing) return readModel;
      const updated: TaskView = {
        ...existing,
        status: "failed",
        completedAt: event.timestamp,
        error: event.error,
      };
      // Update agent performance
      const agentId = existing.adapterId ?? "unknown";
      const perfEntry = readModel.agentPerformance.get(agentId);
      const updatedPerf: AgentPerformanceView = {
        adapterId: agentId,
        tasksCompleted: perfEntry?.tasksCompleted ?? 0,
        tasksFailed: (perfEntry?.tasksFailed ?? 0) + 1,
        totalCost: perfEntry?.totalCost ?? 0,
        totalDurationMs: perfEntry?.totalDurationMs ?? 0,
      };
      return {
        ...readModel,
        tasks: new Map(readModel.tasks).set(event.taskId, updated),
        agentPerformance: new Map(readModel.agentPerformance).set(agentId, updatedPerf),
      };
    }

    case "task.retrying": {
      const existing = readModel.tasks.get(event.taskId);
      if (!existing) return readModel;
      const updated: TaskView = {
        ...existing,
        status: "queued",
        adapterId: event.newAdapterId,
        error: null,
        startedAt: null,
        completedAt: null,
      };
      return {
        ...readModel,
        tasks: new Map(readModel.tasks).set(event.taskId, updated),
      };
    }

    case "task.timed_out": {
      const existing = readModel.tasks.get(event.taskId);
      if (!existing) return readModel;
      const updated: TaskView = {
        ...existing,
        status: "timed_out",
        completedAt: event.timestamp,
      };
      const agentId = existing.adapterId ?? "unknown";
      const perfEntry = readModel.agentPerformance.get(agentId);
      const updatedPerf: AgentPerformanceView = {
        adapterId: agentId,
        tasksCompleted: perfEntry?.tasksCompleted ?? 0,
        tasksFailed: (perfEntry?.tasksFailed ?? 0) + 1,
        totalCost: perfEntry?.totalCost ?? 0,
        totalDurationMs: perfEntry?.totalDurationMs ?? 0,
      };
      return {
        ...readModel,
        tasks: new Map(readModel.tasks).set(event.taskId, updated),
        agentPerformance: new Map(readModel.agentPerformance).set(agentId, updatedPerf),
      };
    }

    case "task.skipped": {
      const existing = readModel.tasks.get(event.taskId);
      if (!existing) return readModel;
      const updated: TaskView = {
        ...existing,
        status: "skipped",
        completedAt: event.timestamp,
        error: event.reason,
      };
      return {
        ...readModel,
        tasks: new Map(readModel.tasks).set(event.taskId, updated),
      };
    }

    case "merge.started":
    case "merge.conflicted":
    case "merge.completed":
      // Merge events do not change the read model views directly;
      // they are informational for subscribers and the event log.
      return readModel;

    case "cost.updated": {
      const existing = readModel.goalRuns.get(event.goalRunId);
      if (!existing) return readModel;
      const updated: GoalRunView = {
        ...existing,
        totalCost: event.totalUsd,
      };
      return {
        ...readModel,
        goalRuns: new Map(readModel.goalRuns).set(event.goalRunId, updated),
      };
    }

    default: {
      const _exhaustive: never = event;
      return readModel;
    }
  }
}

/**
 * Rebuild a read model from scratch by folding all events.
 * Pure function — no side effects.
 */
export function buildReadModel(events: OrchestrationEvent[]): OrchestrationReadModel {
  return events.reduce(project, createEmptyReadModel());
}
