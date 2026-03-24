import { describe, expect, it } from 'bun:test';

import { PermissionEnforcer } from '../extensions/permission-enforcer.js';
import type { InstalledExtension, LunaManifest } from '../extensions/types.js';

function makeExtension(permissions: string[]): InstalledExtension {
  return {
    id: 'test-ext',
    name: 'Test',
    version: '1.0.0',
    author: 'tester',
    description: 'test',
    permissions,
    hooks: [],
    enabled: true,
    installedAt: Date.now(),
    assetsPath: '/tmp/test.luna',
  };
}

function makeManifest(permissions: string[]): LunaManifest {
  return {
    id: 'test-ext',
    name: 'Test',
    version: '1.0.0',
    description: 'test',
    permissions,
    activationEvents: [],
  };
}

describe('PermissionEnforcer', () => {
  const enforcer = new PermissionEnforcer();

  describe('checkPermission', () => {
    it('returns true when extension has the permission', () => {
      const ext = makeExtension(['sessions.read', 'memory.read']);
      expect(enforcer.checkPermission(ext, 'sessions.read')).toBe(true);
    });

    it('returns false when extension lacks the permission', () => {
      const ext = makeExtension(['sessions.read']);
      expect(enforcer.checkPermission(ext, 'memory.write')).toBe(false);
    });
  });

  describe('validateManifestPermissions', () => {
    it('returns valid for known permissions', () => {
      const manifest = makeManifest(['sessions.read', 'memory.read', 'ui.toast']);
      const result = enforcer.validateManifestPermissions(manifest);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('returns invalid for unknown permissions', () => {
      const manifest = makeManifest(['sessions.read', 'super.secret.hack']);
      const result = enforcer.validateManifestPermissions(manifest);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('unknown permission: super.secret.hack');
    });

    it('returns valid for empty permissions', () => {
      const manifest = makeManifest([]);
      const result = enforcer.validateManifestPermissions(manifest);
      expect(result.valid).toBe(true);
    });
  });

  describe('getRequiredPermissions', () => {
    it('always includes hooks.listen', () => {
      const perms = enforcer.getRequiredPermissions([]);
      expect(perms).toContain('hooks.listen');
    });

    it('maps onSession hooks to sessions.read', () => {
      const perms = enforcer.getRequiredPermissions([{ event: 'onSession', handler: 'onSession' }]);
      expect(perms).toContain('sessions.read');
    });

    it('maps onMemory hooks to memory.read', () => {
      const perms = enforcer.getRequiredPermissions([
        { event: 'onMemory', handler: 'handleMemory' },
      ]);
      expect(perms).toContain('memory.read');
    });

    it('returns deduplicated permissions', () => {
      const perms = enforcer.getRequiredPermissions([
        { event: 'onSession', handler: 'a' },
        { event: 'onSession', handler: 'b' },
      ]);
      const sessionReadCount = perms.filter((p) => p === 'sessions.read').length;
      expect(sessionReadCount).toBe(1);
    });
  });
});
