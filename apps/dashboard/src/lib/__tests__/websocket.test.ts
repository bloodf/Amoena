import { describe, expect, it, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

const mockSetConnection = vi.fn();
const mockSetLastMessage = vi.fn();
const mockSetSessions = vi.fn();
const mockAddLog = vi.fn();
const mockUpdateSpawnRequest = vi.fn();
const mockSetCronJobs = vi.fn();
const mockAddTokenUsage = vi.fn();
const mockAddChatMessage = vi.fn();
const mockAddNotification = vi.fn();
const mockUpdateAgent = vi.fn();
const mockAddExecApproval = vi.fn();
const mockUpdateExecApproval = vi.fn();

vi.mock('@/store', () => ({
  useAmoena: vi.fn(() => ({
    connection: { isConnected: false, sseConnected: false },
    setConnection: mockSetConnection,
    setLastMessage: mockSetLastMessage,
    setSessions: mockSetSessions,
    addLog: mockAddLog,
    updateSpawnRequest: mockUpdateSpawnRequest,
    setCronJobs: mockSetCronJobs,
    addTokenUsage: mockAddTokenUsage,
    addChatMessage: mockAddChatMessage,
    addNotification: mockAddNotification,
    updateAgent: mockUpdateAgent,
    addExecApproval: mockAddExecApproval,
    updateExecApproval: mockUpdateExecApproval,
  })),
}));

vi.mock('@/lib/client-logger', () => ({
  createClientLogger: vi.fn(() => ({
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  })),
}));

vi.mock('@/lib/device-identity', () => ({
  cacheDeviceToken: vi.fn(),
  clearDeviceIdentity: vi.fn(),
  getCachedDeviceToken: vi.fn(() => null),
  getOrCreateDeviceIdentity: vi.fn(() =>
    Promise.resolve({
      deviceId: 'test-device-id',
      publicKeyBase64: 'test-pub-key',
      privateKey: {},
    }),
  ),
  signPayload: vi.fn(() => Promise.resolve({ signature: 'test-sig', signedAt: Date.now() })),
}));

vi.mock('@/lib/gateway-url', () => ({
  buildGatewayWebSocketUrl: vi.fn(() => 'ws://localhost:18789'),
}));

vi.mock('@/lib/version', () => ({
  APP_VERSION: '1.0.0',
}));

vi.mock('@/lib/websocket-utils', () => ({
  NON_RETRYABLE_ERROR_CODES: new Set(),
  readErrorDetailCode: vi.fn(() => null),
  shouldRetryWithoutDeviceIdentity: vi.fn(() => false),
}));

vi.mock('@/lib/utils', () => ({
  normalizeModel: vi.fn((m) => m),
  formatAge: vi.fn(() => '5m'),
}));

describe('useWebSocket', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns connection functions', async () => {
    const { useWebSocket } = await import('../websocket');
    const { result } = renderHook(() => useWebSocket());

    expect(result.current).toHaveProperty('connect');
    expect(result.current).toHaveProperty('disconnect');
    expect(result.current).toHaveProperty('reconnect');
    expect(result.current).toHaveProperty('sendMessage');
  });

  it('disconnect is a function', async () => {
    const { useWebSocket } = await import('../websocket');
    const { result } = renderHook(() => useWebSocket());
    expect(typeof result.current.disconnect).toBe('function');
  });

  it('reconnect is a function', async () => {
    const { useWebSocket } = await import('../websocket');
    const { result } = renderHook(() => useWebSocket());
    expect(typeof result.current.reconnect).toBe('function');
  });

  it('sendMessage returns boolean', async () => {
    const { useWebSocket } = await import('../websocket');
    const { result } = renderHook(() => useWebSocket());
    expect(typeof result.current.sendMessage({})).toBe('boolean');
  });
});
