import { render, screen } from "@testing-library/react";
import { describe, expect, mock, test, vi } from "vitest";
import { AutopilotSidebar } from "./AutopilotSidebar";

function makeProps(overrides: Partial<Parameters<typeof AutopilotSidebar>[0]> = {}) {
  return {
    enabled: true,
    state: "idle" as const,
    onToggleEnabled: vi.fn(() => {}),
    onStart: vi.fn(() => {}),
    onPause: vi.fn(() => {}),
    onStop: vi.fn(() => {}),
    onResume: vi.fn(() => {}),
    onApprove: vi.fn(() => {}),
    onDeny: vi.fn(() => {}),
    onNewRun: vi.fn(() => {}),
    onUnblock: vi.fn(() => {}),
    goalText: "Build authentication",
    editingGoal: false,
    onToggleEditingGoal: vi.fn(() => {}),
    onChangeGoal: vi.fn((_v: string) => {}),
    storySteps: [
      { label: "Step 1", status: "done" as const, tokens: "1k" },
      { label: "Step 2", status: "pending" as const, tokens: "—" },
    ],
    allowedActions: { file_edits: true, terminal: true, git: false },
    onToggleAction: vi.fn(() => {}),
    maxTokens: "10000",
    onMaxTokensChange: vi.fn((_v: string) => {}),
    timeLimit: "15 minutes",
    onTimeLimitChange: vi.fn((_v: string) => {}),
    showHistory: false,
    onToggleHistory: vi.fn(() => {}),
    history: [],
    onSelectRun: vi.fn(() => {}),
    ...overrides,
  };
}

describe("AutopilotSidebar", () => {
  test("renders AutopilotStatusPanel with heading", () => {
    render(<AutopilotSidebar {...makeProps()} />);
    expect(screen.getByText("Autopilot")).toBeTruthy();
  });

  test("renders goal section", () => {
    render(<AutopilotSidebar {...makeProps()} />);
    expect(screen.getByText("Current Goal")).toBeTruthy();
    expect(screen.getByText("Build authentication")).toBeTruthy();
  });

  test("renders story steps", () => {
    render(<AutopilotSidebar {...makeProps()} />);
    expect(screen.getByText("Story Breakdown")).toBeTruthy();
    expect(screen.getByText("Step 1")).toBeTruthy();
    expect(screen.getByText("Step 2")).toBeTruthy();
  });

  test("renders constraints section", () => {
    render(<AutopilotSidebar {...makeProps()} />);
    expect(screen.getByText("Constraints & Limits")).toBeTruthy();
  });

  test("renders history section", () => {
    render(<AutopilotSidebar {...makeProps()} />);
    expect(screen.getByText("Run History")).toBeTruthy();
  });
});
