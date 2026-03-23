import Database from "better-sqlite3";
import { beforeEach, describe, expect, it } from "vitest";
import {
	insertGoalRun,
	insertTaskRun,
	updateGoalRunStatus,
	updateTaskRunCompleted,
	updateTaskRunDispatched,
} from "../mission-control-telemetry";
import { runMigrations } from "../migrations";
import {
	ReportNotFoundError,
	analyzeRoutingDecision,
	explainRoutingReason,
	generateReport,
	renderMarkdown,
} from "../run-reporter";

function makeTestDb(): Database.Database {
	const db = new Database(":memory:");
	db.pragma("foreign_keys = ON");
	runMigrations(db);
	return db;
}

function makeGoal(
	db: Database.Database,
	goalId: string,
	opts: { status?: string; mergeStrategy?: string } = {},
) {
	insertGoalRun(db, { id: goalId, description: `Goal ${goalId}`, base_ref: "main" });
	if (opts.status && opts.status !== "pending") {
		updateGoalRunStatus(
			db,
			goalId,
			opts.status as any,
			opts.status === "completed" || opts.status === "cancelled" ? 1000 : undefined,
			undefined,
			opts.mergeStrategy,
		);
	}
}

function makeTask(
	db: Database.Database,
	taskId: string,
	goalId: string,
	opts: {
		taskType?: string;
		complexity?: string;
		status?: string;
		agentType?: string;
		routingReason?: string;
		costUsd?: number | null;
		durationMs?: number;
		inputTokens?: number;
		outputTokens?: number;
		attemptCount?: number;
	} = {},
) {
	insertTaskRun(db, {
		id: taskId,
		goal_run_id: goalId,
		task_type: opts.taskType ?? "implementation",
		complexity: opts.complexity ?? "medium",
		description: `Task ${taskId}`,
	});
	if (opts.agentType) {
		updateTaskRunDispatched(
			db,
			taskId,
			opts.agentType,
			opts.routingReason ?? `matrix:${opts.taskType ?? "implementation"}/${opts.complexity ?? "medium"}→${opts.agentType}`,
			1000,
			"/tmp/wt",
		);
	}
	if (opts.status && opts.status !== "queued") {
		updateTaskRunCompleted(db, taskId, {
			status: opts.status as any,
			completedAt: 2000,
			durationMs: opts.durationMs ?? 1000,
			inputTokens: opts.inputTokens ?? 100,
			outputTokens: opts.outputTokens ?? 200,
			costUsd: opts.costUsd !== undefined ? opts.costUsd : 0.01,
			errorMessage: null,
			attemptCount: opts.attemptCount ?? 1,
		});
	}
}

