/**
 * routing_reason format (set by dag-engine/router.ts, read by run-reporter):
 *   "matrix:<task_type>/<complexity>→<adapter_id>"
 *   "override:<adapter_id>"
 *   "fallback:<original>→<fallback>"
 */
import type Database from "better-sqlite3";

export type GoalRunStatus =
	| "pending"
	| "running"
	| "completed"
	| "partial_failure"
	| "failed"
	| "cancelled";

export type TaskStatus =
	| "queued"
	| "running"
	| "completed"
	| "failed"
	| "timed_out"
	| "cancelled"
	| "skipped";

export interface GoalRunRow {
	id: string;
	description: string;
	status: GoalRunStatus;
	base_ref: string;
	started_at: number;
	completed_at: number | null;
	total_cost_usd: number | null;
	merge_strategy: string | null;
	created_at: number;
}

export interface TaskRunRow {
	id: string;
	goal_run_id: string;
	task_type: string;
	complexity: string;
	description: string;
	status: TaskStatus;
	agent_type: string | null;
	routing_reason: string;
	attempt_count: number;
	worktree_path: string | null;
	started_at: number | null;
	completed_at: number | null;
	duration_ms: number | null;
	input_tokens: number | null;
	output_tokens: number | null;
	cost_usd: number | null;
	error_message: string | null;
	created_at: number;
}

export interface AgentPerformanceRow {
	agent_type: string;
	total_tasks: number;
	completed_tasks: number;
	failed_tasks: number;
	timed_out_tasks: number;
	total_duration_ms: number;
	total_cost_usd: number;
	avg_duration_ms: number;
	success_rate: number;
	last_used_at: number;
	updated_at: number;
}

// ---------------------------------------------------------------------------
// Disk-full resilience helper
// ---------------------------------------------------------------------------

function safeWrite(fn: () => void, critical = false): void {
	try {
		fn();
	} catch (err) {
		const isDiskError =
			err instanceof Error &&
			(err.message.includes("SQLITE_FULL") ||
				err.message.includes("disk") ||
				(err as NodeJS.ErrnoException).code === "SQLITE_FULL");
		if (!isDiskError) throw err;
		console.warn("[mission-control-telemetry] write failed:", err);
		if (critical) throw err;
	}
}

// ---------------------------------------------------------------------------
// Goal Run Writers
// ---------------------------------------------------------------------------

export function insertGoalRun(
	db: Database.Database,
	run: Pick<GoalRunRow, "id" | "description" | "base_ref">,
): void {
	safeWrite(() => {
		db.prepare(
			`INSERT INTO goal_runs (id, description, base_ref) VALUES (?, ?, ?)`,
		).run(run.id, run.description, run.base_ref);
	});
}

export function updateGoalRunStatus(
	db: Database.Database,
	goalId: string,
	status: GoalRunStatus,
	completedAt?: number,
	totalCostUsd?: number,
	mergeStrategy?: string,
): void {
	safeWrite(() => {
		db.prepare(
			`UPDATE goal_runs SET status = ?, completed_at = ?, total_cost_usd = ?, merge_strategy = ? WHERE id = ?`,
		).run(
			status,
			completedAt ?? null,
			totalCostUsd ?? null,
			mergeStrategy ?? null,
			goalId,
		);
	});
}

// ---------------------------------------------------------------------------
// Task Run Writers
// ---------------------------------------------------------------------------

export function insertTaskRun(
	db: Database.Database,
	task: Pick<
		TaskRunRow,
		"id" | "goal_run_id" | "task_type" | "complexity" | "description"
	>,
): void {
	safeWrite(() => {
		db.prepare(
			`INSERT INTO task_runs (id, goal_run_id, task_type, complexity, description) VALUES (?, ?, ?, ?, ?)`,
		).run(
			task.id,
			task.goal_run_id,
			task.task_type,
			task.complexity,
			task.description,
		);
	});
}

export function updateTaskRunDispatched(
	db: Database.Database,
	taskId: string,
	agentType: string,
	routingReason: string,
	startedAt: number,
	worktreePath: string,
): void {
	safeWrite(() => {
		db.prepare(
			`UPDATE task_runs SET agent_type = ?, routing_reason = ?, started_at = ?, worktree_path = ?, status = 'running' WHERE id = ?`,
		).run(agentType, routingReason, startedAt, worktreePath, taskId);
	});
}

export function updateTaskRunCompleted(
	db: Database.Database,
	taskId: string,
	result: {
		status: TaskStatus;
		completedAt: number;
		durationMs: number;
		inputTokens: number | null;
		outputTokens: number | null;
		costUsd: number | null;
		errorMessage: string | null;
		attemptCount: number;
	},
): void {
	safeWrite(() => {
		db.prepare(
			`UPDATE task_runs SET status = ?, completed_at = ?, duration_ms = ?, input_tokens = ?, output_tokens = ?, cost_usd = ?, error_message = ?, attempt_count = ? WHERE id = ?`,
		).run(
			result.status,
			result.completedAt,
			result.durationMs,
			result.inputTokens,
			result.outputTokens,
			result.costUsd,
			result.errorMessage,
			result.attemptCount,
			taskId,
		);
	});
}

