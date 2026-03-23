import Database from "better-sqlite3";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
	deleteGoalRunState,
	getAgentPerformance,
	getAgentPerformanceByType,
	getGoalRun,
	getTaskRunsForGoal,
	insertGoalRun,
	insertTaskRun,
	listGoalRuns,
	loadGoalRunState,
	saveGoalRunState,
	updateGoalRunStatus,
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

// ---------------------------------------------------------------------------
// migration
// ---------------------------------------------------------------------------
describe("migration", () => {
	it("creates goal_runs table", () => {
		const db = makeTestDb();
		const row = db
			.prepare(
				`SELECT name FROM sqlite_master WHERE type='table' AND name='goal_runs'`,
			)
			.get();
		expect(row).toBeTruthy();
	});

	it("creates task_runs table", () => {
		const db = makeTestDb();
		const row = db
			.prepare(
				`SELECT name FROM sqlite_master WHERE type='table' AND name='task_runs'`,
			)
			.get();
		expect(row).toBeTruthy();
	});

	it("creates agent_performance table", () => {
		const db = makeTestDb();
		const row = db
			.prepare(
				`SELECT name FROM sqlite_master WHERE type='table' AND name='agent_performance'`,
			)
			.get();
		expect(row).toBeTruthy();
	});

	it("creates goal_run_state table", () => {
		const db = makeTestDb();
		const row = db
			.prepare(
				`SELECT name FROM sqlite_master WHERE type='table' AND name='goal_run_state'`,
			)
			.get();
		expect(row).toBeTruthy();
	});

	it("creates idx_task_runs_goal index", () => {
		const db = makeTestDb();
		const row = db
			.prepare(
				`SELECT name FROM sqlite_master WHERE type='index' AND name='idx_task_runs_goal'`,
			)
			.get();
		expect(row).toBeTruthy();
	});

	it("double-migration is idempotent (no error)", () => {
		const db = makeTestDb();
		expect(() => runMigrations(db)).not.toThrow();
	});
});

// ---------------------------------------------------------------------------
// goal_runs CRUD
// ---------------------------------------------------------------------------
describe("goal_runs CRUD", () => {
	let db: Database.Database;
	beforeEach(() => {
		db = makeTestDb();
	});

	it("insertGoalRun creates row with default status 'pending'", () => {
		insertGoalRun(db, { id: "g1", description: "Do something", base_ref: "main" });
		const row = getGoalRun(db, "g1");
		expect(row).not.toBeNull();
		expect(row!.status).toBe("pending");
		expect(row!.description).toBe("Do something");
		expect(row!.base_ref).toBe("main");
	});

	it("updateGoalRunStatus sets status and completed_at", () => {
		insertGoalRun(db, { id: "g2", description: "Test", base_ref: "main" });
		updateGoalRunStatus(db, "g2", "completed", 1234567890, 0.05, "auto");
		const row = getGoalRun(db, "g2");
		expect(row!.status).toBe("completed");
		expect(row!.completed_at).toBe(1234567890);
		expect(row!.total_cost_usd).toBe(0.05);
		expect(row!.merge_strategy).toBe("auto");
	});

	it("getGoalRun returns null for unknown id", () => {
		const row = getGoalRun(db, "nonexistent");
		expect(row).toBeNull();
	});

	it("listGoalRuns respects limit/offset", () => {
		for (let i = 0; i < 5; i++) {
			insertGoalRun(db, { id: `g-list-${i}`, description: `Goal ${i}`, base_ref: "main" });
		}
		const page1 = listGoalRuns(db, 2, 0);
		expect(page1).toHaveLength(2);
		const page2 = listGoalRuns(db, 2, 2);
		expect(page2).toHaveLength(2);
		const page3 = listGoalRuns(db, 2, 4);
		expect(page3).toHaveLength(1);
	});
});

