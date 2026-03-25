import { describe, expect, it, mock, beforeEach } from "bun:test";
import type { ChildProcess } from "node:child_process";
import { EventEmitter } from "node:events";

// Create a mock child process
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

// Mock fetch for waitForReady
const origFetch = globalThis.fetch;
let fetchMock = mock(() => Promise.resolve({ ok: true } as Response));
globalThis.fetch = fetchMock as unknown as typeof fetch;

const { startTerminalHost, stopTerminalHost, getTerminalHostStatus } =
	await import("./terminal-host-service");

describe("terminal-host-service", () => {
	describe("getTerminalHostStatus", () => {
		it("returns port and status", () => {
			const status = getTerminalHostStatus();
			expect(status).toHaveProperty("port");
			expect(status).toHaveProperty("status");
			expect(typeof status.port).toBe("number");
		});
	});

	describe("stopTerminalHost", () => {
		it("does not throw when no process is running", () => {
			expect(() => stopTerminalHost()).not.toThrow();
		});
	});

	describe("startTerminalHost", () => {
		it("returns a port number", async () => {
			fetchMock.mockResolvedValue({ ok: true } as Response);
			const port = await startTerminalHost();
			expect(typeof port).toBe("number");
			expect(port).toBeGreaterThan(0);
		});

		it("returns same port on subsequent calls when running", async () => {
			const port1 = await startTerminalHost();
			const port2 = await startTerminalHost();
			expect(port1).toBe(port2);
		});
	});
});

// Restore
globalThis.fetch = origFetch;
