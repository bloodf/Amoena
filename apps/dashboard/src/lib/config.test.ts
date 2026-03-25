import os from "node:os";
import path from "node:path";
import { beforeEach, describe, expect, it, vi } from "vitest";

async function loadConfigWithEnv(env: Record<string, string | undefined>) {
	vi.resetModules();

	const original = {
		AMOENA_DATA_DIR: process.env.AMOENA_DATA_DIR,
		AMOENA_BUILD_DATA_DIR: process.env.AMOENA_BUILD_DATA_DIR,
		AMOENA_BUILD_DB_PATH: process.env.AMOENA_BUILD_DB_PATH,
		AMOENA_BUILD_TOKENS_PATH: process.env.AMOENA_BUILD_TOKENS_PATH,
		AMOENA_DB_PATH: process.env.AMOENA_DB_PATH,
		AMOENA_TOKENS_PATH: process.env.AMOENA_TOKENS_PATH,
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

	if (original.AMOENA_DATA_DIR === undefined)
		delete process.env.AMOENA_DATA_DIR;
	else process.env.AMOENA_DATA_DIR = original.AMOENA_DATA_DIR;

	if (original.AMOENA_BUILD_DATA_DIR === undefined)
		delete process.env.AMOENA_BUILD_DATA_DIR;
	else process.env.AMOENA_BUILD_DATA_DIR = original.AMOENA_BUILD_DATA_DIR;

	if (original.AMOENA_BUILD_DB_PATH === undefined)
		delete process.env.AMOENA_BUILD_DB_PATH;
	else process.env.AMOENA_BUILD_DB_PATH = original.AMOENA_BUILD_DB_PATH;

	if (original.AMOENA_BUILD_TOKENS_PATH === undefined)
		delete process.env.AMOENA_BUILD_TOKENS_PATH;
	else
		process.env.AMOENA_BUILD_TOKENS_PATH = original.AMOENA_BUILD_TOKENS_PATH;

	if (original.AMOENA_DB_PATH === undefined)
		delete process.env.AMOENA_DB_PATH;
	else process.env.AMOENA_DB_PATH = original.AMOENA_DB_PATH;

	if (original.AMOENA_TOKENS_PATH === undefined)
		delete process.env.AMOENA_TOKENS_PATH;
	else process.env.AMOENA_TOKENS_PATH = original.AMOENA_TOKENS_PATH;

	if (original.NEXT_PHASE === undefined) delete process.env.NEXT_PHASE;
	else process.env.NEXT_PHASE = original.NEXT_PHASE;

	return mod.config;
}

describe("config data paths", () => {
	beforeEach(() => {
		vi.resetModules();
	});

	it("derives db and token paths from AMOENA_DATA_DIR", async () => {
		const config = await loadConfigWithEnv({
			AMOENA_DATA_DIR: "/tmp/amoena-data",
			AMOENA_DB_PATH: undefined,
			AMOENA_TOKENS_PATH: undefined,
		});

		expect(config.dataDir).toBe("/tmp/amoena-data");
		expect(config.dbPath).toBe("/tmp/amoena-data/amoena.db");
		expect(config.tokensPath).toBe("/tmp/amoena-data/amoena-tokens.json");
	});

	it("respects explicit db and token path overrides", async () => {
		const config = await loadConfigWithEnv({
			AMOENA_DATA_DIR: "/tmp/amoena-data",
			AMOENA_DB_PATH: "/tmp/custom.db",
			AMOENA_TOKENS_PATH: "/tmp/custom-tokens.json",
		});

		expect(config.dataDir).toBe("/tmp/amoena-data");
		expect(config.dbPath).toBe("/tmp/custom.db");
		expect(config.tokensPath).toBe("/tmp/custom-tokens.json");
	});

	it("uses a build-scoped worker data dir during next build", async () => {
		const config = await loadConfigWithEnv({
			NEXT_PHASE: "phase-production-build",
			AMOENA_DATA_DIR: "/tmp/runtime-data",
			AMOENA_BUILD_DATA_DIR: "/tmp/build-scratch",
			AMOENA_DB_PATH: undefined,
			AMOENA_TOKENS_PATH: undefined,
		});

		expect(config.dataDir).toMatch(/^\/tmp\/build-scratch\/worker-\d+$/);
		expect(config.dbPath).toMatch(
			/^\/tmp\/build-scratch\/worker-\d+\/amoena\.db$/,
		);
		expect(config.tokensPath).toMatch(
			/^\/tmp\/build-scratch\/worker-\d+\/amoena-tokens\.json$/,
		);
	});

	it("prefers build-specific db and token overrides during next build", async () => {
		const config = await loadConfigWithEnv({
			NEXT_PHASE: "phase-production-build",
			AMOENA_DATA_DIR: "/tmp/runtime-data",
			AMOENA_DB_PATH: "/tmp/runtime.db",
			AMOENA_TOKENS_PATH: "/tmp/runtime-tokens.json",
			AMOENA_BUILD_DB_PATH: "/tmp/build.db",
			AMOENA_BUILD_TOKENS_PATH: "/tmp/build-tokens.json",
		});

		const expectedBuildRoot = path.join(os.tmpdir(), "amoena-build");
		expect(config.dataDir).toMatch(
			new RegExp(
				`^${expectedBuildRoot.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}/worker-\\d+$`,
			),
		);
		expect(config.dbPath).toBe("/tmp/build.db");
		expect(config.tokensPath).toBe("/tmp/build-tokens.json");
	});
});
