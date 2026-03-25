import { describe, expect, it, mock } from "bun:test";

// Mock electron session
const mockLoadExtension = mock(() => Promise.resolve({ version: "1.0.0" }));
const mockGetExtension = mock(() => null);

mock.module("electron", () => ({
	app: {
		getPath: mock(() => "/tmp/test"),
		getAppPath: mock(() => "/tmp/test"),
		isPackaged: false,
	},
	session: {
		defaultSession: {
			extensions: {
				loadExtension: mockLoadExtension,
				getExtension: mockGetExtension,
			},
		},
		fromPartition: () => ({
			extensions: {
				loadExtension: mockLoadExtension,
				getExtension: mockGetExtension,
			},
		}),
	},
}));

mock.module("main/env.main", () => ({
	env: {
		NODE_ENV: "test",
	},
}));

const { loadReactDevToolsExtension, loadWebviewBrowserExtension } =
	await import("./index");

describe("extensions", () => {
	describe("loadReactDevToolsExtension", () => {
		it("does not throw", async () => {
			// In test env (not development), should return early
			await expect(loadReactDevToolsExtension()).resolves.toBeUndefined();
		});
	});

	describe("loadWebviewBrowserExtension", () => {
		it("does not throw when extension not found", async () => {
			await expect(loadWebviewBrowserExtension()).resolves.toBeUndefined();
		});
	});
});
