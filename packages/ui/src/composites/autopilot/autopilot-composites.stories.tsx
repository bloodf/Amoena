import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "@storybook/test";

import { AutopilotActivityPane } from "./AutopilotActivityPane";
import { AutopilotConstraintsSection } from "./AutopilotConstraintsSection";
import { AutopilotGoalSection } from "./AutopilotGoalSection";
import { AutopilotHistorySection } from "./AutopilotHistorySection";
import { AutopilotStatusPanel } from "./AutopilotStatusPanel";
import { AutopilotStoryList } from "./AutopilotStoryList";
import {
  initialAutopilotActivityLog,
  initialAutopilotStorySteps,
  initialAutopilotRunHistory,
} from "./data";

const meta: Meta = {
  title: "Composites/Autopilot",
};
export default meta;
type Story = StoryObj;

// ─── AutopilotActivityPane ───────────────────────────────────────────────────

export const ActivityPaneExecuting: Story = {
  name: "AutopilotActivityPane / Executing",
  render: () => (
    <AutopilotActivityPane
      state="executing"
      activityLog={initialAutopilotActivityLog}
      onOpenTaskBoard={fn()}
      onApprove={fn()}
      onDeny={fn()}
    />
  ),
};

export const ActivityPaneWaitingApproval: Story = {
  name: "AutopilotActivityPane / Waiting Approval",
  render: () => (
    <AutopilotActivityPane
      state="waiting_approval"
      activityLog={initialAutopilotActivityLog}
      onOpenTaskBoard={fn()}
      onApprove={fn()}
      onDeny={fn()}
    />
  ),
};

export const ActivityPaneIdle: Story = {
  name: "AutopilotActivityPane / Idle Empty",
  render: () => (
    <AutopilotActivityPane
      state="idle"
      activityLog={[]}
      onOpenTaskBoard={fn()}
      onApprove={fn()}
      onDeny={fn()}
    />
  ),
};

// ─── AutopilotConstraintsSection ─────────────────────────────────────────────

export const ConstraintsAllEnabled: Story = {
  name: "AutopilotConstraintsSection / All Enabled",
  render: () => (
    <AutopilotConstraintsSection
      allowedActions={{ file_edits: true, terminal: true, git: true }}
      onToggleAction={fn()}
      maxTokens="10000"
      onMaxTokensChange={fn()}
      timeLimit="30m"
      onTimeLimitChange={fn()}
    />
  ),
};

export const ConstraintsRestricted: Story = {
  name: "AutopilotConstraintsSection / Restricted",
  render: () => (
    <AutopilotConstraintsSection
      allowedActions={{ file_edits: true, terminal: false, git: false }}
      onToggleAction={fn()}
      maxTokens="2000"
      onMaxTokensChange={fn()}
      timeLimit="5m"
      onTimeLimitChange={fn()}
    />
  ),
};

export const ConstraintsAllDisabled: Story = {
  name: "AutopilotConstraintsSection / All Disabled",
  render: () => (
    <AutopilotConstraintsSection
      allowedActions={{ file_edits: false, terminal: false, git: false }}
      onToggleAction={fn()}
      maxTokens="0"
      onMaxTokensChange={fn()}
      timeLimit="0m"
      onTimeLimitChange={fn()}
    />
  ),
};

// ─── AutopilotGoalSection ────────────────────────────────────────────────────

export const GoalReadOnly: Story = {
  name: "AutopilotGoalSection / Read Only",
  render: () => (
    <AutopilotGoalSection
      goalText="Implement JWT-based authentication with refresh token rotation and session management"
      editingGoal={false}
      onToggleEditing={fn()}
      onChangeGoal={fn()}
    />
  ),
};

export const GoalEditing: Story = {
  name: "AutopilotGoalSection / Editing",
  render: () => (
    <AutopilotGoalSection
      goalText="Implement JWT-based authentication with refresh token rotation and session management"
      editingGoal={true}
      onToggleEditing={fn()}
      onChangeGoal={fn()}
    />
  ),
};

export const GoalEmpty: Story = {
  name: "AutopilotGoalSection / Empty",
  render: () => (
    <AutopilotGoalSection
      goalText=""
      editingGoal={true}
      onToggleEditing={fn()}
      onChangeGoal={fn()}
    />
  ),
};

// ─── AutopilotHistorySection ─────────────────────────────────────────────────

export const HistoryExpanded: Story = {
  name: "AutopilotHistorySection / Expanded",
  render: () => (
    <AutopilotHistorySection
      showHistory={true}
      onToggle={fn()}
      history={initialAutopilotRunHistory}
      onSelectRun={fn()}
    />
  ),
};

export const HistoryCollapsed: Story = {
  name: "AutopilotHistorySection / Collapsed",
  render: () => (
    <AutopilotHistorySection
      showHistory={false}
      onToggle={fn()}
      history={initialAutopilotRunHistory}
      onSelectRun={fn()}
    />
  ),
};

export const HistoryEmpty: Story = {
  name: "AutopilotHistorySection / Empty",
  render: () => (
    <AutopilotHistorySection
      showHistory={true}
      onToggle={fn()}
      history={[]}
      onSelectRun={fn()}
    />
  ),
};

// ─── AutopilotStatusPanel ────────────────────────────────────────────────────

const statusPanelActions = {
  onToggleEnabled: fn(),
  onStart: fn(),
  onPause: fn(),
  onStop: fn(),
  onResume: fn(),
  onApprove: fn(),
  onDeny: fn(),
  onNewRun: fn(),
  onUnblock: fn(),
};

export const StatusPanelIdle: Story = {
  name: "AutopilotStatusPanel / Idle",
  render: () => (
    <AutopilotStatusPanel
      enabled={true}
      state="idle"
      {...statusPanelActions}
    />
  ),
};

export const StatusPanelExecuting: Story = {
  name: "AutopilotStatusPanel / Executing",
  render: () => (
    <AutopilotStatusPanel
      enabled={true}
      state="executing"
      {...statusPanelActions}
    />
  ),
};

export const StatusPanelWaitingApproval: Story = {
  name: "AutopilotStatusPanel / Waiting Approval",
  render: () => (
    <AutopilotStatusPanel
      enabled={true}
      state="waiting_approval"
      {...statusPanelActions}
    />
  ),
};

export const StatusPanelDisabled: Story = {
  name: "AutopilotStatusPanel / Disabled",
  render: () => (
    <AutopilotStatusPanel
      enabled={false}
      state="idle"
      {...statusPanelActions}
    />
  ),
};

// ─── AutopilotStoryList ──────────────────────────────────────────────────────

export const StoryListDefault: Story = {
  name: "AutopilotStoryList / Default",
  render: () => <AutopilotStoryList steps={initialAutopilotStorySteps} />,
};

export const StoryListAllDone: Story = {
  name: "AutopilotStoryList / All Done",
  render: () => (
    <AutopilotStoryList
      steps={initialAutopilotStorySteps.map((step) => ({
        ...step,
        status: "done" as const,
      }))}
    />
  ),
};

export const StoryListAllPending: Story = {
  name: "AutopilotStoryList / All Pending",
  render: () => (
    <AutopilotStoryList
      steps={initialAutopilotStorySteps.map((step) => ({
        ...step,
        status: "pending" as const,
        tokens: "—",
      }))}
    />
  ),
};
