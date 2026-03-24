import type Database from "better-sqlite3";

export interface LeaderboardEntry {
	agentType: string;
	rank: number;
	score: number;
	totalTasks: number;
	completedTasks: number;
	failedTasks: number;
	timedOutTasks: number;
	successRate: number;
	avgDurationMs: number;
	totalCostUsd: number;
	avgCostPerTask: number;
	totalTokensUsed: number;
	lastUsedAt: number;
	trend: "improving" | "declining" | "stable";
}

export interface LeaderboardOptions {
	/** Minimum completed tasks to qualify for ranking (default: 3) */
	minTasks?: number;
	/** Time window in days (default: null = all time) */
	windowDays?: number | null;
	/** Sort field (default: "score") */
	sortBy?: keyof LeaderboardEntry;
	/** Sort direction (default: "desc") */
	sortDir?: "asc" | "desc";
}

export interface AgentTrendPoint {
	date: string; // YYYY-MM-DD
	successRate: number;
	avgDurationMs: number;
	tasksCompleted: number;
}

export function computeAgentScore(perf: {
	successRate: number;
	avgDurationMs: number;
	avgCostPerTask: number;
	totalTasks: number;
}): number {
	const clamp = (v: number, lo: number, hi: number) =>
		Math.max(lo, Math.min(hi, v));
	const speedScore = clamp(1 - perf.avgDurationMs / 300_000, 0, 1);
	const costScore = clamp(1 - perf.avgCostPerTask / 0.05, 0, 1);
	const volumeScore = clamp(perf.totalTasks / 50, 0, 1);
	return clamp(
		perf.successRate * 40 + speedScore * 25 + costScore * 20 + volumeScore * 15,
		0,
		100,
	);
}

function computeTrend(
	db: Database.Database,
	agentType: string,
): "improving" | "declining" | "stable" {
	const rows = db
		.prepare(
			`SELECT status FROM task_runs
       WHERE agent_type = ? AND status IN ('completed', 'failed', 'timed_out')
       ORDER BY completed_at DESC
       LIMIT 20`,
		)
		.all(agentType) as { status: string }[];

	if (rows.length < 2) return "stable";

	const half = Math.min(10, Math.floor(rows.length / 2));
	const recent = rows.slice(0, half);
	const previous = rows.slice(half, half * 2);

	if (previous.length === 0) return "stable";

	const recentRate =
		recent.filter((r) => r.status === "completed").length / recent.length;
	const prevRate =
		previous.filter((r) => r.status === "completed").length / previous.length;

	if (recentRate > prevRate + 0.05) return "improving";
	if (recentRate < prevRate - 0.05) return "declining";
	return "stable";
}

interface AgentStats {
	agentType: string;
	totalTasks: number;
	completedTasks: number;
	failedTasks: number;
	timedOutTasks: number;
	successRate: number;
	avgDurationMs: number;
	totalCostUsd: number;
	avgCostPerTask: number;
	totalTokensUsed: number;
	lastUsedAt: number;
}

