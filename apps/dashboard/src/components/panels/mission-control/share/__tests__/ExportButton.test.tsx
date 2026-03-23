// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ExportButton } from "../ExportButton";
import type { RunReport } from "../../../../../lib/run-reporter";

afterEach(cleanup);

vi.mock("next-intl", () => ({
	useTranslations: () => (key: string) => key,
}));

// Mock localStorage
const localStorageMock = (() => {
	let store: Record<string, string> = {};
	return {
		getItem: (key: string) => store[key] ?? null,
		setItem: (key: string, val: string) => { store[key] = val; },
		removeItem: (key: string) => { delete store[key]; },
		clear: () => { store = {}; },
	};
})();
Object.defineProperty(globalThis, "localStorage", { value: localStorageMock });

// Mock URL.createObjectURL
globalThis.URL.createObjectURL = vi.fn(() => "blob:mock");
globalThis.URL.revokeObjectURL = vi.fn();

const cleanReport: RunReport = {
	goalId: "abc12345-0000-0000-0000-000000000000",
	goalDescription: "Clean report with no secrets",
	generatedAt: 1000,
	runStatus: "completed",
	startedAt: 900,
	completedAt: 1000,
	totalDurationMs: 100000,
	costSummary: { totalUsd: 0.01, byAgent: {}, byTaskType: {} },
	taskBreakdown: [],
	agentSummary: [],
	routingInsights: [],
	mergeInfo: null,
	issues: [],
};

describe("ExportButton", () => {
	it("renders 3 export options when opened", () => {
		render(<ExportButton report={cleanReport} onExport={vi.fn()} />);
		fireEvent.click(screen.getByText("title"));
		expect(screen.getByText("exportHtml")).toBeTruthy();
		expect(screen.getByText("exportMarkdown")).toBeTruthy();
		expect(screen.getByText("exportJson")).toBeTruthy();
	});

	it("clicking option triggers export", () => {
		const onExport = vi.fn();
		// Ensure no skip warning stored
		localStorageMock.clear();
		render(<ExportButton report={cleanReport} onExport={onExport} />);
		fireEvent.click(screen.getByText("title"));
		fireEvent.click(screen.getByText("exportJson"));
		expect(onExport).toHaveBeenCalledTimes(1);
		const result = onExport.mock.calls[0][0];
		expect(result.mimeType).toBe("application/json");
	});
});
