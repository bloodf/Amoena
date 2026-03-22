import os from "node:os";
import path from "node:path";
import { beforeEach, describe, expect, it, vi } from "vitest";

async function loadConfigWithEnv(env: Record<string, string | undefined>) {
	vi.resetModules();

	const original = {
		LUNARIA_DATA_DIR: process.env.LUNARIA_DATA_DIR,
		LUNARIA_BUILD_DATA_DIR: process.env.LUNARIA_BUILD_DATA_DIR,
		LUNARIA_BUILD_DB_PATH: process.env.LUNARIA_BUILD_DB_PATH,
		LUNARIA_BUILD_TOKENS_PATH: process.env.LUNARIA_BUILD_TOKENS_PATH,
		LUNARIA_DB_PATH: process.env.LUNARIA_DB_PATH,
		LUNARIA_TOKENS_PATH: process.env.LUNARIA_TOKENS_PATH,
		NEXT_PHASE: process.env.NEXT_PHASE,
	};

	for (const [key, value] of Object.entries(env)) {
		if (value === undefined) {
			delete process.env[key];
		} else {
			process.env[key] = value;
		}
	}

	const mod = await import("./config");

	if (original.LUNARIA_DATA_DIR === undefined)
		delete process.env.LUNARIA_DATA_DIR;
	else process.env.LUNARIA_DATA_DIR = original.LUNARIA_DATA_DIR;

	if (original.LUNARIA_BUILD_DATA_DIR === undefined)
		delete process.env.LUNARIA_BUILD_DATA_DIR;
	else process.env.LUNARIA_BUILD_DATA_DIR = original.LUNARIA_BUILD_DATA_DIR;

	if (original.LUNARIA_BUILD_DB_PATH === undefined)
		delete process.env.LUNARIA_BUILD_DB_PATH;
	else process.env.LUNARIA_BUILD_DB_PATH = original.LUNARIA_BUILD_DB_PATH;

	if (original.LUNARIA_BUILD_TOKENS_PATH === undefined)
		delete process.env.LUNARIA_BUILD_TOKENS_PATH;
	else
		process.env.LUNARIA_BUILD_TOKENS_PATH = original.LUNARIA_BUILD_TOKENS_PATH;

	if (original.LUNARIA_DB_PATH === undefined)
		delete process.env.LUNARIA_DB_PATH;
	else process.env.LUNARIA_DB_PATH = original.LUNARIA_DB_PATH;

	if (original.LUNARIA_TOKENS_PATH === undefined)
		delete process.env.LUNARIA_TOKENS_PATH;
	else process.env.LUNARIA_TOKENS_PATH = original.LUNARIA_TOKENS_PATH;

	if (original.NEXT_PHASE === undefined) delete process.env.NEXT_PHASE;
	else process.env.NEXT_PHASE = original.NEXT_PHASE;

	return mod.config;
}

describe("config data paths", () => {
	beforeEach(() => {
		vi.resetModules();
	});

	it("derives db and token paths from LUNARIA_DATA_DIR", async () => {
		const config = await loadConfigWithEnv({
			LUNARIA_DATA_DIR: "/tmp/lunaria-data",
			LUNARIA_DB_PATH: undefined,
			LUNARIA_TOKENS_PATH: undefined,
		});

		expect(config.dataDir).toBe("/tmp/lunaria-data");
		expect(config.dbPath).toBe("/tmp/lunaria-data/lunaria.db");
		expect(config.tokensPath).toBe("/tmp/lunaria-data/lunaria-tokens.json");
	});

	it("respects explicit db and token path overrides", async () => {
		const config = await loadConfigWithEnv({
			LUNARIA_DATA_DIR: "/tmp/lunaria-data",
			LUNARIA_DB_PATH: "/tmp/custom.db",
			LUNARIA_TOKENS_PATH: "/tmp/custom-tokens.json",
		});

		expect(config.dataDir).toBe("/tmp/lunaria-data");
		expect(config.dbPath).toBe("/tmp/custom.db");
		expect(config.tokensPath).toBe("/tmp/custom-tokens.json");
	});

	it("uses a build-scoped worker data dir during next build", async () => {
		const config = await loadConfigWithEnv({
			NEXT_PHASE: "phase-production-build",
			LUNARIA_DATA_DIR: "/tmp/runtime-data",
			LUNARIA_BUILD_DATA_DIR: "/tmp/build-scratch",
			LUNARIA_DB_PATH: undefined,
			LUNARIA_TOKENS_PATH: undefined,
		});

		expect(config.dataDir).toMatch(/^\/tmp\/build-scratch\/worker-\d+$/);
		expect(config.dbPath).toMatch(
			/^\/tmp\/build-scratch\/worker-\d+\/lunaria\.db$/,
		);
		expect(config.tokensPath).toMatch(
			/^\/tmp\/build-scratch\/worker-\d+\/lunaria-tokens\.json$/,
		);
	});

	it("prefers build-specific db and token overrides during next build", async () => {
		const config = await loadConfigWithEnv({
			NEXT_PHASE: "phase-production-build",
			LUNARIA_DATA_DIR: "/tmp/runtime-data",
			LUNARIA_DB_PATH: "/tmp/runtime.db",
			LUNARIA_TOKENS_PATH: "/tmp/runtime-tokens.json",
			LUNARIA_BUILD_DB_PATH: "/tmp/build.db",
			LUNARIA_BUILD_TOKENS_PATH: "/tmp/build-tokens.json",
		});

		const expectedBuildRoot = path.join(os.tmpdir(), "lunaria-build");
		expect(config.dataDir).toMatch(
			new RegExp(
				`^${expectedBuildRoot.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}/worker-\\d+$`,
			),
		);
		expect(config.dbPath).toBe("/tmp/build.db");
		expect(config.tokensPath).toBe("/tmp/build-tokens.json");
	});
});
