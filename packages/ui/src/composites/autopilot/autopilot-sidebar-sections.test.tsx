import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { AutopilotGoalSection } from "./AutopilotGoalSection";
import { AutopilotHistorySection } from "./AutopilotHistorySection";
import { AutopilotSidebar } from "./AutopilotSidebar";
import { AutopilotStoryList } from "./AutopilotStoryList";
import {
  initialAutopilotRunHistory,
  initialAutopilotStorySteps,
} from "./data";

describe("Autopilot sidebar sections", () => {
  it("toggles goal editing and propagates goal changes", () => {
    const onToggleEditing = vi.fn();
    const onChangeGoal = vi.fn();

    render(
      <AutopilotGoalSection
        goalText="Ship the auth refactor"
        editingGoal
        onToggleEditing={onToggleEditing}
        onChangeGoal={onChangeGoal}
      />,
    );

    fireEvent.click(screen.getByText("Save"));
    fireEvent.change(screen.getByDisplayValue("Ship the auth refactor"), {
      target: { value: "Ship the i18n refactor" },
    });

    expect(onToggleEditing).toHaveBeenCalledOnce();
    expect(onChangeGoal).toHaveBeenCalledWith("Ship the i18n refactor");
  });

  it("renders story list and expandable run history", () => {
    const onToggle = vi.fn();
    const onSelectRun = vi.fn();

    render(
      <>
        <AutopilotStoryList steps={initialAutopilotStorySteps} />
        <AutopilotHistorySection
          showHistory
          onToggle={onToggle}
          history={initialAutopilotRunHistory}
          onSelectRun={onSelectRun}
        />
      </>,
    );

    expect(screen.getByText("Story Breakdown")).toBeInTheDocument();
    expect(screen.getByText("Analyze existing auth module")).toBeInTheDocument();
    expect(screen.getByText("Run History")).toBeInTheDocument();
    expect(screen.getByText("JWT Auth Refactor")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Run History"));
    fireEvent.click(screen.getByText("Add rate limiting"));

    expect(onToggle).toHaveBeenCalledOnce();
    expect(onSelectRun).toHaveBeenCalledWith(
      expect.objectContaining({ id: "run-2" }),
    );
  });

  it("wires the composed sidebar controls", () => {
    const onToggleEnabled = vi.fn();
    const onStart = vi.fn();
    const onPause = vi.fn();
    const onStop = vi.fn();
    const onResume = vi.fn();
    const onApprove = vi.fn();
    const onDeny = vi.fn();
    const onNewRun = vi.fn();
    const onUnblock = vi.fn();
    const onToggleEditingGoal = vi.fn();
    const onChangeGoal = vi.fn();
    const onToggleAction = vi.fn();
    const onMaxTokensChange = vi.fn();
    const onTimeLimitChange = vi.fn();
    const onToggleHistory = vi.fn();
    const onSelectRun = vi.fn();

    render(
      <AutopilotSidebar
        enabled
        state="paused"
        onToggleEnabled={onToggleEnabled}
        onStart={onStart}
        onPause={onPause}
        onStop={onStop}
        onResume={onResume}
        onApprove={onApprove}
        onDeny={onDeny}
        onNewRun={onNewRun}
        onUnblock={onUnblock}
        goalText="Ship the auth refactor"
        editingGoal={false}
        onToggleEditingGoal={onToggleEditingGoal}
        onChangeGoal={onChangeGoal}
        storySteps={initialAutopilotStorySteps}
        allowedActions={{ file_edits: true, terminal: false, git: true }}
        onToggleAction={onToggleAction}
        maxTokens="12000"
        onMaxTokensChange={onMaxTokensChange}
        timeLimit="10 minutes"
        onTimeLimitChange={onTimeLimitChange}
        showHistory={false}
        onToggleHistory={onToggleHistory}
        history={initialAutopilotRunHistory}
        onSelectRun={onSelectRun}
      />,
    );

    fireEvent.click(screen.getByText("Resume"));
    fireEvent.click(screen.getByText("Edit"));

    expect(onResume).toHaveBeenCalledOnce();
    expect(onToggleEditingGoal).toHaveBeenCalledOnce();
  });
});
