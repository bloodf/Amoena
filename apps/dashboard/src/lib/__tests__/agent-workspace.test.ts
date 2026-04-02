import { describe, expect, it, vi, beforeEach } from "vitest";

const mockExistsSync = vi.fn();
const mockReadFileSync = vi.fn();

vi.mock("@/lib/config", () => ({
	config: { amoenaStateDir: "/test/state" },
}));

vi.mock("@/lib/paths", () => ({
	resolveWithin: vi.fn((base: string, rel: string) => `${base}/${rel}`),
}));

vi.mock("node:fs", () => ({
	existsSync: (...args: unknown[]) => mockExistsSync(...args),
	readFileSync: (...args: unknown[]) => mockReadFileSync(...args),
}));

describe("agent-workspace", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockExistsSync.mockReturnValue(true);
	});

	describe("getAgentWorkspaceCandidates", () => {
		it("returns absolute paths unchanged", async () => {
			const { getAgentWorkspaceCandidates } = await import("../agent-workspace");
			const result = getAgentWorkspaceCandidates({ workspace: "/absolute/path" }, "test-agent");
			expect(result.some(p => p.includes("/absolute/path"))).toBe(true);
		});

		it("generates candidates from agent config workspace string", async () => {
			const { getAgentWorkspaceCandidates } = await import("../agent-workspace");
			const result = getAgentWorkspaceCandidates({ workspace: "my-workspace" }, "test-agent");
			expect(result.length).toBeGreaterThan(0);
		});

		it("filters out non-existent paths when existsSync returns false", async () => {
			mockExistsSync.mockReturnValue(false);
			const { getAgentWorkspaceCandidates } = await import("../agent-workspace");
			const result = getAgentWorkspaceCandidates({}, "test-agent");
			expect(result).toEqual([]);
		});
	});

	describe("readAgentWorkspaceFile", () => {
		it("returns exists:false when no files found", async () => {
			mockExistsSync.mockReturnValue(false);
			const { readAgentWorkspaceFile } = await import("../agent-workspace");
			const result = readAgentWorkspaceFile(["/workspace1"], ["file.txt"]);
			expect(result.exists).toBe(false);
			expect(result.content).toBe("");
		});

		it("returns exists:false when workspaceCandidates is empty", async () => {
			const { readAgentWorkspaceFile } = await import("../agent-workspace");
			const result = readAgentWorkspaceFile([], ["file.txt"]);
			expect(result.exists).toBe(false);
		});

		it("returns exists:false when names is empty", async () => {
			const { readAgentWorkspaceFile } = await import("../agent-workspace");
			const result = readAgentWorkspaceFile(["/workspace1"], []);
			expect(result.exists).toBe(false);
		});
	});
});
