// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { PromoBanner } from "./promo-banner";

afterEach(() => cleanup());

describe("PromoBanner", () => {
	it("renders without crashing", () => {
		const { container } = render(<PromoBanner />);
		expect(container.firstElementChild).not.toBeNull();
	});

	it("displays builder name", () => {
		render(<PromoBanner />);
		expect(screen.getByText("nyk")).toBeDefined();
	});

	it("renders Hire nyk link", () => {
		render(<PromoBanner />);
		const link = screen.getByText("Hire nyk");
		expect(link.tagName).toBe("A");
		expect(link.getAttribute("target")).toBe("_blank");
	});

	it("renders Follow nyk link", () => {
		render(<PromoBanner />);
		const link = screen.getByText("Follow nyk");
		expect(link.getAttribute("href")).toContain("github.com");
	});

	it("renders DictX link", () => {
		render(<PromoBanner />);
		expect(screen.getByText("DictX (Upcoming)")).toBeDefined();
	});

	it("all links have rel noopener noreferrer", () => {
		const { container } = render(<PromoBanner />);
		const links = container.querySelectorAll("a");
		for (const link of links) {
			expect(link.getAttribute("rel")).toContain("noopener");
		}
	});
});
