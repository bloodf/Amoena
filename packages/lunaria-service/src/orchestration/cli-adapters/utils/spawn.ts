import { spawn as nodeSpawn, type ChildProcess, type SpawnOptions } from 'child_process';

export type SpawnResult = {
  process: ChildProcess;
  onStdout(handler: (line: string) => void): void;
  onStderr(handler: (line: string) => void): void;
  onExit(handler: (code: number) => void): void;
  write(data: string): void;
  kill(): void;
};

export function spawnProcess(command: string, args: string[], options?: SpawnOptions): SpawnResult {
  const child = nodeSpawn(command, args, {
    env: { ...process.env, ...(options?.env as Record<string, string> | undefined) },
    ...options,
  });

  const stdoutHandlers: Array<(line: string) => void> = [];
  const stderrHandlers: Array<(line: string) => void> = [];
  const exitHandlers: Array<(code: number) => void> = [];

  let stdoutBuf = '';
  let stderrBuf = '';

  child.stdout?.on('data', (chunk: Buffer) => {
    stdoutBuf += chunk.toString();
    const lines = stdoutBuf.split('\n');
    stdoutBuf = lines.pop() ?? '';
    for (const line of lines) {
      for (const h of stdoutHandlers) h(line);
    }
  });

  child.stderr?.on('data', (chunk: Buffer) => {
    stderrBuf += chunk.toString();
    const lines = stderrBuf.split('\n');
    stderrBuf = lines.pop() ?? '';
    for (const line of lines) {
      for (const h of stderrHandlers) h(line);
    }
  });

  child.on('exit', (code) => {
    // Flush remaining buffer content
    if (stdoutBuf.length > 0) {
      for (const h of stdoutHandlers) h(stdoutBuf);
      stdoutBuf = '';
    }
    if (stderrBuf.length > 0) {
      for (const h of stderrHandlers) h(stderrBuf);
      stderrBuf = '';
    }
    for (const h of exitHandlers) h(code ?? 1);
  });

  return {
    process: child,
    onStdout(handler) {
      stdoutHandlers.push(handler);
    },
    onStderr(handler) {
      stderrHandlers.push(handler);
    },
    onExit(handler) {
      exitHandlers.push(handler);
    },
    write(data) {
      child.stdin?.write(data);
    },
    kill() {
      child.kill('SIGTERM');
    },
  };
}
