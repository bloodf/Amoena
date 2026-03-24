// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CostTracker } from "../components/CostTracker";

vi.mock("next-intl", () => ({
	useTranslations: () => (key: string) => key,
}));

afterEach(() => cleanup());

describe("CostTracker", () => {
	describe("zero cost", () => {
		it("renders $0.0000 when totalUsd is 0", () => {
			render(<CostTracker totalUsd={0} byAgent={{}} isRunning={false} />);
			expect(screen.getByText("$0.0000")).toBeDefined();
		});

		it("aria-label includes the formatted cost", () => {
			const { container } = render(
				<CostTracker totalUsd={0} byAgent={{}} isRunning={false} />,
			);
			const el = container.querySelector("[aria-label]");
			expect(el?.getAttribute("aria-label")).toContain("$0.0000");
		});

		it("does not apply animate-pulse class when not running", () => {
			const { container } = render(
				<CostTracker totalUsd={0} byAgent={{}} isRunning={false} />,
			);
			const span = container.querySelector("span[aria-label]");
			expect(span?.className).not.toContain("animate-pulse");
		});
	});

	describe("running cost", () => {
		it("renders formatted cost with 4 decimal places", () => {
			render(<CostTracker totalUsd={0.0073} byAgent={{}} isRunning={true} />);
			expect(screen.getByText("$0.0073")).toBeDefined();
		});

		it("applies animate-pulse class when isRunning is true", () => {
			const { container } = render(
				<CostTracker totalUsd={0.0073} byAgent={{ "claude-code": 0.0073 }} isRunning={true} />,
			);
			const span = container.querySelector("span[aria-label]");
			expect(span?.className).toContain("animate-pulse");
		});

		it("aria-label includes the totalCost translation key and formatted value", () => {
			const { container } = render(
				<CostTracker totalUsd={0.0042} byAgent={{}} isRunning={true} />,
			);
			const el = container.querySelector("[aria-label]");
			expect(el?.getAttribute("aria-label")).toContain("totalCost");
			expect(el?.getAttribute("aria-label")).toContain("$0.0042");
		});
	});

	describe("completed cost", () => {
		it("renders non-zero cost without pulse when not running", () => {
			const { container } = render(
				<CostTracker totalUsd={0.1234} byAgent={{ codex: 0.1234 }} isRunning={false} />,
			);
			expect(screen.getByText("$0.1234")).toBeDefined();
			const span = container.querySelector("span[aria-label]");
			expect(span?.className).not.toContain("animate-pulse");
		});

		it("renders correct cost for multi-agent breakdown", () => {
			render(
				<CostTracker
					totalUsd={0.0150}
					byAgent={{ "claude-code": 0.0100, codex: 0.0050 }}
					isRunning={false}
				/>,
			);
			expect(screen.getByText("$0.0150")).toBeDefined();
		});
	});
});
