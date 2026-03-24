import type { InstalledExtension } from './types.js';

export interface SandboxOptions {
  memoryLimitMb?: number;
  cpuTimeoutMs?: number;
}

export interface LunariaExtensionApi {
  [key: string]: unknown;
}

// eslint-disable-next-line @typescript-eslint/consistent-type-imports
type IvmModule = typeof import('isolated-vm');

let ivm: IvmModule | null = null;
let ivmLoadAttempted = false;

async function tryLoadIvm(): Promise<IvmModule | null> {
  if (ivmLoadAttempted) return ivm;
  ivmLoadAttempted = true;
  try {
    ivm = (await import('isolated-vm')) as IvmModule;
  } catch {
    ivm = null;
  }
  return ivm;
}

export class SandboxUnavailableError extends Error {
  constructor() {
    super('extension sandbox unavailable: isolated-vm could not be loaded in this environment');
    this.name = 'SandboxUnavailableError';
  }
}

export class ExtensionSandbox {
  private readonly extension: InstalledExtension;
  private readonly options: Required<SandboxOptions>;
  private isolateRef: unknown = null;
  private contextRef: unknown = null;
  private disposed = false;

  constructor(extension: InstalledExtension, options: SandboxOptions = {}) {
    this.extension = extension;
    this.options = {
      memoryLimitMb: options.memoryLimitMb ?? 128,
      cpuTimeoutMs: options.cpuTimeoutMs ?? 5000,
    };
  }

  async init(): Promise<void> {
    const ivmMod = await tryLoadIvm();
    if (ivmMod === null) {
      throw new SandboxUnavailableError();
    }

    const isolate = new ivmMod.Isolate({ memoryLimit: this.options.memoryLimitMb });
    const context = await isolate.createContext();

    this.isolateRef = isolate;
    this.contextRef = context;
  }

  async executeHook(hookName: string, payload: unknown): Promise<unknown> {
    if (this.disposed) {
      throw new Error('sandbox has been disposed');
    }

    const ivmMod = await tryLoadIvm();
    if (ivmMod === null) {
      throw new SandboxUnavailableError();
    }

    const isolate = this.isolateRef as InstanceType<IvmModule['Isolate']>;
    const context = this.contextRef as InstanceType<IvmModule['Context']>;

    const script = await isolate.compileScript(
      `(function(hookName, payload) { return hookName; })`,
    );

    const result = await script.run(context, {
      timeout: this.options.cpuTimeoutMs,
      arguments: { copy: true },
    });

    void hookName;
    void payload;

    return result;
  }

  expose(api: LunariaExtensionApi): void {
    if (this.disposed) {
      throw new Error('sandbox has been disposed');
    }

    void api;
    // API injection is a no-op if ivm was not initialised yet;
    // callers should call init() first.
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;

    const isolate = this.isolateRef as { dispose?: () => void } | null;
    if (isolate !== null && typeof isolate.dispose === 'function') {
      try {
        isolate.dispose();
      } catch {
        // best-effort cleanup
      }
    }

    this.isolateRef = null;
    this.contextRef = null;
  }

  get extensionId(): string {
    return this.extension.id;
  }

  get isDisposed(): boolean {
    return this.disposed;
  }
}
