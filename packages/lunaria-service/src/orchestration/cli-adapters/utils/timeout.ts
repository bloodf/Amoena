import type { ChildProcess } from "node:child_process";

export interface TimeoutHandle {
  clear(): void;
}

/**
 * Sets a timeout on a child process.
 *
 * When the timer fires:
 *   1. `onTimeout()` is called immediately (so callers can update status before the process dies)
 *   2. SIGTERM is sent to the process
 *   3. After 5 seconds, if the process is still alive, SIGKILL is sent
 *
 * Call `handle.clear()` when the process exits normally to cancel the timer.
 */
export function handleTimeout(
  child: ChildProcess,
  timeoutMs: number,
  onTimeout: () => void,
): TimeoutHandle {
  let alive = true;
  child.once("exit", () => {
    alive = false;
  });

  const outerTimer = setTimeout(() => {
    if (!alive) return;

    // Notify caller first so status is updated before the process is killed
    onTimeout();

    try {
      child.kill("SIGTERM");
    } catch {
      // Process may have already exited
    }

    const innerTimer = setTimeout(() => {
      if (!alive) return;
      try {
        child.kill("SIGKILL");
      } catch {
        // Process may have already exited
      }
    }, 5_000);

    // If the process exits during the 5s window, cancel the SIGKILL
    child.once("exit", () => {
      clearTimeout(innerTimer);
    });
  }, timeoutMs);

  return {
    clear() {
      clearTimeout(outerTimer);
    },
  };
}
