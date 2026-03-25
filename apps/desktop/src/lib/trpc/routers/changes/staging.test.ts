import { describe, expect, it, mock } from "bun:test";

// Mock all dependencies
mock.module("./security/git-commands", () => ({
	gitStageFile: mock(() => Promise.resolve()),
	gitUnstageFile: mock(() => Promise.resolve()),
	gitCheckoutFile: mock(() => Promise.resolve()),
	gitStageFiles: mock(() => Promise.resolve()),
	gitUnstageFiles: mock(() => Promise.resolve()),
	gitStageAll: mock(() => Promise.resolve()),
	gitUnstageAll: mock(() => Promise.resolve()),
	gitDiscardAllUnstaged: mock(() => Promise.resolve()),
	gitDiscardAllStaged: mock(() => Promise.resolve()),
	gitStash: mock(() => Promise.resolve()),
	gitStashIncludeUntracked: mock(() => Promise.resolve()),
	gitStashPop: mock(() => Promise.resolve()),
}));

mock.module("./security/path-validation", () => ({
	assertRegisteredWorktree: () => {},
}));

mock.module("./utils/status-cache", () => ({
	clearStatusCacheForWorktree: mock(() => {}),
}));

mock.module("./utils/parse-status", () => ({
	parseGitStatus: mock(() => ({
		staged: [],
		unstaged: [],
		untracked: [],
	})),
}));

mock.module("../workspaces/utils/git-client", () => ({
	getSimpleGitWithShellPath: () =>
		Promise.resolve({
			status: mock(() =>
				Promise.resolve({
					files: [],
					staged: [],
					not_added: [],
				}),
			),
		}),
}));

mock.module("../workspace-fs-service", () => ({
	getServiceForRootPath: () => ({
		deletePath: mock(() => Promise.resolve()),
	}),
}));

const { createStagingRouter } = await import("./staging");

describe("staging router", () => {
	it("creates a router with expected procedures", () => {
		const router = createStagingRouter();
		expect(router).toBeDefined();
		expect(typeof router).toBe("object");
	});
});