// ---------------------------------------------------------------------------
// task_runs CRUD
// ---------------------------------------------------------------------------
describe("task_runs CRUD", () => {
	let db: Database.Database;
	beforeEach(() => {
		db = makeTestDb();
		insertGoalRun(db, { id: "goal-1", description: "Goal", base_ref: "main" });
	});

	it("insertTaskRun creates row with status 'queued'", () => {
		insertTaskRun(db, {
			id: "t1",
			goal_run_id: "goal-1",
			task_type: "implementation",
			complexity: "high",
			description: "Build auth",
		});
		const tasks = getTaskRunsForGoal(db, "goal-1");
		expect(tasks).toHaveLength(1);
		expect(tasks[0].status).toBe("queued");
	});

	it("updateTaskRunDispatched sets agent_type, routing_reason, started_at, worktree_path, status 'running'", () => {
		insertTaskRun(db, {
			id: "t2",
			goal_run_id: "goal-1",
			task_type: "implementation",
			complexity: "medium",
			description: "Build API",
		});
		updateTaskRunDispatched(
			db,
			"t2",
			"claude-code",
			"matrix:implementation/medium→claude-code",
			1000000,
			"/tmp/worktree",
		);
		const tasks = getTaskRunsForGoal(db, "goal-1");
		const t = tasks[0];
		expect(t.agent_type).toBe("claude-code");
		expect(t.routing_reason).toBe("matrix:implementation/medium→claude-code");
		expect(t.started_at).toBe(1000000);
		expect(t.worktree_path).toBe("/tmp/worktree");
		expect(t.status).toBe("running");
	});

	it("updateTaskRunCompleted sets duration_ms, tokens, cost, status", () => {
		insertTaskRun(db, {
			id: "t3",
			goal_run_id: "goal-1",
			task_type: "testing",
			complexity: "low",
			description: "Run tests",
		});
		updateTaskRunCompleted(db, "t3", {
			status: "completed",
			completedAt: 2000000,
			durationMs: 5000,
			inputTokens: 100,
			outputTokens: 200,
			costUsd: 0.001,
			errorMessage: null,
			attemptCount: 1,
		});
		const tasks = getTaskRunsForGoal(db, "goal-1");
		const t = tasks[0];
		expect(t.status).toBe("completed");
		expect(t.completed_at).toBe(2000000);
		expect(t.duration_ms).toBe(5000);
		expect(t.input_tokens).toBe(100);
		expect(t.output_tokens).toBe(200);
		expect(t.cost_usd).toBe(0.001);
		expect(t.attempt_count).toBe(1);
	});

	it("getTaskRunsForGoal returns all tasks for a goal", () => {
		for (let i = 0; i < 3; i++) {
			insertTaskRun(db, {
				id: `t-multi-${i}`,
				goal_run_id: "goal-1",
				task_type: "analysis",
				complexity: "low",
				description: `Task ${i}`,
			});
		}
		const tasks = getTaskRunsForGoal(db, "goal-1");
		expect(tasks).toHaveLength(3);
	});

	it("FK violation on unknown goal_run_id throws", () => {
		expect(() => {
			insertTaskRun(db, {
				id: "t-fk",
				goal_run_id: "nonexistent-goal",
				task_type: "implementation",
				complexity: "low",
				description: "Should fail",
			});
		}).toThrow();
	});
});

