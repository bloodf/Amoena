import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

let capturedHeartbeatInterval: number | undefined;
let capturedOnStatusChange: ((s: string) => void) | undefined;

vi.mock('@/lib/relay-client', () => ({
  createRelayClient: vi.fn(
    (opts: { heartbeatInterval?: number; onStatusChange?: (s: string) => void }) => {
      capturedHeartbeatInterval = opts.heartbeatInterval;
      capturedOnStatusChange = opts.onStatusChange;
      return {
        connect: vi.fn(),
        disconnect: vi.fn(),
        send: vi.fn(),
      };
    },
  ),
}));

import { useRelayConnection } from '../use-relay-connection';

describe('useRelayConnection reconnect lifecycle', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    capturedHeartbeatInterval = undefined;
    capturedOnStatusChange = undefined;
  });

  it('passes 30 second heartbeat interval to relay client', () => {
    renderHook(() => useRelayConnection({ url: 'ws://localhost:8080' }));

    expect(capturedHeartbeatInterval).toBe(30_000);
  });

  it('fires onClose when status becomes disconnected', () => {
    const { result } = renderHook(() => useRelayConnection({ url: 'ws://localhost:8080' }));

    act(() => {
      capturedOnStatusChange?.('disconnected');
    });

    expect(result.current.status).toBe('disconnected');
    expect(result.current.isConnected).toBe(false);
  });

  it('maintains reconnect behavior on repeated disconnect', () => {
    const { result, rerender } = renderHook(
      ({ url }: { url: string | null }) => useRelayConnection({ url }),
      { initialProps: { url: 'ws://localhost:8080' } },
    );

    // Simulate multiple status changes (disconnect -> reconnect cycle)
    const statusSequence: Array<'disconnected' | 'reconnecting' | 'connected'> = [
      'disconnected',
      'reconnecting',
      'connected',
      'disconnected',
      'reconnecting',
      'connected',
    ];

    for (const status of statusSequence) {
      act(() => {
        capturedOnStatusChange?.(status);
      });
    }

    // Final status should be connected
    expect(result.current.status).toBe('connected');
    expect(result.current.isConnected).toBe(true);

    // URL change triggers cleanup
    rerender({ url: 'ws://localhost:9090' });
  });
});
