import { describe, expect, it, mock } from 'bun:test';

import { ExtensionLifecycle } from '../extensions/extension-lifecycle.js';
import type { InstalledExtension } from '../extensions/types.js';
import type { ExtensionSandbox } from '../extensions/extension-sandbox.js';

function makeExtension(id = 'ext-1'): InstalledExtension {
  return {
    id,
    name: 'Test',
    version: '1.0.0',
    author: 'tester',
    description: 'test',
    permissions: [],
    hooks: [{ event: 'onSession', handler: 'handleSession' }],
    enabled: true,
    installedAt: Date.now(),
    assetsPath: '/tmp/test.luna',
  };
}

function makeSandbox(executeResult: unknown = 'ok'): ExtensionSandbox {
  return {
    executeHook: mock(async () => executeResult),
    expose: mock(() => {}),
    dispose: mock(() => {}),
    extensionId: 'ext-1',
    isDisposed: false,
  } as unknown as ExtensionSandbox;
}

describe('ExtensionLifecycle', () => {
  describe('registerHooks / fireHook', () => {
    it('fires hook to registered extension sandbox', async () => {
      const lifecycle = new ExtensionLifecycle();
      const ext = makeExtension();
      const sandbox = makeSandbox('handler-result');

      lifecycle.registerHooks(ext, sandbox);
      const results = await lifecycle.fireHook('onSession', { id: 'sess-1' });

      expect(results).toHaveLength(1);
      expect(results[0]!.extensionId).toBe('ext-1');
      expect(results[0]!.result).toBe('handler-result');
      expect(results[0]!.timedOut).toBe(false);
    });

    it('returns empty results when no extensions are registered for the event', async () => {
      const lifecycle = new ExtensionLifecycle();
      const results = await lifecycle.fireHook('onSession', {});
      expect(results).toHaveLength(0);
    });

    it('does not fire hooks for non-matching events', async () => {
      const lifecycle = new ExtensionLifecycle();
      const ext = makeExtension();
      const sandbox = makeSandbox();
      lifecycle.registerHooks(ext, sandbox);

      const results = await lifecycle.fireHook('onMemory', {});
      expect(results).toHaveLength(0);
    });
  });

  describe('hook error handling', () => {
    it('emits hook:error and includes result with undefined value on sandbox error', async () => {
      const lifecycle = new ExtensionLifecycle();
      const ext = makeExtension();
      const sandbox = {
        executeHook: mock(async () => {
          throw new Error('sandbox exploded');
        }),
        expose: mock(() => {}),
        dispose: mock(() => {}),
        extensionId: 'ext-1',
        isDisposed: false,
      } as unknown as ExtensionSandbox;

      const errors: string[] = [];
      lifecycle.on('hook:error', (extId) => errors.push(extId));

      lifecycle.registerHooks(ext, sandbox);
      const results = await lifecycle.fireHook('onSession', {});

      expect(results).toHaveLength(1);
      expect(results[0]!.result).toBeUndefined();
      expect(errors).toContain('ext-1');
    });
  });

  describe('lifecycle events', () => {
    it('emits install event', () => {
      const lifecycle = new ExtensionLifecycle();
      const received: string[] = [];
      lifecycle.on('install', (ext) => received.push(ext.id));

      lifecycle.emitInstall(makeExtension('my-ext'));
      expect(received).toContain('my-ext');
    });

    it('emits enable/disable events', () => {
      const lifecycle = new ExtensionLifecycle();
      const enabled: string[] = [];
      const disabled: string[] = [];
      lifecycle.on('enable', (id) => enabled.push(id));
      lifecycle.on('disable', (id) => disabled.push(id));

      lifecycle.emitEnable('ext-a');
      lifecycle.emitDisable('ext-b');

      expect(enabled).toContain('ext-a');
      expect(disabled).toContain('ext-b');
    });

    it('emits uninstall event', () => {
      const lifecycle = new ExtensionLifecycle();
      const uninstalled: string[] = [];
      lifecycle.on('uninstall', (id) => uninstalled.push(id));

      lifecycle.emitUninstall('ext-gone');
      expect(uninstalled).toContain('ext-gone');
    });
  });
});