// ---------------------------------------------------------------------------
// agent_performance
// ---------------------------------------------------------------------------
describe("agent_performance", () => {
	let db: Database.Database;
	beforeEach(() => {
		db = makeTestDb();
	});

	it("upsertAgentPerformance creates row on first call", () => {
		upsertAgentPerformance(db, "claude-code", {
			durationMs: 1000,
			costUsd: 0.01,
			status: "completed",
		});
		const row = getAgentPerformanceByType(db, "claude-code");
		expect(row).not.toBeNull();
		expect(row!.total_tasks).toBe(1);
	});

	it("multiple completions accumulate correctly", () => {
		upsertAgentPerformance(db, "codex", { durationMs: 1000, costUsd: 0.01, status: "completed" });
		upsertAgentPerformance(db, "codex", { durationMs: 2000, costUsd: 0.02, status: "completed" });
		upsertAgentPerformance(db, "codex", { durationMs: 3000, costUsd: 0.03, status: "failed" });
		const row = getAgentPerformanceByType(db, "codex");
		expect(row!.total_tasks).toBe(3);
		expect(row!.completed_tasks).toBe(2);
		expect(row!.failed_tasks).toBe(1);
	});

	it("success_rate and avg_duration_ms are recomputed correctly", () => {
		upsertAgentPerformance(db, "gemini", { durationMs: 1000, costUsd: 0.01, status: "completed" });
		upsertAgentPerformance(db, "gemini", { durationMs: 2000, costUsd: 0.02, status: "completed" });
		upsertAgentPerformance(db, "gemini", { durationMs: 3000, costUsd: 0.03, status: "failed" });
		const row = getAgentPerformanceByType(db, "gemini");
		expect(row!.success_rate).toBeCloseTo(2 / 3, 3);
		expect(row!.avg_duration_ms).toBeCloseTo(2000, 1);
	});

	it("failed status increments failed_tasks not completed_tasks", () => {
		upsertAgentPerformance(db, "agent-x", { durationMs: 500, costUsd: 0, status: "failed" });
		const row = getAgentPerformanceByType(db, "agent-x");
		expect(row!.failed_tasks).toBe(1);
		expect(row!.completed_tasks).toBe(0);
	});

	it("getAgentPerformance returns all rows", () => {
		upsertAgentPerformance(db, "a1", { durationMs: 1000, costUsd: 0.01, status: "completed" });
		upsertAgentPerformance(db, "a2", { durationMs: 2000, costUsd: 0.02, status: "completed" });
		const rows = getAgentPerformance(db);
		expect(rows.length).toBeGreaterThanOrEqual(2);
	});
});

// ---------------------------------------------------------------------------
// crash recovery
// ---------------------------------------------------------------------------
describe("crash recovery", () => {
	let db: Database.Database;
	beforeEach(() => {
		db = makeTestDb();
		insertGoalRun(db, { id: "gr-state", description: "Test", base_ref: "main" });
	});

	it("saveGoalRunState + loadGoalRunState round-trip", () => {
		saveGoalRunState(db, "gr-state", '{"step":1}');
		const loaded = loadGoalRunState(db, "gr-state");
		expect(loaded).toBe('{"step":1}');
	});

	it("deleteGoalRunState removes row; subsequent load returns null", () => {
		saveGoalRunState(db, "gr-state", '{"step":2}');
		deleteGoalRunState(db, "gr-state");
		const loaded = loadGoalRunState(db, "gr-state");
		expect(loaded).toBeNull();
	});
});

// ---------------------------------------------------------------------------
// disk-full resilience
// ---------------------------------------------------------------------------
describe("disk-full resilience", () => {
	it("failed insertGoalRun is swallowed (non-critical)", () => {
		const db = makeTestDb();
		// Replace prepare to throw
		const origPrepare = db.prepare.bind(db);
		vi.spyOn(db, "prepare").mockImplementation((sql: string) => {
			if (sql.includes("INSERT INTO goal_runs")) {
				throw new Error("SQLITE_FULL: database or disk is full");
			}
			return origPrepare(sql);
		});
		expect(() =>
			insertGoalRun(db, {
				id: "g-fail",
				description: "Test",
				base_ref: "main",
			}),
		).not.toThrow();
		vi.restoreAllMocks();
	});

	it("failed saveGoalRunState re-throws (critical)", () => {
		const db = makeTestDb();
		insertGoalRun(db, { id: "gr-critical", description: "Test", base_ref: "main" });
		const origPrepare = db.prepare.bind(db);
		vi.spyOn(db, "prepare").mockImplementation((sql: string) => {
			if (sql.includes("INSERT OR REPLACE INTO goal_run_state")) {
				throw new Error("SQLITE_FULL: database or disk is full");
			}
			return origPrepare(sql);
		});
		expect(() => saveGoalRunState(db, "gr-critical", '{"step":1}')).toThrow();
		vi.restoreAllMocks();
	});
});
