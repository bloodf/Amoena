import type Database from "better-sqlite3";
import type { GoalRunStatus, TaskStatus } from "./mission-control-telemetry";

export type { GoalRunStatus, TaskStatus };

export interface RunSummary {
	goalId: string;
	description: string;
	status: GoalRunStatus;
	startedAt: number;
	completedAt: number | null;
	totalDurationMs: number | null;
	totalCostUsd: number;
	taskCount: number;
	completedCount: number;
	failedCount: number;
}

export interface ComparisonDelta {
	metric: string;
	label: string;
	values: (number | null)[];
	change: number | null;
	direction: "better" | "worse" | "neutral";
}

export interface TaskDiffEntry {
	taskId: string;
	status: TaskStatus;
	agentType: string | null;
	durationMs: number | null;
	costUsd: number | null;
	attemptCount: number;
}

export interface TaskDiff {
	taskType: string;
	complexity: string;
	entries: (TaskDiffEntry | null)[];
}

export interface AgentRunStats {
	goalId: string;
	tasksAssigned: number;
	tasksCompleted: number;
	tasksFailed: number;
	totalDurationMs: number;
	totalCostUsd: number;
	successRate: number;
}

export interface AgentDiff {
	agentType: string;
	perRun: AgentRunStats[];
}

export interface ComparisonVerdict {
	summary: string;
	improvements: string[];
	regressions: string[];
	unchanged: string[];
}

export interface RunComparisonResult {
	runs: RunSummary[];
	deltas: ComparisonDelta[];
	taskDiffs: TaskDiff[];
	agentDiffs: AgentDiff[];
	verdict: ComparisonVerdict;
}

const NEUTRAL_THRESHOLD = 0.02;

function deltaDirection(
	metric: string,
	first: number | null,
	last: number | null,
): "better" | "worse" | "neutral" {
	if (first == null || last == null || first === 0) return "neutral";
	const change = (last - first) / first;
	if (Math.abs(change) < NEUTRAL_THRESHOLD) return "neutral";

	switch (metric) {
		case "duration":
		case "cost":
			return change < 0 ? "better" : "worse";
		case "success_rate":
			return change > 0 ? "better" : "worse";
		default:
			return "neutral";
	}
}

function pctChange(
	first: number | null,
	last: number | null,
): number | null {
	if (first == null || last == null || first === 0) return null;
	return ((last - first) / first) * 100;
}

function buildRunSummary(
	db: Database.Database,
	goalId: string,
): RunSummary | null {
	const goal = db
		.prepare(`SELECT * FROM goal_runs WHERE id = ?`)
		.get(goalId) as {
		id: string;
		description: string;
		status: GoalRunStatus;
		started_at: number;
		completed_at: number | null;
		total_cost_usd: number | null;
	} | undefined;

	if (!goal) return null;

	const tasks = db
		.prepare(
			`SELECT status, cost_usd FROM task_runs WHERE goal_run_id = ?`,
		)
		.all(goalId) as { status: string; cost_usd: number | null }[];

	const completedCount = tasks.filter((t) => t.status === "completed").length;
	const failedCount = tasks.filter((t) => t.status === "failed").length;
	const totalCostUsd =
		goal.total_cost_usd ??
		tasks.reduce((sum, t) => sum + (t.cost_usd ?? 0), 0);
	const totalDurationMs =
		goal.completed_at != null
			? (goal.completed_at - goal.started_at) * 1000
			: null;

	return {
		goalId: goal.id,
		description: goal.description,
		status: goal.status,
		startedAt: goal.started_at,
		completedAt: goal.completed_at,
		totalDurationMs,
		totalCostUsd,
		taskCount: tasks.length,
		completedCount,
		failedCount,
	};
}

