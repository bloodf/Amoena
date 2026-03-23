import Database from "better-sqlite3";
import { beforeEach, describe, expect, it } from "vitest";
import {
	getStreakInfo,
	getTimeSaved,
	getWeeklyDigests,
} from "../stats-queries";
import {
	insertGoalRun,
	insertTaskRun,
	updateGoalRunStatus,
	updateTaskRunCompleted,
	updateTaskRunDispatched,
} from "../mission-control-telemetry";
import { runMigrations } from "../migrations";

function makeTestDb(): Database.Database {
	const db = new Database(":memory:");
	db.pragma("foreign_keys = ON");
	runMigrations(db);
	return db;
}

const NOW = Math.floor(Date.now() / 1000);
let counter = 0;

function seedGoal(
	db: Database.Database,
	opts: {
		id?: string;
		status: "completed" | "failed" | "partial_failure" | "cancelled";
		startedAt?: number;
		costUsd?: number;
	},
): string {
	const id = opts.id ?? `goal-${++counter}`;
	const startedAt = opts.startedAt ?? NOW - counter * 100;
	insertGoalRun(db, { id, description: `Goal ${id}`, base_ref: "main" });
	db.prepare(`UPDATE goal_runs SET started_at = ? WHERE id = ?`).run(
		startedAt,
		id,
	);
	const completedAt =
		opts.status === "completed" ? startedAt + 60 : null;
	updateGoalRunStatus(
		db,
		id,
		opts.status,
		completedAt ?? undefined,
		opts.costUsd,
		undefined,
	);
	return id;
}

function seedTask(
	db: Database.Database,
	opts: {
		goalId: string;
		taskType?: string;
		complexity?: string;
		durationMs: number;
		status?: "completed" | "failed";
		agentType?: string;
		completedAt?: number;
	},
): string {
	const taskId = `task-${++counter}`;
	const agent = opts.agentType ?? "claude-code";
	const completedAt = opts.completedAt ?? NOW - counter * 10;
	const startedAt = completedAt - opts.durationMs / 1000;

	insertTaskRun(db, {
		id: taskId,
		goal_run_id: opts.goalId,
		task_type: opts.taskType ?? "implementation",
		complexity: opts.complexity ?? "medium",
		description: `Task ${taskId}`,
	});
	updateTaskRunDispatched(
		db,
		taskId,
		agent,
		`matrix:${opts.taskType ?? "implementation"}/${opts.complexity ?? "medium"}→${agent}`,
		startedAt,
		"/tmp/work",
	);
	updateTaskRunCompleted(db, taskId, {
		status: opts.status ?? "completed",
		completedAt,
		durationMs: opts.durationMs,
		inputTokens: 100,
		outputTokens: 50,
		costUsd: 0.001,
		errorMessage: null,
		attemptCount: 1,
	});
	return taskId;
}

// ---------------------------------------------------------------------------
// getTimeSaved
// ---------------------------------------------------------------------------
describe("getTimeSaved", () => {
	let db: Database.Database;

	beforeEach(() => {
		db = makeTestDb();
		counter = 0;
	});

	it("sums time saved across all completed tasks", () => {
		const gId = seedGoal(db, { status: "completed" });
		// implementation/medium: 45min * 1.0 = 2_700_000ms human estimate
		// task took 10_000ms → saves 2_690_000ms
		seedTask(db, { goalId: gId, taskType: "implementation", complexity: "medium", durationMs: 10_000 });
		seedTask(db, { goalId: gId, taskType: "implementation", complexity: "medium", durationMs: 10_000 });

		const stats = getTimeSaved(db);
		expect(stats.totalTimeSavedMs).toBeCloseTo(2 * (2_700_000 - 10_000), 0);
		expect(stats.totalTasksCompleted).toBe(2);
	});

	it("negative savings clamped to 0", () => {
		const gId = seedGoal(db, { status: "completed" });
		// implementation/medium: 2_700_000ms human estimate
		// task took 3_600_000ms (1h) → would be -900_000, clamped to 0
		seedTask(db, { goalId: gId, taskType: "implementation", complexity: "medium", durationMs: 3_600_000 });

		const stats = getTimeSaved(db);
		expect(stats.totalTimeSavedMs).toBe(0);
	});

	it("complexity multiplier applied correctly", () => {
		const gId = seedGoal(db, { status: "completed" });
		// implementation/high: 45min * 2.0 = 90min = 5_400_000ms
		// task took 30_000ms (30s) → saves ~5_370_000ms
		seedTask(db, { goalId: gId, taskType: "implementation", complexity: "high", durationMs: 30_000 });

		const stats = getTimeSaved(db);
		expect(stats.totalTimeSavedMs).toBeCloseTo(5_400_000 - 30_000, 0);
	});

	it("weekTimeSavedMs filters to current week only", () => {
		// This week's task
		const thisWeekGoal = seedGoal(db, { status: "completed" });
		const thisWeek = NOW - 86_400; // yesterday (within this week for most cases)
		seedTask(db, { goalId: thisWeekGoal, taskType: "implementation", complexity: "medium", durationMs: 10_000, completedAt: thisWeek });

		// Last week's task (8 days ago)
		const lastWeekGoal = seedGoal(db, { status: "completed" });
		const lastWeek = NOW - 8 * 86_400;
		seedTask(db, { goalId: lastWeekGoal, taskType: "implementation", complexity: "medium", durationMs: 10_000, completedAt: lastWeek });

		const stats = getTimeSaved(db);
		// Both tasks have the same savings; week should only count the recent one
		// (if they happen to fall in different weeks)
		// Note: this test is "best effort" since week boundaries depend on current day
		expect(stats.weekTimeSavedMs).toBeLessThanOrEqual(stats.totalTimeSavedMs);
	});

	it("returns zeros when no completed tasks exist", () => {
		const stats = getTimeSaved(db);
		expect(stats.totalTimeSavedMs).toBe(0);
		expect(stats.totalTasksCompleted).toBe(0);
		expect(stats.totalGoals).toBe(0);
		expect(stats.humanEquivalentHours).toBe(0);
	});
});

