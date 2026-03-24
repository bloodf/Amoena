// UI-specific types for Mission Control panel
// Stubs for types from other packages (replaced with real imports during merge)

export type TaskStatus =
	| "pending"
	| "running"
	| "completed"
	| "failed"
	| "cancelled"
	| "timed_out"
	| "partial_failure";

export type GoalRunStatus =
	| "pending"
	| "running"
	| "completed"
	| "failed"
	| "cancelled"
	| "partial_failure";

// --- Type stubs (replaced with imports from telemetry/reporter on merge) ---

export interface TaskRunRow {
	taskId: string;
	goalId: string;
	adapterId: string;
	description: string;
	taskType: string;
	complexity?: string;
	status: TaskStatus;
	startedAt?: number;
	completedAt?: number;
	durationMs?: number;
	costUsd?: number;
	attempts?: number;
	dependsOn?: string[];
	routingReason?: string;
	couldImprove?: boolean;
}

export interface GoalRunRow {
	goalId: string;
	description: string;
	status: GoalRunStatus;
	startedAt: number;
	completedAt?: number;
	durationMs?: number;
	totalCostUsd?: number;
	taskCount?: number;
}

export interface AgentPerformanceRow {
	adapterId: string;
	assigned: number;
	completed: number;
	failed: number;
	avgDurationMs?: number;
	totalCostUsd?: number;
	successRate?: number;
}

export interface RoutingDecision {
	taskId: string;
	adapterId: string;
	reason: string;
	couldImprove: boolean;
}

export interface RunReport {
	goalId: string;
	description: string;
	status: GoalRunStatus;
	startedAt: number;
	completedAt?: number;
	durationMs?: number;
	totalCostUsd?: number;
	tasks: TaskRunRow[];
	agents: AgentPerformanceRow[];
	routing: RoutingDecision[];
}

export interface AgentCapability {
	provider: "claude-code" | "codex" | "gemini";
	available: boolean;
}

// --- MC WebSocket event types ---

export type MCServerEvent =
	| {
			type: "task:dispatched";
			taskId: string;
			adapterId: string;
			routingReason: string;
			description?: string;
	  }
	| {
			type: "task:output";
			taskId: string;
			adapterId: string;
			text: string;
			timestamp: number;
	  }
	| { type: "task:status"; taskId: string; status: TaskStatus }
	| { type: "task:completed"; task: TaskRunRow }
	| { type: "task:failed"; task: TaskRunRow }
	| { type: "goal:status"; goalId: string; status: GoalRunStatus }
	| { type: "goal:completed"; report: RunReport }
	| { type: "goal:cancelled"; goalId: string }
	| {
			type: "cost:update";
			goalId: string;
			totalUsd: number;
			byAgent: Record<string, number>;
	  };

export type MCClientEvent =
	| { type: "goal:submit"; description: string; options?: GoalOptions }
	| { type: "goal:cancel"; goalId: string };

// --- Component props types ---

export interface GoalOptions {
	maxConcurrency?: number;
	timeoutMs?: number;
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

export interface AgentPanelState {
	adapterId: string;
	taskId: string;
	taskDescription: string;
	status: TaskStatus;
	outputLines: OutputLine[];
}
