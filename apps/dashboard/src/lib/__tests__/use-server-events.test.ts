import { describe, expect, it, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';

const mockSetConnection = vi.fn();
const mockAddTask = vi.fn();
const mockUpdateTask = vi.fn();
const mockDeleteTask = vi.fn();
const mockAddAgent = vi.fn();
const mockUpdateAgent = vi.fn();
const mockAddChatMessage = vi.fn();
const mockAddNotification = vi.fn();
const mockAddActivity = vi.fn();

vi.mock('@/store', () => ({
  useAmoena: vi.fn(() => ({
    setConnection: mockSetConnection,
    addTask: mockAddTask,
    updateTask: mockUpdateTask,
    deleteTask: mockDeleteTask,
    addAgent: mockAddAgent,
    updateAgent: mockUpdateAgent,
    addChatMessage: mockAddChatMessage,
    addNotification: mockAddNotification,
    addActivity: mockAddActivity,
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

const mockEventSourceClose = vi.fn();
const mockEventSourceAddEventListener = vi.fn();

vi.stubGlobal(
  'EventSource',
  vi.fn().mockImplementation(() => ({
    onopen: null,
    onmessage: null,
    onerror: null,
    close: mockEventSourceClose,
    addEventListener: mockEventSourceAddEventListener,
  })),
);

describe('useServerEvents', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates EventSource connection on mount', async () => {
    const { useServerEvents } = await import('../use-server-events');
    renderHook(() => useServerEvents());
    expect(EventSource).toHaveBeenCalledWith('/api/events');
  });

  it('sets up event handlers on EventSource', async () => {
    const { useServerEvents } = await import('../use-server-events');
    renderHook(() => useServerEvents());
    expect(mockEventSourceAddEventListener).toHaveBeenCalled();
  });

  it('closes connection on unmount', async () => {
    const { useServerEvents } = await import('../use-server-events');
    const { unmount } = renderHook(() => useServerEvents());
    unmount();
    expect(mockEventSourceClose).toHaveBeenCalled();
  });

  it('sets sseConnected false on unmount', async () => {
    const { useServerEvents } = await import('../use-server-events');
    const { unmount } = renderHook(() => useServerEvents());
    unmount();
    expect(mockSetConnection).toHaveBeenCalledWith({ sseConnected: false });
  });

  it('cleans up reconnect timeout on unmount', async () => {
    const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout');
    const { useServerEvents } = await import('../use-server-events');
    const { unmount } = renderHook(() => useServerEvents());
    unmount();
    expect(clearTimeoutSpy).toHaveBeenCalled();
  });
});
