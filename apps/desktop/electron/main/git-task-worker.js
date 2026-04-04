import { parentPort } from "node:worker_threads";
import { realpath, stat, readFile } from "node:fs/promises";
import { resolve, relative, sep, isAbsolute } from "node:path";
import { S as parseDiffNumstat, a as getSimpleGitWithShellPath, T as parseNameStatus, U as getStatusNoLock, i as parseGitStatus, V as parseGitLog } from "./chunks/parse-status-8uMFNboz.js";
import "node:child_process";
import "node:crypto";
import "node:util";
import "./chunks/_commonjsHelpers-BVEIagUZ.js";
import "node:buffer";
import "fs";
import "tty";
import "util";
import "os";
import "child_process";
import "node:events";
import "node:process";
import "path";
import "assert";
import "events";
import "buffer";
import "stream";
import "./chunks/index-d7r8qpVm.js";
import "node:os";
async function applyNumstatToFiles(git, files, diffArgs) {
  if (files.length === 0) return;
  try {
    const numstat = await git.raw(diffArgs);
    const stats = parseDiffNumstat(numstat);
    for (const file of files) {
      const fileStat = stats.get(file.path);
      if (fileStat) {
        file.additions = fileStat.additions;
        file.deletions = fileStat.deletions;
      }
    }
  } catch {
  }
}
const MAX_LINE_COUNT_SIZE = 1 * 1024 * 1024;
const WORKER_DEBUG = process.env.AMOENA_WORKER_DEBUG === "1";
function logWorkerWarning(message, error) {
  console.warn(`[changes-git-worker] ${message}`, error);
}
function logWorkerDebug(message, error) {
  if (!WORKER_DEBUG) return;
  logWorkerWarning(message, error);
}
function isPathWithinWorktree(worktreePath, candidate) {
  const relativePath = relative(worktreePath, candidate);
  if (relativePath === "") return true;
  return relativePath !== ".." && !relativePath.startsWith(`..${sep}`) && !isAbsolute(relativePath);
}
function resolvePathInWorktree(worktreePath, filePath) {
  const absolutePath = resolve(worktreePath, filePath);
  if (!isPathWithinWorktree(worktreePath, absolutePath)) {
    return null;
  }
  return absolutePath;
}
async function applyUntrackedLineCount(worktreePath, untracked) {
  let worktreeReal;
  try {
    worktreeReal = await realpath(worktreePath);
  } catch (error) {
    logWorkerWarning(
      `failed to resolve worktree realpath for line counting: ${worktreePath}`,
      error
    );
    return;
  }
  for (const file of untracked) {
    try {
      const absolutePath = resolvePathInWorktree(worktreePath, file.path);
      if (!absolutePath) continue;
      const fileReal = await realpath(absolutePath);
      if (!isPathWithinWorktree(worktreeReal, fileReal)) continue;
      const stats = await stat(fileReal);
      if (!stats.isFile() || stats.size > MAX_LINE_COUNT_SIZE) continue;
      const content = await readFile(fileReal, "utf-8");
      const lineCount = content === "" ? 0 : content.endsWith("\n") ? content.split(/\r?\n/).length - 1 : content.split(/\r?\n/).length;
      file.additions = lineCount;
      file.deletions = 0;
    } catch (error) {
      logWorkerDebug(
        `failed untracked line count for "${file.path}" in "${worktreePath}"`,
        error
      );
    }
  }
}
async function getBranchComparison(git, defaultBranch) {
  let commits = [];
  let againstBase = [];
  let ahead = 0;
  let behind = 0;
  try {
    const tracking = await git.raw([
      "rev-list",
      "--left-right",
      "--count",
      `origin/${defaultBranch}...HEAD`
    ]);
    const [behindStr, aheadStr] = tracking.trim().split(/\s+/);
    behind = Number.parseInt(behindStr || "0", 10);
    ahead = Number.parseInt(aheadStr || "0", 10);
    const logOutput = await git.raw([
      "log",
      `origin/${defaultBranch}..HEAD`,
      "--format=%H|%h|%s|%an|%aI"
    ]);
    commits = parseGitLog(logOutput);
    if (ahead > 0) {
      const nameStatus = await git.raw([
        "diff",
        "--name-status",
        `origin/${defaultBranch}...HEAD`
      ]);
      againstBase = parseNameStatus(nameStatus);
      await applyNumstatToFiles(git, againstBase, [
        "diff",
        "--numstat",
        `origin/${defaultBranch}...HEAD`
      ]);
    }
  } catch (error) {
    logWorkerDebug(
      `failed to compute branch comparison against ${defaultBranch}`,
      error
    );
  }
  return { commits, againstBase, ahead, behind };
}
async function getTrackingBranchStatus(git) {
  try {
    const upstream = await git.raw([
      "rev-parse",
      "--abbrev-ref",
      "@{upstream}"
    ]);
    if (!upstream.trim()) {
      return { pushCount: 0, pullCount: 0, hasUpstream: false };
    }
    const tracking = await git.raw([
      "rev-list",
      "--left-right",
      "--count",
      "@{upstream}...HEAD"
    ]);
    const [pullStr, pushStr] = tracking.trim().split(/\s+/);
    return {
      pushCount: Number.parseInt(pushStr || "0", 10),
      pullCount: Number.parseInt(pullStr || "0", 10),
      hasUpstream: true
    };
  } catch (error) {
    logWorkerDebug("failed to compute tracking branch status", error);
    return { pushCount: 0, pullCount: 0, hasUpstream: false };
  }
}
async function computeStatus({
  worktreePath,
  defaultBranch
}) {
  const git = await getSimpleGitWithShellPath(worktreePath);
  const status = await getStatusNoLock(worktreePath);
  const parsed = parseGitStatus(status);
  const [branchComparison, trackingStatus] = await Promise.all([
    getBranchComparison(git, defaultBranch),
    getTrackingBranchStatus(git),
    applyNumstatToFiles(git, parsed.staged, ["diff", "--cached", "--numstat"]),
    applyNumstatToFiles(git, parsed.unstaged, ["diff", "--numstat"]),
    applyUntrackedLineCount(worktreePath, parsed.untracked)
  ]);
  return {
    branch: parsed.branch,
    defaultBranch,
    againstBase: branchComparison.againstBase,
    commits: branchComparison.commits,
    staged: parsed.staged,
    unstaged: parsed.unstaged,
    untracked: parsed.untracked,
    ahead: branchComparison.ahead,
    behind: branchComparison.behind,
    pushCount: trackingStatus.pushCount,
    pullCount: trackingStatus.pullCount,
    hasUpstream: trackingStatus.hasUpstream
  };
}
async function computeCommitFiles({
  worktreePath,
  commitHash
}) {
  const git = await getSimpleGitWithShellPath(worktreePath);
  const nameStatus = await git.raw([
    "diff-tree",
    "--no-commit-id",
    "--name-status",
    "-r",
    commitHash
  ]);
  const files = parseNameStatus(nameStatus);
  await applyNumstatToFiles(git, files, [
    "diff-tree",
    "--no-commit-id",
    "--numstat",
    "-r",
    commitHash
  ]);
  return files;
}
async function executeGitTask(taskType, payload) {
  switch (taskType) {
    case "getStatus":
      return computeStatus(
        payload
      );
    case "getCommitFiles":
      return computeCommitFiles(
        payload
      );
    default: {
      const exhaustive = taskType;
      throw new Error(`Unknown git task: ${exhaustive}`);
    }
  }
}
function serializeWorkerError(error) {
  if (error instanceof Error) {
    const serialized = {
      name: error.name,
      message: error.message,
      stack: error.stack
    };
    if ("code" in error && typeof error.code === "string") {
      serialized.code = error.code;
    }
    return serialized;
  }
  return {
    name: "Error",
    message: String(error)
  };
}
if (!parentPort) {
  throw new Error("git-task-worker must be run in a worker thread");
}
function isWorkerTaskRequestMessage(message) {
  if (!message || typeof message !== "object") {
    return false;
  }
  const candidate = message;
  return candidate.kind === "task" && typeof candidate.taskId === "string" && typeof candidate.taskType === "string";
}
parentPort.on("message", async (message) => {
  if (!isWorkerTaskRequestMessage(message)) return;
  const task = message;
  try {
    const result = await executeGitTask(
      task.taskType,
      task.payload
    );
    parentPort?.postMessage({
      kind: "result",
      taskId: task.taskId,
      ok: true,
      result
    });
  } catch (error) {
    parentPort?.postMessage({
      kind: "result",
      taskId: task.taskId,
      ok: false,
      error: serializeWorkerError(error)
    });
  }
});
//# sourceMappingURL=git-task-worker.js.map
