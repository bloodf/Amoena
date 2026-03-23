// Pure JS fallback — no native deps required.
// On macOS a native addon can be substituted by replacing these exports.

// --- Types ---

export type CpuUsage = {
  readonly user: number;
  readonly system: number;
};

export type MemoryUsage = {
  readonly rss: number;
  readonly heapUsed: number;
};

// --- Implementations ---

/**
 * Returns CPU usage counters for the given PID.
 * Falls back to the current process metrics when the PID matches,
 * otherwise returns zeroes (native lookup not available in pure JS).
 */
export function getProcessCpuUsage(pid: number): CpuUsage {
  if (pid === process.pid) {
    const usage = process.cpuUsage();
    return { user: usage.user, system: usage.system };
  }
  return { user: 0, system: 0 };
}

/**
 * Returns memory usage for the given PID.
 * Falls back to the current process metrics when the PID matches,
 * otherwise returns zeroes.
 */
export function getProcessMemoryUsage(pid: number): MemoryUsage {
  if (pid === process.pid) {
    const usage = process.memoryUsage();
    return { rss: usage.rss, heapUsed: usage.heapUsed };
  }
  return { rss: 0, heapUsed: 0 };
}

/**
 * Returns the process tree rooted at `pid`.
 * Simplified: always returns [pid] — native tree walk not yet implemented.
 */
export function getProcessTree(pid: number): number[] {
  return [pid];
}
