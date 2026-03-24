import { homedir } from 'os';
import { mkdirSync } from 'fs';
import { join } from 'path';
import type { GoalRun } from '../types.js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyDb = any;

// Lazy-load better-sqlite3 to allow tests to run without native bindings.
// We use `any` here because better-sqlite3 is a CJS module with a complex
// type that varies between versions and isn't reliably importable as a type.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let DatabaseCtor: (new (path: string) => AnyDb) | null = null;

function getDb(): AnyDb | null {
  if (!DatabaseCtor) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      DatabaseCtor = require('better-sqlite3');
    } catch {
      // Native module not available (e.g. in tests)
      return null;
    }
  }
  if (!DatabaseCtor) return null;
  const dir = join(homedir(), '.lunaria');
  mkdirSync(dir, { recursive: true });
  const db = new DatabaseCtor(join(dir, 'tui.db'));
  db.exec(`
    CREATE TABLE IF NOT EXISTS goal_runs (
      id TEXT PRIMARY KEY,
      goal TEXT NOT NULL,
      status TEXT NOT NULL,
      total_cost REAL NOT NULL DEFAULT 0,
      started_at INTEGER NOT NULL,
      finished_at INTEGER
    );
    CREATE TABLE IF NOT EXISTS task_runs (
      id TEXT PRIMARY KEY,
      run_id TEXT NOT NULL REFERENCES goal_runs(id),
      name TEXT NOT NULL,
      agent TEXT NOT NULL,
      status TEXT NOT NULL,
      cost REAL NOT NULL DEFAULT 0,
      duration_ms INTEGER NOT NULL DEFAULT 0
    );
  `);
  return db;
}

export function persistGoalRun(run: GoalRun): void {
  const db = getDb();
  if (!db) return;

  const upsertRun = db.prepare(`
    INSERT OR REPLACE INTO goal_runs (id, goal, status, total_cost, started_at, finished_at)
    VALUES (@id, @goal, @status, @totalCost, @startedAt, @finishedAt)
  `);

  const upsertTask = db.prepare(`
    INSERT OR REPLACE INTO task_runs (id, run_id, name, agent, status, cost, duration_ms)
    VALUES (@id, @runId, @name, @agent, @status, @cost, @durationMs)
  `);

  db.transaction(() => {
    upsertRun.run({
      id: run.id,
      goal: run.goal,
      status: run.status,
      totalCost: run.totalCost,
      startedAt: run.startedAt,
      finishedAt: run.finishedAt ?? null,
    });
    for (const task of run.tasks) {
      upsertTask.run({
        id: task.id,
        runId: run.id,
        name: task.name,
        agent: task.agent,
        status: task.status,
        cost: task.cost,
        durationMs: task.durationMs,
      });
    }
  })();
}

export function loadRecentRuns(limit = 20): GoalRun[] {
  const db = getDb();
  if (!db) return [];

  const runs = db
    .prepare('SELECT * FROM goal_runs ORDER BY started_at DESC LIMIT ?')
    .all(limit) as {
    id: string;
    goal: string;
    status: string;
    total_cost: number;
    started_at: number;
    finished_at: number | null;
  }[];

  return runs.map((row) => ({
    id: row.id,
    goal: row.goal,
    status: row.status as GoalRun['status'],
    tasks: [],
    totalCost: row.total_cost,
    startedAt: row.started_at,
    finishedAt: row.finished_at ?? undefined,
  }));
}
