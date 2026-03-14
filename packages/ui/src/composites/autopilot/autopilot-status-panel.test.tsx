import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AutopilotStatusPanel } from "./AutopilotStatusPanel";
import type { AutopilotState } from "./types";

const noop = vi.fn();

const baseProps = {
  enabled: true,
  onToggleEnabled: noop,
  onStart: noop,
  onPause: noop,
  onStop: noop,
  onResume: noop,
  onApprove: noop,
  onDeny: noop,
  onNewRun: noop,
  onUnblock: noop,
};

describe("AutopilotStatusPanel state branches", () => {
  it("renders Start button when state is idle", () => {
    render(<AutopilotStatusPanel {...baseProps} state="idle" />);
    expect(screen.getByText("Start")).toBeTruthy();
    expect(screen.queryByText("Pause")).toBeNull();
  });

  it("renders Pause and Stop buttons when state is executing", () => {
    render(<AutopilotStatusPanel {...baseProps} state="executing" />);
    expect(screen.getByText("Pause")).toBeTruthy();
    expect(screen.getByText("Stop")).toBeTruthy();
  });

  it("renders Pause and Stop buttons when state is planning", () => {
    render(<AutopilotStatusPanel {...baseProps} state="planning" />);
    expect(screen.getByText("Pause")).toBeTruthy();
    expect(screen.getByText("Stop")).toBeTruthy();
  });

  it("renders Resume button when state is paused", () => {
    render(<AutopilotStatusPanel {...baseProps} state="paused" />);
    expect(screen.getByText("Resume")).toBeTruthy();
    expect(screen.queryByText("Pause")).toBeNull();
  });

  it("renders Approve and Deny buttons when state is waiting_approval", () => {
    render(<AutopilotStatusPanel {...baseProps} state="waiting_approval" />);
    expect(screen.getByText("Approve")).toBeTruthy();
    expect(screen.getByText("Deny")).toBeTruthy();
  });

  it("renders New Run button when state is complete", () => {
    render(<AutopilotStatusPanel {...baseProps} state="complete" />);
    expect(screen.getByText("New Run")).toBeTruthy();
    expect(screen.queryByText("Start")).toBeNull();
  });

  it("renders New Run button when state is failed", () => {
    render(<AutopilotStatusPanel {...baseProps} state="failed" />);
    expect(screen.getByText("New Run")).toBeTruthy();
  });

  it("renders Unblock button when state is blocked", () => {
    render(<AutopilotStatusPanel {...baseProps} state="blocked" />);
    expect(screen.getByText("Unblock")).toBeTruthy();
  });

  it("renders Executing label when state is executing", () => {
    render(<AutopilotStatusPanel {...baseProps} state="executing" />);
    expect(screen.getByText("Executing")).toBeTruthy();
  });

  it("renders border-destructive style for blocked state", () => {
    const { container } = render(<AutopilotStatusPanel {...baseProps} state="blocked" />);
    expect(container.querySelector(".border-destructive\\/40")).toBeTruthy();
  });

  it("renders border-warning style for waiting_approval state", () => {
    const { container } = render(<AutopilotStatusPanel {...baseProps} state="waiting_approval" />);
    expect(container.querySelector(".border-warning\\/40")).toBeTruthy();
  });

  it("renders border-green style for executing state", () => {
    const { container } = render(<AutopilotStatusPanel {...baseProps} state="executing" />);
    expect(container.querySelector(".border-green\\/40")).toBeTruthy();
  });

  it("renders default border for idle state", () => {
    const { container } = render(<AutopilotStatusPanel {...baseProps} state="idle" />);
    expect(container.querySelector(".border-border")).toBeTruthy();
  });

  it("calls onStart when Start is clicked", () => {
    const onStart = vi.fn();
    render(<AutopilotStatusPanel {...baseProps} onStart={onStart} state="idle" />);
    fireEvent.click(screen.getByText("Start"));
    expect(onStart).toHaveBeenCalledOnce();
  });

  it("calls onPause when Pause is clicked", () => {
    const onPause = vi.fn();
    render(<AutopilotStatusPanel {...baseProps} onPause={onPause} state="executing" />);
    fireEvent.click(screen.getByText("Pause"));
    expect(onPause).toHaveBeenCalledOnce();
  });

  it("calls onStop when Stop is clicked", () => {
    const onStop = vi.fn();
    render(<AutopilotStatusPanel {...baseProps} onStop={onStop} state="executing" />);
    fireEvent.click(screen.getByText("Stop"));
    expect(onStop).toHaveBeenCalledOnce();
  });

  it("calls onResume when Resume is clicked", () => {
    const onResume = vi.fn();
    render(<AutopilotStatusPanel {...baseProps} onResume={onResume} state="paused" />);
    fireEvent.click(screen.getByText("Resume"));
    expect(onResume).toHaveBeenCalledOnce();
  });

  it("calls onApprove when Approve is clicked", () => {
    const onApprove = vi.fn();
    render(<AutopilotStatusPanel {...baseProps} onApprove={onApprove} state="waiting_approval" />);
    fireEvent.click(screen.getByText("Approve"));
    expect(onApprove).toHaveBeenCalledOnce();
  });

  it("calls onDeny when Deny is clicked", () => {
    const onDeny = vi.fn();
    render(<AutopilotStatusPanel {...baseProps} onDeny={onDeny} state="waiting_approval" />);
    fireEvent.click(screen.getByText("Deny"));
    expect(onDeny).toHaveBeenCalledOnce();
  });

  it("calls onNewRun when New Run is clicked (complete state)", () => {
    const onNewRun = vi.fn();
    render(<AutopilotStatusPanel {...baseProps} onNewRun={onNewRun} state="complete" />);
    fireEvent.click(screen.getByText("New Run"));
    expect(onNewRun).toHaveBeenCalledOnce();
  });

  it("calls onUnblock when Unblock is clicked", () => {
    const onUnblock = vi.fn();
    render(<AutopilotStatusPanel {...baseProps} onUnblock={onUnblock} state="blocked" />);
    fireEvent.click(screen.getByText("Unblock"));
    expect(onUnblock).toHaveBeenCalledOnce();
  });

  it("shows animate-pulse class for executing state indicator dot", () => {
    const { container } = render(<AutopilotStatusPanel {...baseProps} state="executing" />);
    expect(container.querySelector(".animate-pulse")).toBeTruthy();
  });

  it("shows animate-pulse class for planning state indicator dot", () => {
    const { container } = render(<AutopilotStatusPanel {...baseProps} state="planning" />);
    expect(container.querySelector(".animate-pulse")).toBeTruthy();
  });

  it("no animate-pulse for idle state", () => {
    const { container } = render(<AutopilotStatusPanel {...baseProps} state="idle" />);
    expect(container.querySelector(".animate-pulse")).toBeNull();
  });
});
