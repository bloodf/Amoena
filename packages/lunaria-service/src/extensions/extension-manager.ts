import fs from 'node:fs';
import path from 'node:path';

import { parseLunaBundle } from './luna-parser.js';
import { ExtensionLifecycle } from './extension-lifecycle.js';
import { ExtensionSandbox } from './extension-sandbox.js';
import { PermissionEnforcer } from './permission-enforcer.js';
import type { InstalledExtension } from './types.js';

export interface Database {
  prepare(sql: string): {
    run: (...args: unknown[]) => void;
    get: (...args: unknown[]) => unknown;
    all: (...args: unknown[]) => unknown[];
  };
}

export class ExtensionManager {
  private readonly db: Database;
  private readonly extensionsDir: string;
  private readonly lifecycle: ExtensionLifecycle;
  private readonly enforcer: PermissionEnforcer;
  private readonly sandboxes = new Map<string, ExtensionSandbox>();
  private cache: InstalledExtension[] | null = null;

  constructor(db: Database, extensionsDir: string) {
    this.db = db;
    this.extensionsDir = extensionsDir;
    this.lifecycle = new ExtensionLifecycle();
    this.enforcer = new PermissionEnforcer();
    fs.mkdirSync(extensionsDir, { recursive: true });
  }

  get events(): ExtensionLifecycle {
    return this.lifecycle;
  }

  async install(lunaFilePath: string): Promise<InstalledExtension> {
    const data = fs.readFileSync(lunaFilePath);
    const bundle = parseLunaBundle(data);
    const { manifest } = bundle;

    const validation = this.enforcer.validateManifestPermissions(manifest);
    if (!validation.valid) {
      throw new Error(`invalid extension manifest: ${validation.errors.join(', ')}`);
    }

    const destPath = path.join(this.extensionsDir, `${manifest.id}.luna`);
    fs.copyFileSync(lunaFilePath, destPath);

    const now = Date.now();
    const hooks = manifest.contributes?.hooks ?? [];

    const extension: InstalledExtension = {
      id: manifest.id,
      name: manifest.name,
      version: manifest.version,
      author: manifest.publisher ?? '',
      description: manifest.description,
      permissions: manifest.permissions,
      hooks: hooks.map((h) => ({ event: h.event, handler: h.handler })),
      enabled: false,
      installedAt: now,
      assetsPath: destPath,
    };

    this.db
      .prepare(
        `INSERT OR REPLACE INTO extensions
          (id, name, version, author, description, permissions, hooks, enabled, installed_at, assets_path)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(
        extension.id,
        extension.name,
        extension.version,
        extension.author,
        extension.description,
        JSON.stringify(extension.permissions),
        JSON.stringify(extension.hooks),
        extension.enabled ? 1 : 0,
        extension.installedAt,
        extension.assetsPath,
      );

    this.cache = null;
    this.lifecycle.emitInstall(extension);
    return extension;
  }

  async uninstall(extensionId: string): Promise<void> {
    await this.disable(extensionId).catch(() => undefined);

    const ext = this.getExtension(extensionId);
    if (ext !== null && fs.existsSync(ext.assetsPath)) {
      fs.unlinkSync(ext.assetsPath);
    }

    this.db.prepare('DELETE FROM extensions WHERE id = ?').run(extensionId);
    this.cache = null;
    this.lifecycle.emitUninstall(extensionId);
  }

  async enable(extensionId: string): Promise<void> {
    const ext = this.getExtension(extensionId);
    if (ext === null) {
      throw new Error(`extension not found: ${extensionId}`);
    }

    if (!this.sandboxes.has(extensionId)) {
      const sandbox = new ExtensionSandbox(ext);
      try {
        await sandbox.init();
      } catch {
        // sandbox unavailable — register without isolation
      }
      this.sandboxes.set(extensionId, sandbox);
      this.lifecycle.registerHooks(ext, sandbox);
    }

    this.db.prepare('UPDATE extensions SET enabled = 1 WHERE id = ?').run(extensionId);
    this.cache = null;
    this.lifecycle.emitEnable(extensionId);
  }

  async disable(extensionId: string): Promise<void> {
    const sandbox = this.sandboxes.get(extensionId);
    if (sandbox !== undefined) {
      sandbox.dispose();
      this.sandboxes.delete(extensionId);
    }

    this.lifecycle.unregisterHooks(extensionId);
    this.db.prepare('UPDATE extensions SET enabled = 0 WHERE id = ?').run(extensionId);
    this.cache = null;
    this.lifecycle.emitDisable(extensionId);
  }

  listInstalled(): InstalledExtension[] {
    if (this.cache !== null) return this.cache;

    const rows = this.db
      .prepare(
        'SELECT id, name, version, author, description, permissions, hooks, enabled, installed_at, assets_path FROM extensions ORDER BY installed_at ASC',
      )
      .all() as Array<{
      id: string;
      name: string;
      version: string;
      author: string;
      description: string;
      permissions: string;
      hooks: string;
      enabled: number;
      installed_at: number;
      assets_path: string;
    }>;

    this.cache = rows.map((row) => ({
      id: row.id,
      name: row.name,
      version: row.version,
      author: row.author,
      description: row.description,
      permissions: JSON.parse(row.permissions) as string[],
      hooks: JSON.parse(row.hooks) as { event: string; handler: string }[],
      enabled: row.enabled === 1,
      installedAt: row.installed_at,
      assetsPath: row.assets_path,
    }));

    return this.cache;
  }

  getExtension(id: string): InstalledExtension | null {
    return this.listInstalled().find((e) => e.id === id) ?? null;
  }
}