// ---------------------------------------------------------------------------
// agent_performance Update
// ---------------------------------------------------------------------------

export function upsertAgentPerformance(
	db: Database.Database,
	agentType: string,
	delta: {
		durationMs: number;
		costUsd: number;
		status: TaskStatus;
	},
): void {
	safeWrite(() => {
		const existing = db
			.prepare(`SELECT * FROM agent_performance WHERE agent_type = ?`)
			.get(agentType) as AgentPerformanceRow | undefined;

		const prev: AgentPerformanceRow = existing ?? {
			agent_type: agentType,
			total_tasks: 0,
			completed_tasks: 0,
			failed_tasks: 0,
			timed_out_tasks: 0,
			total_duration_ms: 0,
			total_cost_usd: 0,
			avg_duration_ms: 0,
			success_rate: 0,
			last_used_at: Math.floor(Date.now() / 1000),
			updated_at: Math.floor(Date.now() / 1000),
		};

		const total_tasks = prev.total_tasks + 1;
		const completed_tasks =
			prev.completed_tasks + (delta.status === "completed" ? 1 : 0);
		const failed_tasks =
			prev.failed_tasks + (delta.status === "failed" ? 1 : 0);
		const timed_out_tasks =
			prev.timed_out_tasks + (delta.status === "timed_out" ? 1 : 0);
		const total_duration_ms = prev.total_duration_ms + delta.durationMs;
		const total_cost_usd = prev.total_cost_usd + (delta.costUsd ?? 0);
		const avg_duration_ms = total_duration_ms / total_tasks;
		const success_rate = completed_tasks / total_tasks;
		const now = Math.floor(Date.now() / 1000);

		db.prepare(`
      INSERT OR REPLACE INTO agent_performance
        (agent_type, total_tasks, completed_tasks, failed_tasks, timed_out_tasks,
         total_duration_ms, total_cost_usd, avg_duration_ms, success_rate, last_used_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
			agentType,
			total_tasks,
			completed_tasks,
			failed_tasks,
			timed_out_tasks,
			total_duration_ms,
			total_cost_usd,
			avg_duration_ms,
			success_rate,
			now,
			now,
		);
	});
}

// ---------------------------------------------------------------------------
// Crash Recovery Writers
// ---------------------------------------------------------------------------

export function saveGoalRunState(
	db: Database.Database,
	goalId: string,
	stateJson: string,
): void {
	safeWrite(() => {
		db.prepare(
			`INSERT OR REPLACE INTO goal_run_state (goal_id, state_json, updated_at) VALUES (?, ?, unixepoch())`,
		).run(goalId, stateJson);
	}, true /* critical */);
}

export function loadGoalRunState(
	db: Database.Database,
	goalId: string,
): string | null {
	const row = db
		.prepare(`SELECT state_json FROM goal_run_state WHERE goal_id = ?`)
		.get(goalId) as { state_json: string } | undefined;
	return row?.state_json ?? null;
}

export function deleteGoalRunState(
	db: Database.Database,
	goalId: string,
): void {
	safeWrite(() => {
		db.prepare(`DELETE FROM goal_run_state WHERE goal_id = ?`).run(goalId);
	});
}

// ---------------------------------------------------------------------------
// Readers
// ---------------------------------------------------------------------------

export function getGoalRun(
	db: Database.Database,
	goalId: string,
): GoalRunRow | null {
	return (
		(db
			.prepare(`SELECT * FROM goal_runs WHERE id = ?`)
			.get(goalId) as GoalRunRow | undefined) ?? null
	);
}

export function listGoalRuns(
	db: Database.Database,
	limit = 50,
	offset = 0,
): GoalRunRow[] {
	return db
		.prepare(
			`SELECT * FROM goal_runs ORDER BY created_at DESC LIMIT ? OFFSET ?`,
		)
		.all(limit, offset) as GoalRunRow[];
}

export function getTaskRunsForGoal(
	db: Database.Database,
	goalId: string,
): TaskRunRow[] {
	return db
		.prepare(`SELECT * FROM task_runs WHERE goal_run_id = ? ORDER BY created_at ASC`)
		.all(goalId) as TaskRunRow[];
}

export function getAgentPerformance(
	db: Database.Database,
): AgentPerformanceRow[] {
	return db
		.prepare(`SELECT * FROM agent_performance ORDER BY total_tasks DESC`)
		.all() as AgentPerformanceRow[];
}

export function getAgentPerformanceByType(
	db: Database.Database,
	agentType: string,
): AgentPerformanceRow | null {
	return (
		(db
			.prepare(`SELECT * FROM agent_performance WHERE agent_type = ?`)
			.get(agentType) as AgentPerformanceRow | undefined) ?? null
	);
}
