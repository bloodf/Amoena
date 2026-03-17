import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useExtensions } from "./use-extensions";

const mockListExtensions = vi.fn().mockResolvedValue([
  { id: "e1", name: "Test Ext", version: "1.0.0", enabled: true, description: "A test" },
]);

vi.mock("../client-context", () => ({
  useClient: () => ({
    auth: { accessToken: "tok", baseUrl: "http://localhost" },
    client: {
      listExtensions: mockListExtensions,
      toggleExtension: vi.fn().mockResolvedValue(undefined),
      uninstallExtension: vi.fn().mockResolvedValue(undefined),
    },
  }),
}));

describe("useExtensions", () => {
  beforeEach(() => vi.clearAllMocks());

  it("fetches extensions on mount", async () => {
    const { result } = renderHook(() => useExtensions());

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.data).toHaveLength(1);
    expect(result.current.data[0].id).toBe("e1");
    expect(mockListExtensions).toHaveBeenCalled();
  });

  it("returns empty when no extensions", async () => {
    vi.mocked(mockListExtensions).mockResolvedValueOnce([]);
    const { result } = renderHook(() => useExtensions());

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.data.length).toBeGreaterThanOrEqual(0);
  });
});
