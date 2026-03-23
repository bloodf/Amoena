// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TaskGraph } from "../components/TaskGraph";
import type { TaskRunRow } from "../types";

vi.mock("next-intl", () => ({
	useTranslations: () => (key: string) => key,
}));

const makeTask = (overrides: Partial<TaskRunRow> = {}): TaskRunRow => ({
	taskId: "task-1",
	goalId: "goal-1",
	adapterId: "claude-code",
	description: "Implement feature",
	taskType: "impl",
	status: "completed",
	...overrides,
});

afterEach(() => cleanup());

describe("TaskGraph", () => {
	it("renders a node per task", () => {
		const tasks = [
			makeTask({ taskId: "t1" }),
			makeTask({ taskId: "t2", status: "running" }),
		];
		const { container } = render(<TaskGraph tasks={tasks} onTaskClick={vi.fn()} />);
		// Two SVG <g> nodes with role="button"
		const nodes = container.querySelectorAll("g[role='button']");
		expect(nodes.length).toBe(2);
	});

	it("completed task node has green color class", () => {
		const tasks = [makeTask({ taskId: "t1", status: "completed" })];
		const { container } = render(<TaskGraph tasks={tasks} onTaskClick={vi.fn()} />);
		// The rect fill for completed is #166534 (green)
		const rects = container.querySelectorAll("rect");
		const fills = Array.from(rects).map((r) => r.getAttribute("fill"));
		expect(fills).toContain("#166534");
	});

	it("failed task node has red color class", () => {
		const tasks = [makeTask({ taskId: "t1", status: "failed" })];
		const { container } = render(<TaskGraph tasks={tasks} onTaskClick={vi.fn()} />);
		const rects = container.querySelectorAll("rect");
		const fills = Array.from(rects).map((r) => r.getAttribute("fill"));
		expect(fills).toContain("#7f1d1d");
	});

	it("clicking a node calls onTaskClick with correct taskId", () => {
		const onTaskClick = vi.fn();
		const tasks = [makeTask({ taskId: "task-abc" })];
		const { container } = render(<TaskGraph tasks={tasks} onTaskClick={onTaskClick} />);
		const node = container.querySelector("g[role='button']") as SVGGElement;
		fireEvent.click(node);
		expect(onTaskClick).toHaveBeenCalledWith("task-abc");
	});

	it("renders loading skeleton when tasks is empty array", () => {
		const { container } = render(<TaskGraph tasks={[]} onTaskClick={vi.fn()} />);
		// Shows skeleton divs with animate-pulse
		const skeletons = container.querySelectorAll(".animate-pulse");
		expect(skeletons.length).toBeGreaterThan(0);
	});
});
