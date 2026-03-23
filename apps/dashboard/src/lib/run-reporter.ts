import type Database from "better-sqlite3";
import {
	type GoalRunStatus,
	type TaskRunRow,
	type TaskStatus,
	getGoalRun,
	getTaskRunsForGoal,
} from "./mission-control-telemetry";

// ---------------------------------------------------------------------------
// Output types
// ---------------------------------------------------------------------------

export interface RunReport {
	goalId: string;
	goalDescription: string;
	generatedAt: number;
	runStatus: GoalRunStatus;
	startedAt: number;
	completedAt: number | null;
	totalDurationMs: number | null;
	costSummary: CostSummary;
	taskBreakdown: TaskReport[];
	agentSummary: AgentRunSummary[];
	routingInsights: RoutingInsight[];
	mergeInfo: MergeInfo | null;
	issues: RunIssue[];
}

export interface CostSummary {
	totalUsd: number;
	byAgent: Record<string, number>;
	byTaskType: Record<string, number>;
}

export interface TaskReport {
	taskId: string;
	description: string;
	taskType: string;
	complexity: string;
	status: TaskStatus;
	agentType: string | null;
	routingReason: string;
	whyThisAgent: string;
	attemptCount: number;
	durationMs: number | null;
	inputTokens: number | null;
	outputTokens: number | null;
	costUsd: number | null;
	errorMessage: string | null;
}

export interface AgentRunSummary {
	agentType: string;
	tasksAssigned: number;
	tasksCompleted: number;
	tasksFailed: number;
	totalDurationMs: number;
	totalCostUsd: number;
	avgDurationMs: number;
	successRate: number;
}

export interface RoutingInsight {
	taskId: string;
	decision: string;
	explanation: string;
	couldImprove: boolean;
	improvementHint: string;
}

export interface MergeInfo {
	strategy: "auto" | "review_required" | null;
	autoMergedCount: number;
	conflictCount: number;
	conflictedTasks: string[];
}

export interface RunIssue {
	severity: "warning" | "error";
	taskId: string | null;
	message: string;
}

// ---------------------------------------------------------------------------
// Errors
// ---------------------------------------------------------------------------

export class ReportNotFoundError extends Error {
	constructor(goalId: string) {
		super(`Goal run not found: ${goalId}`);
		this.name = "ReportNotFoundError";
	}
}

// ---------------------------------------------------------------------------
// Routing explanation
// ---------------------------------------------------------------------------

export function explainRoutingReason(routingReason: string): string {
	if (!routingReason) return "Unknown";

	if (routingReason.startsWith("matrix:")) {
		// "matrix:implementation/high→claude-code"
		const rest = routingReason.slice("matrix:".length);
		const arrowIdx = rest.indexOf("→");
		if (arrowIdx === -1) return routingReason;
		const taskPart = rest.slice(0, arrowIdx); // "implementation/high"
		const adapter = rest.slice(arrowIdx + 1); // "claude-code"
		const slashIdx = taskPart.indexOf("/");
		if (slashIdx === -1) return routingReason;
		const taskType = taskPart.slice(0, slashIdx);
		const complexity = taskPart.slice(slashIdx + 1);
		return `Assigned to ${adapter} by routing matrix: ${taskType} task with ${complexity} complexity`;
	}

	if (routingReason.startsWith("override:")) {
		const adapter = routingReason.slice("override:".length);
		return `Manually overridden to ${adapter}`;
	}

	if (routingReason.startsWith("fallback:")) {
		const agents = routingReason.slice("fallback:".length);
		const arrowIdx = agents.indexOf("→");
		if (arrowIdx === -1) return routingReason;
		const original = agents.slice(0, arrowIdx);
		const fallback = agents.slice(arrowIdx + 1);
		return `Fell back to ${fallback} after ${original} was unavailable`;
	}

	return routingReason;
}

// ---------------------------------------------------------------------------
// Routing analysis
// ---------------------------------------------------------------------------

