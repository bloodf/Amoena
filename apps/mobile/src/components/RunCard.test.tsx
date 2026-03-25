import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { RunCard } from "./RunCard";

const baseProps = {
  goalId: "goal-1",
  description: "Implement JWT auth",
  status: "running" as const,
  startedAt: Date.now() - 120_000,
};

describe("RunCard", () => {
  it("renders the description", () => {
    render(<RunCard {...baseProps} />);
    expect(screen.getAllByText("Implement JWT auth").length).toBeGreaterThanOrEqual(1);
  });

  it("renders the status label for running", () => {
    render(<RunCard {...baseProps} />);
    expect(screen.getAllByText("Running").length).toBeGreaterThanOrEqual(1);
  });

  it("renders Completed status", () => {
    render(<RunCard {...baseProps} status="completed" />);
    expect(screen.getAllByText("Completed").length).toBeGreaterThanOrEqual(1);
  });

  it("renders Failed status", () => {
    render(<RunCard {...baseProps} status="failed" />);
    expect(screen.getAllByText("Failed").length).toBeGreaterThanOrEqual(1);
  });

  it("renders Partial Failure status", () => {
    render(<RunCard {...baseProps} status="partial_failure" />);
    expect(screen.getAllByText("Partial Failure").length).toBeGreaterThanOrEqual(1);
  });

  it("renders Cancelled status", () => {
    render(<RunCard {...baseProps} status="cancelled" />);
    expect(screen.getAllByText("Cancelled").length).toBeGreaterThanOrEqual(1);
  });

  it("formats duration in seconds for short runs", () => {
    const now = Date.now();
    render(<RunCard {...baseProps} startedAt={now - 30_000} completedAt={now} />);
    expect(screen.getAllByText("30s").length).toBeGreaterThanOrEqual(1);
  });

  it("formats duration in minutes", () => {
    const now = Date.now();
    render(<RunCard {...baseProps} startedAt={now - 150_000} completedAt={now} />);
    expect(screen.getAllByText("2m 30s").length).toBeGreaterThanOrEqual(1);
  });

  it("shows task count when provided", () => {
    render(<RunCard {...baseProps} taskCount={5} />);
    expect(screen.getAllByText("5 tasks").length).toBeGreaterThanOrEqual(1);
  });

  it("shows singular task for count 1", () => {
    render(<RunCard {...baseProps} taskCount={1} />);
    expect(screen.getAllByText("1 task").length).toBeGreaterThanOrEqual(1);
  });

  it("shows agent count when provided", () => {
    render(<RunCard {...baseProps} agentCount={3} />);
    expect(screen.getAllByText("3 agents").length).toBeGreaterThanOrEqual(1);
  });

  it("shows CostBadge when totalCostUsd is positive", () => {
    render(<RunCard {...baseProps} totalCostUsd={0.5} />);
    expect(screen.getAllByText("50c").length).toBeGreaterThanOrEqual(1);
  });

  it("renders without crashing when no optional props given", () => {
    const { container } = render(<RunCard {...baseProps} />);
    expect(container).toBeTruthy();
  });
});
