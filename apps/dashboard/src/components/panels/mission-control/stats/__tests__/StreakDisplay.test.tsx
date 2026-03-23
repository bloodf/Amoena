// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { StreakInfo } from "../../../../../lib/stats-queries";
import { StreakDisplay } from "../StreakDisplay";

vi.mock("next-intl", () => ({
	useTranslations: () => (key: string) => key,
}));

afterEach(() => cleanup());

const makeStreak = (overrides: Partial<StreakInfo> = {}): StreakInfo => ({
	currentStreak: 3,
	longestStreak: 7,
	isActive: true,
	streakStartedAt: Math.floor(Date.now() / 1000) - 3 * 86_400,
	milestones: [
		{ count: 5, achievedAt: null, label: "First Five" },
		{ count: 10, achievedAt: null, label: "Perfect Ten" },
		{ count: 25, achievedAt: null, label: "Quarter Century" },
		{ count: 50, achievedAt: null, label: "Half Century" },
		{ count: 100, achievedAt: null, label: "Centurion" },
	],
	...overrides,
});

describe("StreakDisplay", () => {
	it("renders current streak count", () => {
		render(<StreakDisplay streak={makeStreak({ currentStreak: 5 })} />);
		expect(document.body.textContent).toContain("5");
	});

	it("shows flame icon when streak is active", () => {
		render(<StreakDisplay streak={makeStreak({ isActive: true, currentStreak: 3 })} />);
		expect(document.body.textContent).toContain("🔥");
	});

	it("does not show flame icon when streak is inactive", () => {
		render(<StreakDisplay streak={makeStreak({ isActive: false, currentStreak: 0 })} />);
		expect(document.body.textContent).not.toContain("🔥");
	});

	it("milestone badges shown for achieved milestones", () => {
		const streak = makeStreak({
			milestones: [
				{ count: 5, achievedAt: Date.now() / 1000, label: "First Five" },
				{ count: 10, achievedAt: null, label: "Perfect Ten" },
				{ count: 25, achievedAt: null, label: "Quarter Century" },
				{ count: 50, achievedAt: null, label: "Half Century" },
				{ count: 100, achievedAt: null, label: "Centurion" },
			],
		});
		render(<StreakDisplay streak={streak} />);
		// Achieved milestone should be bright (yellow), locked ones dimmed
		const milestoneEls = screen.getAllByRole("generic", { hidden: false });
		// Find the achieved badge by aria-label
		const achievedBadge = screen.getByLabelText("First Five milestone achieved");
		expect(achievedBadge).toBeDefined();
		const lockedBadge = screen.getByLabelText("Perfect Ten milestone locked");
		expect(lockedBadge).toBeDefined();
	});

	it("shows longest streak", () => {
		render(<StreakDisplay streak={makeStreak({ longestStreak: 12 })} />);
		expect(document.body.textContent).toContain("12");
	});
});
