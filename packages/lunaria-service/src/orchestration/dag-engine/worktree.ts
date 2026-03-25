import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { stat } from "node:fs/promises";
import path from "node:path";

export interface WorktreeInfo {
  path: string; // absolute path to worktree
  branch: string; // branch name, e.g. "mc/goal-{goalId}/task-{taskId}"
  taskId: string;
}

/** Create a new worktree branching from baseRef */
export async function createWorktree(
  repoRoot: string,
  goalId: string,
  taskId: string,
  baseRef: string,
): Promise<WorktreeInfo> {
  const worktreePath = path.join(
    repoRoot,
    ".amoena-worktrees",
    goalId,
    taskId,
  );
  const branch = `mc/goal-${goalId}/task-${taskId}`;

  await promisify(execFile)(
    "git",
    ["worktree", "add", worktreePath, "-b", branch, baseRef],
    { cwd: repoRoot },
  );

  return { path: worktreePath, branch, taskId };
}

/** Remove a worktree (after merge or 24h cleanup) */
export async function removeWorktree(
  repoRoot: string,
  worktreePath: string,
): Promise<void> {
  await promisify(execFile)("git", ["worktree", "remove", "--force", worktreePath], {
    cwd: repoRoot,
  });
}

/** List all worktrees older than maxAgeMs (for cleanup job) */
export async function listStaleWorktrees(
  repoRoot: string,
  maxAgeMs = 86_400_000,
): Promise<WorktreeInfo[]> {
  const { stdout } = await promisify(execFile)(
    "git",
    ["worktree", "list", "--porcelain"],
    { cwd: repoRoot },
  );

  const worktrees = parseWorktreeList(stdout);
  const now = Date.now();
  const stale: WorktreeInfo[] = [];

  for (const wt of worktrees) {
    // Skip the main worktree
    if (wt.path === repoRoot) continue;

    // Only include worktrees under .amoena-worktrees/
    if (!wt.path.includes(".amoena-worktrees")) continue;

    try {
      const stats = await stat(wt.path);
      const ageMs = now - stats.mtimeMs;
      if (ageMs > maxAgeMs) {
        stale.push(wt);
      }
    } catch {
      // Directory gone — skip
    }
  }

  return stale;
}

interface RawWorktree {
  path: string;
  branch: string;
}

function parseWorktreeList(porcelain: string): WorktreeInfo[] {
  const worktrees: WorktreeInfo[] = [];
  const blocks = porcelain.trim().split("\n\n");

  for (const block of blocks) {
    const lines = block.split("\n");
    let wtPath = "";
    let branch = "";

    for (const line of lines) {
      if (line.startsWith("worktree ")) {
        wtPath = line.slice("worktree ".length);
      } else if (line.startsWith("branch ")) {
        branch = line.slice("branch ".length).replace("refs/heads/", "");
      }
    }

    if (!wtPath) continue;

    // Extract taskId from branch name: mc/goal-{goalId}/task-{taskId}
    const match = branch.match(/\/task-(.+)$/);
    const taskId = match ? match[1] : "";

    worktrees.push({ path: wtPath, branch, taskId });
  }

  return worktrees;
}
