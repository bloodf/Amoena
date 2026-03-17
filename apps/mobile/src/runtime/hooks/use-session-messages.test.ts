import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useSessionMessages } from "./use-session-messages";

const mockListMessages = vi.fn().mockResolvedValue([
  { id: "m1", role: "assistant", content: "Hello", attachments: [], createdAt: "" },
]);

vi.mock("../client-context", () => ({
  useClient: () => ({
    auth: { accessToken: "tok", baseUrl: "http://localhost" },
    client: {
      listSessionMessages: mockListMessages,
      createSessionMessage: vi.fn().mockResolvedValue({}),
      sessionEventsUrl: () => "http://localhost/events/s1",
    },
  }),
}));

vi.mock("../event-source", () => ({
  createReconnectingEventSource: () => ({ close: vi.fn() }),
}));

describe("useSessionMessages", () => {
  beforeEach(() => vi.clearAllMocks());

  it("fetches messages for session on mount", async () => {
    const { result } = renderHook(() => useSessionMessages("s1"));

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.data).toHaveLength(1);
    expect(result.current.data[0].content).toBe("Hello");
    expect(mockListMessages).toHaveBeenCalledWith("s1");
  });
});
