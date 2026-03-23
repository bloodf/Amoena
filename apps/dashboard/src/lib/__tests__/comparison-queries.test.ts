import Database from "better-sqlite3";
import { beforeEach, describe, expect, it } from "vitest";
import {
	compareRuns,
	generateVerdict,
	listComparableRuns,
} from "../comparison-queries";
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

function seedRun(
	db: Database.Database,
	opts: {
		id: string;
		status?: "completed" | "failed" | "partial_failure";
		durationSec?: number;
		tasks?: {
			type?: string;
			complexity?: string;
			status?: "completed" | "failed" | "timed_out";
			durationMs?: number;
			costUsd?: number;
			agentType?: string;
		}[];
	},
) {
	const startedAt = NOW - 3600;
	const completedAt =
		opts.status === "completed" && opts.durationSec != null
			? startedAt + opts.durationSec
			: opts.status === "completed"
				? startedAt + 60
				: null;

	insertGoalRun(db, {
		id: opts.id,
		description: `Goal ${opts.id}`,
		base_ref: "main",
	});

	// Explicitly set started_at so duration calculation is deterministic
	db.prepare(`UPDATE goal_runs SET started_at = ? WHERE id = ?`).run(
		startedAt,
		opts.id,
	);

	if (opts.status) {
		updateGoalRunStatus(
			db,
			opts.id,
			opts.status,
			completedAt ?? undefined,
			undefined,
			undefined,
		);
	}

	for (const task of opts.tasks ?? []) {
		const taskId = `task-${++counter}`;
		insertTaskRun(db, {
			id: taskId,
			goal_run_id: opts.id,
			task_type: task.type ?? "implementation",
			complexity: task.complexity ?? "medium",
			description: `Task ${taskId}`,
		});
		const agent = task.agentType ?? "claude-code";
		updateTaskRunDispatched(
			db,
			taskId,
			agent,
			`matrix:${task.type ?? "implementation"}/${task.complexity ?? "medium"}→${agent}`,
			startedAt,
			"/tmp/work",
		);
		updateTaskRunCompleted(db, taskId, {
			status: task.status ?? "completed",
			completedAt: startedAt + (task.durationMs ?? 10_000) / 1000,
			durationMs: task.durationMs ?? 10_000,
			inputTokens: 100,
			outputTokens: 50,
			costUsd: task.costUsd ?? 0.001,
			errorMessage: null,
			attemptCount: 1,
		});
	}
}

// ---------------------------------------------------------------------------
// compareRuns
// ---------------------------------------------------------------------------
describe("compareRuns", () => {
	let db: Database.Database;

	beforeEach(() => {
		db = makeTestDb();
		counter = 0;
	});

	it("two runs with different durations shows correct delta", () => {
		seedRun(db, {
			id: "run-a",
			status: "completed",
			durationSec: 60,
			tasks: [{ status: "completed", durationMs: 10_000 }],
		});
		seedRun(db, {
			id: "run-b",
			status: "completed",
			durationSec: 45,
			tasks: [{ status: "completed", durationMs: 10_000 }],
		});

		const result = compareRuns(db, ["run-a", "run-b"]);
		const durationDelta = result.deltas.find((d) => d.metric === "duration");
		expect(durationDelta).toBeDefined();
		// 45s vs 60s = -25% change
		expect(durationDelta!.change).toBeCloseTo(-25, 0);
		expect(durationDelta!.direction).toBe("better");
	});

	it("delta direction: faster = better", () => {
		seedRun(db, {
			id: "run-a",
			status: "completed",
			durationSec: 100,
			tasks: [],
		});
		seedRun(db, {
			id: "run-b",
			status: "completed",
			durationSec: 50,
			tasks: [],
		});

		const result = compareRuns(db, ["run-a", "run-b"]);
		const d = result.deltas.find((d) => d.metric === "duration")!;
		expect(d.direction).toBe("better");
	});

	it("delta direction: more expensive = worse", () => {
		seedRun(db, {
			id: "run-a",
			status: "completed",
			tasks: [{ costUsd: 0.01 }],
		});
		seedRun(db, {
			id: "run-b",
			status: "completed",
			tasks: [{ costUsd: 0.02 }],
		});

		const result = compareRuns(db, ["run-a", "run-b"]);
		const d = result.deltas.find((d) => d.metric === "cost")!;
		expect(d.direction).toBe("worse");
	});

	it("changes under 2% threshold → neutral", () => {
		// Run A: cost = 0.1000, Run B: cost = 0.1005 (0.5% change)
		seedRun(db, {
			id: "run-a",
			status: "completed",
			tasks: Array.from({ length: 100 }, () => ({ costUsd: 0.001 })),
		});
		seedRun(db, {
			id: "run-b",
			status: "completed",
			tasks: Array.from({ length: 100 }, () => ({ costUsd: 0.001005 })),
		});

		const result = compareRuns(db, ["run-a", "run-b"]);
		const d = result.deltas.find((d) => d.metric === "cost")!;
		expect(d.direction).toBe("neutral");
	});

	it("task diff: task present in run A but not B → null entry", () => {
		seedRun(db, {
			id: "run-a",
			status: "completed",
			tasks: [{ type: "review", complexity: "low", status: "completed" }],
		});
		seedRun(db, {
			id: "run-b",
			status: "completed",
			tasks: [{ type: "implementation", complexity: "medium" }],
		});

		const result = compareRuns(db, ["run-a", "run-b"]);
		const reviewDiff = result.taskDiffs.find((t) => t.taskType === "review");
		expect(reviewDiff).toBeDefined();
		expect(reviewDiff!.entries[0]).not.toBeNull();
		expect(reviewDiff!.entries[1]).toBeNull();
	});

	it("agent diff: correct per-run aggregation", () => {
		seedRun(db, {
			id: "run-a",
			status: "completed",
			tasks: [
				{ agentType: "claude-code", status: "completed", durationMs: 10_000 },
				{ agentType: "claude-code", status: "failed", durationMs: 5_000 },
			],
		});
		seedRun(db, {
			id: "run-b",
			status: "completed",
			tasks: [
				{ agentType: "claude-code", status: "completed", durationMs: 8_000 },
			],
		});

		const result = compareRuns(db, ["run-a", "run-b"]);
		const agentDiff = result.agentDiffs.find(
			(a) => a.agentType === "claude-code",
		)!;
		expect(agentDiff.perRun[0].tasksAssigned).toBe(2);
		expect(agentDiff.perRun[0].tasksCompleted).toBe(1);
		expect(agentDiff.perRun[1].tasksAssigned).toBe(1);
		expect(agentDiff.perRun[1].tasksCompleted).toBe(1);
	});
});

