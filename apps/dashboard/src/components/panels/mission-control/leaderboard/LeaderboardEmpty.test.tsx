// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { LeaderboardEmpty } from "./LeaderboardEmpty";

vi.mock("next-intl", () => ({
	useTranslations: () => (key: string) => key,
}));

afterEach(() => cleanup());

describe("LeaderboardEmpty", () => {
	it("renders without crashing", () => {
		const { container } = render(<LeaderboardEmpty />);
		expect(container.firstElementChild).not.toBeNull();
	});

	it("displays empty title", () => {
		render(<LeaderboardEmpty />);
		expect(screen.getByText("leaderboard.emptyTitle")).toBeDefined();
	});

	it("displays empty description", () => {
		render(<LeaderboardEmpty />);
		expect(screen.getByText("leaderboard.emptyDescription")).toBeDefined();
	});

	it("renders SVG illustration with aria-hidden", () => {
		const { container } = render(<LeaderboardEmpty />);
		const svg = container.querySelector("svg");
		expect(svg).not.toBeNull();
		expect(svg!.getAttribute("aria-hidden")).toBe("true");
	});
});
