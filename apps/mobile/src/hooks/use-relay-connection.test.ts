import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockConnect = vi.fn();
const mockDisconnect = vi.fn();
const mockSend = vi.fn();

let capturedOnStatusChange: ((s: string) => void) | undefined;
let capturedOnMessage: ((msg: unknown) => void) | undefined;

vi.mock("@/lib/relay-client", () => ({
  createRelayClient: vi.fn((opts: {
    onStatusChange?: (s: string) => void;
    onMessage?: (msg: unknown) => void;
  }) => {
    capturedOnStatusChange = opts.onStatusChange;
    capturedOnMessage = opts.onMessage;
    return {
      connect: mockConnect,
      disconnect: mockDisconnect,
      send: mockSend,
    };
  }),
}));

import { useRelayConnection } from "./use-relay-connection";

describe("useRelayConnection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    capturedOnStatusChange = undefined;
    capturedOnMessage = undefined;
  });

  it("starts disconnected with no URL", () => {
    const { result } = renderHook(() =>
      useRelayConnection({ url: null }),
    );
    expect(result.current.status).toBe("disconnected");
    expect(result.current.isConnected).toBe(false);
  });

  it("auto-connects when URL is provided", () => {
    renderHook(() =>
      useRelayConnection({ url: "ws://localhost:8080" }),
    );
    expect(mockConnect).toHaveBeenCalled();
  });

  it("does not auto-connect when autoConnect is false", () => {
    renderHook(() =>
      useRelayConnection({ url: "ws://localhost:8080", autoConnect: false }),
    );
    expect(mockConnect).not.toHaveBeenCalled();
  });

  it("disconnects on unmount", () => {
    const { unmount } = renderHook(() =>
      useRelayConnection({ url: "ws://localhost:8080" }),
    );
    unmount();
    expect(mockDisconnect).toHaveBeenCalled();
  });

  it("isConnected returns true when status is connected", () => {
    const { result } = renderHook(() =>
      useRelayConnection({ url: "ws://localhost:8080" }),
    );

    act(() => {
      capturedOnStatusChange?.("connected");
    });

    expect(result.current.isConnected).toBe(true);
    expect(result.current.status).toBe("connected");
  });

  it("exposes connect function", () => {
    const { result } = renderHook(() =>
      useRelayConnection({ url: "ws://localhost:8080", autoConnect: false }),
    );

    act(() => {
      result.current.connect();
    });

    expect(mockConnect).toHaveBeenCalled();
  });

  it("exposes disconnect function", () => {
    const { result } = renderHook(() =>
      useRelayConnection({ url: "ws://localhost:8080" }),
    );

    act(() => {
      result.current.disconnect();
    });

    expect(mockDisconnect).toHaveBeenCalled();
  });

  it("exposes send function", () => {
    const { result } = renderHook(() =>
      useRelayConnection({ url: "ws://localhost:8080" }),
    );

    const message = { type: "ping" };
    act(() => {
      result.current.send(message);
    });

    expect(mockSend).toHaveBeenCalledWith(message);
  });

  it("reconnects when URL changes", () => {
    const { rerender } = renderHook(
      ({ url }) => useRelayConnection({ url }),
      { initialProps: { url: "ws://localhost:8080" as string | null } },
    );

    rerender({ url: "ws://localhost:9090" });
    expect(mockDisconnect).toHaveBeenCalled();
  });

  it("passes onMessage callback to relay client", () => {
    const onMessage = vi.fn();
    renderHook(() =>
      useRelayConnection({ url: "ws://localhost:8080", onMessage }),
    );

    const msg = { type: "test", payload: { data: 1 } };
    capturedOnMessage?.(msg);
    expect(onMessage).toHaveBeenCalledWith(msg);
  });
});
