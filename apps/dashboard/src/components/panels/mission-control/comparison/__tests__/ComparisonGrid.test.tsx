// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type {
	ComparisonDelta,
	RunSummary,
} from "../../../../../lib/comparison-queries";
import { ComparisonGrid } from "../ComparisonGrid";

vi.mock("next-intl", () => ({
	useTranslations: () => (key: string) => key,
}));

afterEach(() => cleanup());

const makeRun = (
	id: string,
	durationMs: number,
	cost: number,
	completed: number,
	total: number,
): RunSummary => ({
	goalId: id,
	description: `Run ${id}`,
	status: "completed",
	startedAt: Math.floor(Date.now() / 1000) - 3600,
	completedAt: Math.floor(Date.now() / 1000),
	totalDurationMs: durationMs,
	totalCostUsd: cost,
	taskCount: total,
	completedCount: completed,
	failedCount: total - completed,
});

const runs: RunSummary[] = [
	makeRun("run-a", 60_000, 0.1, 5, 5),
	makeRun("run-b", 45_000, 0.08, 5, 5),
];

const deltas: ComparisonDelta[] = [
	{
		metric: "duration",
		label: "comparison.duration",
		values: [60_000, 45_000],
		change: -25,
		direction: "better",
	},
	{
		metric: "cost",
		label: "comparison.cost",
		values: [0.1, 0.08],
		change: -20,
		direction: "better",
	},
	{
		metric: "success_rate",
		label: "comparison.successRate",
		values: [1, 1],
		change: 0,
		direction: "neutral",
	},
	{
		metric: "task_count",
		label: "comparison.tasksCompleted",
		values: [5, 5],
		change: 0,
		direction: "neutral",
	},
	{
		metric: "task_count",
		label: "comparison.tasksFailed",
		values: [0, 0],
		change: 0,
		direction: "neutral",
	},
];

describe("ComparisonGrid", () => {
	it("renders one column per run", () => {
		render(<ComparisonGrid runs={runs} deltas={deltas} />);
		// Both run descriptions appear as headers
		expect(screen.getByText(/Run run-a/)).toBeDefined();
		expect(screen.getByText(/Run run-b/)).toBeDefined();
	});

	it("renders metric rows", () => {
		render(<ComparisonGrid runs={runs} deltas={deltas} />);
		expect(screen.getByText("comparison.duration")).toBeDefined();
		expect(screen.getByText("comparison.cost")).toBeDefined();
	});

	it("shows formatted duration values", () => {
		render(<ComparisonGrid runs={runs} deltas={deltas} />);
		expect(screen.getByText("1.0m")).toBeDefined(); // 60s
		expect(screen.getByText("45.0s")).toBeDefined(); // 45s
	});
});
