import Database from "better-sqlite3";
import { beforeEach, describe, expect, it } from "vitest";
import {
	computeAgentScore,
	getAgentTrend,
	getLeaderboard,
} from "../leaderboard-queries";
import {
	insertGoalRun,
	insertTaskRun,
	updateTaskRunCompleted,
	updateTaskRunDispatched,
	upsertAgentPerformance,
} from "../mission-control-telemetry";
import { runMigrations } from "../migrations";

function makeTestDb(): Database.Database {
	const db = new Database(":memory:");
	db.pragma("foreign_keys = ON");
	runMigrations(db);
	return db;
}

const BASE_TIME = Math.floor(Date.now() / 1000) - 3600;

let taskCounter = 0;

function seedTasks(
	db: Database.Database,
	agentType: string,
	tasks: {
		status: "completed" | "failed" | "timed_out";
		durationMs: number;
		costUsd: number;
		completedAt?: number;
	}[],
) {
	const goalId = `goal-${agentType}-${Date.now()}`;
	insertGoalRun(db, {
		id: goalId,
		description: `Goal for ${agentType}`,
		base_ref: "main",
	});
	for (const [i, task] of tasks.entries()) {
		const taskId = `task-${agentType}-${++taskCounter}`;
		const startedAt = task.completedAt
			? task.completedAt - task.durationMs / 1000
			: BASE_TIME + i;
		const completedAt = task.completedAt ?? BASE_TIME + i + 1;
		insertTaskRun(db, {
			id: taskId,
			goal_run_id: goalId,
			task_type: "implementation",
			complexity: "medium",
			description: `Task ${i}`,
		});
		updateTaskRunDispatched(
			db,
			taskId,
			agentType,
			`matrix:implementation/medium→${agentType}`,
			startedAt,
			"/tmp/work",
		);
		updateTaskRunCompleted(db, taskId, {
			status: task.status,
			completedAt,
			durationMs: task.durationMs,
			inputTokens: 100,
			outputTokens: 50,
			costUsd: task.costUsd,
			errorMessage: null,
			attemptCount: 1,
		});
		upsertAgentPerformance(db, agentType, {
			durationMs: task.durationMs,
			costUsd: task.costUsd,
			status: task.status,
		});
	}
}

// ---------------------------------------------------------------------------
// computeAgentScore
// ---------------------------------------------------------------------------
describe("computeAgentScore", () => {
	it("perfect agent scores near 100", () => {
		const score = computeAgentScore({
			successRate: 1,
			avgDurationMs: 0,
			avgCostPerTask: 0,
			totalTasks: 50,
		});
		expect(score).toBeCloseTo(100, 0);
	});

	it("poor agent scores near 0", () => {
		const score = computeAgentScore({
			successRate: 0,
			avgDurationMs: 600_000,
			avgCostPerTask: 0.1,
			totalTasks: 0,
		});
		expect(score).toBeCloseTo(0, 0);
	});

	it("score clamps between 0 and 100", () => {
		const high = computeAgentScore({
			successRate: 2,
			avgDurationMs: -1000,
			avgCostPerTask: -1,
			totalTasks: 1000,
		});
		expect(high).toBeLessThanOrEqual(100);

		const low = computeAgentScore({
			successRate: -1,
			avgDurationMs: 1_000_000,
			avgCostPerTask: 10,
			totalTasks: 0,
		});
		expect(low).toBeGreaterThanOrEqual(0);
	});

	it("returns ~78 for a well-configured agent (acceptance criteria value)", () => {
		const score = computeAgentScore({
			successRate: 0.9,
			avgDurationMs: 60_000,
			avgCostPerTask: 0.01,
			totalTasks: 20,
		});
		// 36 + 20 + 16 + 6 = 78
		expect(score).toBeGreaterThanOrEqual(70);
		expect(score).toBeLessThanOrEqual(85);
	});
});

