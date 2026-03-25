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
		readFileSync: vi.fn(() => "[]"),
		readdirSync: vi.fn(() => []),
		statSync: vi.fn(() => ({ isDirectory: () => false, isFile: () => false })),
	};
});

describe("hermes-tasks", () => {
	it("exports getHermesTasks function", async () => {
		const mod = await import("@/lib/hermes-tasks");
		expect(typeof mod.getHermesTasks).toBe("function");
	});

	it("returns empty cronJobs when no jobs file exists", async () => {
		const { getHermesTasks } = await import("@/lib/hermes-tasks");
		const result = getHermesTasks(true);
		expect(result.cronJobs).toEqual([]);
	});

	it("parses cron jobs from existing file", async () => {
		const fs = await import("node:fs");
		vi.mocked(fs.existsSync).mockReturnValue(true);
		vi.mocked(fs.readFileSync).mockReturnValue(
			JSON.stringify([
				{ id: "job1", prompt: "test task", schedule: "0 * * * *", enabled: true },
			]),
		);

		vi.resetModules();
		const { getHermesTasks } = await import("@/lib/hermes-tasks");
		const result = getHermesTasks(true);
		expect(result.cronJobs.length).toBe(1);
		expect(result.cronJobs[0].id).toBe("job1");
		expect(result.cronJobs[0].prompt).toBe("test task");
		expect(result.cronJobs[0].enabled).toBe(true);
	});
});
