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

const { startMemoryService, stopMemoryService, getMemoryServiceStatus } =
	await import("./memory-service");

describe("memory-service", () => {
	describe("getMemoryServiceStatus", () => {
		it("returns port and status", () => {
			const status = getMemoryServiceStatus();
			expect(status).toHaveProperty("port");
			expect(status).toHaveProperty("status");
			expect(typeof status.port).toBe("number");
		});
	});

	describe("stopMemoryService", () => {
		it("does not throw when no process is running", () => {
			expect(() => stopMemoryService()).not.toThrow();
		});
	});

	describe("startMemoryService", () => {
		it("returns a port number", async () => {
			const port = await startMemoryService();
			expect(typeof port).toBe("number");
			expect(port).toBeGreaterThan(0);
		});
	});
});

globalThis.fetch = origFetch;
