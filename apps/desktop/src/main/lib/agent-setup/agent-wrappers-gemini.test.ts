import { afterEach, beforeEach, describe, expect, it, mock } from "bun:test";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import * as realOs from "node:os";
import path from "node:path";

const TEST_ROOT = path.join(
	realOs.tmpdir(),
	`amoena-gemini-test-${process.pid}-${Date.now()}`,
);
const TEST_HOOKS_DIR = path.join(TEST_ROOT, "amoena", "hooks");
const TEST_BIN_DIR = path.join(TEST_ROOT, "amoena", "bin");
let mockedHomeDir = path.join(TEST_ROOT, "home");

mock.module("shared/env.shared", () => ({
	env: { DESKTOP_NOTIFICATIONS_PORT: 7777 },
	getWorkspaceName: () => undefined,
}));

mock.module("./paths", () => ({
	BIN_DIR: TEST_BIN_DIR,
	HOOKS_DIR: TEST_HOOKS_DIR,
}));

mock.module("./agent-wrappers-common", () => ({
	buildWrapperScript: mock((name: string, exec: string) => `#!/bin/bash\n${exec}`),
	createWrapper: mock(() => {}),
	isAmoenaManagedHookCommand: mock(() => false),
	reconcileManagedEntries: mock(
		({
			current,
			desired,
		}: {
			current: unknown[] | undefined;
			desired: unknown[];
			isManaged: (e: unknown) => boolean;
			isEquivalent: (a: unknown, b: unknown) => boolean;
		}) => ({
			entries: [...(current || []), ...desired],
			replacedManagedEntries: [],
		}),
	),
	writeFileIfChanged: mock(() => true),
}));

mock.module("node:os", () => ({
	...realOs,
	homedir: () => mockedHomeDir,
}));

// Create a template file for getGeminiHookScriptContent
const TEMPLATES_DIR = path.join(TEST_ROOT, "templates");

const {
	getGeminiHookScriptPath,
	getGeminiSettingsJsonPath,
	getGeminiSettingsJsonContent,
	GEMINI_HOOK_MARKER,
	GEMINI_HOOK_SCRIPT_NAME,
} = await import("./agent-wrappers-gemini");

describe("agent-wrappers-gemini", () => {
	beforeEach(() => {
		mkdirSync(TEST_HOOKS_DIR, { recursive: true });
		mkdirSync(TEST_BIN_DIR, { recursive: true });
		mkdirSync(path.join(mockedHomeDir, ".gemini"), { recursive: true });
	});

	afterEach(() => {
		rmSync(TEST_ROOT, { recursive: true, force: true });
	});

	describe("getGeminiHookScriptPath", () => {
		it("returns path under HOOKS_DIR", () => {
			const p = getGeminiHookScriptPath();
			expect(p).toContain(GEMINI_HOOK_SCRIPT_NAME);
			expect(p).toContain("hooks");
		});
	});

	describe("getGeminiSettingsJsonPath", () => {
		it("returns path under ~/.gemini/", () => {
			const p = getGeminiSettingsJsonPath();
			expect(p).toContain(".gemini");
			expect(p).toContain("settings.json");
		});
	});

	describe("getGeminiSettingsJsonContent", () => {
		it("returns JSON with BeforeAgent, AfterAgent, AfterTool hooks", () => {
			const content = getGeminiSettingsJsonContent(
				path.join(TEST_HOOKS_DIR, "gemini-hook.sh"),
			);
			const parsed = JSON.parse(content);
			expect(parsed.hooks).toBeDefined();
			expect(parsed.hooks.BeforeAgent).toBeArray();
			expect(parsed.hooks.AfterAgent).toBeArray();
			expect(parsed.hooks.AfterTool).toBeArray();
		});

		it("preserves existing settings", () => {
			const settingsPath = getGeminiSettingsJsonPath();
			writeFileSync(
				settingsPath,
				JSON.stringify({ customSetting: true, hooks: {} }),
			);
			const content = getGeminiSettingsJsonContent(
				path.join(TEST_HOOKS_DIR, "gemini-hook.sh"),
			);
			const parsed = JSON.parse(content);
			expect(parsed.customSetting).toBe(true);
		});
	});

	describe("GEMINI_HOOK_MARKER", () => {
		it("contains signature and version", () => {
			expect(GEMINI_HOOK_MARKER).toContain("Amoena gemini hook");
		});
	});
});
