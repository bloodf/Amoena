import { describe, expect, it, mock } from "bun:test";

mock.module("./security/path-validation", () => ({
	assertRegisteredWorktree: () => {},
}));

mock.module("./utils/status-cache", () => ({
	clearStatusCacheForWorktree: mock(() => {}),
	getCachedStatus: mock(() => null),
	getInFlightStatus: mock(() => null),
	makeStatusCacheKey: mock((p: string, b: string) => `${p}:${b}`),
	setCachedStatus: mock(() => {}),
	setInFlightStatus: mock(() => {}),
	clearInFlightStatus: mock(() => {}),
}));

mock.module("./workers/git-task-runner", () => ({
	runGitTask: mock(() =>
		Promise.resolve({
			staged: [],
			unstaged: [],
			untracked: [],
			commits: [],
			stashCount: 0,
			branch: "main",
		}),
	),
}));

const { createStatusRouter } = await import("./status");

describe("status router", () => {
	it("creates a router with expected procedures", () => {
		const router = createStatusRouter();
		expect(router).toBeDefined();
		expect(typeof router).toBe("object");
	});
});
