export type AutopilotState =
  | "idle"
  | "planning"
  | "executing"
  | "waiting_approval"
  | "blocked"
  | "complete"
  | "failed"
  | "paused";

/** MiroFish-inspired pipeline phase for horizontal stepper visualization */
export type AutopilotPipelinePhase =
  | "goal_analysis"
  | "story_decomposition"
  | "agent_assignment"
  | "execution"
  | "verification"
  | "report";

export interface AutopilotActivityItem {
  time: string;
  action: string;
  target: string;
  status: "completed" | "pending_approval";
  agentId?: string;
  agentName?: string;
}

export interface AutopilotStoryStep {
  label: string;
  status: "done" | "in_progress" | "pending" | "blocked";
  tokens: string;
  assignedAgent?: string;
}

/** MiroFish-inspired sub-agent card for swarm view */
export interface AutopilotSubAgent {
  id: string;
  name: string;
  role: string;
  emoji: string;
  status: "preparing" | "running" | "paused" | "completed" | "failed";
  currentTask?: string;
  tokensUsed: string;
  stepsCompleted: number;
  stepsTotal: number;
}

/** MiroFish-inspired run summary (generated after completion) */
export interface AutopilotRunSummary {
  filesChanged: number;
  testsAdded: number;
  testsPassed: number;
  keyDecisions: string[];
  lessonsLearned: string[];
  suggestedNextSteps: string[];
}

export interface AutopilotRunHistoryItem {
  id: string;
  goal: string;
  state: AutopilotState;
  steps: number;
  completed: number;
  tokens: string;
  duration: string;
  startedAt: string;
  pipelinePhase?: AutopilotPipelinePhase;
  subAgents?: AutopilotSubAgent[];
  summary?: AutopilotRunSummary;
}
