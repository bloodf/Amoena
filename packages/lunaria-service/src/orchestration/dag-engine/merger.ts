import { execFile } from "node:child_process";
import { promisify } from "node:util";
import type { TaskNode } from "./task-node.js";
import type { MergeResult, ConflictInfo } from "./types.js";

/** Collect files changed in a worktree branch relative to baseRef */
async function getChangedFiles(
  repoRoot: string,
  baseRef: string,
  branch: string,
): Promise<string[]> {
  try {
    const { stdout } = await promisify(execFile)(
      "git",
      ["diff", "--name-only", `${baseRef}...${branch}`],
      { cwd: repoRoot },
    );
    return stdout
      .trim()
      .split("\n")
      .filter((f) => f.length > 0);
  } catch {
    return [];
  }
}

/** Merge a branch into the current HEAD (no-ff) */
async function mergeBranch(repoRoot: string, branch: string): Promise<void> {
  await promisify(execFile)("git", ["merge", "--no-ff", branch], {
    cwd: repoRoot,
  });
}

export async function mergeTaskResults(
  repoRoot: string,
  _goalId: string,
  completedTasks: TaskNode[],
  topologicalOrder: string[],
  baseRef: string,
): Promise<MergeResult> {
  // Build ordered list of completed tasks in topological order
  const completedMap = new Map(completedTasks.map((t) => [t.spec.id, t]));
  const ordered = topologicalOrder
    .map((id) => completedMap.get(id))
    .filter((t): t is TaskNode => t !== undefined);

  // Collect changed files per task
  const taskFiles = new Map<string, string[]>();
  for (const task of ordered) {
    const branch = task.state.worktreePath
      ? `mc/goal-${_goalId}/task-${task.spec.id}`
      : null;
    if (!branch) continue;
    const files = await getChangedFiles(repoRoot, baseRef, branch);
    taskFiles.set(task.spec.id, files);
  }

  // Detect overlapping files
  const fileToTasks = new Map<string, string[]>();
  for (const [taskId, files] of taskFiles) {
    for (const file of files) {
      const existing = fileToTasks.get(file) ?? [];
      fileToTasks.set(file, [...existing, taskId]);
    }
  }

  const conflictingTaskIds = new Set<string>();
  for (const tasks of fileToTasks.values()) {
    if (tasks.length > 1) {
      for (const id of tasks) conflictingTaskIds.add(id);
    }
  }

  const conflicts: ConflictInfo[] = [];
  const mergedTasks: string[] = [];

  for (const task of ordered) {
    const taskId = task.spec.id;
    const branch = `mc/goal-${_goalId}/task-${taskId}`;

    if (conflictingTaskIds.has(taskId)) {
      // Collect conflicting files for this task
      const conflictFiles: string[] = [];
      for (const [file, tasks] of fileToTasks) {
        if (tasks.length > 1 && tasks.includes(taskId)) {
          conflictFiles.push(file);
        }
      }
      conflicts.push({
        taskId,
        files: conflictFiles,
        reason: `File overlap with ${[...conflictingTaskIds].filter((id) => id !== taskId).join(", ")}`,
      });
    } else {
      try {
        await mergeBranch(repoRoot, branch);
        mergedTasks.push(taskId);
      } catch {
        conflicts.push({
          taskId,
          files: taskFiles.get(taskId) ?? [],
          reason: "merge failed",
        });
      }
    }
  }

  const strategy: "auto" | "review_required" =
    conflicts.length > 0 ? "review_required" : "auto";

  // Get the current HEAD commit SHA
  let commitSha: string | null = null;
  try {
    const { stdout } = await promisify(execFile)(
      "git",
      ["rev-parse", "HEAD"],
      { cwd: repoRoot },
    );
    commitSha = stdout.trim() || null;
  } catch {
    commitSha = null;
  }

  return { strategy, mergedTasks, conflicts, commitSha };
}
