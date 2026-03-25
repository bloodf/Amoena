import { describe, expect, it, mock } from "bun:test";
import type { ChildProcess } from "node:child_process";
import { EventEmitter } from "node:events";

function createMockProc(): ChildProcess {
	const emitter = new EventEmitter();
	return Object.assign(emitter, {
		stdout: new EventEmitter(),
		stderr: new EventEmitter(),
		stdin: null,
		stdio: [null, null, null] as const,
		pid: 12345,
		connected: true,
		exitCode: null,
		signalCode: null,
		spawnargs: [],
		spawnfile: "",
		killed: false,
		kill: mock(() => true),
		send: mock(() => true),
		disconnect: mock(() => {}),
		unref: mock(() => {}),
		ref: mock(() => {}),
		[Symbol.dispose]: mock(() => {}),
		serialization: "json" as const,
		channel: undefined,
	}) as unknown as ChildProcess;
}

const mockProc = createMockProc();

mock.module("node:child_process", () => ({
	spawn: mock(() => mockProc),
}));

const origFetch = globalThis.fetch;
globalThis.fetch = mock(() => Promise.resolve({ ok: true } as Response)) as unknown as typeof fetch;

const { startDashboard, stopDashboard, getDashboardStatus } =
	await import("./dashboard-service");

describe("dashboard-service", () => {
	describe("getDashboardStatus", () => {
		it("returns port and status", () => {
			const status = getDashboardStatus();
			expect(status).toHaveProperty("port");
			expect(status).toHaveProperty("status");
			expect(typeof status.port).toBe("number");
		});
	});

	describe("stopDashboard", () => {
		it("does not throw when no process is running", () => {
			expect(() => stopDashboard()).not.toThrow();
		});
	});

	describe("startDashboard", () => {
		it("returns a port number", async () => {
			const port = await startDashboard();
			expect(typeof port).toBe("number");
			expect(port).toBeGreaterThan(0);
		});
	});
});

globalThis.fetch = origFetch;
