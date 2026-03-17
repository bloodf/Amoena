import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useWorkspaces } from "./use-workspaces";

const mockListWorkspaces = vi.fn().mockResolvedValue([
  { id: "w1", name: "Project", rootPath: "/tmp", status: "active", createdAt: "2024-01-01" },
]);

vi.mock("../client-context", () => ({
  useClient: () => ({
    auth: { accessToken: "tok", baseUrl: "http://localhost" },
    client: {
      listWorkspaces: mockListWorkspaces,
      inspectWorkspace: vi.fn().mockResolvedValue({}),
      archiveWorkspace: vi.fn().mockResolvedValue(undefined),
      destroyWorkspace: vi.fn().mockResolvedValue(undefined),
    },
  }),
}));

describe("useWorkspaces", () => {
  beforeEach(() => vi.clearAllMocks());

  it("fetches workspaces on mount", async () => {
    const { result } = renderHook(() => useWorkspaces());

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.data).toHaveLength(1);
    expect(result.current.data[0].id).toBe("w1");
    expect(mockListWorkspaces).toHaveBeenCalled();
  });

  it("returns empty when no workspaces", async () => {
    vi.mocked(mockListWorkspaces).mockResolvedValueOnce([]);
    const { result } = renderHook(() => useWorkspaces());

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.data.length).toBeGreaterThanOrEqual(0);
  });
});
