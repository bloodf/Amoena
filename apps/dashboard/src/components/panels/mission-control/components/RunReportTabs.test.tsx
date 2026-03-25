// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { RunReportTabs } from "./RunReportTabs";

vi.mock("next-intl", () => ({
	useTranslations: () => (key: string) => key,
}));

afterEach(() => cleanup());

describe("RunReportTabs", () => {
	it("renders all five tabs", () => {
		render(<RunReportTabs activeTab="summary" onTabChange={() => {}} />);
		expect(screen.getByText("tabSummary")).toBeDefined();
		expect(screen.getByText("tabTasks")).toBeDefined();
		expect(screen.getByText("tabAgents")).toBeDefined();
		expect(screen.getByText("tabRouting")).toBeDefined();
		expect(screen.getByText("tabRaw")).toBeDefined();
	});

	it("marks active tab with aria-selected", () => {
		render(<RunReportTabs activeTab="tasks" onTabChange={() => {}} />);
		const tasksTab = screen.getByRole("tab", { name: "tabTasks" });
		expect(tasksTab.getAttribute("aria-selected")).toBe("true");
	});

	it("marks inactive tabs with aria-selected false", () => {
		render(<RunReportTabs activeTab="summary" onTabChange={() => {}} />);
		const tasksTab = screen.getByRole("tab", { name: "tabTasks" });
		expect(tasksTab.getAttribute("aria-selected")).toBe("false");
	});

	it("calls onTabChange when tab clicked", () => {
		const onTabChange = vi.fn();
		render(<RunReportTabs activeTab="summary" onTabChange={onTabChange} />);
		fireEvent.click(screen.getByText("tabAgents"));
		expect(onTabChange).toHaveBeenCalledWith("agents");
	});

	it("has tablist role", () => {
		render(<RunReportTabs activeTab="summary" onTabChange={() => {}} />);
		expect(screen.getByRole("tablist")).toBeDefined();
	});

	it("sets aria-controls on each tab", () => {
		render(<RunReportTabs activeTab="summary" onTabChange={() => {}} />);
		const summaryTab = screen.getByRole("tab", { name: "tabSummary" });
		expect(summaryTab.getAttribute("aria-controls")).toBe("tab-panel-summary");
	});
});
