import { describe, expect, it, vi } from "vitest";

vi.mock("node:fs", async () => {
	const actual = await vi.importActual<typeof import("node:fs")>("node:fs");
	return {
		...actual,
		existsSync: vi.fn(() => false),
		readFileSync: vi.fn(() => ""),
	};
});

describe("transcript-parser", () => {
	it("parseJsonlTranscript parses valid JSONL messages", async () => {
		const { parseJsonlTranscript } = await import("@/lib/transcript-parser");
		const jsonl = [
			JSON.stringify({ type: "message", message: { role: "user", content: "hello" } }),
			JSON.stringify({ type: "message", message: { role: "assistant", content: "hi there" } }),
		].join("\n");

		const result = parseJsonlTranscript(jsonl, 100);
		expect(result.length).toBe(2);
		expect(result[0].role).toBe("user");
		expect(result[1].role).toBe("assistant");
	});

	it("parseJsonlTranscript handles empty input", async () => {
		const { parseJsonlTranscript } = await import("@/lib/transcript-parser");
		const result = parseJsonlTranscript("", 100);
		expect(result).toEqual([]);
	});

	it("parseJsonlTranscript skips non-message entries", async () => {
		const { parseJsonlTranscript } = await import("@/lib/transcript-parser");
		const jsonl = [
			JSON.stringify({ type: "message", message: { role: "user", content: "hello" } }),
			JSON.stringify({ type: "system", data: "ignored" }),
			JSON.stringify({ type: "message", message: { role: "assistant", content: "hi" } }),
		].join("\n");

		const result = parseJsonlTranscript(jsonl, 100);
		expect(result.length).toBe(2);
	});

	it("parseJsonlTranscript respects limit", async () => {
		const { parseJsonlTranscript } = await import("@/lib/transcript-parser");
		const lines = Array.from({ length: 10 }, (_, i) =>
			JSON.stringify({ type: "message", message: { role: "user", content: `msg ${i}` } }),
		).join("\n");

		const result = parseJsonlTranscript(lines, 3);
		expect(result.length).toBe(3);
	});

	it("parseGatewayHistoryTranscript handles gateway format", async () => {
		const { parseGatewayHistoryTranscript } = await import("@/lib/transcript-parser");
		const history = [
			{ role: "user", content: "test question" },
			{ role: "assistant", content: [{ type: "text", text: "answer" }] },
		];
		const result = parseGatewayHistoryTranscript(history, 100);
		expect(result.length).toBe(2);
	});
});
