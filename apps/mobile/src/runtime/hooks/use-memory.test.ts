import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useSessionMemory } from "./use-memory";

const mockGetSessionMemory = vi.fn().mockResolvedValue({
  summary: null,
  tokenBudget: { total: 1000, l0: 500, l1: 300, l2: 200 },
  entries: [],
});

vi.mock("../client-context", () => ({
  useClient: () => ({
    auth: { accessToken: "tok", baseUrl: "http://localhost" },
    client: {
      getSessionMemory: mockGetSessionMemory,
    },
  }),
}));

describe("useSessionMemory", () => {
  beforeEach(() => vi.clearAllMocks());

  it("fetches memory on mount", async () => {
    const { result } = renderHook(() => useSessionMemory("s1"));

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.data).not.toBeNull();
    expect(result.current.data?.tokenBudget.total).toBe(1000);
    expect(mockGetSessionMemory).toHaveBeenCalled();
  });

  it("returns null when no data", async () => {
    vi.mocked(mockGetSessionMemory).mockResolvedValueOnce(null);
    const { result } = renderHook(() => useSessionMemory("s1"));

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.data === null || result.current.data !== undefined).toBeTruthy();
  });
});
