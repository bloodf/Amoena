// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { StatusBar } from "../components/StatusBar";

vi.mock("next-intl", () => ({
	useTranslations: () => (key: string) => key,
}));

afterEach(() => cleanup());

const baseProps = {
	completedTasks: 0,
	totalTasks: 3,
	activeAgents: 0,
	totalCostUsd: 0,
	costByAgent: {} as Record<string, number>,
	startedAt: null,
};

describe("StatusBar", () => {
	it("renders task progress as completedTasks/totalTasks", () => {
		render(<StatusBar {...baseProps} completedTasks={2} totalTasks={5} />);
		expect(screen.getByText("2")).toBeDefined();
		expect(screen.getByText("5")).toBeDefined();
	});

	it("renders the tasks translation key label", () => {
		const { container } = render(<StatusBar {...baseProps} />);
		expect(container.textContent).toContain("tasks");
	});

	it("renders active agents count", () => {
		render(<StatusBar {...baseProps} activeAgents={7} />);
		expect(screen.getByText("7")).toBeDefined();
	});

	it("renders the agentsActive translation key label", () => {
		render(<StatusBar {...baseProps} />);
		expect(screen.getByText("agentsActive")).toBeDefined();
	});

	it("renders $0.0000 cost when totalCostUsd is zero", () => {
		render(<StatusBar {...baseProps} totalCostUsd={0} />);
		expect(screen.getByText("$0.0000")).toBeDefined();
	});

	it("renders formatted cost with 4 decimal places", () => {
		render(<StatusBar {...baseProps} totalCostUsd={0.0073} />);
		expect(screen.getByText("$0.0073")).toBeDefined();
	});

	it("shows 0m 00s elapsed time when startedAt is null", () => {
		render(<StatusBar {...baseProps} startedAt={null} />);
		expect(screen.getByText("0m 00s")).toBeDefined();
	});

	it("renders without crashing when all tasks completed", () => {
		const { container } = render(
			<StatusBar
				{...baseProps}
				completedTasks={5}
				totalTasks={5}
				activeAgents={0}
				totalCostUsd={0.0042}
			/>,
		);
		expect(container.firstChild).toBeTruthy();
	});

	it("renders without crashing when goal is running with active agents", () => {
		const { container } = render(
			<StatusBar
				{...baseProps}
				completedTasks={1}
				totalTasks={4}
				activeAgents={2}
				totalCostUsd={0.001}
				startedAt={Date.now() - 30000}
			/>,
		);
		expect(container.firstChild).toBeTruthy();
	});

	it("renders without crashing when goal is in partial_failure state (some done, some failed)", () => {
		// partial_failure: completedTasks < totalTasks with cost incurred
		const { container } = render(
			<StatusBar
				{...baseProps}
				completedTasks={2}
				totalTasks={5}
				activeAgents={0}
				totalCostUsd={0.0021}
			/>,
		);
		expect(container.firstChild).toBeTruthy();
	});

	it("renders without crashing for failed goal (0 completed)", () => {
		const { container } = render(
			<StatusBar
				{...baseProps}
				completedTasks={0}
				totalTasks={3}
				activeAgents={0}
				totalCostUsd={0.0005}
			/>,
		);
		expect(container.firstChild).toBeTruthy();
	});

	it("renders without crashing for cancelled goal (activeAgents=0, some completed)", () => {
		const { container } = render(
			<StatusBar
				{...baseProps}
				completedTasks={1}
				totalTasks={3}
				activeAgents={0}
				totalCostUsd={0.0002}
				startedAt={Date.now() - 10000}
			/>,
		);
		expect(container.firstChild).toBeTruthy();
	});
});
