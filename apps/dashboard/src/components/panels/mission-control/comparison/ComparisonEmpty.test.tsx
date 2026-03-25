// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ComparisonEmpty } from "./ComparisonEmpty";

vi.mock("next-intl", () => ({
	useTranslations: () => (key: string) => key,
}));

afterEach(() => cleanup());

describe("ComparisonEmpty", () => {
	it("renders without crashing", () => {
		const { container } = render(<ComparisonEmpty />);
		expect(container.firstElementChild).not.toBeNull();
	});

	it("displays empty title translation key", () => {
		render(<ComparisonEmpty />);
		expect(screen.getByText("comparison.emptyTitle")).toBeDefined();
	});

	it("displays empty description translation key", () => {
		render(<ComparisonEmpty />);
		expect(screen.getByText("comparison.emptyDescription")).toBeDefined();
	});

	it("renders SVG illustration", () => {
		const { container } = render(<ComparisonEmpty />);
		const svg = container.querySelector("svg");
		expect(svg).not.toBeNull();
		expect(svg!.getAttribute("aria-hidden")).toBe("true");
	});
});