// ---------------------------------------------------------------------------
// listComparableRuns
// ---------------------------------------------------------------------------
describe("listComparableRuns", () => {
	let db: Database.Database;

	beforeEach(() => {
		db = makeTestDb();
		counter = 0;
	});

	it("returns only completed runs", () => {
		seedRun(db, { id: "run-completed", status: "completed" });
		seedRun(db, { id: "run-failed", status: "failed" });

		const runs = listComparableRuns(db);
		expect(runs.every((r) => r.status === "completed")).toBe(true);
		expect(runs.some((r) => r.goalId === "run-completed")).toBe(true);
		expect(runs.some((r) => r.goalId === "run-failed")).toBe(false);
	});

	it("respects limit parameter", () => {
		for (let i = 0; i < 5; i++) {
			seedRun(db, { id: `run-${i}`, status: "completed" });
		}
		const runs = listComparableRuns(db, 2);
		expect(runs.length).toBe(2);
	});

	it("returns empty array when no completed runs", () => {
		const runs = listComparableRuns(db);
		expect(runs).toEqual([]);
	});
});

// ---------------------------------------------------------------------------
// generateVerdict
// ---------------------------------------------------------------------------
describe("generateVerdict", () => {
	it("mentions faster run in summary", () => {
		const runs = [
			{
				goalId: "a",
				description: "Run Alpha",
				status: "completed" as const,
				startedAt: 0,
				completedAt: 60,
				totalDurationMs: 60_000,
				totalCostUsd: 0.1,
				taskCount: 5,
				completedCount: 5,
				failedCount: 0,
			},
			{
				goalId: "b",
				description: "Run Beta",
				status: "completed" as const,
				startedAt: 0,
				completedAt: 45,
				totalDurationMs: 45_000,
				totalCostUsd: 0.1,
				taskCount: 5,
				completedCount: 5,
				failedCount: 0,
			},
		];
		const deltas = [
			{
				metric: "duration",
				label: "Duration",
				values: [60_000, 45_000],
				change: -25,
				direction: "better" as const,
			},
		];
		const verdict = generateVerdict(runs, deltas);
		expect(verdict.summary).toContain("faster");
	});

	it("lists improvements and regressions separately", () => {
		const runs = [
			{
				goalId: "a",
				description: "A",
				status: "completed" as const,
				startedAt: 0,
				completedAt: 60,
				totalDurationMs: 60_000,
				totalCostUsd: 0.1,
				taskCount: 5,
				completedCount: 5,
				failedCount: 0,
			},
			{
				goalId: "b",
				description: "B",
				status: "completed" as const,
				startedAt: 0,
				completedAt: 45,
				totalDurationMs: 45_000,
				totalCostUsd: 0.2,
				taskCount: 5,
				completedCount: 5,
				failedCount: 0,
			},
		];
		const deltas = [
			{
				metric: "duration",
				label: "Duration",
				values: [60_000, 45_000],
				change: -25,
				direction: "better" as const,
			},
			{
				metric: "cost",
				label: "Cost",
				values: [0.1, 0.2],
				change: 100,
				direction: "worse" as const,
			},
		];
		const verdict = generateVerdict(runs, deltas);
		expect(verdict.improvements.length).toBe(1);
		expect(verdict.regressions.length).toBe(1);
	});

	it("all-neutral shows 'Runs performed similarly'", () => {
		const runs = [
			{
				goalId: "a",
				description: "A",
				status: "completed" as const,
				startedAt: 0,
				completedAt: 60,
				totalDurationMs: 60_000,
				totalCostUsd: 0.1,
				taskCount: 5,
				completedCount: 5,
				failedCount: 0,
			},
			{
				goalId: "b",
				description: "B",
				status: "completed" as const,
				startedAt: 0,
				completedAt: 60,
				totalDurationMs: 60_000,
				totalCostUsd: 0.1,
				taskCount: 5,
				completedCount: 5,
				failedCount: 0,
			},
		];
		const deltas = [
			{
				metric: "duration",
				label: "Duration",
				values: [60_000, 60_000],
				change: 0,
				direction: "neutral" as const,
			},
		];
		const verdict = generateVerdict(runs, deltas);
		expect(verdict.summary).toContain("similarly");
	});
});
