import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, mock, test } from "bun:test";

import { AutopilotActivityPane } from "./AutopilotActivityPane";
import type { AutopilotActivityItem } from "./types";

const activityLog: AutopilotActivityItem[] = [
  { time: "0:12", action: "edit", target: "src/auth.ts", status: "completed" },
  { time: "0:30", action: "create", target: "src/tokens.ts", status: "pending_approval" },
  { time: "0:45", action: "test", target: "src/auth.test.ts", status: "completed" },
];

function renderPane(log: AutopilotActivityItem[] = activityLog) {
  const handlers = {
    onOpenTaskBoard: mock(() => {}),
    onApprove: mock((_i: number) => {}),
    onDeny: mock((_i: number) => {}),
  };
  const result = render(
    <AutopilotActivityPane state="executing" activityLog={log} {...handlers} />,
  );
  return { ...result, ...handlers };
}

describe("AutopilotActivityPane", () => {
  test("renders Live Activity heading", () => {
    renderPane();
    expect(screen.getByText("Live Activity")).toBeTruthy();
  });

  test("renders Task Board button", () => {
    renderPane();
    expect(screen.getByLabelText("Open task board")).toBeTruthy();
  });

  test("calls onOpenTaskBoard when Task Board is clicked", () => {
    const { onOpenTaskBoard } = renderPane();
    fireEvent.click(screen.getByLabelText("Open task board"));
    expect(onOpenTaskBoard).toHaveBeenCalled();
  });

  test("renders activity log items", () => {
    renderPane();
    expect(screen.getByText("src/auth.ts")).toBeTruthy();
    expect(screen.getByText("src/tokens.ts")).toBeTruthy();
    expect(screen.getByText("src/auth.test.ts")).toBeTruthy();
  });

  test("renders action labels", () => {
    renderPane();
    expect(screen.getByText("edit")).toBeTruthy();
    expect(screen.getByText("create")).toBeTruthy();
    expect(screen.getByText("test")).toBeTruthy();
  });

  test("renders timestamps", () => {
    renderPane();
    expect(screen.getByText("0:12")).toBeTruthy();
    expect(screen.getByText("0:30")).toBeTruthy();
  });

  test("shows Approve/Deny buttons for pending_approval items", () => {
    renderPane();
    expect(screen.getByLabelText("Approve src/tokens.ts")).toBeTruthy();
    expect(screen.getByLabelText("Deny src/tokens.ts")).toBeTruthy();
  });

  test("calls onApprove with correct index", () => {
    const { onApprove } = renderPane();
    fireEvent.click(screen.getByLabelText("Approve src/tokens.ts"));
    expect(onApprove).toHaveBeenCalledWith(1);
  });

  test("calls onDeny with correct index", () => {
    const { onDeny } = renderPane();
    fireEvent.click(screen.getByLabelText("Deny src/tokens.ts"));
    expect(onDeny).toHaveBeenCalledWith(1);
  });

  test("shows empty state when no activity", () => {
    renderPane([]);
    expect(screen.getByText("No activity yet")).toBeTruthy();
    expect(screen.getByText("Start an autopilot run to see activity here")).toBeTruthy();
  });

  test("renders the activity log as a log region", () => {
    renderPane();
    expect(screen.getByRole("log")).toBeTruthy();
  });

  test("renders pipeline stepper", () => {
    renderPane();
    // PipelineStepper renders phase labels
    expect(screen.getByText("Execute")).toBeTruthy();
  });

  test("renders elapsed time", () => {
    renderPane();
    expect(screen.getByText(/elapsed/)).toBeTruthy();
  });
});