// ---------------------------------------------------------------------------
// generateReport
// ---------------------------------------------------------------------------
describe("generateReport", () => {
	let db: Database.Database;
	beforeEach(() => {
		db = makeTestDb();
	});

	it("happy path: 5 completed tasks, correct totals", () => {
		makeGoal(db, "g-happy", { status: "completed" });
		for (let i = 0; i < 5; i++) {
			makeTask(db, `t-happy-${i}`, "g-happy", {
				agentType: i < 3 ? "claude-code" : "codex",
				status: "completed",
				costUsd: 0.01,
				durationMs: 1000,
			});
		}
		const report = generateReport(db, "g-happy");
		expect(report.taskBreakdown).toHaveLength(5);
		expect(report.costSummary.totalUsd).toBeCloseTo(0.05, 4);
		expect(report.agentSummary.find((a) => a.agentType === "claude-code")?.tasksCompleted).toBe(3);
		expect(report.agentSummary.find((a) => a.agentType === "codex")?.tasksCompleted).toBe(2);
		expect(report.issues).toHaveLength(0);
	});

	it("unknown goalId throws ReportNotFoundError", () => {
		expect(() => generateReport(db, "nonexistent")).toThrow(ReportNotFoundError);
	});

	it("zero-task goal returns valid report", () => {
		makeGoal(db, "g-zero");
		const report = generateReport(db, "g-zero");
		expect(report.taskBreakdown).toHaveLength(0);
		expect(report.agentSummary).toHaveLength(0);
		expect(report.costSummary.totalUsd).toBe(0);
	});

	it("all-cancelled goal sets status and issues", () => {
		makeGoal(db, "g-cancelled", { status: "cancelled" });
		makeTask(db, "t-c1", "g-cancelled", { status: "cancelled" });
		const report = generateReport(db, "g-cancelled");
		expect(report.runStatus).toBe("cancelled");
		expect(report.issues.some((i) => i.message.includes("cancelled"))).toBe(true);
	});

	it("partial failure: some tasks failed, some skipped", () => {
		makeGoal(db, "g-partial", { status: "partial_failure" });
		makeTask(db, "t-p1", "g-partial", { status: "completed", agentType: "claude-code" });
		makeTask(db, "t-p2", "g-partial", { status: "failed", agentType: "claude-code" });
		makeTask(db, "t-p3", "g-partial", { status: "skipped", agentType: "claude-code" });
		const report = generateReport(db, "g-partial");
		expect(report.runStatus).toBe("partial_failure");
		const skippedTask = report.taskBreakdown.find((t) => t.status === "skipped");
		expect(skippedTask).toBeTruthy();
		expect(report.issues.some((i) => i.taskId === "t-p3")).toBe(true);
	});

	it("costSummary.totalUsd excludes null-cost tasks", () => {
		makeGoal(db, "g-cost");
		makeTask(db, "t-cost-1", "g-cost", { status: "completed", agentType: "claude-code", costUsd: 0.05 });
		makeTask(db, "t-cost-2", "g-cost", { status: "completed", agentType: "claude-code", costUsd: null });
		const report = generateReport(db, "g-cost");
		expect(report.costSummary.totalUsd).toBeCloseTo(0.05, 4);
	});

	it("agentSummary groups by agent_type correctly", () => {
		makeGoal(db, "g-agent-group");
		makeTask(db, "t-ag-1", "g-agent-group", { agentType: "claude-code", status: "completed" });
		makeTask(db, "t-ag-2", "g-agent-group", { agentType: "claude-code", status: "completed" });
		makeTask(db, "t-ag-3", "g-agent-group", { agentType: "codex", status: "failed" });
		const report = generateReport(db, "g-agent-group");
		const cc = report.agentSummary.find((a) => a.agentType === "claude-code")!;
		expect(cc.tasksAssigned).toBe(2);
		expect(cc.tasksCompleted).toBe(2);
		const cx = report.agentSummary.find((a) => a.agentType === "codex")!;
		expect(cx.tasksFailed).toBe(1);
	});

	it("tasks with attemptCount > 1 appear in issues", () => {
		makeGoal(db, "g-retry");
		makeTask(db, "t-retry", "g-retry", {
			agentType: "claude-code",
			status: "completed",
			attemptCount: 3,
		});
		const report = generateReport(db, "g-retry");
		expect(report.issues.some((i) => i.taskId === "t-retry")).toBe(true);
	});
});

// ---------------------------------------------------------------------------
// explainRoutingReason
// ---------------------------------------------------------------------------
describe("explainRoutingReason", () => {
	it('"matrix:implementation/high→claude-code" → contains "high complexity"', () => {
		const result = explainRoutingReason("matrix:implementation/high→claude-code");
		expect(result).toContain("claude-code");
		expect(result).toContain("high complexity");
	});

	it('"override:codex" → contains "Manually overridden"', () => {
		const result = explainRoutingReason("override:codex");
		expect(result).toContain("Manually overridden");
	});

	it('"fallback:codex→claude-code" → contains "Fell back"', () => {
		const result = explainRoutingReason("fallback:codex→claude-code");
		expect(result).toContain("Fell back");
	});

	it("unknown format → passthrough", () => {
		const result = explainRoutingReason("custom:something");
		expect(result).toBe("custom:something");
	});
});

