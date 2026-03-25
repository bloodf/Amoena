// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { WeeklyDigestCard } from "./WeeklyDigestCard";

vi.mock("next-intl", () => ({
	useTranslations: () => (key: string) => key,
}));

afterEach(() => cleanup());

const digest = {
	weekStart: "2025-06-09",
	goalsCompleted: 7,
	totalTimeSavedMs: 5_400_000, // 90m -> 1.5h
	totalCostUsd: 0.425,
	topAgent: "claude-code",
	streakMaintained: true,
};

describe("WeeklyDigestCard", () => {
	it("renders week start date", () => {
		render(<WeeklyDigestCard digest={digest} />);
		expect(screen.getByText("2025-06-09")).toBeDefined();
	});

	it("renders goals completed count", () => {
		render(<WeeklyDigestCard digest={digest} />);
		expect(screen.getByText("7")).toBeDefined();
	});

	it("renders formatted time saved", () => {
		render(<WeeklyDigestCard digest={digest} />);
		expect(screen.getByText("1.5h")).toBeDefined();
	});

	it("renders top agent", () => {
		render(<WeeklyDigestCard digest={digest} />);
		expect(screen.getByText("claude-code")).toBeDefined();
	});

	it("renders cost formatted to 3 decimal places", () => {
		render(<WeeklyDigestCard digest={digest} />);
		expect(screen.getByText("$0.425")).toBeDefined();
	});

	it("shows checkmark when streak maintained", () => {
		render(<WeeklyDigestCard digest={digest} />);
		// Unicode checkmark
		expect(screen.getByText("\u2713")).toBeDefined();
	});

	it("shows X when streak broken", () => {
		const brokenDigest = { ...digest, streakMaintained: false };
		render(<WeeklyDigestCard digest={brokenDigest} />);
		expect(screen.getByText("\u2717")).toBeDefined();
	});

	it("renders dash when no top agent", () => {
		const noAgent = { ...digest, topAgent: null };
		render(<WeeklyDigestCard digest={noAgent} />);
		// em dash
		expect(screen.getByText("\u2014")).toBeDefined();
	});
});
