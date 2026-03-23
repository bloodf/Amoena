import { spawn, type ChildProcess } from "node:child_process";

export interface SpawnOptions {
  command: string;
  args: string[];
  cwd: string;
  env: NodeJS.ProcessEnv;
  onStdout: (data: Buffer) => void;
  onStderr: (data: Buffer) => void;
  onExit: (code: number | null, signal: string | null) => void;
}

/**
 * Spawns a CLI agent child process with piped stdio.
 * Emits chunks immediately as they arrive — no buffering until exit.
 */
export function spawnCliAgent(opts: SpawnOptions): ChildProcess {
  const child = spawn(opts.command, opts.args, {
    cwd: opts.cwd,
    env: opts.env,
    stdio: ["pipe", "pipe", "pipe"],
  });

  child.stdout!.on("data", opts.onStdout);
  child.stderr!.on("data", opts.onStderr);
  child.on("exit", opts.onExit);

  return child;
}
