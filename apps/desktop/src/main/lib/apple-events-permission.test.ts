import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const execFileMock = vi.hoisted(() => vi.fn(() => {}));
const consoleLogMock = vi.hoisted(() => vi.fn(() => {}));
let originalPlatform = process.platform;

vi.mock('node:child_process', () => ({
  execFile: execFileMock,
}));

const { requestAppleEventsAccess } = await import('./apple-events-permission');

function setPlatform(platform: NodeJS.Platform) {
  Object.defineProperty(process, 'platform', {
    configurable: true,
    value: platform,
  });
}

describe('apple-events-permission', () => {
  beforeEach(() => {
    originalPlatform = process.platform;
    setPlatform('darwin');
    console.log = consoleLogMock as typeof console.log;
    execFileMock.mock.calls.length = 0;
    consoleLogMock.mock.calls.length = 0;
  });

  afterEach(() => {
    setPlatform(originalPlatform);
    console.log = globalThis.console.log;
  });

  it('does nothing on non-darwin platforms', () => {
    setPlatform('linux');
    requestAppleEventsAccess();
    expect(execFileMock.mock.calls).toHaveLength(0);
  });

  it('invokes osascript on darwin', () => {
    requestAppleEventsAccess();

    expect(execFileMock.mock.calls).toHaveLength(1);
    expect(execFileMock.mock.calls[0][0]).toBe('osascript');
    expect(execFileMock.mock.calls[0][1]).toEqual([
      '-e',
      'tell application "System Events" to return 1',
    ]);
  });

  it('logs success when the permission probe succeeds', () => {
    execFileMock.mockImplementation((_cmd, _args, cb) => cb?.(null, '', ''));
    requestAppleEventsAccess();

    expect(consoleLogMock.mock.calls.at(-1)?.[0]).toContain('Apple Events access granted');
  });

  it('logs expected errors without throwing', () => {
    execFileMock.mockImplementation((_cmd, _args, cb) => cb?.(new Error('denied'), '', ''));

    expect(() => requestAppleEventsAccess()).not.toThrow();
    expect(consoleLogMock.mock.calls.at(-1)?.[0]).toContain('Permission request error');
  });
});
