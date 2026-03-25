// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AgentDiffTable } from "./AgentDiffTable";

vi.mock("next-intl", () => ({
	useTranslations: () => (key: string) => key,
}));

afterEach(() => cleanup());

const runs = [
	{
		goalId: "g1",
		description: "Build a landing page for the project",
		status: "completed" as const,
		totalDurationMs: 60000,
		totalCostUsd: 0.05,
		tasksTotal: 5,
		tasksCompleted: 4,
		agentsUsed: 2,
	},
	{
		goalId: "g2",
		description: "Write unit tests for API endpoints",
		status: "completed" as const,
		totalDurationMs: 30000,
		totalCostUsd: 0.03,
		tasksTotal: 3,
		tasksCompleted: 3,
		agentsUsed: 1,
	},
];

const agentDiffs = [
	{
		agentType: "claude-code",
		perRun: [
			{ goalId: "g1", tasksAssigned: 3, tasksCompleted: 2, successRate: 0.67 },
			{ goalId: "g2", tasksAssigned: 2, tasksCompleted: 2, successRate: 1.0 },
		],
	},
	{
		agentType: "codex",
		perRun: [
			{ goalId: "g1", tasksAssigned: 2, tasksCompleted: 2, successRate: 1.0 },
			{ goalId: "g2", tasksAssigned: 1, tasksCompleted: 1, successRate: 1.0 },
		],
	},
];

describe("AgentDiffTable", () => {
	it("renders table with role=table", () => {
		render(<AgentDiffTable runs={runs} agentDiffs={agentDiffs} />);
		expect(screen.getByRole("table")).toBeDefined();
	});

	it("renders heading", () => {
		render(<AgentDiffTable runs={runs} agentDiffs={agentDiffs} />);
		expect(screen.getByText("comparison.agentDiff")).toBeDefined();
	});

	it("renders agent types", () => {
		render(<AgentDiffTable runs={runs} agentDiffs={agentDiffs} />);
		expect(screen.getByText("claude-code")).toBeDefined();
		expect(screen.getByText("codex")).toBeDefined();
	});

	it("renders success rates as percentages", () => {
		render(<AgentDiffTable runs={runs} agentDiffs={agentDiffs} />);
		expect(screen.getByText("67%")).toBeDefined();
		expect(screen.getAllByText("100%").length).toBeGreaterThan(0);
	});

	it("renders task completion fractions", () => {
		render(<AgentDiffTable runs={runs} agentDiffs={agentDiffs} />);
		expect(screen.getByText("2/3")).toBeDefined();
	});

	it("truncates run descriptions in header", () => {
		render(<AgentDiffTable runs={runs} agentDiffs={agentDiffs} />);
		// Descriptions are sliced to 20 chars
		expect(screen.getByText("Build a landing page")).toBeDefined();
	});
});