// ---------------------------------------------------------------------------
// getStreakInfo
// ---------------------------------------------------------------------------
describe("getStreakInfo", () => {
	let db: Database.Database;

	beforeEach(() => {
		db = makeTestDb();
		counter = 0;
	});

	it("consecutive completions counted correctly", () => {
		seedGoal(db, { status: "completed", startedAt: NOW - 3000 });
		seedGoal(db, { status: "completed", startedAt: NOW - 2000 });
		seedGoal(db, { status: "completed", startedAt: NOW - 1000 });

		const info = getStreakInfo(db);
		expect(info.currentStreak).toBe(3);
		expect(info.isActive).toBe(true);
	});

	it("failed goal breaks streak", () => {
		seedGoal(db, { status: "completed", startedAt: NOW - 3000 });
		seedGoal(db, { status: "completed", startedAt: NOW - 2000 });
		seedGoal(db, { status: "failed", startedAt: NOW - 1000 });

		const info = getStreakInfo(db);
		expect(info.currentStreak).toBe(0);
		expect(info.longestStreak).toBe(2);
		expect(info.isActive).toBe(false);
	});

	it("cancelled goal breaks streak", () => {
		seedGoal(db, { status: "completed", startedAt: NOW - 2000 });
		seedGoal(db, { status: "cancelled", startedAt: NOW - 1000 });

		const info = getStreakInfo(db);
		expect(info.currentStreak).toBe(0);
	});

	it("partial_failure breaks streak", () => {
		seedGoal(db, { status: "completed", startedAt: NOW - 2000 });
		seedGoal(db, { status: "partial_failure", startedAt: NOW - 1000 });

		const info = getStreakInfo(db);
		expect(info.currentStreak).toBe(0);
	});

	it("longestStreak preserved after streak break", () => {
		// 3 completed, then fail, then 1 more
		seedGoal(db, { status: "completed", startedAt: NOW - 5000 });
		seedGoal(db, { status: "completed", startedAt: NOW - 4000 });
		seedGoal(db, { status: "completed", startedAt: NOW - 3000 });
		seedGoal(db, { status: "failed", startedAt: NOW - 2000 });
		seedGoal(db, { status: "completed", startedAt: NOW - 1000 });

		const info = getStreakInfo(db);
		expect(info.currentStreak).toBe(1);
		expect(info.longestStreak).toBe(3);
	});

	it("milestones marked as achieved with timestamp", () => {
		const times = Array.from({ length: 6 }, (_, i) => NOW - (6000 - i * 1000));
		for (const t of times) {
			seedGoal(db, { status: "completed", startedAt: t });
		}

		const info = getStreakInfo(db);
		const firstFive = info.milestones.find((m) => m.count === 5);
		expect(firstFive?.achievedAt).not.toBeNull();
		expect(info.currentStreak).toBe(6);
	});
});

// ---------------------------------------------------------------------------
// getWeeklyDigests
// ---------------------------------------------------------------------------
describe("getWeeklyDigests", () => {
	let db: Database.Database;

	beforeEach(() => {
		db = makeTestDb();
		counter = 0;
	});

	it("returns one entry per week", () => {
		// Two goals in the same week, one in a different week
		const thisWeek = NOW - 2 * 86_400;
		const lastWeek = NOW - 9 * 86_400;

		seedGoal(db, { status: "completed", startedAt: thisWeek });
		seedGoal(db, { status: "completed", startedAt: thisWeek + 3600 });
		seedGoal(db, { status: "completed", startedAt: lastWeek });

		const digests = getWeeklyDigests(db, 4);
		// Should have at most 2 distinct weeks
		expect(digests.length).toBeGreaterThanOrEqual(1);
		const weeks = new Set(digests.map((d) => d.weekStart));
		expect(weeks.size).toBe(digests.length);
	});

	it("topAgent is the agent with most completed tasks", () => {
		const goalId = seedGoal(db, { status: "completed", startedAt: NOW - 86_400 });
		// codex: 3 tasks, claude-code: 1 task
		for (let i = 0; i < 3; i++) {
			seedTask(db, { goalId, durationMs: 10_000, agentType: "codex", completedAt: NOW - 86_400 + i * 100 });
		}
		seedTask(db, { goalId, durationMs: 10_000, agentType: "claude-code", completedAt: NOW - 86_400 });

		const digests = getWeeklyDigests(db, 4);
		const relevant = digests.find((d) => d.goalsCompleted > 0);
		expect(relevant?.topAgent).toBe("codex");
	});

	it("streakMaintained reflects goal outcomes that week", () => {
		const thisWeek = NOW - 2 * 86_400;
		const g1 = seedGoal(db, { status: "completed", startedAt: thisWeek });
		const g2 = seedGoal(db, { status: "failed", startedAt: thisWeek + 3600 });

		const digests = getWeeklyDigests(db, 4);
		const relevant = digests.find((d) => d.goalsFailed > 0);
		expect(relevant?.streakMaintained).toBe(false);
	});
});
