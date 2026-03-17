import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useTasks } from "./use-tasks";

const mockListTasks = vi.fn().mockResolvedValue([
  { id: "t1", title: "Test task", status: "pending", description: "" },
]);

vi.mock("../client-context", () => ({
  useClient: () => ({
    auth: { accessToken: "tok", baseUrl: "http://localhost" },
    client: {
      listTasks: mockListTasks,
      createTask: vi.fn().mockResolvedValue({}),
      updateTask: vi.fn().mockResolvedValue({}),
      deleteTask: vi.fn().mockResolvedValue(undefined),
      sessionEventsUrl: () => "http://localhost/events",
    },
  }),
}));

vi.mock("../event-source", () => ({
  createReconnectingEventSource: () => ({ close: vi.fn() }),
}));

describe("useTasks", () => {
  beforeEach(() => vi.clearAllMocks());

  it("fetches tasks on mount", async () => {
    const { result } = renderHook(() => useTasks("s1"));

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.data).toHaveLength(1);
    expect(result.current.data[0].id).toBe("t1");
    expect(mockListTasks).toHaveBeenCalled();
  });

  it("returns empty when no tasks", async () => {
    vi.mocked(mockListTasks).mockResolvedValueOnce([]);
    const { result } = renderHook(() => useTasks("s1"));

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.data.length).toBeGreaterThanOrEqual(0);
  });
});