// ---------------------------------------------------------------------------
// analyzeRoutingDecision
// ---------------------------------------------------------------------------
describe("analyzeRoutingDecision", () => {
	const baseTask = {
		id: "t1",
		goal_run_id: "g1",
		task_type: "implementation",
		complexity: "medium",
		description: "desc",
		status: "completed" as const,
		agent_type: "claude-code",
		routing_reason: "matrix:implementation/medium→claude-code",
		attempt_count: 1,
		worktree_path: null,
		started_at: 1000,
		completed_at: 2000,
		duration_ms: 1000,
		input_tokens: 100,
		output_tokens: 200,
		cost_usd: 0.01,
		error_message: null,
		created_at: 1000,
	};

	it("high-complexity task on codex → couldImprove=true", () => {
		const insight = analyzeRoutingDecision({
			...baseTask,
			complexity: "high",
			agent_type: "codex",
			routing_reason: "matrix:implementation/high→codex",
		});
		expect(insight.couldImprove).toBe(true);
	});

	it("fallback routing → couldImprove=true, mentions original agent", () => {
		const insight = analyzeRoutingDecision({
			...baseTask,
			routing_reason: "fallback:codex→claude-code",
			agent_type: "claude-code",
		});
		expect(insight.couldImprove).toBe(true);
		expect(insight.improvementHint).toContain("codex");
	});

	it("attempt_count > 1 → couldImprove=true", () => {
		const insight = analyzeRoutingDecision({ ...baseTask, attempt_count: 3 });
		expect(insight.couldImprove).toBe(true);
	});

	it("normal claude-code routing → couldImprove=false", () => {
		const insight = analyzeRoutingDecision(baseTask);
		expect(insight.couldImprove).toBe(false);
	});
});

// ---------------------------------------------------------------------------
// renderMarkdown
// ---------------------------------------------------------------------------
describe("renderMarkdown", () => {
	let db: Database.Database;
	beforeEach(() => {
		db = makeTestDb();
	});

	function makeReport() {
		makeGoal(db, "g-md", { status: "completed" });
		makeTask(db, "t-md-1", "g-md", {
			agentType: "claude-code",
			status: "completed",
			costUsd: 0.012,
			durationMs: 263000,
		});
		return generateReport(db, "g-md");
	}

	it('output starts with "# Mission Control Run Report"', () => {
		const md = renderMarkdown(makeReport());
		expect(md.startsWith("# Mission Control Run Report")).toBe(true);
	});

	it('duration formatted as "Xm Ys"', () => {
		const report = makeReport();
		// totalDurationMs = (completedAt - startedAt) * 1000, both are unix seconds
		// We just check the helper directly
		const md = renderMarkdown({
			...report,
			completedAt: 100,
			startedAt: 0,
			totalDurationMs: 263000,
		});
		expect(md).toContain("4m 23s");
	});

	it('cost formatted as "$X.XXXX USD"', () => {
		const md = renderMarkdown(makeReport());
		expect(md).toMatch(/\$\d+\.\d{4} USD/);
	});

	it('empty issues section shows "> No issues detected."', () => {
		const report = makeReport();
		const md = renderMarkdown({ ...report, issues: [] });
		expect(md).toContain("> No issues detected.");
	});

	it("null cost shown as —", () => {
		const report = makeReport();
		const modifiedReport = {
			...report,
			taskBreakdown: report.taskBreakdown.map((t) => ({ ...t, costUsd: null })),
		};
		const md = renderMarkdown(modifiedReport);
		// In the task breakdown section, cost should show —
		expect(md).toContain("**Cost:** —");
	});

	it('running goal shows "In progress" for duration', () => {
		makeGoal(db, "g-running");
		const report = generateReport(db, "g-running");
		const md = renderMarkdown(report);
		expect(md).toContain("In progress");
	});
});
