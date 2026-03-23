// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { LeaderboardEntry } from "../../../../../lib/leaderboard-queries";
import { LeaderboardTable } from "../LeaderboardTable";

vi.mock("next-intl", () => ({
	useTranslations: () => (key: string) => key,
}));

afterEach(() => cleanup());

const makeEntry = (
	agentType: string,
	overrides: Partial<LeaderboardEntry> = {},
): LeaderboardEntry => ({
	agentType,
	rank: 1,
	score: 75,
	totalTasks: 10,
	completedTasks: 8,
	failedTasks: 1,
	timedOutTasks: 1,
	successRate: 0.8,
	avgDurationMs: 30_000,
	totalCostUsd: 0.05,
	avgCostPerTask: 0.005,
	totalTokensUsed: 1500,
	lastUsedAt: Date.now() / 1000,
	trend: "stable",
	...overrides,
});

const baseEntries: LeaderboardEntry[] = [
	makeEntry("claude-code", { rank: 1, score: 80 }),
	makeEntry("codex", { rank: 2, score: 60 }),
	makeEntry("gemini", { rank: 3, score: 50 }),
];

describe("LeaderboardTable", () => {
	it("renders a row per agent", () => {
		render(
			<LeaderboardTable
				entries={baseEntries}
				sortBy="score"
				sortDir="desc"
				onSort={vi.fn()}
				onSelectAgent={vi.fn()}
			/>,
		);
		expect(screen.getByText("claude-code")).toBeDefined();
		expect(screen.getByText("codex")).toBeDefined();
		expect(screen.getByText("gemini")).toBeDefined();
	});

	it("clicking a header calls onSort with the field", () => {
		const onSort = vi.fn();
		render(
			<LeaderboardTable
				entries={baseEntries}
				sortBy="score"
				sortDir="desc"
				onSort={onSort}
				onSelectAgent={vi.fn()}
			/>,
		);
		// Click "leaderboard.successRate" column header
		const headers = screen.getAllByRole("columnheader");
		fireEvent.click(headers[3]); // successRate column
		expect(onSort).toHaveBeenCalledWith("successRate");
	});

	it("active sort column has aria-sort attribute", () => {
		render(
			<LeaderboardTable
				entries={baseEntries}
				sortBy="score"
				sortDir="desc"
				onSort={vi.fn()}
				onSelectAgent={vi.fn()}
			/>,
		);
		const headers = screen.getAllByRole("columnheader");
		// score is the 3rd column (index 2)
		const scoreHeader = headers[2];
		expect(scoreHeader.getAttribute("aria-sort")).toBe("descending");
	});

	it("non-active sort columns have aria-sort=none", () => {
		render(
			<LeaderboardTable
				entries={baseEntries}
				sortBy="score"
				sortDir="asc"
				onSort={vi.fn()}
				onSelectAgent={vi.fn()}
			/>,
		);
		const headers = screen.getAllByRole("columnheader");
		// rank column (index 0) should have aria-sort=none
		expect(headers[0].getAttribute("aria-sort")).toBe("none");
	});

	it("clicking a row calls onSelectAgent with agentType", () => {
		const onSelectAgent = vi.fn();
		render(
			<LeaderboardTable
				entries={baseEntries}
				sortBy="score"
				sortDir="desc"
				onSort={vi.fn()}
				onSelectAgent={onSelectAgent}
			/>,
		);
		fireEvent.click(screen.getByText("claude-code"));
		expect(onSelectAgent).toHaveBeenCalledWith("claude-code");
	});

	it("agent names show color via inline style", () => {
		render(
			<LeaderboardTable
				entries={baseEntries}
				sortBy="score"
				sortDir="desc"
				onSort={vi.fn()}
				onSelectAgent={vi.fn()}
			/>,
		);
		const agentCell = screen.getByText("claude-code");
		// claude-code color is #FF6B35
		expect(agentCell.getAttribute("style")).toContain("color");
	});
});
