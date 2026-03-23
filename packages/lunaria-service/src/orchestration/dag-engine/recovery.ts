import type { GoalRunState } from "./types.js";

/**
 * Storage interface for persisting GoalRunState.
 * Inject a concrete implementation to decouple from the dashboard SQLite DB.
 */
export interface GoalRunStorage {
  save(state: GoalRunState): Promise<void>;
  load(goalId: string): Promise<GoalRunState | null>;
  findIncomplete(): Promise<string[]>;
}

/**
 * In-memory implementation — useful for tests and standalone runs.
 */
export class InMemoryGoalRunStorage implements GoalRunStorage {
  private readonly store = new Map<string, GoalRunState>();

  async save(state: GoalRunState): Promise<void> {
    this.store.set(state.goalId, structuredClone(state));
  }

  async load(goalId: string): Promise<GoalRunState | null> {
    const stored = this.store.get(goalId);
    return stored ? structuredClone(stored) : null;
  }

  async findIncomplete(): Promise<string[]> {
    const ids: string[] = [];
    for (const state of this.store.values()) {
      if (state.status === "running" || state.status === "pending") {
        ids.push(state.goalId);
      }
    }
    return ids;
  }
}

/**
 * Module-level helpers that delegate to a provided storage instance.
 * These mirror the spec's function signatures and are used by GoalRun.
 */
export async function saveGoalRunState(
  storage: GoalRunStorage,
  state: GoalRunState,
): Promise<void> {
  await storage.save(state);
}

export async function loadGoalRunState(
  storage: GoalRunStorage,
  goalId: string,
): Promise<GoalRunState | null> {
  return storage.load(goalId);
}

export async function findIncompleteGoalRuns(
  storage: GoalRunStorage,
): Promise<string[]> {
  return storage.findIncomplete();
}
