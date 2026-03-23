import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("node:child_process", () => ({
  execFile: vi.fn(),
}));

vi.mock("node:fs/promises", () => ({
  stat: vi.fn(),
}));

import { execFile } from "node:child_process";
import { stat } from "node:fs/promises";
import {
  createWorktree,
  removeWorktree,
  listStaleWorktrees,
} from "../worktree.js";

const mockExecFile = execFile as unknown as ReturnType<typeof vi.fn>;
const mockStat = stat as unknown as ReturnType<typeof vi.fn>;

function makeExecFileMock(stdout = "", stderr = "") {
  // execFile with callback is wrapped by promisify — we need to mock the callback form
  mockExecFile.mockImplementation(
    (
      _cmd: string,
      _args: string[],
      _opts: object,
      callback: (err: null, result: { stdout: string; stderr: string }) => void,
    ) => {
      callback(null, { stdout, stderr });
    },
  );
}

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("createWorktree()", () => {
  it("creates a directory and branch with correct naming", async () => {
    makeExecFileMock("");

    const info = await createWorktree(
      "/repo",
      "goal-1",
      "task-a",
      "main",
    );

    expect(mockExecFile).toHaveBeenCalledWith(
      "git",
      [
        "worktree",
        "add",
        expect.stringContaining("goal-1"),
        "-b",
        "mc/goal-goal-1/task-task-a",
        "main",
      ],
      { cwd: "/repo" },
      expect.any(Function),
    );

    expect(info.branch).toBe("mc/goal-goal-1/task-task-a");
    expect(info.taskId).toBe("task-a");
    expect(info.path).toContain("goal-1");
    expect(info.path).toContain("task-a");
  });
});

describe("removeWorktree()", () => {
  it("calls git worktree remove --force", async () => {
    makeExecFileMock("");

    await removeWorktree("/repo", "/repo/.lunaria-worktrees/goal-1/task-a");

    expect(mockExecFile).toHaveBeenCalledWith(
      "git",
      [
        "worktree",
        "remove",
        "--force",
        "/repo/.lunaria-worktrees/goal-1/task-a",
      ],
      { cwd: "/repo" },
      expect.any(Function),
    );
  });
});

describe("listStaleWorktrees()", () => {
  const HOUR_MS = 3_600_000;
  const DAY_MS = 86_400_000;

  const porcelainOutput = [
    "worktree /repo",
    "HEAD abc123",
    "branch refs/heads/main",
    "",
    "worktree /repo/.lunaria-worktrees/goal-1/task-old",
    "HEAD def456",
    "branch refs/heads/mc/goal-goal-1/task-task-old",
    "",
    "worktree /repo/.lunaria-worktrees/goal-1/task-new",
    "HEAD ghi789",
    "branch refs/heads/mc/goal-goal-1/task-task-new",
    "",
  ].join("\n");

  it("returns worktrees older than maxAgeMs and excludes recent ones", async () => {
    makeExecFileMock(porcelainOutput);

    const now = Date.now();
    mockStat
      .mockResolvedValueOnce({ mtimeMs: now - 2 * DAY_MS }) // task-old: 2 days old
      .mockResolvedValueOnce({ mtimeMs: now - HOUR_MS }); // task-new: 1 hour old

    const stale = await listStaleWorktrees("/repo", DAY_MS);

    expect(stale).toHaveLength(1);
    expect(stale[0]!.taskId).toBe("task-old");
  });

  it("excludes the main worktree", async () => {
    makeExecFileMock(porcelainOutput);

    const now = Date.now();
    mockStat
      .mockResolvedValueOnce({ mtimeMs: now - 2 * DAY_MS })
      .mockResolvedValueOnce({ mtimeMs: now - 2 * DAY_MS });

    const stale = await listStaleWorktrees("/repo", DAY_MS);

    const mainWorktree = stale.find((w) => w.path === "/repo");
    expect(mainWorktree).toBeUndefined();
  });

  it("excludes worktrees outside .lunaria-worktrees/", async () => {
    const customPorcelain = [
      "worktree /repo",
      "HEAD abc123",
      "branch refs/heads/main",
      "",
      "worktree /some/other/path",
      "HEAD def456",
      "branch refs/heads/other-branch",
      "",
    ].join("\n");

    makeExecFileMock(customPorcelain);

    const stale = await listStaleWorktrees("/repo", DAY_MS);
    expect(stale).toHaveLength(0);
  });
});
