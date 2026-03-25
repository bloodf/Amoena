import { describe, expect, it, mock } from "bun:test";

// Mock dependencies
mock.module("../workspaces/utils/git-client", () => ({
	getSimpleGitWithShellPath: () =>
		Promise.resolve({
			branch: mock(() =>
				Promise.resolve({
					branches: {
						main: {},
						feature: {},
						"remotes/origin/main": {},
						"remotes/origin/HEAD": {},
						"remotes/origin/dev": {},
					},
				}),
			),
			raw: mock((args: string[]) => {
				if (args[0] === "for-each-ref") {
					return Promise.resolve("main 1700000000\nfeature 1700000001\n");
				}
				if (args[0] === "symbolic-ref") {
					return Promise.resolve("refs/remotes/origin/main\n");
				}
				if (args[0] === "worktree") {
					return Promise.resolve("");
				}
				return Promise.resolve("");
			}),
			revparse: mock(() => Promise.resolve("main\n")),
		}),
}));

mock.module("./security/path-validation", () => ({
	assertRegisteredWorktree: () => {},
	getRegisteredWorktree: () => ({
		id: "wt1",
		path: "/repo",
		branch: "main",
		gitStatus: { branch: "main" },
	}),
}));

mock.module("./security/git-commands", () => ({
	gitSwitchBranch: mock(() => Promise.resolve()),
}));

mock.module("../workspaces/utils/base-branch-config", () => ({
	getBranchBaseConfig: mock(() => Promise.resolve({ baseBranch: null })),
	setBranchBaseConfig: mock(() => Promise.resolve()),
	unsetBranchBaseConfig: mock(() => Promise.resolve()),
}));

mock.module("../workspaces/utils/git", () => ({
	getCurrentBranch: mock(() => Promise.resolve("main")),
}));

mock.module("./utils/status-cache", () => ({
	clearStatusCacheForWorktree: mock(() => {}),
}));

const { createBranchesRouter } = await import("./branches");

describe("branches router", () => {
	it("creates a router with expected procedures", () => {
		const router = createBranchesRouter();
		expect(router).toBeDefined();
		// The router object itself is a tRPC router, we verify it was created
		expect(typeof router).toBe("object");
	});
});
