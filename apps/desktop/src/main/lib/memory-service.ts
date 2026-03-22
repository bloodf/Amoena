import type { ChildProcess } from "node:child_process";
import * as childProcess from "node:child_process";
import path from "node:path";
import { app } from "electron";

const MEMORY_PORT = Number(process.env.LUNARIA_MEMORY_PORT ?? 37777);
const STARTUP_TIMEOUT = 20_000;
const MAX_RESTARTS = 3;

type ServiceStatus = "stopped" | "starting" | "running" | "crashed";

const state = {
	process: null as ChildProcess | null,
	port: MEMORY_PORT,
	status: "stopped" as ServiceStatus,
	restartCount: 0,
};

export async function startMemoryService(): Promise<number> {
	if (state.status === "running" && state.process) {
		return state.port;
	}

	state.status = "starting";
	const isDev = !app.isPackaged;

	// In dev: run the memory service's worker entry point with bun
	// In prod: run the bundled server.js
	const workerPath = isDev
		? path.resolve(app.getAppPath(), "../../packages/memory/src/services/worker-service.ts")
		: path.join(process.resourcesPath, "memory", "worker-service.js");

	console.log("[memory] Starting from:", workerPath);

	const dataDir = path.join(app.getPath("userData"), "memory");

	const env = {
		...process.env,
		PORT: String(state.port),
		CLAUDE_MEM_DATA_DIR: dataDir,
		NODE_ENV: isDev ? "development" : "production",
	};

	const proc = isDev
		? childProcess.spawn("bun", ["run", workerPath], { env, stdio: ["ignore", "pipe", "pipe"] })
		: childProcess.spawn("node", [workerPath], { env, stdio: ["ignore", "pipe", "pipe"] });

	state.process = proc;

	proc.stdout?.on("data", (data: Buffer) => {
		const msg = data.toString().trim();
		if (msg) console.log("[memory:stdout]", msg);
	});

	proc.stderr?.on("data", (data: Buffer) => {
		const msg = data.toString().trim();
		if (msg) console.error("[memory:stderr]", msg);
	});

	proc.on("exit", (code, signal) => {
		console.log("[memory] Exited:", { code, signal });
		state.process = null;
		state.status = "crashed";

		if (state.restartCount < MAX_RESTARTS) {
			state.restartCount++;
			console.log(`[memory] Restarting (${state.restartCount}/${MAX_RESTARTS})...`);
			setTimeout(() => startMemoryService(), 1000 * state.restartCount);
		}
	});

	await waitForReady(state.port, STARTUP_TIMEOUT);
	state.status = "running";
	state.restartCount = 0;
	console.log("[memory] Ready on port", state.port);
	return state.port;
}

export function stopMemoryService(): void {
	if (state.process) {
		state.process.kill("SIGTERM");
		state.process = null;
		state.status = "stopped";
	}
}

export function getMemoryServiceStatus(): { port: number; status: ServiceStatus } {
	return { port: state.port, status: state.status };
}

async function waitForReady(port: number, timeout: number): Promise<void> {
	const start = Date.now();
	while (Date.now() - start < timeout) {
		try {
			const res = await fetch(`http://localhost:${port}/health`);
			if (res.ok) return;
		} catch {
			// not ready
		}
		await new Promise((r) => setTimeout(r, 500));
	}
	console.warn("[memory] Startup timeout — proceeding anyway");
}
