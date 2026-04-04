import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import type { ChildProcess } from 'node:child_process';
import { EventEmitter } from 'node:events';

function createDeferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (error?: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return { promise, resolve, reject };
}

class MockChildProcess extends EventEmitter {
  stdout = new EventEmitter();
  stderr = new EventEmitter();
  kill = vi.fn(() => true);
}

const getProcessEnvWithShellPathMock = vi.fn(async (env: Record<string, string>) => env);
let lastChild: MockChildProcess | null = null;
const spawnMock = vi.fn((..._args: unknown[]) => {
  lastChild = new MockChildProcess();
  return lastChild as unknown as ChildProcess;
});
let HostServiceManager: typeof import('./host-service-manager').HostServiceManager;

describe('HostServiceManager', () => {
  beforeAll(async () => {
    const childProcessModule = await import('node:child_process');
    const shellEnvModule = await import('../../lib/trpc/routers/workspaces/utils/shell-env');

    vi.spyOn(childProcessModule, 'spawn').mockImplementation(((_args) =>
      spawnMock(_args)) as typeof childProcessModule.spawn);
    vi.spyOn(shellEnvModule, 'getProcessEnvWithShellPath').mockImplementation(((
      baseEnv: NodeJS.ProcessEnv = process.env,
    ) =>
      getProcessEnvWithShellPathMock(
        baseEnv as Record<string, string>,
      )) as typeof shellEnvModule.getProcessEnvWithShellPath);

    vi.mock('electron', () => ({
      app: {
        isPackaged: false,
        getAppPath: () => '/tmp/app',
      },
    }));

    ({ HostServiceManager } = await import('./host-service-manager'));
  });

  afterAll(() => {
    vi.restoreAllMocks();
  });

  beforeEach(() => {
    getProcessEnvWithShellPathMock.mockReset();
    getProcessEnvWithShellPathMock.mockImplementation(async (env: Record<string, string>) => env);
    spawnMock.mockReset();
    spawnMock.mockImplementation(() => {
      lastChild = new MockChildProcess();
      return lastChild as unknown as ChildProcess;
    });
    lastChild = null;
  });

  it('dedupes concurrent starts while shell PATH is resolving', async () => {
    const manager = new HostServiceManager();
    const pendingEnv = createDeferred<Record<string, string>>();
    getProcessEnvWithShellPathMock.mockImplementation(() => pendingEnv.promise);

    const firstStart = manager.start('org-1');
    const secondStart = manager.start('org-1');

    expect(manager.getStatus('org-1')).toBe('starting');
    expect(getProcessEnvWithShellPathMock.mock.calls).toHaveLength(1);

    pendingEnv.resolve({ PATH: '/usr/bin:/bin' });
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(spawnMock.mock.calls).toHaveLength(1);
    expect(lastChild).not.toBeNull();
    expect(spawnMock.mock.calls[0]?.[2]).toMatchObject({
      stdio: ['ignore', 'pipe', 'pipe', 'ipc'],
    });

    lastChild?.emit('message', { type: 'ready', port: 4242 });

    expect(await firstStart).toBe(4242);
    expect(await secondStart).toBe(4242);
    expect(manager.getPort('org-1')).toBe(4242);
  });
});