export function generateVerdict(
	runs: RunSummary[],
	deltas: ComparisonDelta[],
): ComparisonVerdict {
	const improvements: string[] = [];
	const regressions: string[] = [];
	const unchanged: string[] = [];

	for (const delta of deltas) {
		if (delta.direction === "better") {
			const changeAbs = Math.abs(delta.change ?? 0).toFixed(1);
			improvements.push(`${delta.label}: ${changeAbs}% improvement`);
		} else if (delta.direction === "worse") {
			const changeAbs = Math.abs(delta.change ?? 0).toFixed(1);
			regressions.push(`${delta.label}: ${changeAbs}% regression`);
		} else {
			unchanged.push(delta.label);
		}
	}

	let summary: string;
	if (runs.length < 2) {
		summary = "Not enough runs to compare.";
	} else if (improvements.length === 0 && regressions.length === 0) {
		summary = "Runs performed similarly.";
	} else {
		const runA = runs[0].description.slice(0, 30);
		const runB = runs[runs.length - 1].description.slice(0, 30);
		const durationDelta = deltas.find((d) => d.metric === "duration");
		const costDelta = deltas.find((d) => d.metric === "cost");

		const parts: string[] = [];
		if (durationDelta?.direction === "better" && durationDelta.change != null) {
			parts.push(`${Math.abs(durationDelta.change).toFixed(0)}% faster`);
		} else if (durationDelta?.direction === "worse" && durationDelta.change != null) {
			parts.push(`${Math.abs(durationDelta.change).toFixed(0)}% slower`);
		}
		if (costDelta?.direction === "better" && costDelta.change != null) {
			parts.push(`${Math.abs(costDelta.change).toFixed(0)}% cheaper`);
		} else if (costDelta?.direction === "worse" && costDelta.change != null) {
			parts.push(`${Math.abs(costDelta.change).toFixed(0)}% more expensive`);
		}

		if (parts.length > 0) {
			summary = `"${runB}" was ${parts.join(" and ")} than "${runA}"`;
		} else {
			summary = `Comparing "${runA}" to "${runB}": ${improvements.length} improvement(s), ${regressions.length} regression(s).`;
		}
	}

	return { summary, improvements, regressions, unchanged };
}

