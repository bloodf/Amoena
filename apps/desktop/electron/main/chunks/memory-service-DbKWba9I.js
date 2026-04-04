import * as childProcess from "node:child_process";
import path__default from "node:path";
import { app } from "electron";
const MEMORY_PORT = Number(process.env.AMOENA_MEMORY_PORT ?? 37777);
const STARTUP_TIMEOUT = 2e4;
const MAX_RESTARTS = 3;
const state = {
  process: null,
  port: MEMORY_PORT,
  status: "stopped",
  restartCount: 0
};
async function startMemoryService() {
  if (state.status === "running" && state.process) {
    return state.port;
  }
  state.status = "starting";
  const isDev = !app.isPackaged;
  const workerPath = isDev ? path__default.resolve(app.getAppPath(), "../../packages/memory/src/services/worker-service.ts") : path__default.join(process.resourcesPath, "memory", "worker-service.js");
  console.log("[memory] Starting from:", workerPath);
  const dataDir = path__default.join(app.getPath("userData"), "memory");
  const env = {
    ...process.env,
    PORT: String(state.port),
    CLAUDE_MEM_DATA_DIR: dataDir,
    NODE_ENV: isDev ? "development" : "production"
  };
  const proc = isDev ? childProcess.spawn("bun", ["run", workerPath], { env, stdio: ["ignore", "pipe", "pipe"] }) : childProcess.spawn("node", [workerPath], { env, stdio: ["ignore", "pipe", "pipe"] });
  state.process = proc;
  proc.stdout?.on("data", (data) => {
    const msg = data.toString().trim();
    if (msg) console.log("[memory:stdout]", msg);
  });
  proc.stderr?.on("data", (data) => {
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
      setTimeout(() => startMemoryService(), 1e3 * state.restartCount);
    }
  });
  await waitForReady(state.port, STARTUP_TIMEOUT);
  state.status = "running";
  state.restartCount = 0;
  console.log("[memory] Ready on port", state.port);
  return state.port;
}
function stopMemoryService() {
  if (state.process) {
    state.process.kill("SIGTERM");
    state.process = null;
    state.status = "stopped";
  }
}
function getMemoryServiceStatus() {
  return { port: state.port, status: state.status };
}
async function waitForReady(port, timeout) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    try {
      const res = await fetch(`http://localhost:${port}/health`);
      if (res.ok) return;
    } catch {
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  console.warn("[memory] Startup timeout — proceeding anyway");
}
export {
  getMemoryServiceStatus,
  startMemoryService,
  stopMemoryService
};
//# sourceMappingURL=memory-service-DbKWba9I.js.map
