import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("node:child_process", () => ({
  execFile: vi.fn(),
}));

import { execFile } from "node:child_process";
import { mergeTaskResults } from "../merger.js";
import { TaskNode } from "../task-node.js";
import type { TaskSpec } from "../types.js";

const mockExecFile = execFile as unknown as ReturnType<typeof vi.fn>;

function makeNode(id: string, worktreePath = `/wt/${id}`): TaskNode {
  const spec: TaskSpec = {
    id,
    description: `Task ${id}`,
    dependsOn: [],
    taskType: "implementation",
    complexity: "low",
  };
  const node = new TaskNode(spec);
  node.state.status = "completed";
  node.state.worktreePath = worktreePath;
  return node;
}

// Build an execFile mock that handles multiple sequential calls
function buildExecFileMock(
  responses: Array<{ stdout: string } | Error>,
): void {
  let callIndex = 0;
  mockExecFile.mockImplementation(
    (
      _cmd: string,
      _args: string[],
      _opts: object,
      callback: (err: Error | null, result?: { stdout: string; stderr: string }) => void,
    ) => {
      const response = responses[callIndex++] ?? { stdout: "" };
      if (response instanceof Error) {
        callback(response);
      } else {
        callback(null, { stdout: response.stdout, stderr: "" });
      }
    },
  );
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("mergeTaskResults()", () => {
  it("no-overlap tasks auto-merge — strategy 'auto', conflicts empty", async () => {
    const taskA = makeNode("A");
    const taskB = makeNode("B");

    // Calls: diff A, diff B, merge A, merge B, rev-parse HEAD
    buildExecFileMock([
      { stdout: "src/fileA.ts\n" },   // diff for A
      { stdout: "src/fileB.ts\n" },   // diff for B
      { stdout: "" },                  // merge A
      { stdout: "" },                  // merge B
      { stdout: "abc1234\n" },         // rev-parse HEAD
    ]);

    const result = await mergeTaskResults(
      "/repo",
      "goal-1",
      [taskA, taskB],
      ["A", "B"],
      "main",
    );

    expect(result.strategy).toBe("auto");
    expect(result.conflicts).toHaveLength(0);
    expect(result.mergedTasks).toContain("A");
    expect(result.mergedTasks).toContain("B");
    expect(result.commitSha).toBe("abc1234");
  });

  it("overlapping files flagged as review_required, file appears in conflicts", async () => {
    const taskA = makeNode("A");
    const taskB = makeNode("B");

    // Both tasks touch the same file
    buildExecFileMock([
      { stdout: "src/shared.ts\n" },  // diff for A
      { stdout: "src/shared.ts\n" },  // diff for B
      { stdout: "deadbeef\n" },        // rev-parse HEAD
    ]);

    const result = await mergeTaskResults(
      "/repo",
      "goal-1",
      [taskA, taskB],
      ["A", "B"],
      "main",
    );

    expect(result.strategy).toBe("review_required");
    expect(result.conflicts.length).toBeGreaterThan(0);

    const conflictFiles = result.conflicts.flatMap((c) => c.files);
    expect(conflictFiles).toContain("src/shared.ts");
  });

  it("partial overlap: non-conflicting tasks are merged, conflicting ones are flagged", async () => {
    const taskA = makeNode("A");
    const taskB = makeNode("B");
    const taskC = makeNode("C");

    buildExecFileMock([
      { stdout: "src/only-a.ts\n" },          // diff A (unique)
      { stdout: "src/shared.ts\n" },           // diff B (shared)
      { stdout: "src/shared.ts\nsrc/c.ts\n" }, // diff C (shared)
      { stdout: "" },                           // merge A
      { stdout: "sha123\n" },                   // rev-parse HEAD
    ]);

    const result = await mergeTaskResults(
      "/repo",
      "goal-1",
      [taskA, taskB, taskC],
      ["A", "B", "C"],
      "main",
    );

    expect(result.strategy).toBe("review_required");
    expect(result.mergedTasks).toContain("A");
    const conflictTaskIds = result.conflicts.map((c) => c.taskId);
    expect(conflictTaskIds).toContain("B");
    expect(conflictTaskIds).toContain("C");
  });

  it("returns null commitSha if rev-parse fails", async () => {
    const taskA = makeNode("A");

    buildExecFileMock([
      { stdout: "src/fileA.ts\n" }, // diff
      { stdout: "" },                // merge
      new Error("not a git repo"),   // rev-parse fails
    ]);

    const result = await mergeTaskResults(
      "/repo",
      "goal-1",
      [taskA],
      ["A"],
      "main",
    );

    expect(result.commitSha).toBeNull();
  });
});
