import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/config", () => ({
	config: { homeDir: "/tmp/test-home" },
}));

vi.mock("@/lib/logger", () => ({
	logger: { info: vi.fn(), error: vi.fn(), warn: vi.fn(), debug: vi.fn() },
}));

vi.mock("better-sqlite3", () => ({
	default: vi.fn(() => ({
		prepare: vi.fn(() => ({ all: vi.fn(() => []) })),
		pragma: vi.fn(),
		close: vi.fn(),
	})),
}));

vi.mock("node:fs", async () => {
	const actual = await vi.importActual<typeof import("node:fs")>("node:fs");
	return {
		...actual,
		existsSync: vi.fn(() => false),
		readFileSync: vi.fn(() => ""),
	};
});

vi.mock("node:child_process", () => ({
	spawnSync: vi.fn(() => ({ status: 1 })),
}));

describe("hermes-sessions", () => {
	it("isHermesInstalled returns false when binary not found", async () => {
		const { isHermesInstalled } = await import("@/lib/hermes-sessions");
		expect(isHermesInstalled()).toBe(false);
	});

	it("isHermesGatewayRunning returns false when pid file missing", async () => {
		const { isHermesGatewayRunning } = await import("@/lib/hermes-sessions");
		expect(isHermesGatewayRunning()).toBe(false);
	});
});