export function compareRuns(
	db: Database.Database,
	goalIds: string[],
): RunComparisonResult {
	const runs: RunSummary[] = [];
	for (const id of goalIds) {
		const summary = buildRunSummary(db, id);
		if (summary) runs.push(summary);
	}

	if (runs.length < 2) {
		return {
			runs,
			deltas: [],
			taskDiffs: [],
			agentDiffs: [],
			verdict: { summary: "Not enough runs to compare.", improvements: [], regressions: [], unchanged: [] },
		};
	}

	const first = runs[0];
	const last = runs[runs.length - 1];

	// Build deltas (first → last)
	const deltas: ComparisonDelta[] = [
		{
			metric: "duration",
			label: "Duration",
			values: runs.map((r) => r.totalDurationMs),
			change: pctChange(first.totalDurationMs, last.totalDurationMs),
			direction: deltaDirection(
				"duration",
				first.totalDurationMs,
				last.totalDurationMs,
			),
		},
		{
			metric: "cost",
			label: "Cost",
			values: runs.map((r) => r.totalCostUsd),
			change: pctChange(first.totalCostUsd, last.totalCostUsd),
			direction: deltaDirection("cost", first.totalCostUsd, last.totalCostUsd),
		},
		{
			metric: "success_rate",
			label: "Success Rate",
			values: runs.map((r) =>
				r.taskCount > 0 ? r.completedCount / r.taskCount : null,
			),
			change: pctChange(
				first.taskCount > 0 ? first.completedCount / first.taskCount : null,
				last.taskCount > 0 ? last.completedCount / last.taskCount : null,
			),
			direction: deltaDirection(
				"success_rate",
				first.taskCount > 0 ? first.completedCount / first.taskCount : null,
				last.taskCount > 0 ? last.completedCount / last.taskCount : null,
			),
		},
		{
			metric: "task_count",
			label: "Task Count",
			values: runs.map((r) => r.taskCount),
			change: pctChange(first.taskCount, last.taskCount),
			direction: "neutral",
		},
	];

	// Build task diffs: group task_runs by (task_type, complexity)
	const taskKeySet = new Set<string>();
	const tasksByRun: Map<
		string,
		Map<
			string,
			{
				taskId: string;
				status: TaskStatus;
				agentType: string | null;
				durationMs: number | null;
				costUsd: number | null;
				attemptCount: number;
			}
		>
	> = new Map();

	for (const run of runs) {
		const tasks = db
			.prepare(
				`SELECT id, task_type, complexity, status, agent_type, duration_ms, cost_usd, attempt_count
         FROM task_runs WHERE goal_run_id = ? ORDER BY created_at ASC`,
			)
			.all(run.goalId) as {
			id: string;
			task_type: string;
			complexity: string;
			status: TaskStatus;
			agent_type: string | null;
			duration_ms: number | null;
			cost_usd: number | null;
			attempt_count: number;
		}[];

		const byKey = new Map<string, (typeof tasks)[0]>();
		for (const t of tasks) {
			const key = `${t.task_type}/${t.complexity}`;
			taskKeySet.add(key);
			// Last task with this key wins (in case of retries)
			byKey.set(key, t);
		}
		tasksByRun.set(run.goalId, new Map(
			Array.from(byKey.entries()).map(([k, t]) => [
				k,
				{
					taskId: t.id,
					status: t.status,
					agentType: t.agent_type,
					durationMs: t.duration_ms,
					costUsd: t.cost_usd,
					attemptCount: t.attempt_count,
				},
			]),
		));
	}

	const taskDiffs: TaskDiff[] = Array.from(taskKeySet).map((key) => {
		const [taskType, complexity] = key.split("/");
		return {
			taskType,
			complexity,
			entries: runs.map((r) => tasksByRun.get(r.goalId)?.get(key) ?? null),
		};
	});

	// Build agent diffs
	const allAgentTypes = new Set<string>();
	for (const run of runs) {
		const agents = db
			.prepare(
				`SELECT DISTINCT agent_type FROM task_runs WHERE goal_run_id = ? AND agent_type IS NOT NULL`,
			)
			.all(run.goalId) as { agent_type: string }[];
		for (const a of agents) allAgentTypes.add(a.agent_type);
	}

	const agentDiffs: AgentDiff[] = Array.from(allAgentTypes).map(
		(agentType) => ({
			agentType,
			perRun: runs.map((run) => {
				const tasks = db
					.prepare(
						`SELECT status, duration_ms, cost_usd FROM task_runs
             WHERE goal_run_id = ? AND agent_type = ?`,
					)
					.all(run.goalId, agentType) as {
					status: string;
					duration_ms: number | null;
					cost_usd: number | null;
				}[];

				const tasksAssigned = tasks.length;
				const tasksCompleted = tasks.filter(
					(t) => t.status === "completed",
				).length;
				const tasksFailed = tasks.filter((t) => t.status === "failed").length;
				const totalDurationMs = tasks.reduce(
					(s, t) => s + (t.duration_ms ?? 0),
					0,
				);
				const totalCostUsd = tasks.reduce((s, t) => s + (t.cost_usd ?? 0), 0);

				return {
					goalId: run.goalId,
					tasksAssigned,
					tasksCompleted,
					tasksFailed,
					totalDurationMs,
					totalCostUsd,
					successRate:
						tasksAssigned > 0 ? tasksCompleted / tasksAssigned : 0,
				};
			}),
		}),
	);

	const verdict = generateVerdict(runs, deltas);

	return { runs, deltas, taskDiffs, agentDiffs, verdict };
}

export function listComparableRuns(
	db: Database.Database,
	limit = 20,
): RunSummary[] {
	const goals = db
		.prepare(
			`SELECT id FROM goal_runs WHERE status = 'completed' ORDER BY created_at DESC LIMIT ?`,
		)
		.all(limit) as { id: string }[];

	const results: RunSummary[] = [];
	for (const g of goals) {
		const summary = buildRunSummary(db, g.id);
		if (summary) results.push(summary);
	}
	return results;
}
