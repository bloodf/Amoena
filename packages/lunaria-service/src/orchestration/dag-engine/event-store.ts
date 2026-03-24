import type Database from "better-sqlite3";
import type { OrchestrationEvent } from "./events.js";

export interface EventStore {
  append(events: OrchestrationEvent[]): void;
  loadByGoalRun(goalRunId: string): OrchestrationEvent[];
  loadAll(): OrchestrationEvent[];
  loadSince(timestamp: number): OrchestrationEvent[];
}

/**
 * SQLite-backed event store — append-only, transactional.
 *
 * Table schema (created by migration in apps/dashboard/src/lib/migrations.ts):
 *   dag_events (id TEXT PRIMARY KEY, goal_run_id TEXT, type TEXT, payload TEXT, timestamp INTEGER)
 */
export class SqliteEventStore implements EventStore {
  constructor(private readonly db: Database.Database) {}

  append(events: OrchestrationEvent[]): void {
    if (events.length === 0) return;

    const insert = this.db.prepare(
      `INSERT INTO dag_events (id, goal_run_id, type, payload, timestamp)
       VALUES (?, ?, ?, ?, ?)`,
    );

    const insertMany = this.db.transaction((evts: OrchestrationEvent[]) => {
      for (const evt of evts) {
        insert.run(evt.id, evt.goalRunId, evt.type, JSON.stringify(evt), evt.timestamp);
      }
    });

    insertMany(events);
  }

  loadByGoalRun(goalRunId: string): OrchestrationEvent[] {
    const rows = this.db
      .prepare(
        `SELECT payload FROM dag_events
         WHERE goal_run_id = ?
         ORDER BY timestamp ASC, id ASC`,
      )
      .all(goalRunId) as { payload: string }[];
    return rows.map((r) => JSON.parse(r.payload) as OrchestrationEvent);
  }

  loadAll(): OrchestrationEvent[] {
    const rows = this.db
      .prepare(
        `SELECT payload FROM dag_events
         ORDER BY timestamp ASC, id ASC`,
      )
      .all() as { payload: string }[];
    return rows.map((r) => JSON.parse(r.payload) as OrchestrationEvent);
  }

  loadSince(timestamp: number): OrchestrationEvent[] {
    const rows = this.db
      .prepare(
        `SELECT payload FROM dag_events
         WHERE timestamp >= ?
         ORDER BY timestamp ASC, id ASC`,
      )
      .all(timestamp) as { payload: string }[];
    return rows.map((r) => JSON.parse(r.payload) as OrchestrationEvent);
  }
}

/**
 * In-memory event store — for testing and standalone runs.
 */
export class InMemoryEventStore implements EventStore {
  private readonly events: OrchestrationEvent[] = [];

  append(events: OrchestrationEvent[]): void {
    for (const evt of events) {
      this.events.push(evt);
    }
  }

  loadByGoalRun(goalRunId: string): OrchestrationEvent[] {
    return this.events.filter((e) => e.goalRunId === goalRunId);
  }

  loadAll(): OrchestrationEvent[] {
    return [...this.events];
  }

  loadSince(timestamp: number): OrchestrationEvent[] {
    return this.events.filter((e) => e.timestamp >= timestamp);
  }
}
