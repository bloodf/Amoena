import fs from 'node:fs';
import path from 'node:path';

import type { Database } from '../extensions/extension-manager.js';

export type SettingScope = 'global' | 'workspace';

export class SettingsStore {
  private readonly db: Database;
  private workspaceRoot: string | null = null;

  constructor(db: Database) {
    this.db = db;
  }

  setWorkspaceRoot(root: string): void {
    this.workspaceRoot = root;
  }

  get<T>(key: string, scope: SettingScope = 'global'): T | undefined {
    if (scope === 'workspace') {
      return this.getFromWorkspaceFile<T>(key);
    }

    const row = this.db
      .prepare("SELECT value FROM settings WHERE key = ? AND scope = 'global'")
      .get(key) as { value: string } | undefined;

    if (row === undefined) return undefined;

    try {
      return JSON.parse(row.value) as T;
    } catch {
      return undefined;
    }
  }

  set<T>(key: string, value: T, scope: SettingScope = 'global'): void {
    const serialized = JSON.stringify(value);
    const now = Date.now();

    if (scope === 'workspace') {
      this.setInWorkspaceFile(key, value);
      return;
    }

    this.db
      .prepare(
        `INSERT INTO settings (key, value, scope, updated_at)
         VALUES (?, ?, 'global', ?)
         ON CONFLICT(key, scope) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`,
      )
      .run(key, serialized, now);
  }

  getAll(scope?: SettingScope): Record<string, unknown> {
    if (scope === 'workspace') {
      return this.readWorkspaceFile();
    }

    if (scope === 'global') {
      return this.readGlobalSettings();
    }

    // merge global then workspace (workspace wins)
    return { ...this.readGlobalSettings(), ...this.readWorkspaceFile() };
  }

  delete(key: string, scope: SettingScope = 'global'): void {
    if (scope === 'workspace') {
      const current = this.readWorkspaceFile();
      const { [key]: _removed, ...rest } = current;
      void _removed;
      this.writeWorkspaceFile(rest);
      return;
    }

    this.db.prepare("DELETE FROM settings WHERE key = ? AND scope = 'global'").run(key);
  }

  private readGlobalSettings(): Record<string, unknown> {
    const rows = this.db
      .prepare("SELECT key, value FROM settings WHERE scope = 'global'")
      .all() as Array<{ key: string; value: string }>;

    const result: Record<string, unknown> = {};
    for (const row of rows) {
      try {
        result[row.key] = JSON.parse(row.value);
      } catch {
        result[row.key] = row.value;
      }
    }
    return result;
  }

  private workspaceSettingsPath(): string | null {
    if (this.workspaceRoot === null) return null;
    return path.join(this.workspaceRoot, '.amoena', 'settings.json');
  }

  private readWorkspaceFile(): Record<string, unknown> {
    const filePath = this.workspaceSettingsPath();
    if (filePath === null || !fs.existsSync(filePath)) return {};

    try {
      const raw = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(raw) as Record<string, unknown>;
    } catch {
      return {};
    }
  }

  private writeWorkspaceFile(data: Record<string, unknown>): void {
    const filePath = this.workspaceSettingsPath();
    if (filePath === null) {
      throw new Error('workspace root not set; call setWorkspaceRoot() first');
    }

    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  }

  private getFromWorkspaceFile<T>(key: string): T | undefined {
    const data = this.readWorkspaceFile();
    return key in data ? (data[key] as T) : undefined;
  }

  private setInWorkspaceFile<T>(key: string, value: T): void {
    const current = this.readWorkspaceFile();
    this.writeWorkspaceFile({ ...current, [key]: value });
  }
}
