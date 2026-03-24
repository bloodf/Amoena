import type Database from "better-sqlite3";
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
 * SQLite-backed implementation — persists goal run state across process restarts.
 */
export class SqliteGoalRunStorage implements GoalRunStorage {
  constructor(private readonly db: Database.Database) {}

  async save(state: GoalRunState): Promise<void> {
    this.db
      .prepare(
        `INSERT OR REPLACE INTO goal_run_state (goal_run_id, state_json, updated_at)
         VALUES (?, ?, ?)`,
      )
      .run(state.goalId, JSON.stringify(state), Math.floor(Date.now() / 1000));
  }

  async load(goalId: string): Promise<GoalRunState | null> {
    const row = this.db
      .prepare(`SELECT state_json FROM goal_run_state WHERE goal_run_id = ?`)
      .get(goalId) as { state_json: string } | undefined;
    if (!row) return null;
    return JSON.parse(row.state_json) as GoalRunState;
  }

  async findIncomplete(): Promise<string[]> {
    const rows = this.db
      .prepare(
        `SELECT grs.goal_run_id
         FROM goal_run_state grs
         JOIN goal_runs gr ON gr.id = grs.goal_run_id
         WHERE gr.status = 'running'`,
      )
      .all() as { goal_run_id: string }[];
    return rows.map((r) => r.goal_run_id);
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
