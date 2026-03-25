/**
 * Mission Control WebSocket event discriminated unions.
 *
 * MCServerEvent — emitted by the amoena-service, consumed by the dashboard UI.
 * MCClientEvent — sent by the dashboard UI, consumed by the amoena-service.
 */

import type { TaskStatus, GoalRunStatus } from "./status.js";
import type { TaskRunRow, RunReport } from "./models.js";
import type { GoalOptions } from "./options.js";

/**
 * Events pushed from the server (amoena-service) to the client (dashboard).
 */
export type MCServerEvent =
  | {
      type: "task:dispatched";
      taskId: string;
      adapterId: string;
      routingReason: string;
      description?: string;
    }
  | {
      type: "task:output";
      taskId: string;
      adapterId: string;
      text: string;
      timestamp: number;
    }
  | { type: "task:status"; taskId: string; status: TaskStatus }
  | { type: "task:completed"; task: TaskRunRow }
  | { type: "task:failed"; task: TaskRunRow }
  | {
      type: "task:retrying";
      taskId: string;
      attempt: number;
      reason: string;
    }
  | {
      type: "task:error";
      taskId: string;
      message: string;
      fatal: boolean;
    }
  | { type: "goal:status"; goalId: string; status: GoalRunStatus }
  | { type: "goal:completed"; report: RunReport }
  | { type: "goal:cancelled"; goalId: string }
  | {
      type: "cost:update";
      goalId: string;
      totalUsd: number;
      byAgent: Record<string, number>;
    };

/**
 * Events sent from the client (dashboard) to the server (amoena-service).
 */
export type MCClientEvent =
  | { type: "goal:submit"; description: string; options?: GoalOptions }
  | { type: "goal:cancel"; goalId: string }
  | {
      /** Subscribe to events for a specific goal run. */
      type: "subscribe";
      goalId: string;
    };
