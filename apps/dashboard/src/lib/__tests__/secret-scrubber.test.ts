import { describe, expect, it } from "vitest";
import { containsSecrets, scrubReport, scrubSecrets } from "../secret-scrubber";
import type { RunReport } from "../run-reporter";

describe("scrubSecrets", () => {
	it("scrubs Anthropic API key (sk-ant-...)", () => {
		const result = scrubSecrets("my key is sk-ant-abc123def456ghi789jkl012mno");
		expect(result.text).not.toContain("sk-ant-");
		expect(result.text).toContain("[REDACTED]");
		expect(result.redactedCount).toBeGreaterThan(0);
	});

	it("scrubs OpenAI API key (sk-...)", () => {
		const result = scrubSecrets("key: sk-1234567890abcdefghijklmnop");
		expect(result.text).not.toContain("sk-1234567890");
		expect(result.redactedCount).toBeGreaterThan(0);
	});

	it("scrubs GitHub token (ghp_...)", () => {
		const result = scrubSecrets("token: ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx12345");
		expect(result.text).not.toContain("ghp_");
		expect(result.redactedCount).toBeGreaterThan(0);
	});

	it("scrubs bearer token", () => {
		const result = scrubSecrets("Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9abc");
		expect(result.text).not.toContain("eyJhbGci");
		expect(result.redactedCount).toBeGreaterThan(0);
	});

	it("scrubs connection string", () => {
		const result = scrubSecrets("DB: postgres://user:pass@localhost/mydb");
		expect(result.text).not.toContain("postgres://");
		expect(result.redactedCount).toBeGreaterThan(0);
	});

	it("scrubs PEM private key", () => {
		const pem = `-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC7
-----END PRIVATE KEY-----`;
		const result = scrubSecrets(pem);
		expect(result.text).not.toContain("BEGIN PRIVATE KEY");
		expect(result.redactedCount).toBeGreaterThan(0);
		expect(result.redactedTypes).toContain("private_key");
	});

	it("scrubs AWS access key", () => {
		const result = scrubSecrets("AWS key: AKIAIOSFODNN7EXAMPLE");
		expect(result.text).not.toContain("AKIAIOSFODNN7EXAMPLE");
		expect(result.redactedCount).toBeGreaterThan(0);
		expect(result.redactedTypes).toContain("aws_key");
	});

	it("scrubs Google API key (AIza...)", () => {
		const result = scrubSecrets("google: AIzaSyD1234567890abcdefghijklmnopqrstuvwxy");
		expect(result.text).not.toContain("AIzaSy");
		expect(result.redactedCount).toBeGreaterThan(0);
	});

	it("scrubs generic key=value secrets", () => {
		const result = scrubSecrets("password=supersecret123abc");
		expect(result.text).not.toContain("supersecret123abc");
		expect(result.redactedCount).toBeGreaterThan(0);
	});

	it("handles multiple secrets in one string", () => {
		const text = "key sk-ant-abc123def456ghi789jkl012mno and AKIAIOSFODNN7EXAMPLE here";
		const result = scrubSecrets(text);
		expect(result.text).not.toContain("sk-ant-");
		expect(result.text).not.toContain("AKIAIOSFODNN7EXAMPLE");
		expect(result.redactedCount).toBeGreaterThanOrEqual(2);
	});

	it("returns correct redactedCount", () => {
		const result = scrubSecrets("nothing secret here at all just normal text okay");
		expect(result.redactedCount).toBe(0);
	});

	it("returns correct redactedTypes (deduplicated)", () => {
		const text =
			"AKIAIOSFODNN7EXAMPLE and AKIAJSIE62ASDFAS8TEST are two aws keys";
		const result = scrubSecrets(text);
		const awsTypes = result.redactedTypes.filter((t) => t === "aws_key");
		expect(awsTypes).toHaveLength(1); // deduplicated
	});

	it("showLengthHint produces '[REDACTED:Nchars]'", () => {
		const key = "AKIAIOSFODNN7EXAMPLE";
		const result = scrubSecrets(key, { showLengthHint: true });
		expect(result.text).toMatch(/\[REDACTED:\d+chars\]/);
	});

	it("custom replacement text works", () => {
		const result = scrubSecrets("AKIAIOSFODNN7EXAMPLE", { replacement: "***" });
		expect(result.text).toBe("***");
	});

	it("no false positives on normal text", () => {
		const result = scrubSecrets("Hello world, this is normal text with no secrets.");
		expect(result.redactedCount).toBe(0);
	});

	it("preserves non-secret content unchanged", () => {
		const text = "before AKIAIOSFODNN7EXAMPLE after";
		const result = scrubSecrets(text);
		expect(result.text).toMatch(/^before .+ after$/);
	});
});

describe("scrubReport", () => {
	const baseReport: RunReport = {
		goalId: "goal-123",
		goalDescription: "Fix bug with token sk-ant-abc123def456ghi789jkl012mno embedded",
		generatedAt: 1000,
		runStatus: "completed",
		startedAt: 900,
		completedAt: 1000,
		totalDurationMs: 100000,
		costSummary: { totalUsd: 0.05, byAgent: {}, byTaskType: {} },
		taskBreakdown: [
			{
				taskId: "task-1",
				description: "Task with secret sk-ant-abc123def456ghi789jkl012mno inside",
				taskType: "implementation",
				complexity: "medium",
				status: "completed",
				agentType: "claude-code",
				routingReason: "matrix:implementation/medium→claude-code",
				whyThisAgent: "Normal routing",
				attemptCount: 1,
				durationMs: 5000,
				inputTokens: 100,
				outputTokens: 200,
				costUsd: 0.01,
				errorMessage: "Error: password=secretabc123",
			},
		],
		agentSummary: [],
		routingInsights: [
			{
				taskId: "task-1",
				decision: "matrix",
				explanation: "Explanation with token=mytoken12345",
				couldImprove: false,
				improvementHint: "",
			},
		],
		mergeInfo: null,
		issues: [
			{ severity: "warning", taskId: null, message: "Secret api_key=abc123def456" },
		],
	};

	it("scrubs goalDescription", () => {
		const { report } = scrubReport(baseReport);
		expect(report.goalDescription).not.toContain("sk-ant-");
	});

	it("scrubs taskBreakdown[].description", () => {
		const { report } = scrubReport(baseReport);
		expect(report.taskBreakdown[0].description).not.toContain("sk-ant-");
	});

	it("scrubs taskBreakdown[].errorMessage", () => {
		const { report } = scrubReport(baseReport);
		expect(report.taskBreakdown[0].errorMessage).not.toContain("secretabc123");
	});

	it("does NOT scrub taskId, status, numeric fields", () => {
		const { report } = scrubReport(baseReport);
		expect(report.taskBreakdown[0].taskId).toBe("task-1");
		expect(report.taskBreakdown[0].status).toBe("completed");
		expect(report.taskBreakdown[0].inputTokens).toBe(100);
		expect(report.taskBreakdown[0].outputTokens).toBe(200);
	});

	it("returns totalRedacted count", () => {
		const { totalRedacted } = scrubReport(baseReport);
		expect(totalRedacted).toBeGreaterThan(0);
	});
});

describe("containsSecrets", () => {
	it("returns true for text with secrets", () => {
		expect(containsSecrets("token: sk-ant-abc123def456ghi789jkl012mno")).toBe(true);
		expect(containsSecrets("AKIAIOSFODNN7EXAMPLE")).toBe(true);
	});

	it("returns false for clean text", () => {
		expect(containsSecrets("Hello, this is normal text without secrets.")).toBe(false);
	});
});
