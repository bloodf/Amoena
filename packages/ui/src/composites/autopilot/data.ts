import type { AutopilotActivityItem, AutopilotRunHistoryItem, AutopilotStoryStep, AutopilotSubAgent } from "./types";

export const initialAutopilotActivityLog: AutopilotActivityItem[] = [
  { time: "10:34:12", action: "file_edit", target: "src/auth/tokens.rs", status: "completed" },
  { time: "10:34:08", action: "terminal", target: "cargo test --lib auth", status: "completed" },
  { time: "10:33:55", action: "file_edit", target: "src/auth/middleware.rs", status: "completed" },
  { time: "10:33:42", action: "file_create", target: "src/auth/rate_limit.rs", status: "completed" },
  { time: "10:33:30", action: "terminal", target: "cargo check", status: "completed" },
  { time: "10:33:15", action: "file_delete", target: "src/auth/session_store.rs", status: "pending_approval" },
];

export const initialAutopilotStorySteps: AutopilotStoryStep[] = [
  { label: "Analyze existing auth module", status: "done", tokens: "1.2k" },
  { label: "Design JWT token structure", status: "done", tokens: "0.8k" },
  { label: "Implement token issuer", status: "done", tokens: "2.4k" },
  { label: "Add refresh token rotation", status: "in_progress", tokens: "1.6k" },
  { label: "Update middleware for JWT validation", status: "pending", tokens: "—" },
  { label: "Write integration tests", status: "pending", tokens: "—" },
  { label: "Clean up old session store", status: "blocked", tokens: "—" },
];

/** MiroFish-inspired sub-agents for the active autopilot run */
export const initialAutopilotSubAgents: AutopilotSubAgent[] = [
  { id: "sub-1", name: "Auth Architect", role: "Design JWT structure", emoji: "🏗️", status: "completed", currentTask: undefined, tokensUsed: "2.4k", stepsCompleted: 3, stepsTotal: 3 },
  { id: "sub-2", name: "Implementation Agent", role: "Write token logic", emoji: "⚙️", status: "running", currentTask: "Adding refresh token rotation", tokensUsed: "1.6k", stepsCompleted: 1, stepsTotal: 3 },
  { id: "sub-3", name: "Test Writer", role: "Integration tests", emoji: "🧪", status: "preparing", currentTask: undefined, tokensUsed: "0", stepsCompleted: 0, stepsTotal: 2 },
  { id: "sub-4", name: "Security Reviewer", role: "Audit token security", emoji: "🔒", status: "paused", currentTask: "Waiting for implementation", tokensUsed: "0.3k", stepsCompleted: 0, stepsTotal: 1 },
];

export const initialAutopilotRunHistory: AutopilotRunHistoryItem[] = [
  {
    id: "run-3",
    goal: "JWT Auth Refactor",
    state: "executing",
    steps: 7,
    completed: 3,
    tokens: "6.0k",
    duration: "4m 12s",
    startedAt: "10:30 AM",
    pipelinePhase: "execution",
    subAgents: initialAutopilotSubAgents,
  },
  {
    id: "run-2",
    goal: "Add rate limiting",
    state: "complete",
    steps: 4,
    completed: 4,
    tokens: "8.2k",
    duration: "6m 33s",
    startedAt: "9:45 AM",
    pipelinePhase: "report",
    summary: {
      filesChanged: 6,
      testsAdded: 8,
      testsPassed: 8,
      keyDecisions: [
        "Used token bucket algorithm for rate limiting",
        "Added per-route rate limits configurable via settings",
        "Chose Redis-compatible in-memory store for rate state",
      ],
      lessonsLearned: [
        "Rate limit headers should be added to all responses, not just limited ones",
        "Burst allowance needs separate configuration from sustained rate",
      ],
      suggestedNextSteps: [
        "Add rate limit dashboard to usage screen",
        "Configure per-user rate limits",
      ],
    },
  },
  { id: "run-1", goal: "Fix WebSocket reconnect", state: "failed", steps: 3, completed: 1, tokens: "3.1k", duration: "2m 08s", startedAt: "9:12 AM" },
];
