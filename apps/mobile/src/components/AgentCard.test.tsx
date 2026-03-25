import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AgentCard } from "./AgentCard";

describe("AgentCard", () => {
  it("renders the agent name", () => {
    render(<AgentCard name="Claude" status="idle" />);
    expect(screen.getAllByText("Claude").length).toBeGreaterThanOrEqual(1);
  });

  it("renders the status label", () => {
    render(<AgentCard name="Agent" status="running" />);
    expect(screen.getAllByText("running").length).toBeGreaterThanOrEqual(1);
  });

  it("renders each status type without error", () => {
    const statuses = ["idle", "running", "completed", "failed", "queued"] as const;
    for (const status of statuses) {
      const { unmount } = render(<AgentCard name="Agent" status={status} />);
      expect(screen.getAllByText(status).length).toBeGreaterThanOrEqual(1);
      unmount();
    }
  });

  it("shows the current task when provided", () => {
    render(<AgentCard name="Agent" status="running" currentTask="Refactoring auth module" />);
    expect(screen.getAllByText("Refactoring auth module").length).toBeGreaterThanOrEqual(1);
  });

  it("shows the model when provided", () => {
    render(<AgentCard name="Agent" status="running" model="claude-4-sonnet" />);
    expect(screen.getAllByText("claude-4-sonnet").length).toBeGreaterThanOrEqual(1);
  });

  it("shows CostBadge when costUsd is positive", () => {
    render(<AgentCard name="Agent" status="running" costUsd={0.05} />);
    expect(screen.getAllByText("5c").length).toBeGreaterThanOrEqual(1);
  });

  it("renders all required fields together", () => {
    render(
      <AgentCard
        name="Claude"
        status="running"
        currentTask="Auth refactor"
        costUsd={0.25}
        model="claude-4-sonnet"
      />,
    );
    expect(screen.getAllByText("Claude").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("running").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Auth refactor").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("claude-4-sonnet").length).toBeGreaterThanOrEqual(1);
  });

  it("renders without optional props", () => {
    const { container } = render(<AgentCard name="Agent" status="idle" />);
    expect(container).toBeTruthy();
    expect(screen.getAllByText("Agent").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("idle").length).toBeGreaterThanOrEqual(1);
  });
});
