import { useState } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { ScreenMain, ScreenRoot, ScreenSidebarLayout } from "@/components/screen";
import { AutopilotActivityPane } from "@/composites/autopilot/AutopilotActivityPane";
import { PipelineStepper } from "@/composites/autopilot/PipelineStepper";
import { AutopilotSidebar } from "@/composites/autopilot/AutopilotSidebar";
import { initialAutopilotActivityLog, initialAutopilotRunHistory, initialAutopilotStorySteps } from "@/composites/autopilot/data";
import type { AutopilotState } from "@/composites/autopilot/types";

export function AutopilotScreen() {
  const navigate = useNavigate();
  const [enabled, setEnabled] = useState(true);
  const [currentState, setCurrentState] = useState<AutopilotState>("executing");
  const [showHistory, setShowHistory] = useState(false);
  const [activityLog, setActivityLog] = useState(initialAutopilotActivityLog);
  const [storySteps] = useState(initialAutopilotStorySteps);
  const [allowedActions, setAllowedActions] = useState({ file_edits: true, terminal: true, git: false });
  const [maxTokens, setMaxTokens] = useState("16000");
  const [timeLimit, setTimeLimit] = useState("5 minutes");
  const [goalText, setGoalText] = useState(
    "Refactor authentication module to use JWT tokens with refresh token rotation, replacing the existing session-based auth.",
  );
  const [editingGoal, setEditingGoal] = useState(false);

  const handleApprove = (index: number) => {
    setActivityLog((previous) => previous.map((item, currentIndex) => (currentIndex === index ? { ...item, status: "completed" } : item)));
    toast.success("Action approved");
  };

  const handleDeny = (index: number) => {
    setActivityLog((previous) => previous.filter((_, currentIndex) => currentIndex !== index));
    toast.success("Action denied");
  };

  const toggleAction = (key: keyof typeof allowedActions) => {
    setAllowedActions((previous) => ({ ...previous, [key]: !previous[key] }));
  };

  return (
    <ScreenRoot className="overflow-hidden">
      <ScreenSidebarLayout>
        <AutopilotSidebar
          enabled={enabled}
          state={currentState}
          onToggleEnabled={() => {
            setEnabled(!enabled);
            if (enabled) {
              setCurrentState("idle");
              toast("Autopilot disabled");
            } else {
              toast.success("Autopilot enabled");
            }
          }}
          onStart={() => {
            setCurrentState("planning");
            setTimeout(() => setCurrentState("executing"), 1500);
            toast.success("Autopilot started");
          }}
          onPause={() => {
            setCurrentState("paused");
            toast("Autopilot paused");
          }}
          onStop={() => {
            setCurrentState("idle");
            toast("Autopilot stopped");
          }}
          onResume={() => {
            setCurrentState("executing");
            toast.success("Resumed");
          }}
          onApprove={() => {
            setCurrentState("executing");
            toast.success("Approved — resuming execution");
          }}
          onDeny={() => {
            setCurrentState("blocked");
            toast.error("Denied — autopilot blocked");
          }}
          onNewRun={() => setCurrentState("idle")}
          onUnblock={() => {
            setCurrentState("executing");
            toast.success("Unblocked");
          }}
          goalText={goalText}
          editingGoal={editingGoal}
          onToggleEditingGoal={() => setEditingGoal(!editingGoal)}
          onChangeGoal={setGoalText}
          storySteps={storySteps}
          allowedActions={allowedActions}
          onToggleAction={toggleAction}
          maxTokens={maxTokens}
          onMaxTokensChange={setMaxTokens}
          timeLimit={timeLimit}
          onTimeLimitChange={setTimeLimit}
          showHistory={showHistory}
          onToggleHistory={() => setShowHistory(!showHistory)}
          history={initialAutopilotRunHistory}
          onSelectRun={(run) => toast(`Viewing run: ${run.goal}`)}
        />

        <ScreenMain>
          <div className="border-b border-border px-6 py-3">
            <PipelineStepper currentPhase="execution" />
          </div>
          <AutopilotActivityPane
            state={currentState}
            activityLog={activityLog}
            onOpenTaskBoard={() => navigate("/tasks")}
            onApprove={handleApprove}
            onDeny={handleDeny}
          />
        </ScreenMain>
      </ScreenSidebarLayout>
    </ScreenRoot>
  );
}
