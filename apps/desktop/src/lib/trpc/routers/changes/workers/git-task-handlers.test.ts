import { describe, expect, it, mock } from "bun:test";
import { resolve } from "node:path";
import type { ChangedFile, GitChangesStatus } from "shared/changes-types";
import type { SimpleGit, StatusResult } from "simple-git";

const mockGetStatusNoLock = mock(() =>
	Promise.resolve({
		branch: "main",
		current: "main",
		tracking: "origin/main",
		staged: [] as Array<{ path: string; index: string; working_dir: string }>,
		modified: [] as Array<{ path: string; index: string; working_dir: string }>,
		not_added: [] as string[],
		deleted: [] as Array<{ path: string; index: string; working_dir: string }>,
		renamed: [] as Array<{ from: string; to: string }>,
		untracked: [] as string[],
	} as StatusResult),
);

const mockGetSimpleGitWithShellPath = mock(() =>
	Promise.resolve({
		raw: mock(() => Promise.resolve("")),
		branch: mock(() =>
			Promise.resolve({
				branches: {
					main: { current: true, name: "main" },
				},
			}),
		),
	}),
);

mock.module("../../workspaces/utils/git", () => ({
	getStatusNoLock: mockGetStatusNoLock,
}));

mock.module("../../workspaces/utils/git-client", () => ({
	getSimpleGitWithShellPath: mockGetSimpleGitWithShellPath,
}));

const { executeGitTask } = await import("./git-task-handlers");

describe("git-task-handlers", () => {
	describe("executeGitTask", () => {
		it("executes getStatus task", async () => {
			mockGetSimpleGitWithShellPath.mockResolvedValue({
				raw: mock(() => Promise.resolve("")),
				branch: mock(() =>
					Promise.resolve({
						branches: {
							main: { current: true, name: "main" },
						},
					}),
				),
			} as unknown as SimpleGit);

			mockGetStatusNoLock.mockResolvedValue({
				branch: "main",
				current: "main",
				tracking: "origin/main",
				staged: [],
				modified: [],
				not_added: [],
				deleted: [],
				renamed: [],
				untracked: [],
			} as unknown as StatusResult);

			const result = await executeGitTask("getStatus", {
				worktreePath: "/test/worktree",
				defaultBranch: "main",
			});

			expect(result).toHaveProperty("branch");
			expect(result).toHaveProperty("staged");
			expect(result).toHaveProperty("unstaged");
			expect(result).toHaveProperty("untracked");
		});

		it("executes getCommitFiles task", async () => {
			mockGetSimpleGitWithShellPath.mockResolvedValue({
				raw: mock(() =>
					Promise.resolve("M\tsrc/index.ts\nA\tsrc/new.ts"),
			} as unknown as SimpleGit);

			const result = await executeGitTask("getCommitFiles", {
				worktreePath: "/test/worktree",
				commitHash: "abc123",
			});

			expect(Array.isArray(result)).toBe(true);
		});

		it("throws error for unknown task type", async () => {
			await expect(
				// @ts-ignore - testing unknown task type
				executeGitTask("unknown" as any, {}),
			).rejects.toThrow("Unknown git task");
		});
	});
});
