import { describe, expect, it, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

vi.mock('@/store', () => ({
  useAmoena: vi.fn(() => ({
    connection: { isConnected: false, sseConnected: false },
  })),
}));

describe('useSmartPoll', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns a fire function', async () => {
    const { useSmartPoll } = await import('../use-smart-poll');
    const callback = vi.fn();
    const { result } = renderHook(() => useSmartPoll(callback, 5000, { enabled: true }));
    expect(typeof result.current).toBe('function');
  });

  it('calls callback on mount (initial fire)', async () => {
    const callback = vi.fn();
    const { useSmartPoll } = await import('../use-smart-poll');
    renderHook(() => useSmartPoll(callback, 5000, { enabled: true }));
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('does not fire when disabled', async () => {
    const callback = vi.fn();
    const { useSmartPoll } = await import('../use-smart-poll');
    renderHook(() => useSmartPoll(callback, 5000, { enabled: false }));
    expect(callback).not.toHaveBeenCalled();
  });

  it('respects pauseWhenConnected option', async () => {
    const callback = vi.fn();

    const { useAmoena } = await import('@/store');
    (useAmoena as ReturnType<typeof vi.fn>).mockReturnValueOnce({
      connection: { isConnected: true, sseConnected: false },
    });

    const { useSmartPoll } = await import('../use-smart-poll');
    const { result } = renderHook(() => useSmartPoll(callback, 5000, { pauseWhenConnected: true }));

    act(() => {
      result.current();
    });

    expect(callback).not.toHaveBeenCalled();
  });

  it('respects pauseWhenSseConnected option', async () => {
    const callback = vi.fn();

    const { useAmoena } = await import('@/store');
    (useAmoena as ReturnType<typeof vi.fn>).mockReturnValueOnce({
      connection: { isConnected: false, sseConnected: true },
    });

    const { useSmartPoll } = await import('../use-smart-poll');
    const { result } = renderHook(() =>
      useSmartPoll(callback, 5000, { pauseWhenSseConnected: true }),
    );

    act(() => {
      result.current();
    });

    expect(callback).not.toHaveBeenCalled();
  });

  it('returns function that calls callback when should poll', async () => {
    const callback = vi.fn();
    const { useSmartPoll } = await import('../use-smart-poll');
    const { result } = renderHook(() => useSmartPoll(callback, 5000, { enabled: true }));

    callback.mockClear();
    act(() => {
      result.current();
    });

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('handles promise rejection in callback gracefully', async () => {
    const callback = vi.fn(() => Promise.reject(new Error('Async error')));
    const { useSmartPoll } = await import('../use-smart-poll');
    const { result } = renderHook(() => useSmartPoll(callback, 5000, { backoff: true }));

    act(() => {
      expect(() => result.current()).not.toThrow();
    });
  });
});
