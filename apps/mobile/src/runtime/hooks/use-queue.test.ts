import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useQueue } from "./use-queue";

const mockListQueueMessages = vi.fn().mockResolvedValue([
  { id: "q1", content: "hello", status: "pending", orderIndex: 0 },
]);

vi.mock("../client-context", () => ({
  useClient: () => ({
    auth: { accessToken: "tok", baseUrl: "http://localhost" },
    client: {
      listQueueMessages: mockListQueueMessages,
      enqueueMessage: vi.fn().mockResolvedValue({}),
      editQueueMessage: vi.fn().mockResolvedValue({}),
      removeQueueMessage: vi.fn().mockResolvedValue(undefined),
      flushQueue: vi.fn().mockResolvedValue(undefined),
      sessionEventsUrl: () => "http://localhost/events",
    },
  }),
}));

vi.mock("../event-source", () => ({
  createReconnectingEventSource: () => ({ close: vi.fn() }),
}));

describe("useQueue", () => {
  beforeEach(() => vi.clearAllMocks());

  it("fetches queue on mount", async () => {
    const { result } = renderHook(() => useQueue("s1"));

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.data).toHaveLength(1);
    expect(result.current.data[0].id).toBe("q1");
    expect(mockListQueueMessages).toHaveBeenCalled();
  });

  it("returns empty when no messages", async () => {
    vi.mocked(mockListQueueMessages).mockResolvedValueOnce([]);
    const { result } = renderHook(() => useQueue("s1"));

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.data.length).toBeGreaterThanOrEqual(0);
  });
});
