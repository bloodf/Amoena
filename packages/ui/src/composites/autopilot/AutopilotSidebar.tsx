import { AutopilotConstraintsSection } from "./AutopilotConstraintsSection";
import { AutopilotGoalSection } from "./AutopilotGoalSection";
import { AutopilotHistorySection } from "./AutopilotHistorySection";
import { AutopilotStatusPanel } from "./AutopilotStatusPanel";
import { AutopilotStoryList } from "./AutopilotStoryList";
import type { AutopilotRunHistoryItem, AutopilotState, AutopilotStoryStep } from "./types";

export function AutopilotSidebar({
  enabled,
  state,
  onToggleEnabled,
  onStart,
  onPause,
  onStop,
  onResume,
  onApprove,
  onDeny,
  onNewRun,
  onUnblock,
  goalText,
  editingGoal,
  onToggleEditingGoal,
  onChangeGoal,
  storySteps,
  allowedActions,
  onToggleAction,
  maxTokens,
  onMaxTokensChange,
  timeLimit,
  onTimeLimitChange,
  showHistory,
  onToggleHistory,
  history,
  onSelectRun,
}: {
  enabled: boolean;
  state: AutopilotState;
  onToggleEnabled: () => void;
  onStart: () => void;
  onPause: () => void;
  onStop: () => void;
  onResume: () => void;
  onApprove: () => void;
  onDeny: () => void;
  onNewRun: () => void;
  onUnblock: () => void;
  goalText: string;
  editingGoal: boolean;
  onToggleEditingGoal: () => void;
  onChangeGoal: (value: string) => void;
  storySteps: AutopilotStoryStep[];
  allowedActions: { file_edits: boolean; terminal: boolean; git: boolean };
  onToggleAction: (key: keyof { file_edits: boolean; terminal: boolean; git: boolean }) => void;
  maxTokens: string;
  onMaxTokensChange: (value: string) => void;
  timeLimit: string;
  onTimeLimitChange: (value: string) => void;
  showHistory: boolean;
  onToggleHistory: () => void;
  history: AutopilotRunHistoryItem[];
  onSelectRun: (run: AutopilotRunHistoryItem) => void;
}) {
  return (
    <div className="flex w-[380px] flex-shrink-0 flex-col overflow-y-auto border-r border-border">
      <AutopilotStatusPanel
        enabled={enabled}
        state={state}
        onToggleEnabled={onToggleEnabled}
        onStart={onStart}
        onPause={onPause}
        onStop={onStop}
        onResume={onResume}
        onApprove={onApprove}
        onDeny={onDeny}
        onNewRun={onNewRun}
        onUnblock={onUnblock}
      />
      <AutopilotGoalSection goalText={goalText} editingGoal={editingGoal} onToggleEditing={onToggleEditingGoal} onChangeGoal={onChangeGoal} />
      <AutopilotStoryList steps={storySteps} />
      <AutopilotConstraintsSection
        allowedActions={allowedActions}
        onToggleAction={onToggleAction}
        maxTokens={maxTokens}
        onMaxTokensChange={onMaxTokensChange}
        timeLimit={timeLimit}
        onTimeLimitChange={onTimeLimitChange}
      />
      <AutopilotHistorySection showHistory={showHistory} onToggle={onToggleHistory} history={history} onSelectRun={onSelectRun} />
    </div>
  );
}
