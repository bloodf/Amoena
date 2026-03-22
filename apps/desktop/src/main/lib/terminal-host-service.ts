import type { ChildProcess } from "node:child_process";
import * as childProcess from "node:child_process";
import path from "node:path";
import { app } from "electron";

const TERMINAL_HOST_PORT = Number(process.env.LUNARIA_TERMINAL_HOST_PORT ?? 4879);
const STARTUP_TIMEOUT = 15_000;
const MAX_RESTARTS = 3;

type ServiceStatus = "stopped" | "starting" | "running" | "crashed";

const state = {
	process: null as ChildProcess | null,
	port: TERMINAL_HOST_PORT,
	status: "stopped" as ServiceStatus,
	restartCount: 0,
};

export async function startTerminalHost(): Promise<number> {
	if (state.status === "running" && state.process) {
		return state.port;
	}

	state.status = "starting";
	const isDev = !app.isPackaged;

	const servePath = isDev
		? path.resolve(app.getAppPath(), "../../packages/terminal-host/src/serve.ts")
		: path.join(process.resourcesPath, "terminal-host", "serve.js");

	console.log("[terminal-host] Starting from:", servePath);

	const env = {
		...process.env,
		PORT: String(state.port),
		HOST_DB_PATH: path.join(app.getPath("userData"), "host.db"),
		NODE_ENV: isDev ? "development" : "production",
	};

	const proc = isDev
		? childProcess.spawn("bun", ["run", servePath], { env, stdio: ["ignore", "pipe", "pipe"] })
		: childProcess.spawn("node", [servePath], { env, stdio: ["ignore", "pipe", "pipe"] });

	state.process = proc;

	proc.stdout?.on("data", (data: Buffer) => {
		const msg = data.toString().trim();
		if (msg) console.log("[terminal-host:stdout]", msg);
	});

	proc.stderr?.on("data", (data: Buffer) => {
		const msg = data.toString().trim();
		if (msg) console.error("[terminal-host:stderr]", msg);
	});

	proc.on("exit", (code, signal) => {
		console.log("[terminal-host] Exited:", { code, signal });
		state.process = null;
		state.status = "crashed";

		if (state.restartCount < MAX_RESTARTS) {
			state.restartCount++;
			console.log(`[terminal-host] Restarting (${state.restartCount}/${MAX_RESTARTS})...`);
			setTimeout(() => startTerminalHost(), 1000 * state.restartCount);
		}
	});

	await waitForReady(state.port, STARTUP_TIMEOUT);
	state.status = "running";
	state.restartCount = 0;
	console.log("[terminal-host] Ready on port", state.port);
	return state.port;
}

export function stopTerminalHost(): void {
	if (state.process) {
		state.process.kill("SIGTERM");
		state.process = null;
		state.status = "stopped";
	}
}

export function getTerminalHostStatus(): { port: number; status: ServiceStatus } {
	return { port: state.port, status: state.status };
}

async function waitForReady(port: number, timeout: number): Promise<void> {
	const start = Date.now();
	while (Date.now() - start < timeout) {
		try {
			const res = await fetch(`http://localhost:${port}/trpc/health`);
			if (res.ok) return;
		} catch {
			// not ready
		}
		await new Promise((r) => setTimeout(r, 500));
	}
	console.warn("[terminal-host] Startup timeout — proceeding anyway");
}
