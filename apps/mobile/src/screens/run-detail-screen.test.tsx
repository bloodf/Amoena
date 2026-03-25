import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockSendMessage = vi.fn();

vi.mock("@/runtime/provider", () => ({
  useRuntime: () => ({
    sessions: [
      {
        id: "session-1",
        workingDir: "/home/user/project",
        status: "active",
        tuiType: "native",
      },
    ],
    sendMessage: mockSendMessage,
  }),
  useSessionAgents: () => ({
    agents: [
      { id: "a1", agentType: "Planner", status: "running", model: "claude-4", currentTask: "Planning tasks" },
      { id: "a2", agentType: "Executor", status: "completed", model: "sonnet", currentTask: undefined },
    ],
    isLoading: false,
  }),
  useSessionMessages: () => ({
    messages: [
      { id: "m1", role: "user", content: "Start the auth refactor" },
      { id: "m2", role: "assistant", content: "Starting the refactor now..." },
    ],
    isLoading: false,
  }),
}));

import { RunDetailScreen } from "./run-detail-screen";

describe("RunDetailScreen", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the session working directory as title", () => {
    render(<RunDetailScreen sessionId="session-1" />);
    expect(screen.getAllByText("project").length).toBeGreaterThanOrEqual(1);
  });

  it("renders session status text", () => {
    render(<RunDetailScreen sessionId="session-1" />);
    expect(screen.getAllByText(/active/).length).toBeGreaterThanOrEqual(1);
  });

  it("displays Agents section", () => {
    render(<RunDetailScreen sessionId="session-1" />);
    expect(screen.getAllByText("Agents").length).toBeGreaterThanOrEqual(1);
  });

  it("displays Task Progress section", () => {
    render(<RunDetailScreen sessionId="session-1" />);
    expect(screen.getAllByText("Task Progress").length).toBeGreaterThanOrEqual(1);
  });

  it("renders agent type names", () => {
    render(<RunDetailScreen sessionId="session-1" />);
    expect(screen.getAllByText("Planner").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Executor").length).toBeGreaterThanOrEqual(1);
  });

  it("shows Recent Output section", () => {
    render(<RunDetailScreen sessionId="session-1" />);
    expect(screen.getAllByText("Recent Output").length).toBeGreaterThanOrEqual(1);
  });

  it("shows message content", () => {
    render(<RunDetailScreen sessionId="session-1" />);
    expect(screen.getAllByText("Start the auth refactor").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Starting the refactor now...").length).toBeGreaterThanOrEqual(1);
  });

  it("shows Cancel Run button for active sessions", () => {
    render(<RunDetailScreen sessionId="session-1" />);
    expect(screen.getAllByText("Cancel Run").length).toBeGreaterThanOrEqual(1);
  });

  it("shows Run Details when session not found", () => {
    render(<RunDetailScreen sessionId="nonexistent" />);
    expect(screen.getAllByText("Run Details").length).toBeGreaterThanOrEqual(1);
  });
});
