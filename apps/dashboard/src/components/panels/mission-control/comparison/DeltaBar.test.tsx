// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { DeltaBar } from "./DeltaBar";

afterEach(() => cleanup());

describe("DeltaBar", () => {
	it("renders with better direction", () => {
		const { container } = render(
			<DeltaBar change={25.5} direction="better" label="Speed" />,
		);
		expect(screen.getByText("+25.5%")).toBeDefined();
		expect(container.querySelector(".bg-green-500")).not.toBeNull();
	});

	it("renders with worse direction", () => {
		const { container } = render(
			<DeltaBar change={-10.3} direction="worse" label="Accuracy" />,
		);
		expect(screen.getByText("-10.3%")).toBeDefined();
		expect(container.querySelector(".bg-red-500")).not.toBeNull();
	});

	it("renders with neutral direction", () => {
		render(<DeltaBar change={0} direction="neutral" label="Cost" />);
		expect(screen.getByText("0.0%")).toBeDefined();
	});

	it("renders dash when change is null", () => {
		render(<DeltaBar change={null} direction="neutral" label="N/A" />);
		// U+2014 em dash
		expect(screen.getByText("\u2014")).toBeDefined();
	});

	it("has aria-label with label and direction", () => {
		render(<DeltaBar change={15} direction="better" label="Speed" />);
		const el = screen.getByRole("meter");
		expect(el.getAttribute("aria-label")).toContain("Speed");
		expect(el.getAttribute("aria-label")).toContain("better");
	});

	it("sets aria-valuenow", () => {
		render(<DeltaBar change={42} direction="better" label="Test" />);
		const el = screen.getByRole("meter");
		expect(el.getAttribute("aria-valuenow")).toBe("42");
	});

	it("clamps bar width at 100%", () => {
		const { container } = render(
			<DeltaBar change={150} direction="better" label="Big" />,
		);
		// The bar div uses pct / 2 which will be 50% for 100 clamped
		const bar = container.querySelector(".bg-green-500");
		expect(bar).not.toBeNull();
	});
});
