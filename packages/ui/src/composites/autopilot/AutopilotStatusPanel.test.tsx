import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, mock, test, vi } from "vitest";

import { AutopilotStatusPanel } from "./AutopilotStatusPanel";
import type { AutopilotState } from "./types";

function renderPanel(state: AutopilotState = "idle", enabled = true) {
  const handlers = {
    onToggleEnabled: vi.fn(() => {}),
    onStart: vi.fn(() => {}),
    onPause: vi.fn(() => {}),
    onStop: vi.fn(() => {}),
    onResume: vi.fn(() => {}),
    onApprove: vi.fn(() => {}),
    onDeny: vi.fn(() => {}),
    onNewRun: vi.fn(() => {}),
    onUnblock: vi.fn(() => {}),
  };
  const result = render(
    <AutopilotStatusPanel enabled={enabled} state={state} {...handlers} />,
  );
  return { ...result, ...handlers };
}

describe("AutopilotStatusPanel", () => {
  test("renders the Autopilot heading", () => {
    renderPanel();
    expect(screen.getByText("Autopilot")).toBeTruthy();
  });

  test("renders the enable toggle", () => {
    renderPanel();
    expect(screen.getByLabelText("Enable autopilot")).toBeTruthy();
  });

  test("shows Start button in idle state", () => {
    renderPanel("idle");
    expect(screen.getByText("Start")).toBeTruthy();
  });

  test("calls onStart when Start is clicked", () => {
    const { onStart } = renderPanel("idle");
    fireEvent.click(screen.getByText("Start"));
    expect(onStart).toHaveBeenCalled();
  });

  test("shows Pause and Stop buttons in executing state", () => {
    renderPanel("executing");
    expect(screen.getByText("Pause")).toBeTruthy();
    expect(screen.getByText("Stop")).toBeTruthy();
  });

  test("calls onPause when Pause is clicked", () => {
    const { onPause } = renderPanel("executing");
    fireEvent.click(screen.getByText("Pause"));
    expect(onPause).toHaveBeenCalled();
  });

  test("calls onStop when Stop is clicked", () => {
    const { onStop } = renderPanel("executing");
    fireEvent.click(screen.getByText("Stop"));
    expect(onStop).toHaveBeenCalled();
  });

  test("shows Resume button in paused state", () => {
    renderPanel("paused");
    expect(screen.getByText("Resume")).toBeTruthy();
  });

  test("calls onResume when Resume is clicked", () => {
    const { onResume } = renderPanel("paused");
    fireEvent.click(screen.getByText("Resume"));
    expect(onResume).toHaveBeenCalled();
  });

  test("shows Approve and Deny in waiting_approval state", () => {
    renderPanel("waiting_approval");
    expect(screen.getByText("Approve")).toBeTruthy();
    expect(screen.getByText("Deny")).toBeTruthy();
  });

  test("calls onApprove when Approve is clicked", () => {
    const { onApprove } = renderPanel("waiting_approval");
    fireEvent.click(screen.getByText("Approve"));
    expect(onApprove).toHaveBeenCalled();
  });

  test("calls onDeny when Deny is clicked", () => {
    const { onDeny } = renderPanel("waiting_approval");
    fireEvent.click(screen.getByText("Deny"));
    expect(onDeny).toHaveBeenCalled();
  });

  test("shows New Run button in complete state", () => {
    renderPanel("complete");
    expect(screen.getByText("New Run")).toBeTruthy();
  });

  test("shows New Run button in failed state", () => {
    renderPanel("failed");
    expect(screen.getByText("New Run")).toBeTruthy();
  });

  test("shows Unblock button in blocked state", () => {
    renderPanel("blocked");
    expect(screen.getByText("Unblock")).toBeTruthy();
  });

  test("calls onUnblock when Unblock is clicked", () => {
    const { onUnblock } = renderPanel("blocked");
    fireEvent.click(screen.getByText("Unblock"));
    expect(onUnblock).toHaveBeenCalled();
  });

  test("shows Pause and Stop in planning state", () => {
    renderPanel("planning");
    expect(screen.getByText("Pause")).toBeTruthy();
    expect(screen.getByText("Stop")).toBeTruthy();
  });

  test("renders status region with aria-live", () => {
    renderPanel("executing");
    const statusRegion = screen.getByRole("status");
    expect(statusRegion).toBeTruthy();
  });
});
