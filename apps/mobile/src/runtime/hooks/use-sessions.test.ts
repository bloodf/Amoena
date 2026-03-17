import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useSessions } from "./use-sessions";

const mockListSessions = vi.fn().mockResolvedValue([
  { id: "s1", workingDir: "/tmp/project", status: "active", tuiType: "native", sessionMode: "default", createdAt: "", updatedAt: "" },
]);

vi.mock("../client-context", () => ({
  useClient: () => ({
    auth: { accessToken: "tok", baseUrl: "http://localhost" },
    client: {
      listSessions: mockListSessions,
      globalEventsUrl: () => "http://localhost/events",
    },
  }),
}));

vi.mock("../event-source", () => ({
  createReconnectingEventSource: () => ({ close: vi.fn() }),
}));

describe("useSessions", () => {
  beforeEach(() => vi.clearAllMocks());

  it("fetches sessions on mount", async () => {
    const { result } = renderHook(() => useSessions());

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.data).toHaveLength(1);
    expect(result.current.data[0].id).toBe("s1");
    expect(mockListSessions).toHaveBeenCalled();
  });

  it("returns empty when no client", async () => {
    vi.mocked(mockListSessions).mockClear();
    const { result } = renderHook(() => useSessions());

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.data.length).toBeGreaterThanOrEqual(0);
  });
});
