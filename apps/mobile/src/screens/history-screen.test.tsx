import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockRefreshSessions = vi.fn().mockResolvedValue(undefined);

vi.mock("@/runtime/provider", () => ({
  useRuntime: () => ({
    sessions: [
      {
        id: "s1",
        workingDir: "/home/user/auth-service",
        status: "completed",
        startedAt: "2025-01-01T00:00:00Z",
        completedAt: "2025-01-01T01:00:00Z",
        metadata: { totalCostUsd: 0.5, taskCount: 4 },
      },
      {
        id: "s2",
        workingDir: "/home/user/api-gateway",
        status: "failed",
        startedAt: "2025-01-02T00:00:00Z",
        metadata: { totalCostUsd: 0.2, taskCount: 2 },
      },
      {
        id: "s3",
        workingDir: "/home/user/frontend",
        status: "active",
        startedAt: "2025-01-03T00:00:00Z",
        metadata: {},
      },
    ],
    refreshSessions: mockRefreshSessions,
    auth: { accessToken: "tok", baseUrl: "http://localhost" },
  }),
}));

vi.mock("expo-router", () => ({
  router: { push: vi.fn() },
}));

import { HistoryScreen } from "./history-screen";

describe("HistoryScreen", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the History title", () => {
    render(<HistoryScreen />);
    expect(screen.getAllByText("History").length).toBeGreaterThanOrEqual(1);
  });

  it("renders session names as run cards", () => {
    render(<HistoryScreen />);
    expect(screen.getAllByText("auth-service").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("api-gateway").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("frontend").length).toBeGreaterThanOrEqual(1);
  });

  it("shows the search input", () => {
    render(<HistoryScreen />);
    expect(screen.getAllByPlaceholderText("Search runs...").length).toBeGreaterThanOrEqual(1);
  });

  it("renders all sessions before any filtering", () => {
    render(<HistoryScreen />);
    expect(screen.getAllByText("auth-service").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("api-gateway").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("frontend").length).toBeGreaterThanOrEqual(1);
  });

  it("renders filter chips", () => {
    render(<HistoryScreen />);
    expect(screen.getAllByText("All").length).toBeGreaterThanOrEqual(1);
  });

  it("shows empty message when no runs match search", () => {
    render(<HistoryScreen />);
    const inputs = screen.getAllByPlaceholderText("Search runs...");
    fireEvent.change(inputs[0], { target: { value: "nonexistent" } });
    expect(screen.getAllByText("No runs match your filters.").length).toBeGreaterThanOrEqual(1);
  });

  it("renders all sessions on initial load", () => {
    render(<HistoryScreen />);
    expect(screen.getAllByText("auth-service").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("api-gateway").length).toBeGreaterThanOrEqual(1);
  });

  it("renders search placeholder correctly", () => {
    render(<HistoryScreen />);
    const inputs = screen.getAllByPlaceholderText("Search runs...");
    expect(inputs.length).toBeGreaterThanOrEqual(1);
  });
});