export function analyzeRoutingDecision(task: TaskRunRow): RoutingInsight {
	const insight: RoutingInsight = {
		taskId: task.id,
		decision: task.routing_reason,
		explanation: explainRoutingReason(task.routing_reason),
		couldImprove: false,
		improvementHint: "",
	};

	// Flag: high-complexity task went to codex
	if (
		task.complexity === "high" &&
		task.agent_type === "codex" &&
		!task.routing_reason.startsWith("override:")
	) {
		insight.couldImprove = true;
		insight.improvementHint =
			"High-complexity tasks generally perform better with claude-code.";
	}

	// Flag: fallback routing
	if (task.routing_reason.startsWith("fallback:")) {
		insight.couldImprove = true;
		const [, agents] = task.routing_reason.split(":");
		const [original] = agents.split("→");
		insight.improvementHint = `Ensure ${original} credentials are configured to avoid fallback routing.`;
	}

	// Flag: retried
	if (task.attempt_count > 1) {
		insight.couldImprove = true;
		insight.improvementHint = `Task required ${task.attempt_count} attempts. Check agent stability.`;
	}

	return insight;
}

// ---------------------------------------------------------------------------
// Core function
// ---------------------------------------------------------------------------

export function generateReport(db: Database.Database, goalId: string): RunReport {
	const goal = getGoalRun(db, goalId);
	if (!goal) throw new ReportNotFoundError(goalId);

	const tasks = getTaskRunsForGoal(db, goalId);

	// Task breakdown
	const taskBreakdown: TaskReport[] = tasks.map((t) => ({
		taskId: t.id,
		description: t.description,
		taskType: t.task_type,
		complexity: t.complexity,
		status: t.status,
		agentType: t.agent_type,
		routingReason: t.routing_reason,
		whyThisAgent: t.agent_type
			? t.routing_reason
				? explainRoutingReason(t.routing_reason)
				: "Unknown"
			: "Not yet assigned",
		attemptCount: t.attempt_count,
		durationMs: t.duration_ms,
		inputTokens: t.input_tokens,
		outputTokens: t.output_tokens,
		costUsd: t.cost_usd,
		errorMessage: t.error_message,
	}));

	// Cost summary
	const byAgent: Record<string, number> = {};
	const byTaskType: Record<string, number> = {};
	let totalUsd = 0;
	for (const t of tasks) {
		if (t.cost_usd == null) continue;
		totalUsd += t.cost_usd;
		if (t.agent_type) {
			byAgent[t.agent_type] = (byAgent[t.agent_type] ?? 0) + t.cost_usd;
		}
		byTaskType[t.task_type] = (byTaskType[t.task_type] ?? 0) + t.cost_usd;
	}
	const costSummary: CostSummary = { totalUsd, byAgent, byTaskType };

	// Agent summary
	const agentMap = new Map<
		string,
		{
			tasksAssigned: number;
			tasksCompleted: number;
			tasksFailed: number;
			totalDurationMs: number;
			totalCostUsd: number;
		}
	>();
	for (const t of tasks) {
		if (!t.agent_type) continue;
		const entry = agentMap.get(t.agent_type) ?? {
			tasksAssigned: 0,
			tasksCompleted: 0,
			tasksFailed: 0,
			totalDurationMs: 0,
			totalCostUsd: 0,
		};
		entry.tasksAssigned += 1;
		if (t.status === "completed") entry.tasksCompleted += 1;
		if (t.status === "failed") entry.tasksFailed += 1;
		entry.totalDurationMs += t.duration_ms ?? 0;
		entry.totalCostUsd += t.cost_usd ?? 0;
		agentMap.set(t.agent_type, entry);
	}
	const agentSummary: AgentRunSummary[] = Array.from(agentMap.entries()).map(
		([agentType, s]) => ({
			agentType,
			tasksAssigned: s.tasksAssigned,
			tasksCompleted: s.tasksCompleted,
			tasksFailed: s.tasksFailed,
			totalDurationMs: s.totalDurationMs,
			totalCostUsd: s.totalCostUsd,
			avgDurationMs: s.tasksAssigned > 0 ? s.totalDurationMs / s.tasksAssigned : 0,
			successRate: s.tasksAssigned > 0 ? s.tasksCompleted / s.tasksAssigned : 0,
		}),
	);

	// Routing insights
	const routingInsights: RoutingInsight[] = tasks.map(analyzeRoutingDecision);

	// Merge info
	const mergeStrategy = goal.merge_strategy as "auto" | "review_required" | null;
	const mergeInfo: MergeInfo | null = mergeStrategy
		? {
				strategy: mergeStrategy,
				autoMergedCount: mergeStrategy === "auto" ? tasks.filter((t) => t.status === "completed").length : 0,
				conflictCount: 0,
				conflictedTasks: [],
			}
		: null;

	// Issues
	const issues: RunIssue[] = [];

	if (goal.status === "cancelled") {
		issues.push({ severity: "warning", taskId: null, message: "Goal was cancelled" });
	}

	for (const t of tasks) {
		if (t.attempt_count > 1) {
			issues.push({
				severity: "warning",
				taskId: t.id,
				message: `Task required ${t.attempt_count} retry attempts.`,
			});
		}
		if (t.status === "timed_out") {
			issues.push({
				severity: "error",
				taskId: t.id,
				message: `Task timed out.`,
			});
		}
		if (t.status === "skipped") {
			issues.push({
				severity: "warning",
				taskId: t.id,
				message: `Task was skipped.`,
			});
		}
	}

	// Total duration
	const totalDurationMs =
		goal.completed_at != null
			? (goal.completed_at - goal.started_at) * 1000
			: null;

	return {
		goalId: goal.id,
		goalDescription: goal.description,
		generatedAt: Date.now(),
		runStatus: goal.status,
		startedAt: goal.started_at,
		completedAt: goal.completed_at,
		totalDurationMs,
		costSummary,
		taskBreakdown,
		agentSummary,
		routingInsights,
		mergeInfo,
		issues,
	};
}

