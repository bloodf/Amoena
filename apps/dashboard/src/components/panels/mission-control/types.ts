/**
 * Mission Control panel types.
 *
 * Canonical shared types are imported from @lunaria/contracts and re-exported
 * for backward compatibility with existing imports within the dashboard.
 * UI-specific types that have no service counterpart are defined here.
 */

// Re-export canonical types from the contracts package
export type {
	TaskStatus,
	GoalRunStatus,
	TaskRunRow,
	GoalRunRow,
	AgentPerformanceRow,
	RunReport,
	RoutingDecision,
	MCServerEvent,
	MCClientEvent,
	GoalOptions,
} from "@lunaria/contracts";

// --- UI-specific types (no service equivalent) ---

export interface AgentCapability {
	provider: "claude-code" | "codex" | "gemini";
	available: boolean;
}

export interface AudioSettings {
	enabled: boolean;
	terminalClicks: boolean;
	completionChime: boolean;
}

export interface OutputLine {
	text: string;
	timestamp: number;
	type: "stdout" | "stderr";
}

export type ViewState = "pre-run" | "during-run" | "post-run";

// TaskStatus is imported from contracts; used here via the re-export above
import type { TaskStatus } from "@lunaria/contracts";

export interface AgentPanelState {
	adapterId: string;
	taskId: string;
	taskDescription: string;
	status: TaskStatus;
	outputLines: OutputLine[];
}
