// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TimeSavedDetail } from "./TimeSavedDetail";

vi.mock("next-intl", () => ({
	useTranslations: () => (key: string, params?: Record<string, unknown>) => {
		if (params?.hours) return `${key} ${params.hours}`;
		return key;
	},
}));

afterEach(() => cleanup());

const stats = {
	totalTimeSavedMs: 7_200_000, // 2h
	weekTimeSavedMs: 3_600_000, // 1h
	monthTimeSavedMs: 14_400_000, // 4h
	avgTimeSavedPerGoalMs: 600_000, // 10m
	humanEquivalentHours: 8,
};

const weeklyDigests = [
	{
		weekStart: "2025-06-02",
		goalsCompleted: 5,
		totalTimeSavedMs: 3_600_000,
		totalCostUsd: 0.5,
		topAgent: "claude-code",
		streakMaintained: true,
	},
	{
		weekStart: "2025-06-09",
		goalsCompleted: 3,
		totalTimeSavedMs: 1_800_000,
		totalCostUsd: 0.3,
		topAgent: "codex",
		streakMaintained: false,
	},
];

describe("TimeSavedDetail", () => {
	it("renders total time saved", () => {
		render(<TimeSavedDetail stats={stats} weeklyDigests={[]} />);
		expect(screen.getByText("2.0h")).toBeDefined();
	});

	it("renders week time saved", () => {
		render(<TimeSavedDetail stats={stats} weeklyDigests={[]} />);
		expect(screen.getByText("1.0h")).toBeDefined();
	});

	it("renders month time saved", () => {
		render(<TimeSavedDetail stats={stats} weeklyDigests={[]} />);
		expect(screen.getByText("4.0h")).toBeDefined();
	});

	it("renders per-goal average", () => {
		render(<TimeSavedDetail stats={stats} weeklyDigests={[]} />);
		expect(screen.getByText("10m")).toBeDefined();
	});

	it("renders human equivalent hours", () => {
		render(<TimeSavedDetail stats={stats} weeklyDigests={[]} />);
		expect(screen.getByText(/humanEquivalent/)).toBeDefined();
	});

	it("does not render human equivalent when 0", () => {
		const noHuman = { ...stats, humanEquivalentHours: 0 };
		const { container } = render(
			<TimeSavedDetail stats={noHuman} weeklyDigests={[]} />,
		);
		expect(container.textContent).not.toContain("humanEquivalent");
	});

	it("renders weekly digest bars", () => {
		render(<TimeSavedDetail stats={stats} weeklyDigests={weeklyDigests} />);
		expect(screen.getByText("stats.weeklyDigest")).toBeDefined();
		expect(screen.getByText("06-02")).toBeDefined();
		expect(screen.getByText("06-09")).toBeDefined();
	});
});
