import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("@/lib/config", () => ({
	config: { memoryDir: "/mock/memory" },
}));

vi.mock("@/lib/paths", () => ({
	resolveWithin: vi.fn((base: string, rel: string) => `${base}/${rel}`),
}));

vi.mock("node:fs", () => ({
	existsSync: vi.fn(() => true),
	lstat: vi.fn(),
	readdir: vi.fn(),
	readFile: vi.fn(),
	realpath: vi.fn(),
	stat: vi.fn(),
}));

describe("docs-knowledge", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("listDocsRoots", () => {
		it("returns array when memoryDir configured", async () => {
			const { listDocsRoots } = await import("../docs-knowledge");
			const result = listDocsRoots();
			expect(Array.isArray(result)).toBe(true);
		});
	});

	describe("isDocsPathAllowed", () => {
		it("returns false for empty path", async () => {
			const { isDocsPathAllowed } = await import("../docs-knowledge");
			expect(isDocsPathAllowed("")).toBe(false);
		});
	});
});
