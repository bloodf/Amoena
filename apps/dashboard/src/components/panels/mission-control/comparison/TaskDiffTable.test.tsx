// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TaskDiffTable } from "./TaskDiffTable";

vi.mock("next-intl", () => ({
	useTranslations: () => (key: string) => key,
}));

afterEach(() => cleanup());

const runs = [
	{
		goalId: "g1",
		description: "Build a landing page for project",
		status: "completed" as const,
		totalDurationMs: 60000,
		totalCostUsd: 0.05,
		tasksTotal: 3,
		tasksCompleted: 3,
		agentsUsed: 2,
	},
];

const taskDiffs = [
	{
		taskType: "code",
		complexity: "medium",
		entries: [
			{
				status: "completed",
				durationMs: 5000,
				agentType: "claude-code",
			},
		],
	},
	{
		taskType: "test",
		complexity: "high",
		entries: [null],
	},
];

describe("TaskDiffTable", () => {
	it("renders table heading", () => {
		render(<TaskDiffTable runs={runs} taskDiffs={taskDiffs} />);
		expect(screen.getByText("comparison.taskDiff")).toBeDefined();
	});

	it("renders table with role=table", () => {
		render(<TaskDiffTable runs={runs} taskDiffs={taskDiffs} />);
		expect(screen.getByRole("table")).toBeDefined();
	});

	it("renders task types", () => {
		render(<TaskDiffTable runs={runs} taskDiffs={taskDiffs} />);
		expect(screen.getByText("code/medium")).toBeDefined();
		expect(screen.getByText("test/high")).toBeDefined();
	});

	it("renders dash for null entries", () => {
		render(<TaskDiffTable runs={runs} taskDiffs={taskDiffs} />);
		// em dash for missing entries
		expect(screen.getByText("\u2014")).toBeDefined();
	});

	it("renders completed status with checkmark", () => {
		render(<TaskDiffTable runs={runs} taskDiffs={taskDiffs} />);
		// Unicode checkmark
		expect(screen.getByText("\u2713")).toBeDefined();
	});

	it("formats duration", () => {
		render(<TaskDiffTable runs={runs} taskDiffs={taskDiffs} />);
		expect(screen.getByText("5.0s")).toBeDefined();
	});
});
