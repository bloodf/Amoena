// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { ComparisonVerdict } from "../../../../../lib/comparison-queries";
import { VerdictCard } from "../VerdictCard";

vi.mock("next-intl", () => ({
	useTranslations: () => (key: string) => key,
}));

afterEach(() => cleanup());

describe("VerdictCard", () => {
	it("renders summary text", () => {
		const verdict: ComparisonVerdict = {
			summary: "Run B was 25% faster than Run A",
			improvements: ["Duration: 25.0% improvement"],
			regressions: [],
			unchanged: ["Task Count"],
		};
		render(<VerdictCard verdict={verdict} />);
		expect(screen.getByText("Run B was 25% faster than Run A")).toBeDefined();
	});

	it("renders improvement list", () => {
		const verdict: ComparisonVerdict = {
			summary: "Run B improved",
			improvements: ["Duration: 25.0% improvement"],
			regressions: [],
			unchanged: [],
		};
		render(<VerdictCard verdict={verdict} />);
		expect(screen.getByText(/Duration: 25.0% improvement/)).toBeDefined();
	});

	it("renders regression list", () => {
		const verdict: ComparisonVerdict = {
			summary: "Run B regressed on cost",
			improvements: [],
			regressions: ["Cost: 50.0% regression"],
			unchanged: [],
		};
		render(<VerdictCard verdict={verdict} />);
		expect(screen.getByText(/Cost: 50.0% regression/)).toBeDefined();
	});

	it("renders unchanged list", () => {
		const verdict: ComparisonVerdict = {
			summary: "Runs performed similarly.",
			improvements: [],
			regressions: [],
			unchanged: ["Duration", "Cost"],
		};
		render(<VerdictCard verdict={verdict} />);
		expect(screen.getByText("Duration")).toBeDefined();
		expect(screen.getByText("Cost")).toBeDefined();
	});

	it("does not render improvements section when empty", () => {
		const verdict: ComparisonVerdict = {
			summary: "No changes",
			improvements: [],
			regressions: [],
			unchanged: [],
		};
		render(<VerdictCard verdict={verdict} />);
		expect(screen.queryByText("comparison.improvements")).toBeNull();
	});
});
