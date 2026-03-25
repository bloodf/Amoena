import { describe, expect, it } from "vitest";
import { AGENT_COLORS, STATUS_COLORS, GRID, TERMINAL_FONT } from "./tokens";

describe("tokens", () => {
	it("exports TERMINAL_FONT as a font stack string", () => {
		expect(typeof TERMINAL_FONT).toBe("string");
		expect(TERMINAL_FONT).toContain("monospace");
	});

	it("exports GRID as 8", () => {
		expect(GRID).toBe(8);
	});

	it("exports agent colors for known agent types", () => {
		expect(AGENT_COLORS["claude-code"]).toBe("#FF6B35");
		expect(AGENT_COLORS.codex).toBe("#00C853");
		expect(AGENT_COLORS.gemini).toBe("#2196F3");
		expect(AGENT_COLORS.unknown).toBe("#9E9E9E");
	});

	it("exports status colors for all statuses", () => {
		expect(STATUS_COLORS.completed).toContain("green");
		expect(STATUS_COLORS.failed).toContain("red");
		expect(STATUS_COLORS.running).toContain("blue");
		expect(STATUS_COLORS.pending).toContain("gray");
		expect(STATUS_COLORS.cancelled).toContain("gray");
		expect(STATUS_COLORS.timed_out).toContain("orange");
	});
});