// ---------------------------------------------------------------------------
// getLeaderboard
// ---------------------------------------------------------------------------
describe("getLeaderboard", () => {
	let db: Database.Database;

	beforeEach(() => {
		db = makeTestDb();
		taskCounter = 0;
	});

	it("returns agents ranked by composite score (default)", () => {
		// claude-code: high success, fast, cheap
		seedTasks(
			db,
			"claude-code",
			Array.from({ length: 5 }, () => ({
				status: "completed" as const,
				durationMs: 10_000,
				costUsd: 0.001,
			})),
		);
		// codex: lower success rate
		seedTasks(db, "codex", [
			...Array.from({ length: 3 }, () => ({
				status: "completed" as const,
				durationMs: 60_000,
				costUsd: 0.01,
			})),
			...Array.from({ length: 2 }, () => ({
				status: "failed" as const,
				durationMs: 60_000,
				costUsd: 0.01,
			})),
		]);

		const entries = getLeaderboard(db, { minTasks: 3 });
		expect(entries.length).toBe(2);
		expect(entries[0].rank).toBe(1);
		expect(entries[1].rank).toBe(2);
		expect(entries[0].score).toBeGreaterThan(entries[1].score);
	});

	it("excludes agents below minTasks threshold", () => {
		seedTasks(
			db,
			"claude-code",
			Array.from({ length: 5 }, () => ({
				status: "completed" as const,
				durationMs: 10_000,
				costUsd: 0.001,
			})),
		);
		// codex only has 2 completed tasks
		seedTasks(db, "codex", [
			{ status: "completed", durationMs: 60_000, costUsd: 0.01 },
			{ status: "completed", durationMs: 60_000, costUsd: 0.01 },
		]);

		const entries = getLeaderboard(db, { minTasks: 3 });
		expect(entries.length).toBe(1);
		expect(entries[0].agentType).toBe("claude-code");
	});

	it("windowDays filters to recent tasks only", () => {
		const now = Math.floor(Date.now() / 1000);
		// claude-code: tasks from 10 days ago (outside 7d window)
		seedTasks(
			db,
			"claude-code",
			Array.from({ length: 4 }, (_, i) => ({
				status: "completed" as const,
				durationMs: 10_000,
				costUsd: 0.001,
				completedAt: now - 10 * 86_400 - i,
			})),
		);
		// codex: tasks from 2 days ago (inside 7d window)
		seedTasks(
			db,
			"codex",
			Array.from({ length: 4 }, (_, i) => ({
				status: "completed" as const,
				durationMs: 10_000,
				costUsd: 0.001,
				completedAt: now - 2 * 86_400 - i,
			})),
		);

		const entries = getLeaderboard(db, { minTasks: 3, windowDays: 7 });
		expect(entries.length).toBe(1);
		expect(entries[0].agentType).toBe("codex");
	});

	it("sortBy/sortDir changes ordering", () => {
		seedTasks(
			db,
			"claude-code",
			Array.from({ length: 5 }, () => ({
				status: "completed" as const,
				durationMs: 10_000,
				costUsd: 0.001,
			})),
		);
		seedTasks(
			db,
			"codex",
			Array.from({ length: 5 }, () => ({
				status: "completed" as const,
				durationMs: 60_000,
				costUsd: 0.02,
			})),
		);

		const asc = getLeaderboard(db, {
			minTasks: 3,
			sortBy: "avgDurationMs",
			sortDir: "asc",
		});
		expect(asc[0].avgDurationMs).toBeLessThanOrEqual(asc[1].avgDurationMs);

		const desc = getLeaderboard(db, {
			minTasks: 3,
			sortBy: "avgDurationMs",
			sortDir: "desc",
		});
		expect(desc[0].avgDurationMs).toBeGreaterThanOrEqual(desc[1].avgDurationMs);
	});

	it("returns empty array when no agents qualify", () => {
		const entries = getLeaderboard(db);
		expect(entries).toEqual([]);
	});
});

