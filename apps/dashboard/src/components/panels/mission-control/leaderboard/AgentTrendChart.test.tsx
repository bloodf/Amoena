// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { AgentTrendChart } from "./AgentTrendChart";

afterEach(() => cleanup());

const trend = [
	{ date: "2025-06-01", successRate: 0.8, tasksCompleted: 10 },
	{ date: "2025-06-02", successRate: 0.9, tasksCompleted: 12 },
	{ date: "2025-06-03", successRate: 0.7, tasksCompleted: 8 },
];

describe("AgentTrendChart", () => {
	it("renders SVG chart", () => {
		const { container } = render(
			<AgentTrendChart trend={trend} color="#FF6B35" />,
		);
		const svg = container.querySelector("svg");
		expect(svg).not.toBeNull();
	});

	it("renders No data when trend is empty", () => {
		render(<AgentTrendChart trend={[]} color="#FF6B35" />);
		expect(screen.getByText("No data")).toBeDefined();
	});

	it("renders correct number of data points", () => {
		const { container } = render(
			<AgentTrendChart trend={trend} color="#FF6B35" />,
		);
		const circles = container.querySelectorAll("circle");
		expect(circles.length).toBe(3);
	});

	it("has aria-label on SVG", () => {
		const { container } = render(
			<AgentTrendChart trend={trend} color="#FF6B35" />,
		);
		const svg = container.querySelector("svg");
		expect(svg!.getAttribute("aria-label")).toContain("trend");
	});

	it("shows tooltip on hover", () => {
		const { container } = render(
			<AgentTrendChart trend={trend} color="#FF6B35" />,
		);
		const circles = container.querySelectorAll("circle");
		fireEvent.mouseEnter(circles[0]);
		expect(screen.getByText("2025-06-01")).toBeDefined();
		expect(screen.getByText("Success: 80%")).toBeDefined();
	});

	it("hides tooltip on mouse leave", () => {
		const { container } = render(
			<AgentTrendChart trend={trend} color="#FF6B35" />,
		);
		const circles = container.querySelectorAll("circle");
		fireEvent.mouseEnter(circles[0]);
		fireEvent.mouseLeave(circles[0]);
		expect(screen.queryByText("2025-06-01")).toBeNull();
	});

	it("accepts custom width and height", () => {
		const { container } = render(
			<AgentTrendChart trend={trend} color="#FF6B35" width={300} height={100} />,
		);
		const svg = container.querySelector("svg");
		expect(svg!.getAttribute("width")).toBe("300");
		expect(svg!.getAttribute("height")).toBe("100");
	});
});
