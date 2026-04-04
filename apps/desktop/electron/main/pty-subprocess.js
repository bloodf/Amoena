import { write } from "node:fs";
import * as pty from "node-pty";
import { t as treeKill } from "./chunks/index-5Z96HUq5.js";
import { P as PtySubprocessFrameDecoder, a as PtySubprocessIpcType, w as writeFrame } from "./chunks/pty-subprocess-ipc-BZlxl0DS.js";
import "./chunks/_commonjsHelpers-BVEIagUZ.js";
import "child_process";
let ptyProcess = null;
let ptyFd = null;
const writeQueue = [];
let queuedBytes = 0;
let flushing = false;
let writeBackoffMs = 0;
const MIN_WRITE_BACKOFF_MS = 2;
const MAX_WRITE_BACKOFF_MS = 50;
let stdinPaused = false;
const INPUT_QUEUE_HIGH_WATERMARK_BYTES = 8 * 1024 * 1024;
const INPUT_QUEUE_LOW_WATERMARK_BYTES = 4 * 1024 * 1024;
const INPUT_QUEUE_HARD_LIMIT_BYTES = 64 * 1024 * 1024;
let outputChunks = [];
let outputBytesQueued = 0;
let outputFlushScheduled = false;
const MAX_OUTPUT_BATCH_SIZE_BYTES = 128 * 1024;
let stdoutDraining = true;
let ptyPaused = false;
const DEBUG_OUTPUT_BATCHING = process.env.AMOENA_PTY_SUBPROCESS_DEBUG === "1";
function send(type, payload) {
  stdoutDraining = writeFrame(process.stdout, type, payload);
  if (!stdoutDraining && ptyProcess && !ptyPaused) {
    ptyPaused = true;
    ptyProcess.pause();
  }
}
process.stdout.on("drain", () => {
  stdoutDraining = true;
  if (ptyPaused && ptyProcess) {
    ptyPaused = false;
    ptyProcess.resume();
  }
});
function sendError(message) {
  send(PtySubprocessIpcType.Error, Buffer.from(message, "utf8"));
}
function queueOutput(data) {
  outputChunks.push(data);
  outputBytesQueued += Buffer.byteLength(data, "utf8");
  if (outputBytesQueued >= MAX_OUTPUT_BATCH_SIZE_BYTES) {
    outputFlushScheduled = false;
    flushOutput();
    return;
  }
  if (!outputFlushScheduled) {
    outputFlushScheduled = true;
    setImmediate(flushOutput);
  }
}
function flushOutput() {
  outputFlushScheduled = false;
  if (outputChunks.length === 0) return;
  const data = outputChunks.join("");
  const chunkCount = outputChunks.length;
  outputChunks = [];
  outputBytesQueued = 0;
  const payload = Buffer.from(data, "utf8");
  if (DEBUG_OUTPUT_BATCHING) {
    console.error(
      `[pty-subprocess] Flushing ${payload.length} bytes (${chunkCount} chunks batched)`
    );
  }
  send(PtySubprocessIpcType.Data, payload);
}
function maybePauseStdin() {
  if (stdinPaused) return;
  if (queuedBytes < INPUT_QUEUE_HIGH_WATERMARK_BYTES) return;
  stdinPaused = true;
  process.stdin.pause();
}
function maybeResumeStdin() {
  if (!stdinPaused) return;
  if (queuedBytes > INPUT_QUEUE_LOW_WATERMARK_BYTES) return;
  stdinPaused = false;
  process.stdin.resume();
}
function queueWriteBuffer(buf) {
  if (queuedBytes + buf.length > INPUT_QUEUE_HARD_LIMIT_BYTES) {
    sendError("Input backlog exceeded hard limit");
    return;
  }
  writeQueue.push(buf);
  queuedBytes += buf.length;
  maybePauseStdin();
  scheduleFlush();
}
function scheduleFlush() {
  if (flushing) return;
  flushing = true;
  setImmediate(flush);
}
function flush() {
  if (!ptyProcess || writeQueue.length === 0) {
    flushing = false;
    return;
  }
  if (typeof ptyFd === "number" && ptyFd > 0) {
    const buf = writeQueue[0];
    write(ptyFd, buf, 0, buf.length, null, (err, bytesWritten) => {
      if (err) {
        const code = err.code;
        if (code === "EAGAIN" || code === "EWOULDBLOCK") {
          writeBackoffMs = writeBackoffMs === 0 ? MIN_WRITE_BACKOFF_MS : Math.min(writeBackoffMs * 2, MAX_WRITE_BACKOFF_MS);
          if (DEBUG_OUTPUT_BATCHING && writeBackoffMs === MIN_WRITE_BACKOFF_MS) {
            console.error("[pty-subprocess] PTY input backpressured (EAGAIN)");
          }
          setTimeout(flush, writeBackoffMs);
          return;
        }
        sendError(
          `Write failed: ${err instanceof Error ? err.message : String(err)}`
        );
        writeQueue.length = 0;
        queuedBytes = 0;
        flushing = false;
        return;
      }
      const wrote = Math.max(0, bytesWritten ?? 0);
      writeBackoffMs = 0;
      queuedBytes -= wrote;
      if (wrote >= buf.length) {
        writeQueue.shift();
      } else {
        writeQueue[0] = buf.subarray(wrote);
      }
      maybeResumeStdin();
      if (writeQueue.length > 0) {
        setImmediate(flush);
      } else {
        flushing = false;
      }
    });
    return;
  }
  const chunk = writeQueue.shift();
  if (!chunk) {
    flushing = false;
    return;
  }
  queuedBytes -= chunk.length;
  maybeResumeStdin();
  try {
    ptyProcess.write(chunk.toString("utf8"));
  } catch (error) {
    sendError(
      `Write failed: ${error instanceof Error ? error.message : String(error)}`
    );
    writeQueue.length = 0;
    queuedBytes = 0;
    flushing = false;
    return;
  }
  if (writeQueue.length > 0) {
    setImmediate(flush);
    return;
  }
  flushing = false;
}
function handleSpawn(payload) {
  if (ptyProcess) {
    sendError("PTY already spawned");
    return;
  }
  let msg;
  try {
    msg = JSON.parse(payload.toString("utf8"));
  } catch (error) {
    sendError(
      `Spawn payload parse failed: ${error instanceof Error ? error.message : String(error)}`
    );
    return;
  }
  if (DEBUG_OUTPUT_BATCHING) {
    console.error("[pty-subprocess] Spawning PTY:", {
      shell: msg.shell,
      args: msg.args,
      cwd: msg.cwd,
      cols: msg.cols,
      rows: msg.rows,
      ZDOTDIR: msg.env.ZDOTDIR,
      AMOENA_ORIG_ZDOTDIR: msg.env.AMOENA_ORIG_ZDOTDIR,
      PATH_start: msg.env.PATH?.substring(0, 100)
    });
  }
  try {
    ptyProcess = pty.spawn(msg.shell, msg.args, {
      name: "xterm-256color",
      cols: msg.cols,
      rows: msg.rows,
      cwd: msg.cwd,
      env: msg.env
    });
    ptyFd = ptyProcess.fd ?? null;
    if (DEBUG_OUTPUT_BATCHING) {
      console.error(
        `[pty-subprocess] PTY fd ${ptyFd ?? "unknown"} (${typeof ptyFd === "number" ? "async fs.write enabled" : "falling back to pty.write"})`
      );
    }
    ptyProcess.onData((data) => {
      queueOutput(data);
    });
    ptyProcess.onExit(({ exitCode, signal }) => {
      flushOutput();
      const exitPayload = Buffer.allocUnsafe(8);
      exitPayload.writeInt32LE(exitCode ?? 0, 0);
      exitPayload.writeInt32LE(signal ?? 0, 4);
      send(PtySubprocessIpcType.Exit, exitPayload);
      ptyProcess = null;
      ptyFd = null;
      setTimeout(() => {
        process.exit(0);
      }, 100);
    });
    const pidPayload = Buffer.allocUnsafe(4);
    pidPayload.writeUInt32LE(ptyProcess.pid ?? 0, 0);
    send(PtySubprocessIpcType.Spawned, pidPayload);
  } catch (error) {
    sendError(
      `Spawn failed: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
function handleWrite(payload) {
  if (!ptyProcess) {
    sendError("PTY not spawned");
    return;
  }
  queueWriteBuffer(payload);
}
function handleResize(payload) {
  if (!ptyProcess) return;
  if (payload.length < 8) return;
  try {
    const cols = payload.readUInt32LE(0);
    const rows = payload.readUInt32LE(4);
    ptyProcess.resize(cols, rows);
  } catch {
  }
}
function handleKill(payload) {
  const signal = payload.length > 0 ? payload.toString("utf8") : "SIGTERM";
  if (!ptyProcess) {
    return;
  }
  const pid = ptyProcess.pid;
  treeKill(pid, signal, (err) => {
    if (err) {
      console.error("[pty-subprocess] Failed to kill process tree:", err);
    }
  });
  const escalationTimer = setTimeout(() => {
    if (!ptyProcess) return;
    treeKill(pid, "SIGKILL", (err) => {
      if (err) {
        console.error("[pty-subprocess] Failed to SIGKILL process tree:", err);
      }
    });
    const forceExitTimer = setTimeout(() => {
      if (!ptyProcess) return;
      console.error(
        `[pty-subprocess] Force exit: onExit never fired for pid ${pid}`
      );
      const exitPayload = Buffer.allocUnsafe(8);
      exitPayload.writeInt32LE(-1, 0);
      exitPayload.writeInt32LE(9, 4);
      send(PtySubprocessIpcType.Exit, exitPayload);
      ptyProcess = null;
      ptyFd = null;
      process.exit(0);
    }, 1e3);
    forceExitTimer.unref();
  }, 2e3);
  escalationTimer.unref();
}
function handleSignal(payload) {
  const signal = payload.length > 0 ? payload.toString("utf8") : "SIGINT";
  if (!ptyProcess) {
    return;
  }
  try {
    ptyProcess.kill(signal);
  } catch {
  }
}
function handleDispose() {
  flushOutput();
  writeQueue.length = 0;
  queuedBytes = 0;
  flushing = false;
  outputChunks = [];
  outputBytesQueued = 0;
  outputFlushScheduled = false;
  ptyFd = null;
  if (ptyProcess) {
    const pid = ptyProcess.pid;
    ptyProcess = null;
    treeKill(pid, "SIGKILL", (err) => {
      if (err) {
        console.error("[pty-subprocess] Failed to kill process tree:", err);
      }
      process.exit(0);
    });
    return;
  }
  process.exit(0);
}
const decoder = new PtySubprocessFrameDecoder();
process.stdin.on("data", (chunk) => {
  try {
    const frames = decoder.push(chunk);
    for (const frame of frames) {
      switch (frame.type) {
        case PtySubprocessIpcType.Spawn:
          handleSpawn(frame.payload);
          break;
        case PtySubprocessIpcType.Write:
          handleWrite(frame.payload);
          break;
        case PtySubprocessIpcType.Resize:
          handleResize(frame.payload);
          break;
        case PtySubprocessIpcType.Kill:
          handleKill(frame.payload);
          break;
        case PtySubprocessIpcType.Signal:
          handleSignal(frame.payload);
          break;
        case PtySubprocessIpcType.Dispose:
          handleDispose();
          break;
      }
    }
  } catch (error) {
    sendError(
      `Failed to parse frame: ${error instanceof Error ? error.message : String(error)}`
    );
  }
});
process.stdin.on("end", () => {
  handleDispose();
});
send(PtySubprocessIpcType.Ready);
//# sourceMappingURL=pty-subprocess.js.map
