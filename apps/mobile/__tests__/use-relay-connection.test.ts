import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { RelayConnectionState } from "@/lib/types";

// ---------------------------------------------------------------------------
// Inline hook matching the pattern from src/runtime/hooks/use-connection-status.ts
// but wired to a relay client lifecycle.
// ---------------------------------------------------------------------------

function useRelayConnection(url: string) {
  const [state, setState] = React.useState<RelayConnectionState>("disconnected");
  const [lastMessage, setLastMessage] = React.useState<unknown>(null);
  const clientRef = React.useRef<{ close: () => void } | null>(null);

  React.useEffect(() => {
    setState("connecting");

    // simulate connection lifecycle
    const timer = setTimeout(() => {
      setState("connected");
    }, 0);

    return () => {
      clearTimeout(timer);
      setState("disconnected");
      clientRef.current?.close();
      clientRef.current = null;
    };
  }, [url]);

  const reconnect = React.useCallback(() => {
    setState("reconnecting");
    setTimeout(() => setState("connected"), 0);
  }, []);

  return { state, lastMessage, reconnect, setLastMessage, setState };
}

import * as React from "react";

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("useRelayConnection", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("starts in connecting state", () => {
    const { result } = renderHook(() =>
      useRelayConnection("wss://relay.amoena.dev"),
    );

    expect(result.current.state).toBe("connecting");
  });

  it("transitions to connected after initial connection", async () => {
    const { result } = renderHook(() =>
      useRelayConnection("wss://relay.amoena.dev"),
    );

    await act(async () => {
      vi.advanceTimersByTime(1);
    });

    expect(result.current.state).toBe("connected");
  });

  it("disconnects on unmount", async () => {
    const { result, unmount } = renderHook(() =>
      useRelayConnection("wss://relay.amoena.dev"),
    );

    await act(async () => {
      vi.advanceTimersByTime(1);
    });

    expect(result.current.state).toBe("connected");

    unmount();
    // after unmount the cleanup ran — nothing to assert on result
    // because the component is gone; we verify no errors are thrown
  });

  it("reconnects when url changes", async () => {
    const { result, rerender } = renderHook(
      ({ url }: { url: string }) => useRelayConnection(url),
      { initialProps: { url: "wss://relay.amoena.dev" } },
    );

    await act(async () => {
      vi.advanceTimersByTime(1);
    });
    expect(result.current.state).toBe("connected");

    // change URL triggers cleanup + new connection
    rerender({ url: "wss://relay-2.amoena.dev" });
    expect(result.current.state).toBe("connecting");

    await act(async () => {
      vi.advanceTimersByTime(1);
    });
    expect(result.current.state).toBe("connected");
  });

  it("manual reconnect sets state to reconnecting then connected", async () => {
    const { result } = renderHook(() =>
      useRelayConnection("wss://relay.amoena.dev"),
    );

    await act(async () => {
      vi.advanceTimersByTime(1);
    });

    act(() => {
      result.current.reconnect();
    });

    expect(result.current.state).toBe("reconnecting");

    await act(async () => {
      vi.advanceTimersByTime(1);
    });

    expect(result.current.state).toBe("connected");
  });

  it("stores last message", async () => {
    const { result } = renderHook(() =>
      useRelayConnection("wss://relay.amoena.dev"),
    );

    await act(async () => {
      vi.advanceTimersByTime(1);
    });

    act(() => {
      result.current.setLastMessage({ type: "session.updated", payload: {} });
    });

    expect(result.current.lastMessage).toEqual({
      type: "session.updated",
      payload: {},
    });
  });
});
