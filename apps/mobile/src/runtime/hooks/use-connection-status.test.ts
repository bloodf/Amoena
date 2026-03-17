import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("react-native", () => ({
  AppState: {
    addEventListener: vi.fn(() => ({ remove: vi.fn() })),
  },
}));

import { useConnectionStatus } from "./use-connection-status";

describe("useConnectionStatus", () => {
  it("returns connected by default", () => {
    const { result } = renderHook(() => useConnectionStatus());

    expect(result.current.isConnected).toBe(true);
    expect(result.current.isReconnecting).toBe(false);
  });
});
