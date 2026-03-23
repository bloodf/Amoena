import type Database from "better-sqlite3";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const BASE_TIMES_MS: Record<string, number> = {
	implementation: 45 * 60_000,
	review: 20 * 60_000,
	testing: 30 * 60_000,
	documentation: 25 * 60_000,
	analysis: 35 * 60_000,
	refactoring: 40 * 60_000,
};

const COMPLEXITY_MULTIPLIERS: Record<string, number> = {
	low: 0.5,
	medium: 1.0,
	high: 2.0,
};

const MILESTONE_DEFS = [
	{ count: 5, label: "First Five" },
	{ count: 10, label: "Perfect Ten" },
	{ count: 25, label: "Quarter Century" },
	{ count: 50, label: "Half Century" },
	{ count: 100, label: "Centurion" },
] as const;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface TimeSavedStats {
	totalTimeSavedMs: number;
	weekTimeSavedMs: number;
	monthTimeSavedMs: number;
	totalGoals: number;
	totalTasksCompleted: number;
	avgTimeSavedPerGoalMs: number;
	humanEquivalentHours: number;
}

export interface StreakMilestone {
	count: number;
	achievedAt: number | null;
	label: string;
}

export interface StreakInfo {
	currentStreak: number;
	longestStreak: number;
	isActive: boolean;
	streakStartedAt: number | null;
	milestones: StreakMilestone[];
}

export interface WeeklyDigest {
	weekStart: string; // YYYY-MM-DD (Monday)
	goalsCompleted: number;
	goalsFailed: number;
	totalTimeSavedMs: number;
	totalCostUsd: number;
	topAgent: string | null;
	streakMaintained: boolean;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getMondayStart(now = Date.now()): number {
	const d = new Date(now);
	const dayOfWeek = d.getUTCDay(); // 0=Sun, 1=Mon, ..., 6=Sat
	const daysBack = (dayOfWeek + 6) % 7;
	const monday = new Date(d);
	monday.setUTCDate(d.getUTCDate() - daysBack);
	monday.setUTCHours(0, 0, 0, 0);
	return Math.floor(monday.getTime() / 1000);
}

function getMonthStart(now = Date.now()): number {
	const d = new Date(now);
	return Math.floor(
		Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1) / 1000,
	);
}

function getMondayDateStr(unixSec: number): string {
	const d = new Date(unixSec * 1000);
	const dayOfWeek = d.getUTCDay();
	const daysBack = (dayOfWeek + 6) % 7;
	const monday = new Date(d);
	monday.setUTCDate(d.getUTCDate() - daysBack);
	monday.setUTCHours(0, 0, 0, 0);
	return monday.toISOString().slice(0, 10);
}

function calcTimeSaved(
	taskType: string,
	complexity: string,
	durationMs: number,
): number {
	const base = BASE_TIMES_MS[taskType] ?? BASE_TIMES_MS.implementation;
	const mult = COMPLEXITY_MULTIPLIERS[complexity] ?? 1.0;
	return Math.max(0, base * mult - durationMs);
}

// ---------------------------------------------------------------------------
// getTimeSaved
// ---------------------------------------------------------------------------

export function getTimeSaved(db: Database.Database): TimeSavedStats {
	const weekStart = getMondayStart();
	const monthStart = getMonthStart();

	const tasks = db
		.prepare(
			`SELECT task_type, complexity, duration_ms, completed_at
       FROM task_runs
       WHERE status = 'completed' AND duration_ms IS NOT NULL`,
		)
		.all() as {
		task_type: string;
		complexity: string;
		duration_ms: number;
		completed_at: number | null;
	}[];

	let totalTimeSavedMs = 0;
	let weekTimeSavedMs = 0;
	let monthTimeSavedMs = 0;
	let totalTasksCompleted = 0;

	for (const task of tasks) {
		const saved = calcTimeSaved(
			task.task_type,
			task.complexity,
			task.duration_ms,
		);
		totalTimeSavedMs += saved;
		totalTasksCompleted++;

		if (task.completed_at != null) {
			if (task.completed_at >= weekStart) weekTimeSavedMs += saved;
			if (task.completed_at >= monthStart) monthTimeSavedMs += saved;
		}
	}

	const totalGoals = (
		db
			.prepare(
				`SELECT COUNT(*) AS count FROM goal_runs WHERE status = 'completed'`,
			)
			.get() as { count: number }
	).count;

	const avgTimeSavedPerGoalMs =
		totalGoals > 0 ? totalTimeSavedMs / totalGoals : 0;
	const humanEquivalentHours = totalTimeSavedMs / 3_600_000;

	return {
		totalTimeSavedMs,
		weekTimeSavedMs,
		monthTimeSavedMs,
		totalGoals,
		totalTasksCompleted,
		avgTimeSavedPerGoalMs,
		humanEquivalentHours,
	};
}

