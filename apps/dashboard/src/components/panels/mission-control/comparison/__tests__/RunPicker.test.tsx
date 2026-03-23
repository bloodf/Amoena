// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { RunSummary } from "../../../../../lib/comparison-queries";
import { RunPicker } from "../RunPicker";

vi.mock("next-intl", () => ({
	useTranslations: () => (key: string) => key,
}));

afterEach(() => cleanup());

const makeRun = (i: number): RunSummary => ({
	goalId: `run-${i}`,
	description: `Goal run number ${i}`,
	status: "completed",
	startedAt: Math.floor(Date.now() / 1000) - i * 86_400,
	completedAt: Math.floor(Date.now() / 1000) - i * 86_400 + 60,
	totalDurationMs: 60_000,
	totalCostUsd: 0.1,
	taskCount: 5,
	completedCount: 5,
	failedCount: 0,
});

const runs = [makeRun(1), makeRun(2), makeRun(3), makeRun(4), makeRun(5), makeRun(6)];

describe("RunPicker", () => {
	it("renders available runs", () => {
		render(
			<RunPicker
				availableRuns={runs.slice(0, 3)}
				selectedIds={[]}
				onSelectionChange={vi.fn()}
			/>,
		);
		expect(screen.getByText(/Goal run number 1/)).toBeDefined();
		expect(screen.getByText(/Goal run number 2/)).toBeDefined();
		expect(screen.getByText(/Goal run number 3/)).toBeDefined();
	});

	it("compare button is disabled with fewer than 2 selections", () => {
		render(
			<RunPicker
				availableRuns={runs}
				selectedIds={["run-1"]}
				onSelectionChange={vi.fn()}
			/>,
		);
		const btn = screen.getByRole("button");
		expect(btn).toBeDefined();
		expect((btn as HTMLButtonElement).disabled).toBe(true);
	});

	it("compare button is enabled with 2+ selections", () => {
		render(
			<RunPicker
				availableRuns={runs}
				selectedIds={["run-1", "run-2"]}
				onSelectionChange={vi.fn()}
			/>,
		);
		const btn = screen.getByRole("button");
		expect((btn as HTMLButtonElement).disabled).toBe(false);
	});

	it("calls onSelectionChange when toggling a run", () => {
		const onChange = vi.fn();
		render(
			<RunPicker
				availableRuns={runs.slice(0, 3)}
				selectedIds={[]}
				onSelectionChange={onChange}
			/>,
		);
		const checkboxes = screen.getAllByRole("checkbox");
		fireEvent.click(checkboxes[0]);
		expect(onChange).toHaveBeenCalledWith(["run-1"]);
	});

	it("does not allow more than maxSelections", () => {
		const onChange = vi.fn();
		// Already have 2 selected, maxSelections=2
		render(
			<RunPicker
				availableRuns={runs.slice(0, 3)}
				selectedIds={["run-1", "run-2"]}
				onSelectionChange={onChange}
				maxSelections={2}
			/>,
		);
		const checkboxes = screen.getAllByRole("checkbox");
		// Third checkbox should be disabled
		expect((checkboxes[2] as HTMLInputElement).disabled).toBe(true);
	});
});
