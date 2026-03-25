import type { ChildProcess } from "node:child_process";
import * as childProcess from "node:child_process";
import path from "node:path";
import { app } from "electron";

const DASHBOARD_PORT = Number(process.env.AMOENA_DASHBOARD_PORT ?? 3456);
const STARTUP_TIMEOUT = 30_000;
const MAX_RESTARTS = 3;

type DashboardStatus = "stopped" | "starting" | "running" | "crashed";

interface DashboardState {
	process: ChildProcess | null;
	port: number;
	status: DashboardStatus;
	restartCount: number;
}

const state: DashboardState = {
	process: null,
	port: DASHBOARD_PORT,
	status: "stopped",
	restartCount: 0,
};

/**
 * Spawn the Next.js dashboard server as a child process.
 * In development: runs `next dev` via bun.
 * In production: runs the standalone Next.js server from the bundled output.
 */
export async function startDashboard(): Promise<number> {
	if (state.status === "running" && state.process) {
		console.log("[dashboard] Already running on port", state.port);
		return state.port;
	}

	state.status = "starting";
	const isDev = !app.isPackaged;

	const dashboardDir = isDev
		? path.resolve(app.getAppPath(), "../../apps/dashboard")
		: path.join(process.resourcesPath, "dashboard");

	console.log("[dashboard] Starting Next.js from:", dashboardDir);
	console.log("[dashboard] Mode:", isDev ? "development" : "production");
	console.log("[dashboard] Port:", state.port);

	const env = {
		...process.env,
		PORT: String(state.port),
		NODE_ENV: isDev ? "development" : "production",
		NEXT_TELEMETRY_DISABLED: "1",
	};

	let proc: ChildProcess;

	if (isDev) {
		proc = childProcess.spawn("bunx", ["next", "dev", "--port", String(state.port)], {
			cwd: dashboardDir,
			env,
			stdio: ["ignore", "pipe", "pipe"],
		});
	} else {
		// Production: run the standalone server
		const serverPath = path.join(dashboardDir, ".next", "standalone", "server.js");
		proc = childProcess.spawn("node", [serverPath], {
			cwd: dashboardDir,
			env,
			stdio: ["ignore", "pipe", "pipe"],
		});
	}

	state.process = proc;

	proc.stdout?.on("data", (data: Buffer) => {
		const msg = data.toString().trim();
		if (msg) console.log("[dashboard:stdout]", msg);
	});

	proc.stderr?.on("data", (data: Buffer) => {
		const msg = data.toString().trim();
		if (msg) console.error("[dashboard:stderr]", msg);
	});

	proc.on("exit", (code, signal) => {
		console.log("[dashboard] Process exited:", { code, signal });
		state.process = null;
		state.status = "crashed";

		if (state.restartCount < MAX_RESTARTS) {
			state.restartCount++;
			console.log(`[dashboard] Restarting (${state.restartCount}/${MAX_RESTARTS})...`);
			setTimeout(() => startDashboard(), 1000 * state.restartCount);
		} else {
			console.error("[dashboard] Max restarts reached. Dashboard unavailable.");
		}
	});

	// Wait for the server to be ready by polling the health endpoint
	await waitForReady(state.port, STARTUP_TIMEOUT);
	state.status = "running";
	state.restartCount = 0;
	console.log("[dashboard] Ready on port", state.port);
	return state.port;
}

/**
 * Stop the dashboard server.
 */
export function stopDashboard(): void {
	if (state.process) {
		console.log("[dashboard] Stopping...");
		state.process.kill("SIGTERM");
		state.process = null;
		state.status = "stopped";
	}
}

/**
 * Get current dashboard status.
 */
export function getDashboardStatus(): { port: number; status: DashboardStatus } {
	return { port: state.port, status: state.status };
}

/**
 * Poll the server until it responds or timeout.
 */
async function waitForReady(port: number, timeout: number): Promise<void> {
	const start = Date.now();
	const interval = 500;

	while (Date.now() - start < timeout) {
		try {
			const response = await fetch(`http://localhost:${port}/api/health`);
			if (response.ok) return;
		} catch {
			// Server not ready yet
		}
		await new Promise((resolve) => setTimeout(resolve, interval));
	}

	// If /api/health doesn't exist yet, try loading the root
	try {
		const response = await fetch(`http://localhost:${port}`);
		if (response.ok || response.status === 404) return; // Next.js is running
	} catch {
		// Still not ready
	}

	console.warn("[dashboard] Startup timeout reached, proceeding anyway...");
}
