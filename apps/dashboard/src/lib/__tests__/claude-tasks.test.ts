import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

const mockGetDatabase = vi.fn();
const mockPrepare = vi.fn(() => ({
	all: vi.fn(() => []),
	get: vi.fn(),
	run: vi.fn(),
	transaction: vi.fn((fn: () => void) => fn()),
}));

vi.mock("@/lib/db", () => ({
	getDatabase: () => mockGetDatabase(),
}));

vi.mock("@/lib/config", () => ({
	config: { claudeHome: "/mock/claude/home" },
}));

vi.mock("@/lib/logger", () => ({
	logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() },
}));

vi.mock("node:fs", () => ({
	createReadStream: vi.fn(),
	readdirSync: vi.fn(() => []),
	statSync: vi.fn(),
}));

describe("claude-tasks", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	describe("scanClaudeCodeTasks", () => {
		it("returns empty result when claudeHome not configured", async () => {
			vi.doMock("@/lib/config", () => ({
				config: { claudeHome: undefined },
			}));
			const { scanClaudeCodeTasks } = await import("../claude-tasks");
			const result = scanClaudeCodeTasks();
			expect(result.teams).toEqual([]);
			expect(result.tasks).toEqual([]);
		});
	});

	describe("getClaudeCodeTasks", () => {
		it("returns cached result when called within throttle window", async () => {
			vi.useFakeTimers();
			const { getClaudeCodeTasks } = await import("../claude-tasks");
			const result1 = getClaudeCodeTasks();
			const result2 = getClaudeCodeTasks();
			expect(result1).toBe(result2);
		});
	});
});
