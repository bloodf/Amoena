import { describe, it, expect, vi, beforeEach } from "vitest";
import { EventEmitter } from "events";

// Build mock child with EventEmitter-based stdout/stderr
function createMockChild() {
  const child = new EventEmitter();
  const stdout = new EventEmitter();
  const stderr = new EventEmitter();
  const stdin = { write: vi.fn() };

  Object.assign(child, {
    stdout,
    stderr,
    stdin,
    pid: 12345,
    kill: vi.fn(() => true),
  });

  return child as EventEmitter & {
    stdout: EventEmitter;
    stderr: EventEmitter;
    stdin: { write: ReturnType<typeof vi.fn> };
    kill: ReturnType<typeof vi.fn>;
  };
}

let mockChild: ReturnType<typeof createMockChild>;

vi.mock("child_process", () => ({
  spawn: vi.fn(() => mockChild),
}));

import { spawnProcess } from "../utils/spawn.js";

describe("spawnProcess", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockChild = createMockChild();
  });

  it("returns a SpawnResult with process reference", () => {
    const result = spawnProcess("echo", ["hello"]);
    expect(result.process).toBe(mockChild);
  });

  it("delivers stdout lines to onStdout handler", () => {
    const result = spawnProcess("cmd", []);
    const lines: string[] = [];
    result.onStdout((line) => lines.push(line));

    // Simulate stdout data event
    mockChild.stdout.emit("data", Buffer.from("line1\nline2\n"));

    expect(lines).toEqual(["line1", "line2"]);
  });

  it("delivers stderr lines to onStderr handler", () => {
    const result = spawnProcess("cmd", []);
    const lines: string[] = [];
    result.onStderr((line) => lines.push(line));

    mockChild.stderr.emit("data", Buffer.from("err1\nerr2\n"));

    expect(lines).toEqual(["err1", "err2"]);
  });

  it("buffers partial lines until newline", () => {
    const result = spawnProcess("cmd", []);
    const lines: string[] = [];
    result.onStdout((line) => lines.push(line));

    mockChild.stdout.emit("data", Buffer.from("partial"));
    expect(lines).toEqual([]);

    mockChild.stdout.emit("data", Buffer.from(" complete\n"));
    expect(lines).toEqual(["partial complete"]);
  });

  it("flushes remaining buffer on exit", () => {
    const result = spawnProcess("cmd", []);
    const stdoutLines: string[] = [];
    const stderrLines: string[] = [];
    result.onStdout((line) => stdoutLines.push(line));
    result.onStderr((line) => stderrLines.push(line));

    mockChild.stdout.emit("data", Buffer.from("trailing"));
    mockChild.stderr.emit("data", Buffer.from("error trailing"));

    // Simulate exit
    mockChild.emit("exit", 0);

    expect(stdoutLines).toContain("trailing");
    expect(stderrLines).toContain("error trailing");
  });

  it("calls onExit handler with exit code", () => {
    const result = spawnProcess("cmd", []);
    const codes: number[] = [];
    result.onExit((code) => codes.push(code));

    mockChild.emit("exit", 42);

    expect(codes).toEqual([42]);
  });

  it("uses exit code 1 when code is null", () => {
    const result = spawnProcess("cmd", []);
    const codes: number[] = [];
    result.onExit((code) => codes.push(code));

    mockChild.emit("exit", null);

    expect(codes).toEqual([1]);
  });

  it("write sends data to stdin", () => {
    const result = spawnProcess("cmd", []);
    result.write("input data");
    expect(mockChild.stdin.write).toHaveBeenCalledWith("input data");
  });

  it("kill sends SIGTERM to child process", () => {
    const result = spawnProcess("cmd", []);
    result.kill();
    expect(mockChild.kill).toHaveBeenCalledWith("SIGTERM");
  });

  it("supports multiple handlers for the same event", () => {
    const result = spawnProcess("cmd", []);
    const lines1: string[] = [];
    const lines2: string[] = [];
    result.onStdout((line) => lines1.push(line));
    result.onStdout((line) => lines2.push(line));

    mockChild.stdout.emit("data", Buffer.from("hello\n"));

    expect(lines1).toEqual(["hello"]);
    expect(lines2).toEqual(["hello"]);
  });
});
