import * as childProcess from "node:child_process";
import path__default from "node:path";
import { app } from "electron";
const DASHBOARD_PORT = Number(process.env.AMOENA_DASHBOARD_PORT ?? 3456);
const STARTUP_TIMEOUT = 3e4;
const MAX_RESTARTS = 3;
const state = {
  process: null,
  port: DASHBOARD_PORT,
  status: "stopped",
  restartCount: 0
};
async function startDashboard() {
  if (state.status === "running" && state.process) {
    console.log("[dashboard] Already running on port", state.port);
    return state.port;
  }
  state.status = "starting";
  const isDev = !app.isPackaged;
  const dashboardDir = isDev ? path__default.resolve(app.getAppPath(), "../../apps/dashboard") : path__default.join(process.resourcesPath, "dashboard");
  console.log("[dashboard] Starting Next.js from:", dashboardDir);
  console.log("[dashboard] Mode:", isDev ? "development" : "production");
  console.log("[dashboard] Port:", state.port);
  const env = {
    ...process.env,
    PORT: String(state.port),
    NODE_ENV: isDev ? "development" : "production",
    NEXT_TELEMETRY_DISABLED: "1"
  };
  let proc;
  if (isDev) {
    proc = childProcess.spawn("bunx", ["next", "dev", "--port", String(state.port)], {
      cwd: dashboardDir,
      env,
      stdio: ["ignore", "pipe", "pipe"]
    });
  } else {
    const serverPath = path__default.join(dashboardDir, ".next", "standalone", "server.js");
    proc = childProcess.spawn("node", [serverPath], {
      cwd: dashboardDir,
      env,
      stdio: ["ignore", "pipe", "pipe"]
    });
  }
  state.process = proc;
  proc.stdout?.on("data", (data) => {
    const msg = data.toString().trim();
    if (msg) console.log("[dashboard:stdout]", msg);
  });
  proc.stderr?.on("data", (data) => {
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
      setTimeout(() => startDashboard(), 1e3 * state.restartCount);
    } else {
      console.error("[dashboard] Max restarts reached. Dashboard unavailable.");
    }
  });
  await waitForReady(state.port, STARTUP_TIMEOUT);
  state.status = "running";
  state.restartCount = 0;
  console.log("[dashboard] Ready on port", state.port);
  return state.port;
}
function stopDashboard() {
  if (state.process) {
    console.log("[dashboard] Stopping...");
    state.process.kill("SIGTERM");
    state.process = null;
    state.status = "stopped";
  }
}
function getDashboardStatus() {
  return { port: state.port, status: state.status };
}
async function waitForReady(port, timeout) {
  const start = Date.now();
  const interval = 500;
  while (Date.now() - start < timeout) {
    try {
      const response = await fetch(`http://localhost:${port}/api/health`);
      if (response.ok) return;
    } catch {
    }
    await new Promise((resolve) => setTimeout(resolve, interval));
  }
  try {
    const response = await fetch(`http://localhost:${port}`);
    if (response.ok || response.status === 404) return;
  } catch {
  }
  console.warn("[dashboard] Startup timeout reached, proceeding anyway...");
}
export {
  getDashboardStatus,
  startDashboard,
  stopDashboard
};
//# sourceMappingURL=dashboard-service-D3MrVlG0.js.map
