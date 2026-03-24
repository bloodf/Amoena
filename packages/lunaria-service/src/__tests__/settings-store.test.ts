import { describe, expect, it, beforeEach, afterEach } from 'bun:test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { SettingsStore } from '../settings/settings-store.js';
import { migrateFromDefaults } from '../settings/settings-migration.js';

// Minimal in-memory SQLite-compatible stub for testing
function makeInMemoryDb() {
  const store = new Map<string, string>();

  return {
    prepare(sql: string) {
      return {
        run(...args: unknown[]) {
          if (sql.includes('INSERT INTO settings')) {
            const key = args[0] as string;
            const value = args[1] as string;
            store.set(`global:${key}`, value);
          } else if (sql.includes('DELETE FROM settings')) {
            const key = args[0] as string;
            store.delete(`global:${key}`);
          } else if (sql.includes('UPDATE settings')) {
            // no-op for this stub
          }
        },
        get(...args: unknown[]) {
          const key = args[0] as string;
          const value = store.get(`global:${key}`);
          return value !== undefined ? { value } : undefined;
        },
        all() {
          const rows: Array<{ key: string; value: string }> = [];
          for (const [storeKey, value] of store.entries()) {
            if (storeKey.startsWith('global:')) {
              rows.push({ key: storeKey.slice('global:'.length), value });
            }
          }
          return rows;
        },
      };
    },
  };
}

describe('SettingsStore', () => {
  describe('global scope', () => {
    it('sets and gets a global value', () => {
      const db = makeInMemoryDb();
      const store = new SettingsStore(db);
      store.set('theme', 'dark', 'global');
      expect(store.get<string>('theme', 'global')).toBe('dark');
    });

    it('returns undefined for missing keys', () => {
      const db = makeInMemoryDb();
      const store = new SettingsStore(db);
      expect(store.get('nonexistent', 'global')).toBeUndefined();
    });

    it('overwrites an existing value', () => {
      const db = makeInMemoryDb();
      const store = new SettingsStore(db);
      store.set('theme', 'dark', 'global');
      store.set('theme', 'light', 'global');
      expect(store.get<string>('theme', 'global')).toBe('light');
    });

    it('deletes a key', () => {
      const db = makeInMemoryDb();
      const store = new SettingsStore(db);
      store.set('theme', 'dark', 'global');
      store.delete('theme', 'global');
      expect(store.get('theme', 'global')).toBeUndefined();
    });

    it('stores structured values', () => {
      const db = makeInMemoryDb();
      const store = new SettingsStore(db);
      const value = { enabled: true, ports: [3000, 4000] };
      store.set('server', value, 'global');
      expect(store.get<typeof value>('server', 'global')).toEqual(value);
    });

    it('getAll returns all global settings', () => {
      const db = makeInMemoryDb();
      const store = new SettingsStore(db);
      store.set('a', 1, 'global');
      store.set('b', 2, 'global');
      const all = store.getAll('global');
      expect(all['a']).toBe(1);
      expect(all['b']).toBe(2);
    });
  });

  describe('workspace scope', () => {
    let tmpDir: string;

    beforeEach(() => {
      tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'lunaria-test-'));
    });

    afterEach(() => {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    });

    it('sets and gets a workspace value via file', () => {
      const db = makeInMemoryDb();
      const store = new SettingsStore(db);
      store.setWorkspaceRoot(tmpDir);
      store.set('editor.tabSize', 4, 'workspace');
      expect(store.get<number>('editor.tabSize', 'workspace')).toBe(4);
    });

    it('workspace settings persist as JSON file', () => {
      const db = makeInMemoryDb();
      const store = new SettingsStore(db);
      store.setWorkspaceRoot(tmpDir);
      store.set('editor.tabSize', 2, 'workspace');

      const filePath = path.join(tmpDir, '.lunaria', 'settings.json');
      const raw = JSON.parse(fs.readFileSync(filePath, 'utf8')) as Record<string, unknown>;
      expect(raw['editor.tabSize']).toBe(2);
    });

    it('workspace scope takes precedence in getAll() with no scope', () => {
      const db = makeInMemoryDb();
      const store = new SettingsStore(db);
      store.setWorkspaceRoot(tmpDir);
      store.set('theme', 'dark', 'global');
      store.set('theme', 'solarized', 'workspace');

      const all = store.getAll();
      expect(all['theme']).toBe('solarized');
    });
  });
});

describe('migrateFromDefaults', () => {
  it('seeds missing keys with default values', () => {
    const db = makeInMemoryDb();
    const store = new SettingsStore(db);
    migrateFromDefaults(store, { theme: 'dark', fontSize: 14 });
    expect(store.get<string>('theme')).toBe('dark');
    expect(store.get<number>('fontSize')).toBe(14);
  });

  it('does not overwrite existing values', () => {
    const db = makeInMemoryDb();
    const store = new SettingsStore(db);
    store.set('theme', 'light', 'global');
    migrateFromDefaults(store, { theme: 'dark' });
    expect(store.get<string>('theme')).toBe('light');
  });

  it('handles empty defaults gracefully', () => {
    const db = makeInMemoryDb();
    const store = new SettingsStore(db);
    expect(() => migrateFromDefaults(store, {})).not.toThrow();
  });
});
