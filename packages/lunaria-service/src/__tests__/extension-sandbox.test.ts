import { describe, expect, it } from 'bun:test';

import { ExtensionSandbox, SandboxUnavailableError } from '../extensions/extension-sandbox.js';
import type { InstalledExtension } from '../extensions/types.js';

function makeExtension(overrides: Partial<InstalledExtension> = {}): InstalledExtension {
  return {
    id: 'test-ext',
    name: 'Test',
    version: '1.0.0',
    author: 'tester',
    description: 'test',
    permissions: [],
    hooks: [],
    enabled: true,
    installedAt: Date.now(),
    assetsPath: '/tmp/test.luna',
    ...overrides,
  };
}

describe('ExtensionSandbox', () => {
  describe('construction', () => {
    it('creates a sandbox with default options', () => {
      const ext = makeExtension();
      const sandbox = new ExtensionSandbox(ext);
      expect(sandbox.extensionId).toBe('test-ext');
      expect(sandbox.isDisposed).toBe(false);
    });

    it('accepts custom memory and cpu options', () => {
      const ext = makeExtension();
      const sandbox = new ExtensionSandbox(ext, { memoryLimitMb: 64, cpuTimeoutMs: 2000 });
      expect(sandbox.isDisposed).toBe(false);
    });
  });

  describe('dispose', () => {
    it('marks sandbox as disposed after dispose()', () => {
      const sandbox = new ExtensionSandbox(makeExtension());
      sandbox.dispose();
      expect(sandbox.isDisposed).toBe(true);
    });

    it('is idempotent — calling dispose() twice does not throw', () => {
      const sandbox = new ExtensionSandbox(makeExtension());
      sandbox.dispose();
      expect(() => sandbox.dispose()).not.toThrow();
    });
  });

  describe('after dispose', () => {
    it('executeHook throws after dispose', async () => {
      const sandbox = new ExtensionSandbox(makeExtension());
      sandbox.dispose();
      await expect(sandbox.executeHook('onSession', {})).rejects.toThrow('disposed');
    });

    it('expose throws after dispose', () => {
      const sandbox = new ExtensionSandbox(makeExtension());
      sandbox.dispose();
      expect(() => sandbox.expose({})).toThrow('disposed');
    });
  });

  describe('adversarial — sandbox isolation (when ivm unavailable)', () => {
    it('throws SandboxUnavailableError or proceeds gracefully if ivm missing', async () => {
      // In CI / bun environments isolated-vm may not load.
      // The sandbox must either work or throw SandboxUnavailableError — never a raw crash.
      const sandbox = new ExtensionSandbox(makeExtension());
      try {
        await sandbox.init();
        // if init succeeded, executeHook should return something
        const result = await sandbox.executeHook('onSession', { id: 'sess-1' });
        expect(result).toBeDefined();
      } catch (err) {
        expect(err).toBeInstanceOf(SandboxUnavailableError);
      } finally {
        sandbox.dispose();
      }
    });

    it('prototype pollution attempt is contained', async () => {
      const before = Object.prototype.toString;
      const sandbox = new ExtensionSandbox(makeExtension());
      try {
        await sandbox.init();
        // attempt to pass a polluted payload
        const payload = JSON.parse('{"__proto__":{"polluted":true}}') as unknown;
        await sandbox.executeHook('onData', payload).catch(() => {});
      } catch {
        // sandbox unavailable — expected in bun/CI
      } finally {
        sandbox.dispose();
      }
      // prototype must not be polluted
      expect((Object.prototype as Record<string, unknown>)['polluted']).toBeUndefined();
      expect(Object.prototype.toString).toBe(before);
    });
  });
});
