import type { Hook, InstalledExtension, LunaManifest, ValidationResult } from './types.js';

const KNOWN_PERMISSIONS = new Set([
  'sessions.read',
  'sessions.write',
  'memory.read',
  'memory.write',
  'ui.toast',
  'ui.panel',
  'tools.register',
  'providers.register',
  'hooks.listen',
  'settings.read',
  'settings.write',
  'files.read',
  'files.write',
  'network.fetch',
]);

const HOOK_PERMISSION_MAP: ReadonlyMap<string, string> = new Map([
  ['onSession', 'sessions.read'],
  ['onMemory', 'memory.read'],
  ['onToolCall', 'tools.register'],
  ['onSettings', 'settings.read'],
]);

export class PermissionEnforcer {
  checkPermission(extension: InstalledExtension, permission: string): boolean {
    return extension.permissions.includes(permission);
  }

  validateManifestPermissions(manifest: LunaManifest): ValidationResult {
    const errors: string[] = [];

    for (const permission of manifest.permissions) {
      if (!KNOWN_PERMISSIONS.has(permission)) {
        errors.push(`unknown permission: ${permission}`);
      }
    }

    return { valid: errors.length === 0, errors };
  }

  getRequiredPermissions(hooks: readonly Hook[]): string[] {
    const required = new Set<string>();

    for (const hook of hooks) {
      const eventBase = hook.event.split(':')[0] ?? hook.event;
      const permission = HOOK_PERMISSION_MAP.get(eventBase);
      if (permission !== undefined) {
        required.add(permission);
      }
    }

    required.add('hooks.listen');
    return Array.from(required);
  }
}
