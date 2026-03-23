// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { StreakMilestone } from "../../../../../lib/stats-queries";
import { MilestoneToast } from "../MilestoneToast";

vi.mock("next-intl", () => ({
	useTranslations: () => (key: string) => key,
}));

afterEach(() => {
	cleanup();
	vi.useRealTimers();
});

const milestone: StreakMilestone = {
	count: 5,
	achievedAt: Math.floor(Date.now() / 1000),
	label: "First Five",
};

describe("MilestoneToast", () => {
	it("renders milestone name and icon", () => {
		render(<MilestoneToast milestone={milestone} onDismiss={vi.fn()} />);
		expect(screen.getByText("First Five")).toBeDefined();
		expect(screen.getByRole("alert")).toBeDefined();
	});

	it("renders the icon for the milestone", () => {
		render(<MilestoneToast milestone={milestone} onDismiss={vi.fn()} />);
		expect(document.body.textContent).toContain("⭐");
	});

	it("auto-dismisses after 5 seconds", async () => {
		vi.useFakeTimers();
		const onDismiss = vi.fn();
		render(<MilestoneToast milestone={milestone} onDismiss={onDismiss} />);

		expect(screen.getByRole("alert")).toBeDefined();

		await act(async () => {
			vi.advanceTimersByTime(5000);
		});

		expect(onDismiss).toHaveBeenCalledOnce();
	});

	it("dismisses immediately on click", () => {
		const onDismiss = vi.fn();
		render(<MilestoneToast milestone={milestone} onDismiss={onDismiss} />);
		fireEvent.click(screen.getByRole("alert"));
		expect(onDismiss).toHaveBeenCalledOnce();
	});

	it("has role=alert for accessibility", () => {
		render(<MilestoneToast milestone={milestone} onDismiss={vi.fn()} />);
		const alert = screen.getByRole("alert");
		expect(alert).toBeDefined();
	});
});
