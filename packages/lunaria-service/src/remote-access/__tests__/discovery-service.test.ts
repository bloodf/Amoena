import { describe, expect, mock, test, beforeEach } from 'bun:test';

// Mock dgram before importing
const mockSocket = {
  bind: mock((...args: unknown[]) => {
    // bind(port, callback?) or bind(callback?)
    const cb = args.find((a) => typeof a === 'function') as (() => void) | undefined;
    cb?.();
  }),
  setBroadcast: mock((_flag: boolean) => {}),
  send: mock((_msg: Buffer, _port: number, _addr: string) => {}),
  close: mock(() => {}),
  on: mock((_event: string, _handler: unknown) => {}),
};

mock.module('dgram', () => ({
  createSocket: mock(() => mockSocket),
}));

const { DiscoveryService } = await import('../discovery-service');

describe('DiscoveryService', () => {
  let service: DiscoveryService;

  beforeEach(() => {
    mockSocket.bind.mockClear();
    mockSocket.setBroadcast.mockClear();
    mockSocket.send.mockClear();
    mockSocket.close.mockClear();
    mockSocket.on.mockClear();

    service = new DiscoveryService({
      host: '192.168.1.100',
      port: 37777,
      deviceId: 'device-test',
      version: '1.0.0',
      broadcastIntervalMs: 60_000,
    });
  });

  test('startBroadcasting binds socket and enables broadcast', () => {
    service.startBroadcasting();
    expect(mockSocket.bind).toHaveBeenCalled();
    expect(mockSocket.setBroadcast).toHaveBeenCalledWith(true);
    service.stop();
  });

  test('startBroadcasting sends initial announcement', () => {
    service.startBroadcasting();
    expect(mockSocket.send).toHaveBeenCalled();

    const sentMsg = mockSocket.send.mock.calls[0]?.[0] as Buffer | undefined;
    expect(sentMsg).toBeDefined();
    const parsed = JSON.parse((sentMsg ?? Buffer.alloc(0)).toString());
    expect(parsed.service).toBe('amoena');
    expect(parsed.host).toBe('192.168.1.100');
    expect(parsed.port).toBe(37777);
    expect(parsed.deviceId).toBe('device-test');
    service.stop();
  });

  test('stop closes sockets', () => {
    service.startBroadcasting();
    service.stop();
    expect(mockSocket.close).toHaveBeenCalled();
  });

  test('getDiscovered returns empty initially', () => {
    expect(service.getDiscovered()).toHaveLength(0);
  });

  test('startListening registers message handler', () => {
    service.startListening();
    const onCalls = mockSocket.on.mock.calls.filter((c) => c[0] === 'message');
    expect(onCalls.length).toBeGreaterThan(0);
    service.stop();
  });
});
