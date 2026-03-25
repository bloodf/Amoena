import { render, screen } from "@testing-library/react";
import { describe, expect, mock, test } from "bun:test";
import { AutopilotSidebar } from "./AutopilotSidebar";

function makeProps(overrides: Partial<Parameters<typeof AutopilotSidebar>[0]> = {}) {
  return {
    enabled: true,
    state: "idle" as const,
    onToggleEnabled: mock(() => {}),
    onStart: mock(() => {}),
    onPause: mock(() => {}),
    onStop: mock(() => {}),
    onResume: mock(() => {}),
    onApprove: mock(() => {}),
    onDeny: mock(() => {}),
    onNewRun: mock(() => {}),
    onUnblock: mock(() => {}),
    goalText: "Build authentication",
    editingGoal: false,
    onToggleEditingGoal: mock(() => {}),
    onChangeGoal: mock((_v: string) => {}),
    storySteps: [
      { label: "Step 1", status: "done" as const, tokens: "1k" },
      { label: "Step 2", status: "pending" as const, tokens: "—" },
    ],
    allowedActions: { file_edits: true, terminal: true, git: false },
    onToggleAction: mock(() => {}),
    maxTokens: "10000",
    onMaxTokensChange: mock((_v: string) => {}),
    timeLimit: "15 minutes",
    onTimeLimitChange: mock((_v: string) => {}),
    showHistory: false,
    onToggleHistory: mock(() => {}),
    history: [],
    onSelectRun: mock(() => {}),
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
