import { describe, expect, it, mock } from "bun:test";
import { resolve, sep } from "node:path";

// We need to mock the localDb used by assertRegisteredWorktree/getRegisteredWorktree.
// The module uses: localDb.select().from(X).where(eq(X.col, val)).get()
// We need to control what .get() returns.
let mockGetResult: unknown = null;

mock.module("main/lib/local-db", () => ({
	localDb: {
		select: () => ({
			from: () => ({
				where: () => ({
					get: () => mockGetResult,
				}),
			}),
		}),
	},
}));

// drizzle-orm eq is used but we just need it to not crash
mock.module("drizzle-orm", () => ({
	eq: () => "mock-eq",
}));

const {
	PathValidationError,
	validateRelativePath,
	resolvePathInWorktree,
	assertValidGitPath,
	assertRegisteredWorktree,
	getRegisteredWorktree,
} = await import("./path-validation");

describe("path-validation", () => {
	describe("PathValidationError", () => {
		it("has correct name and code", () => {
			const err = new PathValidationError("test msg", "ABSOLUTE_PATH");
			expect(err.name).toBe("PathValidationError");
			expect(err.code).toBe("ABSOLUTE_PATH");
			expect(err.message).toBe("test msg");
			expect(err).toBeInstanceOf(Error);
		});
	});

	describe("validateRelativePath", () => {
		it("rejects absolute paths", () => {
			expect(() => validateRelativePath("/etc/passwd")).toThrow("Absolute paths are not allowed");
		});

		it("rejects path traversal with ..", () => {
			expect(() => validateRelativePath("../secret")).toThrow("Path traversal not allowed");
			expect(() => validateRelativePath("foo/../../etc/passwd")).toThrow("Path traversal not allowed");
		});

		it("allows directories containing .. in their name", () => {
			expect(() => validateRelativePath("..foo/bar")).not.toThrow();
		});

		it("rejects empty/root path by default", () => {
			expect(() => validateRelativePath("")).toThrow("Cannot target worktree root");
			expect(() => validateRelativePath(".")).toThrow("Cannot target worktree root");
		});

		it("allows root path when allowRoot is true", () => {
			expect(() => validateRelativePath("", { allowRoot: true })).not.toThrow();
			expect(() => validateRelativePath(".", { allowRoot: true })).not.toThrow();
		});

		it("allows normal relative paths", () => {
			expect(() => validateRelativePath("src/index.ts")).not.toThrow();
			expect(() => validateRelativePath("package.json")).not.toThrow();
			expect(() => validateRelativePath("a/b/c/d.txt")).not.toThrow();
		});
	});

	describe("resolvePathInWorktree", () => {
		it("resolves a relative path within a worktree", () => {
			const result = resolvePathInWorktree("/home/user/repo", "src/index.ts");
			// Use resolve to get the expected path for this platform
			expect(result).toBe(resolve("/home/user/repo", "src/index.ts"));
		});

		it("rejects absolute file paths", () => {
			expect(() => resolvePathInWorktree("/home/user/repo", "/etc/passwd")).toThrow(
				"Absolute paths are not allowed",
			);
		});

		it("rejects traversal attempts", () => {
			expect(() => resolvePathInWorktree("/home/user/repo", "../../../etc/passwd")).toThrow(
				"Path traversal not allowed",
			);
		});
	});

	describe("assertValidGitPath", () => {
		it("allows root path (for git operations)", () => {
			expect(() => assertValidGitPath("")).not.toThrow();
			expect(() => assertValidGitPath(".")).not.toThrow();
		});

		it("rejects absolute paths", () => {
			expect(() => assertValidGitPath("/etc/passwd")).toThrow("Absolute paths are not allowed");
		});

		it("rejects path traversal", () => {
			expect(() => assertValidGitPath("../secret")).toThrow("Path traversal not allowed");
		});

		it("allows normal file paths", () => {
			expect(() => assertValidGitPath("src/app.ts")).not.toThrow();
		});
	});

	describe("assertRegisteredWorktree", () => {
		it("throws for unregistered worktree", () => {
			mockGetResult = null;
			expect(() => assertRegisteredWorktree("/nonexistent")).toThrow(
				"Workspace path not registered",
			);
		});

		it("does not throw for registered worktree", () => {
			mockGetResult = { id: "wt1", path: "/repo" };
			expect(() => assertRegisteredWorktree("/repo")).not.toThrow();
		});
	});

	describe("getRegisteredWorktree", () => {
		it("throws for unregistered worktree", () => {
			mockGetResult = null;
			expect(() => getRegisteredWorktree("/nonexistent")).toThrow(
				"Worktree not registered",
			);
		});

		it("returns worktree record when registered", () => {
			const record = { id: "wt1", path: "/repo", branch: "main" };
			mockGetResult = record;
			expect(getRegisteredWorktree("/repo")).toEqual(record);
		});
	});
});
