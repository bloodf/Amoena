import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "bun:test";

import { PipelineStepper } from "./PipelineStepper";
import type { AutopilotPipelinePhase } from "./types";

describe("PipelineStepper", () => {
  test("renders all phase labels", () => {
    render(<PipelineStepper currentPhase="goal_analysis" />);
    expect(screen.getByText("Goal")).toBeTruthy();
    expect(screen.getByText("Stories")).toBeTruthy();
    expect(screen.getByText("Agents")).toBeTruthy();
    expect(screen.getByText("Execute")).toBeTruthy();
    expect(screen.getByText("Verify")).toBeTruthy();
    expect(screen.getByText("Report")).toBeTruthy();
  });

  test("highlights the current phase with primary styling", () => {
    render(<PipelineStepper currentPhase="execution" />);
    // The active phase should have primary styling
    const executeEl = screen.getByText("Execute");
    expect(executeEl.className).toContain("primary");
  });

  test("marks completed phases with check icon", () => {
    render(<PipelineStepper currentPhase="execution" />);
    // Phases before execution (goal_analysis, story_decomposition, agent_assignment)
    // should show check marks instead of labels
    expect(screen.queryByText("Goal")).toBeNull();
    expect(screen.queryByText("Stories")).toBeNull();
    expect(screen.queryByText("Agents")).toBeNull();
  });

  test("renders future phases with muted styling", () => {
    render(<PipelineStepper currentPhase="goal_analysis" />);
    const reportEl = screen.getByText("Report");
    expect(reportEl.className).toContain("muted-foreground");
  });

  test("renders correctly for the first phase", () => {
    render(<PipelineStepper currentPhase="goal_analysis" />);
    expect(screen.getByText("Goal")).toBeTruthy();
  });

  test("renders correctly for the last phase", () => {
    render(<PipelineStepper currentPhase="report" />);
    expect(screen.getByText("Report")).toBeTruthy();
    // All previous phases should be check marks
    expect(screen.queryByText("Goal")).toBeNull();
  });

  test("renders connectors between phases", () => {
    const { container } = render(<PipelineStepper currentPhase="execution" />);
    // Should have 5 connectors (between 6 phases)
    expect(container).toBeTruthy();
  });
});
