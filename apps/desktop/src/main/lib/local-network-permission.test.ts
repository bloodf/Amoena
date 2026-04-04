import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

type SocketMock = {
  on: ReturnType<typeof vi.fn>;
  bind: ReturnType<typeof vi.fn>;
  send: ReturnType<typeof vi.fn>;
  close: ReturnType<typeof vi.fn>;
};

const consoleLogMock = vi.hoisted(() => vi.fn(() => {}));
const createdSockets: SocketMock[] = [];
let originalPlatform = process.platform;

vi.mock('node:dgram', () => ({
  default: {
    createSocket: vi.fn(() => {
      const socket: SocketMock = {
        on: vi.fn((_event: string, _handler: (...args: any[]) => void) => {}),
        bind: vi.fn((cb?: () => void) => cb?.()),
        send: vi.fn((_msg, _offset, _length, _port, _address, cb?: (err?: Error | null) => void) =>
          cb?.(null),
        ),
        close: vi.fn(() => {}),
      };
      createdSockets.push(socket);
      return socket;
    }),
  },
}));

const { requestLocalNetworkAccess } = await import('./local-network-permission');

function setPlatform(platform: NodeJS.Platform) {
  Object.defineProperty(process, 'platform', {
    configurable: true,
    value: platform,
  });
}

describe('local-network-permission', () => {
  beforeEach(() => {
    originalPlatform = process.platform;
    setPlatform('darwin');
    console.log = consoleLogMock as typeof console.log;
    createdSockets.length = 0;
    consoleLogMock.mock.calls.length = 0;
  });

  afterEach(() => {
    setPlatform(originalPlatform);
    console.log = globalThis.console.log;
  });

  it('does nothing on non-darwin platforms', () => {
    setPlatform('linux');
    requestLocalNetworkAccess();
    expect(createdSockets).toHaveLength(0);
  });

  it('creates a UDP socket and sends a multicast probe on darwin', () => {
    requestLocalNetworkAccess();

    expect(createdSockets).toHaveLength(1);
    expect(createdSockets[0].bind.mock.calls).toHaveLength(1);
    expect(createdSockets[0].send.mock.calls).toHaveLength(1);
    expect(createdSockets[0].close.mock.calls).toHaveLength(1);
    expect(consoleLogMock.mock.calls.at(-1)?.[0]).toContain('Local network access requested');
  });

  it('closes the socket when send returns an error', () => {
    const socket = createdSockets[0] ?? null;
    requestLocalNetworkAccess();
    const activeSocket = socket ?? createdSockets[0];
    activeSocket.send.mockImplementation((_msg, _offset, _length, _port, _address, cb) =>
      cb?.(new Error('denied')),
    );

    requestLocalNetworkAccess();
    expect(consoleLogMock.mock.calls.at(-1)?.[0]).toContain('Send error');
    expect(createdSockets.at(-1)?.close.mock.calls.length).toBe(1);
  });

  it('logs socket errors and closes the socket', () => {
    requestLocalNetworkAccess();
    const socket = createdSockets.at(-1)!;
    const errorHandler = socket.on.mock.calls.find((call) => call[0] === 'error')?.[1];

    errorHandler?.(new Error('boom'));

    expect(consoleLogMock.mock.calls.at(-1)?.[0]).toContain('Socket error');
    expect(socket.close.mock.calls).toHaveLength(1);
  });
});