// ---------------------------------------------------------------------------
// getStreakInfo
// ---------------------------------------------------------------------------

export function getStreakInfo(db: Database.Database): StreakInfo {
	const runs = db
		.prepare(
			`SELECT id, status, started_at
       FROM goal_runs
       WHERE status IN ('completed', 'partial_failure', 'failed', 'cancelled')
       ORDER BY started_at ASC`,
		)
		.all() as { id: string; status: string; started_at: number }[];

	let currentStreak = 0;
	let longestStreak = 0;
	let tempStreakStart: number | null = null;
	const milestoneAchievedAt = new Map<number, number>();

	for (const run of runs) {
		if (run.status === "completed") {
			currentStreak++;
			if (currentStreak === 1) {
				tempStreakStart = run.started_at;
			}
			if (currentStreak > longestStreak) {
				longestStreak = currentStreak;
			}
			for (const m of MILESTONE_DEFS) {
				if (
					currentStreak === m.count &&
					!milestoneAchievedAt.has(m.count)
				) {
					milestoneAchievedAt.set(m.count, run.started_at);
				}
			}
		} else {
			currentStreak = 0;
			tempStreakStart = null;
		}
	}

	const streakStartedAt = currentStreak > 0 ? tempStreakStart : null;

	const milestones: StreakMilestone[] = MILESTONE_DEFS.map((m) => ({
		count: m.count,
		achievedAt: milestoneAchievedAt.get(m.count) ?? null,
		label: m.label,
	}));

	return {
		currentStreak,
		longestStreak,
		isActive: currentStreak > 0,
		streakStartedAt,
		milestones,
	};
}

// ---------------------------------------------------------------------------
// getWeeklyDigests
// ---------------------------------------------------------------------------

export function getWeeklyDigests(
	db: Database.Database,
	weeks = 4,
): WeeklyDigest[] {
	const cutoff = Math.floor(Date.now() / 1000) - weeks * 7 * 86_400;

	const goals = db
		.prepare(
			`SELECT id, status, started_at, total_cost_usd
       FROM goal_runs
       WHERE started_at >= ?
       ORDER BY started_at ASC`,
		)
		.all(cutoff) as {
		id: string;
		status: string;
		started_at: number;
		total_cost_usd: number | null;
	}[];

	// Group goals by ISO week (Monday-start)
	const weekMap = new Map<
		string,
		{ weekStart: string; goals: typeof goals }
	>();
	for (const g of goals) {
		const ws = getMondayDateStr(g.started_at);
		if (!weekMap.has(ws)) weekMap.set(ws, { weekStart: ws, goals: [] });
		weekMap.get(ws)!.goals.push(g);
	}

	return Array.from(weekMap.values()).map(({ weekStart, goals: weekGoals }) => {
		const goalIds = weekGoals.map((g) => g.id);
		const goalsCompleted = weekGoals.filter(
			(g) => g.status === "completed",
		).length;
		const goalsFailed = weekGoals.filter((g) =>
			["failed", "partial_failure", "cancelled"].includes(g.status),
		).length;
		const totalCostUsd = weekGoals.reduce(
			(s, g) => s + (g.total_cost_usd ?? 0),
			0,
		);
		const streakMaintained = goalsFailed === 0 && goalsCompleted > 0;

		if (goalIds.length === 0) {
			return {
				weekStart,
				goalsCompleted,
				goalsFailed,
				totalTimeSavedMs: 0,
				totalCostUsd,
				topAgent: null,
				streakMaintained,
			};
		}

		const placeholders = goalIds.map(() => "?").join(",");

		// Top agent
		const topAgentRow = db
			.prepare(
				`SELECT agent_type, COUNT(*) AS cnt
         FROM task_runs
         WHERE goal_run_id IN (${placeholders})
           AND status = 'completed'
           AND agent_type IS NOT NULL
         GROUP BY agent_type
         ORDER BY cnt DESC
         LIMIT 1`,
			)
			.get(...goalIds) as { agent_type: string } | undefined;

		// Time saved
		const weekTasks = db
			.prepare(
				`SELECT task_type, complexity, duration_ms
         FROM task_runs
         WHERE goal_run_id IN (${placeholders})
           AND status = 'completed'
           AND duration_ms IS NOT NULL`,
			)
			.all(...goalIds) as {
			task_type: string;
			complexity: string;
			duration_ms: number;
		}[];

		const totalTimeSavedMs = weekTasks.reduce(
			(s, t) => s + calcTimeSaved(t.task_type, t.complexity, t.duration_ms),
			0,
		);

		return {
			weekStart,
			goalsCompleted,
			goalsFailed,
			totalTimeSavedMs,
			totalCostUsd,
			topAgent: topAgentRow?.agent_type ?? null,
			streakMaintained,
		};
	});
}
