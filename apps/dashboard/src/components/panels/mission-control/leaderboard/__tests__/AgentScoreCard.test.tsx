// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { LeaderboardEntry } from "../../../../../lib/leaderboard-queries";
import { AgentScoreCard } from "../AgentScoreCard";

vi.mock("next-intl", () => ({
	useTranslations: () => (key: string) => key,
}));

afterEach(() => cleanup());

const entry: LeaderboardEntry = {
	agentType: "claude-code",
	rank: 1,
	score: 78.4,
	totalTasks: 20,
	completedTasks: 18,
	failedTasks: 1,
	timedOutTasks: 1,
	successRate: 0.9,
	avgDurationMs: 60_000,
	totalCostUsd: 0.2,
	avgCostPerTask: 0.01,
	totalTokensUsed: 3000,
	lastUsedAt: Date.now() / 1000,
	trend: "improving",
};

describe("AgentScoreCard", () => {
	it("renders all metric cards", () => {
		render(
			<AgentScoreCard entry={entry} trend={[]} onClose={vi.fn()} />,
		);
		// Score metric
		expect(screen.getByText("78.4")).toBeDefined();
		// Success rate
		expect(screen.getByText("90.0%")).toBeDefined();
		// Tasks completed
		expect(screen.getByText("18")).toBeDefined();
	});

	it("close button calls onClose", () => {
		const onClose = vi.fn();
		render(<AgentScoreCard entry={entry} trend={[]} onClose={onClose} />);
		fireEvent.click(screen.getByLabelText("Close agent details"));
		expect(onClose).toHaveBeenCalledOnce();
	});

	it("renders agent name with color", () => {
		render(<AgentScoreCard entry={entry} trend={[]} onClose={vi.fn()} />);
		const heading = screen.getByText("claude-code");
		expect(heading.getAttribute("style")).toContain("color");
	});

	it("renders trend chart when trend data provided", () => {
		const trend = [
			{ date: "2024-01-01", successRate: 0.8, avgDurationMs: 10_000, tasksCompleted: 5 },
			{ date: "2024-01-02", successRate: 0.9, avgDurationMs: 8_000, tasksCompleted: 7 },
		];
		render(<AgentScoreCard entry={entry} trend={trend} onClose={vi.fn()} />);
		expect(screen.getByRole("img", { name: /trend chart/i })).toBeDefined();
	});
});
