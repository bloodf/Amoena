// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AgentPanel } from "../components/AgentPanel";
import type { OutputLine } from "../types";

vi.mock("next-intl", () => ({
	useTranslations: () => (key: string) => key,
}));

afterEach(() => cleanup());

const baseProps = {
	adapterId: "claude-code",
	taskId: "task-1",
	taskDescription: "Build the login page",
	status: "running" as const,
	outputLines: [] as OutputLine[],
	isHighlighted: false,
};

describe("AgentPanel", () => {
	it("renders agent name in header", () => {
		render(<AgentPanel {...baseProps} />);
		expect(screen.getByText("claude-code")).toBeDefined();
	});

	it("shows correct status badge", () => {
		render(<AgentPanel {...baseProps} status="completed" />);
		expect(screen.getByText("completed")).toBeDefined();
	});

	it("renders output lines in order", () => {
		const lines: OutputLine[] = [
			{ text: "line one", timestamp: 1, type: "stdout" },
			{ text: "line two", timestamp: 2, type: "stdout" },
		];
		render(<AgentPanel {...baseProps} outputLines={lines} />);
		expect(screen.getByText("line one")).toBeDefined();
		expect(screen.getByText("line two")).toBeDefined();
	});

	it("stderr lines have red text class", () => {
		const lines: OutputLine[] = [
			{ text: "error output", timestamp: 1, type: "stderr" },
		];
		const { container } = render(<AgentPanel {...baseProps} outputLines={lines} />);
		const errDiv = container.querySelector(".text-red-400");
		expect(errDiv).toBeTruthy();
		expect(errDiv?.textContent).toBe("error output");
	});

	it("shows 'waitingForOutput' when outputLines is empty", () => {
		render(<AgentPanel {...baseProps} outputLines={[]} />);
		expect(screen.getByText("waitingForOutput")).toBeDefined();
	});
});
