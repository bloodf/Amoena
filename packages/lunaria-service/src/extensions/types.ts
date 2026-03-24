export interface Hook {
  event: string;
  handler: string;
}

export interface InstalledExtension {
  readonly id: string;
  readonly name: string;
  readonly version: string;
  readonly author: string;
  readonly description: string;
  readonly permissions: readonly string[];
  readonly hooks: readonly Hook[];
  readonly enabled: boolean;
  readonly installedAt: number;
  readonly assetsPath: string;
}

export interface LunaManifest {
  readonly id: string;
  readonly name: string;
  readonly version: string;
  readonly publisher?: string;
  readonly description: string;
  readonly permissions: readonly string[];
  readonly activationEvents: readonly string[];
  readonly contributes?: {
    readonly commands?: readonly { id: string; title: string }[];
    readonly panels?: readonly { id: string; entry: string; title?: string }[];
    readonly hooks?: readonly Hook[];
    readonly tools?: readonly { name: string; description: string; handler: string }[];
  };
}

export interface DiscoveredExtension {
  readonly filePath: string;
  readonly manifest: LunaManifest;
}

export interface ConflictReport {
  readonly duplicateIds: readonly string[];
  readonly versionConflicts: readonly { id: string; versions: readonly string[] }[];
  readonly permissionOverlaps: readonly { permission: string; extensionIds: readonly string[] }[];
  readonly hasConflicts: boolean;
}

export interface ValidationResult {
  readonly valid: boolean;
  readonly errors: readonly string[];
}

export interface HookResult {
  readonly extensionId: string;
  readonly hookName: string;
  readonly result: unknown;
  readonly durationMs: number;
  readonly timedOut: boolean;
}

export type ExtensionEvent =
  | 'install'
  | 'enable'
  | 'disable'
  | 'uninstall'
  | 'hook:fired'
  | 'hook:error';
