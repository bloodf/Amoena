import { describe, expect, it, mock } from "bun:test";

mock.module("main/lib/analytics", () => ({
	track: mock(() => {}),
}));

mock.module("./db-helpers", () => ({
	getMaxProjectChildTabOrder: mock(() => 0),
	setLastActiveWorkspace: mock(() => {}),
	activateProject: mock(() => {}),
	touchWorkspace: mock(() => {}),
	updateActiveWorkspaceIfRemoved: mock(() => {}),
}));

mock.module("./base-branch", () => ({
	resolveWorkspaceBaseBranch: mock(() => "main"),
}));

mock.module("./base-branch-config", () => ({
	setBranchBaseConfig: mock(() => Promise.resolve()),
}));

mock.module("./git", () => ({
	listExternalWorktrees: mock(() => Promise.resolve([])),
	worktreeExists: mock(() => Promise.resolve(true)),
	listBranches: mock(() => Promise.resolve({ local: ["main"], remote: [] })),
}));

mock.module("./resolve-worktree-path", () => ({
	resolveWorktreePath: mock(() => "/repo/worktrees/feature"),
}));

mock.module("./setup", () => ({
	copyAmoenaConfigToWorktree: mock(() => {}),
	loadSetupConfig: mock(() => null),
}));

const mockInsertReturningGet = mock(() => ({
	id: "ws-1",
	projectId: "p1",
	worktreeId: "wt1",
	type: "worktree",
	branch: "feature",
	name: "feature",
	tabOrder: 1,
}));

const mockSelectGet = mock(() => ({
	id: "p1",
	mainRepoPath: "/repo",
	defaultBranch: "main",
	workspaceBaseBranch: null,
}));

mock.module("main/lib/local-db", () => ({
	localDb: {
		insert: () => ({
			values: () => ({
				returning: () => ({
					get: mockInsertReturningGet,
				}),
			}),
		}),
		select: () => ({
			from: () => ({
				where: () => ({
					get: mockSelectGet,
				}),
			}),
		}),
		update: () => ({
			set: () => ({
				where: () => ({
					run: mock(() => {}),
				}),
			}),
		}),
		delete: () => ({
			where: () => ({
				run: mock(() => {}),
			}),
		}),
	},
}));

const { createWorkspaceFromWorktree, createWorkspaceFromExternalWorktree } =
	await import("./workspace-creation");

describe("workspace-creation", () => {
	describe("createWorkspaceFromWorktree", () => {
		it("creates a workspace and returns it", () => {
			const result = createWorkspaceFromWorktree({
				projectId: "p1",
				worktreeId: "wt1",
				branch: "feature",
				name: "feature",
			});
			expect(result).toBeDefined();
			expect(result.id).toBe("ws-1");
		});
	});

	describe("createWorkspaceFromExternalWorktree", () => {
		it("returns undefined when no external worktree found", async () => {
			const result = await createWorkspaceFromExternalWorktree({
				projectId: "p1",
				branch: "feature",
				name: "feature",
			});
			expect(result).toBeUndefined();
		});
	});
});
