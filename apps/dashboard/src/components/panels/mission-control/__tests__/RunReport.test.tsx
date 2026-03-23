// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { RunReport } from "../components/RunReport";
import type { RunReport as RunReportType } from "../types";

vi.mock("next-intl", () => ({
	useTranslations: () => (key: string) => key,
}));

afterEach(() => cleanup());

const baseReport: RunReportType = {
	goalId: "goal-1",
	description: "Implement OAuth login flow",
	status: "completed",
	startedAt: Date.now() - 60000,
	completedAt: Date.now(),
	durationMs: 60000,
	totalCostUsd: 0.0042,
	tasks: [
		{
			taskId: "t1",
			goalId: "goal-1",
			adapterId: "claude-code",
			description: "Write auth middleware",
			taskType: "impl",
			status: "completed",
			durationMs: 30000,
			costUsd: 0.002,
			attempts: 1,
		},
	],
	agents: [
		{
			adapterId: "claude-code",
			assigned: 1,
			completed: 1,
			failed: 0,
			avgDurationMs: 30000,
			totalCostUsd: 0.002,
			successRate: 1.0,
		},
	],
	routing: [
		{
			taskId: "t1",
			adapterId: "claude-code",
			reason: "Best suited for implementation",
			couldImprove: false,
		},
		{
			taskId: "t2",
			adapterId: "codex",
			reason: "Fallback due to rate limit",
			couldImprove: true,
		},
	],
};

describe("RunReport", () => {
	it("renders all 5 tabs", () => {
		render(<RunReport report={baseReport} onNewGoal={vi.fn()} />);
		expect(screen.getByRole("tab", { name: "tabSummary" })).toBeDefined();
		expect(screen.getByRole("tab", { name: "tabTasks" })).toBeDefined();
		expect(screen.getByRole("tab", { name: "tabAgents" })).toBeDefined();
		expect(screen.getByRole("tab", { name: "tabRouting" })).toBeDefined();
		expect(screen.getByRole("tab", { name: "tabRaw" })).toBeDefined();
	});

	it("Summary tab shows correct task counts", () => {
		render(<RunReport report={baseReport} onNewGoal={vi.fn()} />);
		// The "totalTasks" label should be visible in summary tab
		expect(screen.getByText("totalTasks")).toBeDefined();
	});

	it("Routing tab highlights couldImprove rows", () => {
		render(<RunReport report={baseReport} onNewGoal={vi.fn()} />);
		fireEvent.click(screen.getByRole("tab", { name: "tabRouting" }));
		// couldImprove row shows the couldImprove badge
		expect(screen.getByText("couldImprove")).toBeDefined();
	});

	it("Raw JSON tab shows stringified report", () => {
		render(<RunReport report={baseReport} onNewGoal={vi.fn()} />);
		fireEvent.click(screen.getByRole("tab", { name: "tabRaw" }));
		const pre = document.querySelector("pre");
		expect(pre?.textContent).toContain("goal-1");
	});

	it("'noTasksInRun' shown for empty task list", () => {
		const emptyReport: RunReportType = { ...baseReport, tasks: [] };
		render(<RunReport report={emptyReport} onNewGoal={vi.fn()} />);
		fireEvent.click(screen.getByRole("tab", { name: "tabTasks" }));
		expect(screen.getByText("noTasksInRun")).toBeDefined();
	});
});
