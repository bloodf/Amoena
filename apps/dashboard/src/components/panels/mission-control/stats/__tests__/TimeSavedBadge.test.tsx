// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TimeSavedBadge } from "../TimeSavedBadge";

vi.mock("next-intl", () => ({
	useTranslations: () => (key: string) => key,
}));

afterEach(() => cleanup());

describe("TimeSavedBadge", () => {
	it("renders hours format for >= 60 minutes of savings", () => {
		// 4.2 hours = 252 minutes = 15_120_000ms
		render(<TimeSavedBadge totalTimeSavedMs={15_120_000} />);
		// aria-label contains the formatted value directly: "stats.timeSaved: 4.2h"
		const badge = document.querySelector("[aria-label]") as HTMLElement;
		expect(badge).not.toBeNull();
		expect(badge.getAttribute("aria-label")).toContain("4.2h");
	});

	it("renders minutes format for < 60 minutes of savings", () => {
		// 32 minutes = 1_920_000ms
		render(<TimeSavedBadge totalTimeSavedMs={1_920_000} />);
		const badge = document.querySelector("[aria-label]") as HTMLElement;
		expect(badge).not.toBeNull();
		expect(badge.getAttribute("aria-label")).toContain("32m");
	});

	it("renders nothing when time saved is 0", () => {
		const { container } = render(<TimeSavedBadge totalTimeSavedMs={0} />);
		expect(container.firstChild).toBeNull();
	});

	it("renders nothing when time saved is negative", () => {
		const { container } = render(<TimeSavedBadge totalTimeSavedMs={-1000} />);
		expect(container.firstChild).toBeNull();
	});

	it("has aria-label describing the time saved", () => {
		render(<TimeSavedBadge totalTimeSavedMs={3_600_000} />);
		const badge = document.querySelector("[aria-label]") as HTMLElement;
		expect(badge).not.toBeNull();
		expect(badge.getAttribute("aria-label")).toContain("stats.timeSaved");
	});
});
