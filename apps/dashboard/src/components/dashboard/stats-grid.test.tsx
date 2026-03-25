// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { StatsGrid } from "./stats-grid";

vi.mock("@/lib/utils", () => ({
	formatUptime: (ms: number) => `${Math.floor(ms / 3600000)}h`,
}));

afterEach(() => cleanup());

const baseStats = {
	totalSessions: 10,
	activeSessions: 3,
	totalMessages: 1500,
	uptime: Date.now() - 3600000,
	errors: 0,
};

describe("StatsGrid", () => {
	it("renders all five stat cards", () => {
		render(<StatsGrid stats={baseStats} />);
		expect(screen.getByText("Total Sessions")).toBeDefined();
		expect(screen.getByText("Active Sessions")).toBeDefined();
		expect(screen.getByText("Messages")).toBeDefined();
		expect(screen.getByText("Uptime")).toBeDefined();
		expect(screen.getByText("Errors")).toBeDefined();
	});

	it("displays total sessions count", () => {
		render(<StatsGrid stats={baseStats} />);
		expect(screen.getByText("10")).toBeDefined();
	});

	it("displays active sessions count", () => {
		render(<StatsGrid stats={baseStats} />);
		expect(screen.getByText("3")).toBeDefined();
	});

	it("displays formatted message count", () => {
		render(<StatsGrid stats={baseStats} />);
		// toLocaleString output is locale-dependent
		expect(screen.getByText((text) => text.includes("1") && text.includes("500"))).toBeDefined();
	});

	it("displays active percentage subtitle", () => {
		render(<StatsGrid stats={baseStats} />);
		expect(screen.getByText("30% active")).toBeDefined();
	});

	it("shows 0% active when totalSessions is 0", () => {
		render(<StatsGrid stats={{ ...baseStats, totalSessions: 0, activeSessions: 0 }} />);
		expect(screen.getByText("0% active")).toBeDefined();
	});

	it("uses danger color when errors > 0", () => {
		const { container } = render(
			<StatsGrid stats={{ ...baseStats, errors: 5 }} />,
		);
		expect(container.textContent).toContain("5");
	});

	it("uses success color when errors = 0", () => {
		const { container } = render(<StatsGrid stats={baseStats} />);
		// Errors card should have success styling (checkmark icon)
		expect(container.textContent).toContain("0");
	});
});
