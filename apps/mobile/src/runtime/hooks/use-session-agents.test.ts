import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useSessionAgents } from "./use-session-agents";

const mockListAgents = vi.fn().mockResolvedValue([
  { id: "a1", agentType: "Navigator", model: "gpt-5", status: "executing" },
]);

vi.mock("../client-context", () => ({
  useClient: () => ({
    auth: { accessToken: "tok", baseUrl: "http://localhost" },
    client: {
      listSessionAgents: mockListAgents,
      sessionEventsUrl: () => "http://localhost/events/s1",
    },
  }),
}));

vi.mock("../event-source", () => ({
  createReconnectingEventSource: () => ({ close: vi.fn() }),
}));

describe("useSessionAgents", () => {
  beforeEach(() => vi.clearAllMocks());

  it("fetches agents for session on mount", async () => {
    const { result } = renderHook(() => useSessionAgents("s1"));

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.data).toHaveLength(1);
    expect(result.current.data[0].agentType).toBe("Navigator");
    expect(mockListAgents).toHaveBeenCalledWith("s1");
  });
});
