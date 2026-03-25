import { describe, expect, it, vi } from "vitest";

vi.mock("node:fs", () => ({
	readFileSync: vi.fn(() => "CREATE TABLE test (id INTEGER);"),
}));

describe("migrations", () => {
	it("exports a registerMigrations function", async () => {
		const mod = await import("@/lib/migrations");
		expect(typeof mod.registerMigrations).toBe("function");
	});

	it("exports runMigrations function", async () => {
		const mod = await import("@/lib/migrations");
		expect(typeof mod.runMigrations).toBe("function");
	});

	it("registerMigrations adds custom migrations", async () => {
		const { registerMigrations } = await import("@/lib/migrations");
		const customMigration = { id: "custom_001", up: vi.fn() };
		// Should not throw
		registerMigrations([customMigration]);
	});

	it("runMigrations creates migration table and applies migrations", async () => {
		const { runMigrations } = await import("@/lib/migrations");
		const mockExec = vi.fn();
		const mockGet = vi.fn(() => undefined);
		const mockRun = vi.fn();
		const mockAllFn = vi.fn(() => []);
		const mockTransaction = vi.fn((fn: any) => () => fn());
		const mockDb = {
			exec: mockExec,
			prepare: vi.fn(() => ({ get: mockGet, run: mockRun, all: mockAllFn })),
			transaction: mockTransaction,
		} as any;

		runMigrations(mockDb);
		// Should have called exec at least once for migration table creation
		expect(mockExec).toHaveBeenCalled();
	});
});
