import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { AutopilotActivityPane } from "./AutopilotActivityPane";
import type { AutopilotActivityItem } from "./types";

const activityLog: AutopilotActivityItem[] = [
  {
    time: "10:34:12",
    action: "file_edit",
    target: "src/auth/tokens.rs",
    status: "completed",
  },
  {
    time: "10:35:01",
    action: "file_delete",
    target: "src/auth/session_store.rs",
    status: "pending_approval",
  },
];

describe("AutopilotActivityPane", () => {
  it("renders live activity details and delegates actions", () => {
    const onOpenTaskBoard = vi.fn();
    const onApprove = vi.fn();
    const onDeny = vi.fn();

    render(
      <AutopilotActivityPane
        state="executing"
        activityLog={activityLog}
        onOpenTaskBoard={onOpenTaskBoard}
        onApprove={onApprove}
        onDeny={onDeny}
      />,
    );

    expect(screen.getByText("Live Activity")).toBeInTheDocument();
    expect(screen.getByText("JWT Auth Refactor")).toBeInTheDocument();
    expect(screen.getByText("Auth Architect")).toBeInTheDocument();
    expect(screen.getByText("src/auth/session_store.rs")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Task Board"));
    fireEvent.click(screen.getByText("Approve"));
    fireEvent.click(screen.getByText("Deny"));

    expect(onOpenTaskBoard).toHaveBeenCalledOnce();
    expect(onApprove).toHaveBeenCalledWith(1);
    expect(onDeny).toHaveBeenCalledWith(1);
  });

  it("renders the empty state when there is no activity", () => {
    render(
      <AutopilotActivityPane
        state="idle"
        activityLog={[]}
        onOpenTaskBoard={() => {}}
        onApprove={() => {}}
        onDeny={() => {}}
      />,
    );

    expect(screen.getByText("No activity yet")).toBeInTheDocument();
    expect(
      screen.getByText("Start an autopilot run to see activity here"),
    ).toBeInTheDocument();
  });
});
