import { Database } from "bun:sqlite";
import path from "node:path";
import os from "node:os";

// --- Schema stubs (column name constants for Electron main imports) ---

export const settings = {
  id: "id" as const,
  key: "key" as const,
  value: "value" as const,
  updatedAt: "updatedAt" as const,
};

export const workspaces = {
  id: "id" as const,
  name: "name" as const,
  worktreeId: "worktreeId" as const,
  createdAt: "createdAt" as const,
};

export const worktrees = {
  id: "id" as const,
  path: "path" as const,
  workspaceId: "workspaceId" as const,
  createdAt: "createdAt" as const,
};

export const sessions = {
  id: "id" as const,
  workspaceId: "workspaceId" as const,
  agentId: "agentId" as const,
  status: "status" as const,
  startedAt: "startedAt" as const,
  endedAt: "endedAt" as const,
};

export const agents = {
  id: "id" as const,
  name: "name" as const,
  provider: "provider" as const,
  model: "model" as const,
  config: "config" as const,
  createdAt: "createdAt" as const,
};

// --- DDL helpers ---

function applySchema(db: Database): void {
  db.run(`
    CREATE TABLE IF NOT EXISTS settings (
      id        TEXT PRIMARY KEY,
      key       TEXT NOT NULL UNIQUE,
      value     TEXT NOT NULL,
      updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS workspaces (
      id         TEXT PRIMARY KEY,
      name       TEXT NOT NULL,
      worktreeId TEXT,
      createdAt  TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS worktrees (
      id          TEXT PRIMARY KEY,
      path        TEXT NOT NULL,
      workspaceId TEXT,
      createdAt   TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS sessions (
      id          TEXT PRIMARY KEY,
      workspaceId TEXT,
      agentId     TEXT,
      status      TEXT NOT NULL DEFAULT 'idle',
      startedAt   TEXT,
      endedAt     TEXT
    )
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS agents (
      id        TEXT PRIMARY KEY,
      name      TEXT NOT NULL,
      provider  TEXT NOT NULL,
      model     TEXT NOT NULL,
      config    TEXT NOT NULL DEFAULT '{}',
      createdAt TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);
}

// --- Public API ---

/**
 * Opens (or creates) a SQLite database at `dbPath` with WAL mode enabled
 * and the Amoena schema applied.
 */
export function createLocalDb(dbPath: string): Database {
  const db = new Database(dbPath, { create: true, readwrite: true });
  db.run("PRAGMA journal_mode = WAL");
  db.run("PRAGMA foreign_keys = ON");
  applySchema(db);
  return db;
}

// Singleton state
let _instance: Database | null = null;
let _instancePath: string | null = null;

/**
 * Returns the existing singleton database, or creates one.
 * If `dbPath` is omitted the database is placed in `~/.amoena/amoena.db`.
 */
export function getOrCreateDb(dbPath?: string): Database {
  const resolvedPath =
    dbPath ?? path.join(os.homedir(), ".amoena", "amoena.db");

  if (_instance && _instancePath === resolvedPath) {
    return _instance;
  }

  _instance = createLocalDb(resolvedPath);
  _instancePath = resolvedPath;
  return _instance;
}

export { Database };
