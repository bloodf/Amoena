import { describe, expect, it, mock } from "bun:test";

// Mock all procedure modules
mock.module("./procedures/create", () => ({
	createCreateProcedures: () => ({}),
}));
mock.module("./procedures/delete", () => ({
	createDeleteProcedures: () => ({}),
}));
mock.module("./procedures/generate-branch-name", () => ({
	createGenerateBranchNameProcedures: () => ({}),
}));
mock.module("./procedures/git-status", () => ({
	createGitStatusProcedures: () => ({}),
}));
mock.module("./procedures/init", () => ({
	createInitProcedures: () => ({}),
}));
mock.module("./procedures/query", () => ({
	createQueryProcedures: () => ({}),
}));
mock.module("./procedures/sections", () => ({
	createSectionsProcedures: () => ({}),
}));
mock.module("./procedures/status", () => ({
	createStatusProcedures: () => ({}),
}));

const { createWorkspacesRouter } = await import("./workspaces");

describe("workspaces router", () => {
	it("creates a merged router", () => {
		const router = createWorkspacesRouter();
		expect(router).toBeDefined();
		expect(typeof router).toBe("object");
	});
});