// ---------------------------------------------------------------------------
// Markdown renderer helpers
// ---------------------------------------------------------------------------

function statusEmoji(status: GoalRunStatus | TaskStatus): string {
	switch (status) {
		case "completed": return "✓";
		case "failed":
		case "cancelled": return "✗";
		case "partial_failure": return "⚠";
		case "pending": return "…";
		case "running": return "⟳";
		default: return "";
	}
}

function formatDuration(ms: number | null): string {
	if (ms == null) return "—";
	const totalSeconds = Math.floor(ms / 1000);
	if (totalSeconds < 60) return `${totalSeconds}s`;
	const minutes = Math.floor(totalSeconds / 60);
	const seconds = totalSeconds % 60;
	return `${minutes}m ${seconds}s`;
}

function formatCost(usd: number | null): string {
	if (usd == null) return "—";
	return `$${usd.toFixed(4)} USD`;
}

function formatTokens(n: number | null): string {
	if (n == null) return "—";
	return n.toLocaleString("en-US");
}

function formatDate(ts: number): string {
	return new Date(ts).toISOString().replace("T", " ").slice(0, 19) + " UTC";
}

// ---------------------------------------------------------------------------
// Markdown renderer
// ---------------------------------------------------------------------------

export function renderMarkdown(report: RunReport): string {
	const lines: string[] = [];

	// Header
	lines.push("# Mission Control Run Report");
	lines.push("");
	lines.push(`**Goal:** ${report.goalDescription}`);
	lines.push(`**Status:** ${report.runStatus} ${statusEmoji(report.runStatus)}`);
	lines.push(
		`**Duration:** ${report.completedAt == null ? "In progress" : formatDuration(report.totalDurationMs)}`,
	);
	lines.push(`**Total Cost:** ${formatCost(report.costSummary.totalUsd)}`);
	lines.push(`**Generated:** ${formatDate(report.generatedAt)}`);
	lines.push("");
	lines.push("---");
	lines.push("");

	// Summary table
	const tasks = report.taskBreakdown;
	const completed = tasks.filter((t) => t.status === "completed").length;
	const failed = tasks.filter((t) => t.status === "failed").length;
	const skipped = tasks.filter((t) => t.status === "skipped").length;
	const timedOut = tasks.filter((t) => t.status === "timed_out").length;
	const cancelled = tasks.filter((t) => t.status === "cancelled").length;

	lines.push("## Summary");
	lines.push("");
	lines.push("| Metric | Value |");
	lines.push("|--------|-------|");
	lines.push(`| Total Tasks | ${tasks.length} |`);
	lines.push(`| Completed | ${completed} |`);
	lines.push(`| Failed | ${failed} |`);
	lines.push(`| Skipped | ${skipped} |`);
	lines.push(`| Timed Out | ${timedOut} |`);
	lines.push(`| Cancelled | ${cancelled} |`);
	lines.push("");
	lines.push("---");
	lines.push("");

	// Agent performance
	lines.push("## Agent Performance");
	lines.push("");
	if (report.agentSummary.length === 0) {
		lines.push("> No agent data available.");
	} else {
		lines.push("| Agent | Tasks | Completed | Failed | Avg Duration | Cost |");
		lines.push("|-------|-------|-----------|--------|--------------|------|");
		for (const a of report.agentSummary) {
			lines.push(
				`| ${a.agentType} | ${a.tasksAssigned} | ${a.tasksCompleted} | ${a.tasksFailed} | ${formatDuration(a.avgDurationMs)} | ${formatCost(a.totalCostUsd)} |`,
			);
		}
	}
	lines.push("");
	lines.push("---");
	lines.push("");

	// Task breakdown
	lines.push("## Task Breakdown");
	lines.push("");
	if (tasks.length === 0) {
		lines.push("> No tasks recorded.");
	} else {
		tasks.forEach((t, i) => {
			lines.push(`### Task ${i + 1}: ${t.description}`);
			lines.push(`- **Status:** ${t.status} ${statusEmoji(t.status)}`);
			lines.push(`- **Agent:** ${t.agentType ?? "—"}`);
			lines.push(`- **Why this agent:** ${t.whyThisAgent}`);
			lines.push(`- **Duration:** ${formatDuration(t.durationMs)}`);
			lines.push(
				`- **Tokens:** ${formatTokens(t.inputTokens)} in / ${formatTokens(t.outputTokens)} out`,
			);
			lines.push(`- **Cost:** ${t.costUsd != null ? formatCost(t.costUsd) : "—"}`);
			if (t.errorMessage) {
				lines.push(`- **Error:** ${t.errorMessage}`);
			}
			lines.push("");
		});
	}
	lines.push("---");
	lines.push("");

	// Routing insights
	lines.push("## Routing Insights");
	lines.push("");
	const improvements = report.routingInsights.filter((r) => r.couldImprove);
	if (improvements.length === 0) {
		lines.push("> No routing improvements suggested.");
	} else {
		lines.push("### Possible Improvements");
		lines.push("");
		for (const r of improvements) {
			lines.push(`- **Task ${r.taskId}:** ${r.improvementHint}`);
		}
	}
	lines.push("");
	lines.push("---");
	lines.push("");

	// Issues
	lines.push("## Issues");
	lines.push("");
	if (report.issues.length === 0) {
		lines.push("> No issues detected.");
	} else {
		for (const issue of report.issues) {
			const icon = issue.severity === "error" ? "✗" : "⚠";
			const taskRef = issue.taskId ? `**Task ${issue.taskId}**` : "**Goal**";
			lines.push(`${icon} ${taskRef} ${issue.message}`);
		}
	}

	return lines.join("\n");
}