// ---------------------------------------------------------------------------
// getAgentTrend
// ---------------------------------------------------------------------------
describe("getAgentTrend", () => {
	let db: Database.Database;

	beforeEach(() => {
		db = makeTestDb();
		taskCounter = 0;
	});

	it("returns daily aggregates for the last N days", () => {
		const now = Math.floor(Date.now() / 1000);
		const dayAgo = now - 86_400;
		const twoDaysAgo = now - 2 * 86_400;

		seedTasks(db, "claude-code", [
			{ status: "completed", durationMs: 10_000, costUsd: 0.001, completedAt: dayAgo },
			{ status: "completed", durationMs: 10_000, costUsd: 0.001, completedAt: twoDaysAgo },
		]);

		const trend = getAgentTrend(db, "claude-code", 30);
		expect(trend.length).toBeGreaterThanOrEqual(1);
		expect(trend[0].date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
		expect(trend[0].successRate).toBe(1);
	});

	it("days with no tasks are excluded (not zero-filled)", () => {
		const now = Math.floor(Date.now() / 1000);
		// Only one day with data
		seedTasks(db, "claude-code", [
			{ status: "completed", durationMs: 10_000, costUsd: 0.001, completedAt: now - 86_400 },
		]);
		const trend = getAgentTrend(db, "claude-code", 30);
		// Should only have 1 entry, not 30
		expect(trend.length).toBe(1);
	});
});

// ---------------------------------------------------------------------------
// trend calculation
// ---------------------------------------------------------------------------
describe("trend calculation via getLeaderboard", () => {
	let db: Database.Database;

	beforeEach(() => {
		db = makeTestDb();
		taskCounter = 0;
	});

	it("improving: recent >> previous success rate", () => {
		const now = Math.floor(Date.now() / 1000);
		// Previous 10 tasks (older): ~50% success (5 completed, 5 failed)
		const prevTasks = [
			...Array.from({ length: 5 }, (_, i) => ({
				status: "completed" as const,
				durationMs: 10_000,
				costUsd: 0.001,
				completedAt: now - 2000 + i,
			})),
			...Array.from({ length: 5 }, (_, i) => ({
				status: "failed" as const,
				durationMs: 10_000,
				costUsd: 0.001,
				completedAt: now - 1900 + i,
			})),
		];
		// Recent 10 tasks (newer): 100% success
		const recentTasks = Array.from({ length: 10 }, (_, i) => ({
			status: "completed" as const,
			durationMs: 10_000,
			costUsd: 0.001,
			completedAt: now - 100 + i,
		}));

		seedTasks(db, "claude-code", [...prevTasks, ...recentTasks]);

		const entries = getLeaderboard(db, { minTasks: 1 });
		expect(entries[0].trend).toBe("improving");
	});

	it("declining: recent << previous success rate", () => {
		const now = Math.floor(Date.now() / 1000);
		// Previous 10: 100% success
		const prevTasks = Array.from({ length: 10 }, (_, i) => ({
			status: "completed" as const,
			durationMs: 10_000,
			costUsd: 0.001,
			completedAt: now - 2000 + i,
		}));
		// Recent 10: ~50% success
		const recentTasks = [
			...Array.from({ length: 5 }, (_, i) => ({
				status: "completed" as const,
				durationMs: 10_000,
				costUsd: 0.001,
				completedAt: now - 100 + i,
			})),
			...Array.from({ length: 5 }, (_, i) => ({
				status: "failed" as const,
				durationMs: 10_000,
				costUsd: 0.001,
				completedAt: now - 50 + i,
			})),
		];

		seedTasks(db, "codex", [...prevTasks, ...recentTasks]);

		const entries = getLeaderboard(db, { minTasks: 1 });
		expect(entries[0].trend).toBe("declining");
	});

	it("stable: similar success rates", () => {
		const now = Math.floor(Date.now() / 1000);
		// 20 tasks, all completed → both halves 100% → stable
		const tasks = Array.from({ length: 20 }, (_, i) => ({
			status: "completed" as const,
			durationMs: 10_000,
			costUsd: 0.001,
			completedAt: now - 2000 + i * 10,
		}));

		seedTasks(db, "gemini", tasks);

		const entries = getLeaderboard(db, { minTasks: 1 });
		expect(entries[0].trend).toBe("stable");
	});
});
