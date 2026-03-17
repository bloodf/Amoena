import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { usePermissions } from "./use-permissions";

const mockGetTranscript = vi.fn().mockResolvedValue([
  { eventType: "permission.requested", payload: { requestId: "r1", message: "bash" } },
]);

vi.mock("../client-context", () => ({
  useClient: () => ({
    auth: { accessToken: "tok", baseUrl: "http://localhost" },
    client: {
      listSessions: vi.fn().mockResolvedValue([{ id: "s1" }]),
      getSessionTranscript: mockGetTranscript,
      resolveRemotePermission: vi.fn().mockResolvedValue(undefined),
      globalEventsUrl: () => "http://localhost/events",
    },
  }),
}));

vi.mock("../event-source", () => ({
  createReconnectingEventSource: () => ({ close: vi.fn() }),
}));

describe("usePermissions", () => {
  beforeEach(() => vi.clearAllMocks());

  it("fetches pending permissions on mount", async () => {
    const { result } = renderHook(() => usePermissions());

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.data).toHaveLength(1);
    expect(result.current.data[0].requestId).toBe("r1");
  });
});
