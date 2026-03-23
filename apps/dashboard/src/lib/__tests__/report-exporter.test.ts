import { describe, expect, it } from "vitest";
import { exportReport } from "../report-exporter";
import type { RunReport } from "../run-reporter";

const baseReport: RunReport = {
	goalId: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
	goalDescription: "Test goal description",
	generatedAt: 1700000000000,
	runStatus: "completed",
	startedAt: 1699999900,
	completedAt: 1700000000,
	totalDurationMs: 100000,
	costSummary: {
		totalUsd: 0.05,
		byAgent: { "claude-code": 0.05 },
		byTaskType: { implementation: 0.05 },
	},
	taskBreakdown: [
		{
			taskId: "task-abc",
			description: "Implement the feature",
			taskType: "implementation",
			complexity: "medium",
			status: "completed",
			agentType: "claude-code",
			routingReason: "matrix:implementation/medium→claude-code",
			whyThisAgent: "Best for implementation",
			attemptCount: 1,
			durationMs: 50000,
			inputTokens: 1000,
			outputTokens: 500,
			costUsd: 0.05,
			errorMessage: null,
		},
	],
	agentSummary: [
		{
			agentType: "claude-code",
			tasksAssigned: 1,
			tasksCompleted: 1,
			tasksFailed: 0,
			totalDurationMs: 50000,
			totalCostUsd: 0.05,
			avgDurationMs: 50000,
			successRate: 1,
		},
	],
	routingInsights: [
		{
			taskId: "task-abc",
			decision: "matrix",
			explanation: "Assigned via matrix",
			couldImprove: false,
			improvementHint: "",
		},
	],
	mergeInfo: null,
	issues: [],
};

const reportWithSecret: RunReport = {
	...baseReport,
	taskBreakdown: [
		{
			...baseReport.taskBreakdown[0],
			description: "Task sk-ant-test123456789abcdefghijklmnop123",
		},
	],
};

describe("exportReport", () => {
	it("HTML format returns valid HTML string", () => {
		const result = exportReport(baseReport, { format: "html" });
		expect(result.content).toContain("<!DOCTYPE html>");
		expect(result.content).toContain("</html>");
	});

	it("HTML contains goal description", () => {
		const result = exportReport(baseReport, { format: "html" });
		expect(result.content).toContain("Test goal description");
	});

	it("HTML scrubs secrets by default", () => {
		const result = exportReport(reportWithSecret, { format: "html" });
		expect(result.content).not.toContain("sk-ant-test123456789");
		expect(result.content).toContain("[REDACTED]");
		expect(result.secretsRedacted).toBeGreaterThan(0);
	});

	it("Markdown format starts with '# Mission Control'", () => {
		const result = exportReport(baseReport, { format: "markdown" });
		expect(result.content).toMatch(/^# Mission Control/);
	});

	it("JSON format is valid parseable JSON", () => {
		const result = exportReport(baseReport, { format: "json" });
		expect(() => JSON.parse(result.content)).not.toThrow();
	});

	it("filename follows expected pattern", () => {
		const result = exportReport(baseReport, { format: "html" });
		expect(result.filename).toMatch(/^lunaria-report-a1b2c3d4-\d{4}-\d{2}-\d{2}\.html$/);
	});

	it("mimeType is correct per format", () => {
		expect(exportReport(baseReport, { format: "html" }).mimeType).toBe("text/html");
		expect(exportReport(baseReport, { format: "markdown" }).mimeType).toBe("text/markdown");
		expect(exportReport(baseReport, { format: "json" }).mimeType).toBe("application/json");
	});

	it("scrubSecrets=false skips scrubbing", () => {
		const result = exportReport(reportWithSecret, {
			format: "html",
			scrubSecrets: false,
		});
		expect(result.secretsRedacted).toBe(0);
		expect(result.content).toContain("sk-ant-test123456789abcdefghijklmnop123");
	});
});
