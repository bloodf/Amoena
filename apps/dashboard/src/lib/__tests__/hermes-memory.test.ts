import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/config", () => ({
	config: { homeDir: "/tmp/test-home" },
}));

vi.mock("@/lib/logger", () => ({
	logger: { info: vi.fn(), error: vi.fn(), warn: vi.fn(), debug: vi.fn() },
}));

vi.mock("node:fs", async () => {
	const actual = await vi.importActual<typeof import("node:fs")>("node:fs");
	return {
		...actual,
		existsSync: vi.fn(() => false),
		readFileSync: vi.fn(() => ""),
	};
});

describe("hermes-memory", () => {
	it("returns nulls when memory files do not exist", async () => {
		const { getHermesMemory } = await import("@/lib/hermes-memory");
		const result = getHermesMemory();
		expect(result.agentMemory).toBeNull();
		expect(result.userMemory).toBeNull();
		expect(result.agentMemorySize).toBe(0);
		expect(result.userMemorySize).toBe(0);
		expect(result.agentMemoryEntries).toBe(0);
		expect(result.userMemoryEntries).toBe(0);
	});

	it("reads memory files when they exist", async () => {
		const fs = await import("node:fs");
		vi.mocked(fs.existsSync).mockReturnValue(true);
		vi.mocked(fs.readFileSync).mockReturnValue("§ Entry 1\nContent\n§ Entry 2\nMore content");

		vi.resetModules();
		const { getHermesMemory } = await import("@/lib/hermes-memory");
		const result = getHermesMemory();
		expect(result.agentMemory).toBeTruthy();
		expect(result.agentMemoryEntries).toBe(2);
		expect(result.agentMemorySize).toBeGreaterThan(0);
	});
});
