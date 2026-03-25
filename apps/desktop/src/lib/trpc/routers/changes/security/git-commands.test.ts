import { describe, expect, it, mock, beforeEach } from "bun:test";

// Mock dependencies
const mockRaw = mock(() => Promise.resolve(""));
const mockCheckout = mock(() => Promise.resolve());
const mockAdd = mock(() => Promise.resolve());
const mockReset = mock(() => Promise.resolve());
const mockStash = mock(() => Promise.resolve());

const mockGit = {
	raw: mockRaw,
	checkout: mockCheckout,
	add: mockAdd,
	reset: mockReset,
	stash: mockStash,
	revparse: mock(() => Promise.resolve("main\n")),
};

mock.module("../../workspaces/utils/git-client", () => ({
	getSimpleGitWithShellPath: () => Promise.resolve(mockGit),
}));

mock.module("../../utils/git-hook-tolerance", () => ({
	runWithPostCheckoutHookTolerance: async (opts: {
		run: () => Promise<void>;
		didSucceed: () => Promise<boolean>;
	}) => {
		await opts.run();
	},
}));

// Mock path validation - assertRegisteredWorktree should pass, assertValidGitPath should pass
mock.module("./path-validation", () => ({
	assertRegisteredWorktree: () => {},
	assertValidGitPath: () => {},
}));

const {
	gitSwitchBranch,
	gitCheckoutFile,
	gitStageFile,
	gitStageFiles,
	gitUnstageFile,
	gitUnstageFiles,
	gitStageAll,
	gitUnstageAll,
	gitDiscardAllUnstaged,
	gitDiscardAllStaged,
	gitStash,
	gitStashIncludeUntracked,
	gitStashPop,
} = await import("./git-commands");

describe("git-commands", () => {
	beforeEach(() => {
		mockRaw.mockReset();
		mockCheckout.mockReset();
		mockAdd.mockReset();
		mockReset.mockReset();
		mockStash.mockReset();
		mockRaw.mockResolvedValue("");
		mockCheckout.mockResolvedValue(undefined);
		mockAdd.mockResolvedValue(undefined);
		mockReset.mockResolvedValue(undefined);
		mockStash.mockResolvedValue(undefined);
	});

	describe("gitSwitchBranch", () => {
		it("rejects branch names starting with -", async () => {
			await expect(gitSwitchBranch("/repo", "--delete")).rejects.toThrow(
				"cannot start with -",
			);
		});

		it("rejects empty branch names", async () => {
			await expect(gitSwitchBranch("/repo", "")).rejects.toThrow("cannot be empty");
			await expect(gitSwitchBranch("/repo", "   ")).rejects.toThrow("cannot be empty");
		});

		it("uses git switch for branch switching", async () => {
			await gitSwitchBranch("/repo", "feature");
			expect(mockRaw).toHaveBeenCalledWith(["switch", "feature"]);
		});

		it("falls back to checkout for old git versions", async () => {
			mockRaw.mockRejectedValueOnce(new Error("git: 'switch' is not a git command"));
			await gitSwitchBranch("/repo", "feature");
			expect(mockCheckout).toHaveBeenCalledWith("feature");
		});

		it("re-throws non-version errors from git switch", async () => {
			mockRaw.mockRejectedValueOnce(new Error("branch not found"));
			await expect(gitSwitchBranch("/repo", "nonexistent")).rejects.toThrow("branch not found");
		});
	});

	describe("gitCheckoutFile", () => {
		it("uses -- for path mode", async () => {
			await gitCheckoutFile("/repo", "src/index.ts");
			expect(mockCheckout).toHaveBeenCalledWith(["--", "src/index.ts"]);
		});
	});

	describe("gitStageFile", () => {
		it("stages a single file with --", async () => {
			await gitStageFile("/repo", "file.ts");
			expect(mockAdd).toHaveBeenCalledWith(["--", "file.ts"]);
		});
	});

	describe("gitStageFiles", () => {
		it("throws on empty file list", async () => {
			await expect(gitStageFiles("/repo", [])).rejects.toThrow("must not be empty");
		});

		it("stages multiple files in one command", async () => {
			await gitStageFiles("/repo", ["a.ts", "b.ts"]);
			expect(mockAdd).toHaveBeenCalledWith(["--", "a.ts", "b.ts"]);
		});
	});

	describe("gitUnstageFile", () => {
		it("uses git reset HEAD -- path", async () => {
			await gitUnstageFile("/repo", "file.ts");
			expect(mockReset).toHaveBeenCalledWith(["HEAD", "--", "file.ts"]);
		});
	});

	describe("gitUnstageFiles", () => {
		it("throws on empty file list", async () => {
			await expect(gitUnstageFiles("/repo", [])).rejects.toThrow("must not be empty");
		});

		it("unstages multiple files in one command", async () => {
			await gitUnstageFiles("/repo", ["a.ts", "b.ts"]);
			expect(mockReset).toHaveBeenCalledWith(["HEAD", "--", "a.ts", "b.ts"]);
		});
	});

	describe("gitStageAll", () => {
		it("uses git add -A", async () => {
			await gitStageAll("/repo");
			expect(mockAdd).toHaveBeenCalledWith("-A");
		});
	});

	describe("gitUnstageAll", () => {
		it("uses git reset HEAD", async () => {
			await gitUnstageAll("/repo");
			expect(mockReset).toHaveBeenCalledWith(["HEAD"]);
		});
	});

	describe("gitDiscardAllUnstaged", () => {
		it("uses git checkout -- .", async () => {
			await gitDiscardAllUnstaged("/repo");
			expect(mockCheckout).toHaveBeenCalledWith(["--", "."]);
		});
	});

	describe("gitDiscardAllStaged", () => {
		it("resets then checks out", async () => {
			await gitDiscardAllStaged("/repo");
			expect(mockReset).toHaveBeenCalledWith(["HEAD"]);
			expect(mockCheckout).toHaveBeenCalledWith(["--", "."]);
		});
	});

	describe("gitStash", () => {
		it("uses git stash push", async () => {
			await gitStash("/repo");
			expect(mockStash).toHaveBeenCalledWith(["push"]);
		});
	});

	describe("gitStashIncludeUntracked", () => {
		it("uses --include-untracked", async () => {
			await gitStashIncludeUntracked("/repo");
			expect(mockStash).toHaveBeenCalledWith(["push", "--include-untracked"]);
		});
	});

	describe("gitStashPop", () => {
		it("uses git stash pop", async () => {
			await gitStashPop("/repo");
			expect(mockStash).toHaveBeenCalledWith(["pop"]);
		});
	});
});
