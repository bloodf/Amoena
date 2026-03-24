export { ExtensionManager } from './extension-manager.js';
export { ExtensionRegistry } from './extension-registry.js';
export { ExtensionSandbox, SandboxUnavailableError } from './extension-sandbox.js';
export { ExtensionLifecycle } from './extension-lifecycle.js';
export { PermissionEnforcer } from './permission-enforcer.js';
export { parseLunaBundle, LunaParseError } from './luna-parser.js';
export type {
  InstalledExtension,
  LunaManifest,
  Hook,
  DiscoveredExtension,
  ConflictReport,
  ValidationResult,
  HookResult,
  ExtensionEvent,
} from './types.js';