export function getLeaderboard(
	db: Database.Database,
	options?: LeaderboardOptions,
): LeaderboardEntry[] {
	const minTasks = options?.minTasks ?? 5;
	const windowDays = options?.windowDays ?? null;
	const sortBy: keyof LeaderboardEntry = options?.sortBy ?? "score";
	const sortDir = options?.sortDir ?? "desc";

	let stats: AgentStats[];

	if (windowDays != null) {
		const cutoff = Math.floor(Date.now() / 1000) - windowDays * 86_400;
		const rows = db
			.prepare(
				`SELECT
           agent_type,
           COUNT(*) AS total_tasks,
           SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) AS completed_tasks,
           SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) AS failed_tasks,
           SUM(CASE WHEN status = 'timed_out' THEN 1 ELSE 0 END) AS timed_out_tasks,
           AVG(CASE WHEN duration_ms IS NOT NULL THEN CAST(duration_ms AS REAL) END) AS avg_duration_ms,
           COALESCE(SUM(cost_usd), 0) AS total_cost_usd,
           COALESCE(SUM(COALESCE(input_tokens, 0)) + SUM(COALESCE(output_tokens, 0)), 0) AS total_tokens_used,
           MAX(completed_at) AS last_used_at
         FROM task_runs
         WHERE agent_type IS NOT NULL AND completed_at >= ?
         GROUP BY agent_type`,
			)
			.all(cutoff) as {
			agent_type: string;
			total_tasks: number;
			completed_tasks: number;
			failed_tasks: number;
			timed_out_tasks: number;
			avg_duration_ms: number | null;
			total_cost_usd: number;
			total_tokens_used: number;
			last_used_at: number | null;
		}[];

		stats = rows.map((row) => {
			const avgCostPerTask =
				row.total_tasks > 0 ? row.total_cost_usd / row.total_tasks : 0;
			return {
				agentType: row.agent_type,
				totalTasks: row.total_tasks,
				completedTasks: row.completed_tasks,
				failedTasks: row.failed_tasks,
				timedOutTasks: row.timed_out_tasks,
				successRate:
					row.total_tasks > 0 ? row.completed_tasks / row.total_tasks : 0,
				avgDurationMs: row.avg_duration_ms ?? 0,
				totalCostUsd: row.total_cost_usd,
				avgCostPerTask,
				totalTokensUsed: row.total_tokens_used,
				lastUsedAt: row.last_used_at ?? 0,
			};
		});
	} else {
		const rows = db
			.prepare(`SELECT * FROM agent_performance ORDER BY total_tasks DESC`)
			.all() as {
			agent_type: string;
			total_tasks: number;
			completed_tasks: number;
			failed_tasks: number;
			timed_out_tasks: number;
			avg_duration_ms: number;
			total_cost_usd: number;
			success_rate: number;
			last_used_at: number;
		}[];

		const tokenRows = db
			.prepare(
				`SELECT agent_type,
                COALESCE(SUM(COALESCE(input_tokens, 0)) + SUM(COALESCE(output_tokens, 0)), 0) AS tokens
         FROM task_runs GROUP BY agent_type`,
			)
			.all() as { agent_type: string; tokens: number }[];
		const tokensByAgent = new Map(tokenRows.map((r) => [r.agent_type, r.tokens]));

		stats = rows.map((row) => {
			const avgCostPerTask =
				row.total_tasks > 0 ? row.total_cost_usd / row.total_tasks : 0;
			return {
				agentType: row.agent_type,
				totalTasks: row.total_tasks,
				completedTasks: row.completed_tasks,
				failedTasks: row.failed_tasks,
				timedOutTasks: row.timed_out_tasks,
				successRate: row.success_rate,
				avgDurationMs: row.avg_duration_ms,
				totalCostUsd: row.total_cost_usd,
				avgCostPerTask,
				totalTokensUsed: tokensByAgent.get(row.agent_type) ?? 0,
				lastUsedAt: row.last_used_at,
			};
		});
	}

	const qualified = stats.filter((s) => s.completedTasks >= minTasks);

	const withScoreAndTrend = qualified.map((s) => ({
		...s,
		score: computeAgentScore({
			successRate: s.successRate,
			avgDurationMs: s.avgDurationMs,
			avgCostPerTask: s.avgCostPerTask,
			totalTasks: s.totalTasks,
		}),
		trend: computeTrend(db, s.agentType),
	}));

	withScoreAndTrend.sort((a, b) => {
		const av = a[sortBy] as string | number;
		const bv = b[sortBy] as string | number;
		const cmp = av < bv ? -1 : av > bv ? 1 : 0;
		return sortDir === "desc" ? -cmp : cmp;
	});

	return withScoreAndTrend.map((e, i) => ({ ...e, rank: i + 1 }));
}

export function getAgentTrend(
	db: Database.Database,
	agentType: string,
	days = 30,
): AgentTrendPoint[] {
	const cutoff = Math.floor(Date.now() / 1000) - days * 86_400;
	const rows = db
		.prepare(
			`SELECT
         date(completed_at, 'unixepoch') AS date,
         COUNT(*) AS total,
         SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) AS completed,
         AVG(CASE WHEN duration_ms IS NOT NULL THEN CAST(duration_ms AS REAL) END) AS avg_duration_ms
       FROM task_runs
       WHERE agent_type = ? AND completed_at >= ?
         AND status IN ('completed', 'failed', 'timed_out')
       GROUP BY date(completed_at, 'unixepoch')
       ORDER BY date ASC`,
		)
		.all(agentType, cutoff) as {
		date: string;
		total: number;
		completed: number;
		avg_duration_ms: number | null;
	}[];

	return rows.map((row) => ({
		date: row.date,
		successRate: row.total > 0 ? row.completed / row.total : 0,
		avgDurationMs: row.avg_duration_ms ?? 0,
		tasksCompleted: row.completed,
	}));
}
