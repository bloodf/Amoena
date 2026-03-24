import type { OrchestrationCommand } from "./commands.js";
import type { OrchestrationEvent } from "./events.js";
import type { OrchestrationReadModel } from "./read-model.js";

/** Monotonically incrementing counter for ULID-like IDs (no crypto dependency) */
let _seq = 0;
function makeEventId(): string {
  return `${Date.now()}-${(++_seq).toString().padStart(6, "0")}`;
}

export class InvariantError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvariantError";
  }
}

/**
 * Pure function: given a command and the current read model, return either
 * the list of events to emit or an InvariantError if the command is invalid.
 *
 * NO side effects — reads only, never mutates readModel.
 */
export function decide(
  command: OrchestrationCommand,
  readModel: OrchestrationReadModel,
): OrchestrationEvent[] | InvariantError {
  const now = Date.now();

  switch (command.type) {
    case "goal.submit": {
      if (readModel.goalRuns.has(command.goalId)) {
        return new InvariantError(
          `Goal "${command.goalId}" already exists`,
        );
      }
      return [
        {
          id: makeEventId(),
          goalRunId: command.goalId,
          timestamp: now,
          type: "goal.created",
          description: command.description,
          taskCount: command.tasks.length,
        },
      ];
    }

    case "goal.cancel": {
      const goal = readModel.goalRuns.get(command.goalId);
      if (!goal) {
        return new InvariantError(
          `Goal "${command.goalId}" does not exist`,
        );
      }
      if (goal.status !== "running" && goal.status !== "pending") {
        return new InvariantError(
          `Goal "${command.goalId}" is not running (status: ${goal.status})`,
        );
      }
      return [
        {
          id: makeEventId(),
          goalRunId: command.goalId,
          timestamp: now,
          type: "goal.cancelled",
        },
      ];
    }

    case "task.dispatch": {
      const goal = readModel.goalRuns.get(command.goalId);
      if (!goal) {
        return new InvariantError(
          `Goal "${command.goalId}" does not exist`,
        );
      }
      const task = readModel.tasks.get(command.taskId);
      if (!task) {
        return new InvariantError(
          `Task "${command.taskId}" does not exist`,
        );
      }
      if (task.status !== "queued") {
        return new InvariantError(
          `Task "${command.taskId}" is not queued (status: ${task.status})`,
        );
      }
      return [
        {
          id: makeEventId(),
          goalRunId: command.goalId,
          timestamp: now,
          type: "task.dispatched",
          taskId: command.taskId,
          adapterId: command.adapterId,
          routingReason: command.routingReason,
        },
      ];
    }

    case "task.output": {
      const task = readModel.tasks.get(command.taskId);
      if (!task) {
        return new InvariantError(
          `Task "${command.taskId}" does not exist`,
        );
      }
      return [
        {
          id: makeEventId(),
          goalRunId: command.goalId,
          timestamp: command.timestamp,
          type: "task.output.appended",
          taskId: command.taskId,
          text: command.text,
        },
      ];
    }

    case "task.complete": {
      const task = readModel.tasks.get(command.taskId);
      if (!task) {
        return new InvariantError(
          `Task "${command.taskId}" does not exist`,
        );
      }
      if (task.status !== "running") {
        return new InvariantError(
          `Task "${command.taskId}" is not running (status: ${task.status})`,
        );
      }
      return [
        {
          id: makeEventId(),
          goalRunId: command.goalId,
          timestamp: now,
          type: "task.completed",
          taskId: command.taskId,
          durationMs: command.durationMs,
          tokenCount: command.tokenCount,
          cost: command.cost,
        },
      ];
    }

    case "task.fail": {
      const task = readModel.tasks.get(command.taskId);
      if (!task) {
        return new InvariantError(
          `Task "${command.taskId}" does not exist`,
        );
      }
      if (task.status !== "running") {
        return new InvariantError(
          `Task "${command.taskId}" is not running (status: ${task.status})`,
        );
      }
      return [
        {
          id: makeEventId(),
          goalRunId: command.goalId,
          timestamp: now,
          type: "task.failed",
          taskId: command.taskId,
          error: command.error,
        },
      ];
    }

    case "task.retry": {
      const task = readModel.tasks.get(command.taskId);
      if (!task) {
        return new InvariantError(
          `Task "${command.taskId}" does not exist`,
        );
      }
      if (task.status !== "failed" && task.status !== "timed_out") {
        return new InvariantError(
          `Task "${command.taskId}" must be failed or timed_out to retry (status: ${task.status})`,
        );
      }
      if (task.attemptCount >= 3) {
        return new InvariantError(
          `Task "${command.taskId}" has exceeded maximum retry attempts (${task.attemptCount})`,
        );
      }
      return [
        {
          id: makeEventId(),
          goalRunId: command.goalId,
          timestamp: now,
          type: "task.retrying",
          taskId: command.taskId,
          newAdapterId: command.newAdapterId,
          attempt: command.attempt,
        },
      ];
    }

    case "task.timeout": {
      const task = readModel.tasks.get(command.taskId);
      if (!task) {
        return new InvariantError(
          `Task "${command.taskId}" does not exist`,
        );
      }
      if (task.status !== "running") {
        return new InvariantError(
          `Task "${command.taskId}" is not running (status: ${task.status})`,
        );
      }
      return [
        {
          id: makeEventId(),
          goalRunId: command.goalId,
          timestamp: now,
          type: "task.timed_out",
          taskId: command.taskId,
        },
      ];
    }

    case "task.skip": {
      const task = readModel.tasks.get(command.taskId);
      if (!task) {
        return new InvariantError(
          `Task "${command.taskId}" does not exist`,
        );
      }
      if (task.status !== "queued") {
        return new InvariantError(
          `Task "${command.taskId}" must be queued to skip (status: ${task.status})`,
        );
      }
      return [
        {
          id: makeEventId(),
          goalRunId: command.goalId,
          timestamp: now,
          type: "task.skipped",
          taskId: command.taskId,
          reason: command.reason,
        },
      ];
    }

    case "merge.start": {
      const goal = readModel.goalRuns.get(command.goalId);
      if (!goal) {
        return new InvariantError(
          `Goal "${command.goalId}" does not exist`,
        );
      }
      return [
        {
          id: makeEventId(),
          goalRunId: command.goalId,
          timestamp: now,
          type: "merge.started",
        },
      ];
    }

    case "merge.conflict": {
      const goal = readModel.goalRuns.get(command.goalId);
      if (!goal) {
        return new InvariantError(
          `Goal "${command.goalId}" does not exist`,
        );
      }
      return [
        {
          id: makeEventId(),
          goalRunId: command.goalId,
          timestamp: now,
          type: "merge.conflicted",
          taskId: command.taskId,
          files: command.files,
        },
      ];
    }

    case "merge.complete": {
      const goal = readModel.goalRuns.get(command.goalId);
      if (!goal) {
        return new InvariantError(
          `Goal "${command.goalId}" does not exist`,
        );
      }
      return [
        {
          id: makeEventId(),
          goalRunId: command.goalId,
          timestamp: now,
          type: "merge.completed",
        },
      ];
    }

    case "cost.update": {
      const goal = readModel.goalRuns.get(command.goalId);
      if (!goal) {
        return new InvariantError(
          `Goal "${command.goalId}" does not exist`,
        );
      }
      return [
        {
          id: makeEventId(),
          goalRunId: command.goalId,
          timestamp: now,
          type: "cost.updated",
          totalUsd: command.totalUsd,
          byAgent: { ...command.byAgent },
        },
      ];
    }

    default: {
      const _exhaustive: never = command;
      return new InvariantError(`Unknown command type: ${JSON.stringify(_exhaustive)}`);
    }
  }
}
