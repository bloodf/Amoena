import EventEmitter from 'eventemitter3';

import type { ExtensionEvent, HookResult, InstalledExtension } from './types.js';
import type { ExtensionSandbox } from './extension-sandbox.js';

interface LifecycleEvents {
  install: [extension: InstalledExtension];
  enable: [extensionId: string];
  disable: [extensionId: string];
  uninstall: [extensionId: string];
  'hook:fired': [result: HookResult];
  'hook:error': [extensionId: string, hookName: string, error: Error];
}

type HookRegistration = {
  extensionId: string;
  event: string;
  handler: string;
  sandbox: ExtensionSandbox;
};

export class ExtensionLifecycle extends EventEmitter<LifecycleEvents> {
  private readonly registrations: HookRegistration[] = [];

  registerHooks(extension: InstalledExtension, sandbox: ExtensionSandbox): void {
    for (const hook of extension.hooks) {
      this.registrations.push({
        extensionId: extension.id,
        event: hook.event,
        handler: hook.handler,
        sandbox,
      });
    }
  }

  unregisterHooks(extensionId: string): void {
    const idx = this.registrations.findIndex((r) => r.extensionId === extensionId);
    while (idx !== -1) {
      this.registrations.splice(idx, 1);
    }
    // remove all registrations for the extension
    for (let i = this.registrations.length - 1; i >= 0; i--) {
      if (this.registrations[i]?.extensionId === extensionId) {
        this.registrations.splice(i, 1);
      }
    }
  }

  async fireHook(event: string, payload: unknown): Promise<HookResult[]> {
    const matching = this.registrations.filter((r) => r.event === event);
    const results: HookResult[] = [];

    for (const reg of matching) {
      const start = Date.now();
      let timedOut = false;
      let hookResult: unknown;

      try {
        hookResult = await reg.sandbox.executeHook(reg.handler, payload);
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        if (error.message.includes('timed out') || error.message.includes('timeout')) {
          timedOut = true;
        }
        this.emit('hook:error', reg.extensionId, event, error);
        hookResult = undefined;
      }

      const result: HookResult = {
        extensionId: reg.extensionId,
        hookName: event,
        result: hookResult,
        durationMs: Date.now() - start,
        timedOut,
      };

      results.push(result);
      this.emit('hook:fired', result);
    }

    return results;
  }

  emitInstall(extension: InstalledExtension): void {
    this.emit('install', extension);
  }

  emitEnable(extensionId: string): void {
    this.emit('enable', extensionId);
  }

  emitDisable(extensionId: string): void {
    this.emit('disable', extensionId);
  }

  emitUninstall(extensionId: string): void {
    this.emit('uninstall', extensionId);
  }
}

export type { ExtensionEvent, HookResult };
