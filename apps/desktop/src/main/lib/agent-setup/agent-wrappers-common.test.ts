import { afterEach, beforeEach, describe, expect, it, mock } from "bun:test";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

const TEST_ROOT = path.join(
	tmpdir(),
	`amoena-common-test-${process.pid}-${Date.now()}`,
);
const TEST_BIN_DIR = path.join(TEST_ROOT, "bin");

mock.module("./paths", () => ({
	BIN_DIR: TEST_BIN_DIR,
}));

const {
	writeFileIfChanged,
	isAmoenaManagedHookCommand,
	reconcileManagedEntries,
	buildWrapperScript,
	getWrapperPath,
	WRAPPER_MARKER,
	AMOENA_MANAGED_BINARIES,
} = await import("./agent-wrappers-common");

describe("agent-wrappers-common", () => {
	beforeEach(() => {
		mkdirSync(TEST_BIN_DIR, { recursive: true });
	});

	afterEach(() => {
		rmSync(TEST_ROOT, { recursive: true, force: true });
	});

	describe("AMOENA_MANAGED_BINARIES", () => {
		it("includes expected binaries", () => {
			expect(AMOENA_MANAGED_BINARIES).toContain("claude");
			expect(AMOENA_MANAGED_BINARIES).toContain("codex");
			expect(AMOENA_MANAGED_BINARIES).toContain("gemini");
			expect(AMOENA_MANAGED_BINARIES).toContain("copilot");
		});
	});

	describe("writeFileIfChanged", () => {
		it("writes file and returns true on first write", () => {
			const filePath = path.join(TEST_ROOT, "test.txt");
			const result = writeFileIfChanged(filePath, "content", 0o644);
			expect(result).toBe(true);
			expect(readFileSync(filePath, "utf-8")).toBe("content");
		});

		it("returns false when content unchanged", () => {
			const filePath = path.join(TEST_ROOT, "test.txt");
			writeFileIfChanged(filePath, "content", 0o644);
			const result = writeFileIfChanged(filePath, "content", 0o644);
			expect(result).toBe(false);
		});

		it("returns true when content changed", () => {
			const filePath = path.join(TEST_ROOT, "test.txt");
			writeFileIfChanged(filePath, "old", 0o644);
			const result = writeFileIfChanged(filePath, "new", 0o644);
			expect(result).toBe(true);
			expect(readFileSync(filePath, "utf-8")).toBe("new");
		});
	});

	describe("isAmoenaManagedHookCommand", () => {
		it("returns false for undefined command", () => {
			expect(isAmoenaManagedHookCommand(undefined, "notify.sh")).toBe(false);
		});

		it("returns false for unrelated commands", () => {
			expect(isAmoenaManagedHookCommand("echo hello", "notify.sh")).toBe(false);
		});

		it("detects Amoena-managed hook command", () => {
			expect(
				isAmoenaManagedHookCommand(
					"/home/user/.amoena/hooks/notify.sh",
					"notify.sh",
				),
			).toBe(true);
		});

		it("detects environment-scoped Amoena paths", () => {
			expect(
				isAmoenaManagedHookCommand(
					"/home/user/.amoena-dev/hooks/notify.sh",
					"notify.sh",
				),
			).toBe(true);
		});

		it("handles backslash paths (Windows)", () => {
			expect(
				isAmoenaManagedHookCommand(
					"C:\\Users\\user\\.amoena\\hooks\\notify.sh",
					"notify.sh",
				),
			).toBe(true);
		});
	});

	describe("reconcileManagedEntries", () => {
		it("returns desired entries when no current entries", () => {
			const result = reconcileManagedEntries({
				current: undefined,
				desired: [{ id: "a" }],
				isManaged: () => false,
				isEquivalent: () => false,
			});
			expect(result.entries).toEqual([{ id: "a" }]);
			expect(result.replacedManagedEntries).toEqual([]);
		});

		it("preserves non-managed entries", () => {
			const result = reconcileManagedEntries({
				current: [{ id: "user" }, { id: "managed" }],
				desired: [{ id: "new-managed" }],
				isManaged: (e: { id: string }) => e.id === "managed",
				isEquivalent: () => false,
			});
			expect(result.entries).toEqual([{ id: "user" }, { id: "new-managed" }]);
			expect(result.replacedManagedEntries).toEqual([{ id: "managed" }]);
		});

		it("does not duplicate managed entries that match desired", () => {
			const result = reconcileManagedEntries({
				current: [{ id: "managed" }],
				desired: [{ id: "managed" }],
				isManaged: () => true,
				isEquivalent: (a: { id: string }, b: { id: string }) => a.id === b.id,
			});
			// Old managed is removed, new desired is added
			expect(result.entries).toEqual([{ id: "managed" }]);
		});
	});

	describe("buildWrapperScript", () => {
		it("includes the marker", () => {
			const script = buildWrapperScript("claude", 'exec "$REAL_BIN" "$@"');
			expect(script).toContain(WRAPPER_MARKER);
		});

		it("includes shebang", () => {
			const script = buildWrapperScript("claude", 'exec "$REAL_BIN" "$@"');
			expect(script.startsWith("#!/bin/bash")).toBe(true);
		});

		it("includes the binary name", () => {
			const script = buildWrapperScript("claude", 'exec "$REAL_BIN" "$@"');
			expect(script).toContain("claude");
		});

		it("includes the exec line", () => {
			const script = buildWrapperScript("test-bin", "echo hello");
			expect(script).toContain("echo hello");
		});

		it("includes find_real_binary function", () => {
			const script = buildWrapperScript("claude", 'exec "$REAL_BIN" "$@"');
			expect(script).toContain("find_real_binary");
		});
	});

	describe("getWrapperPath", () => {
		it("returns path under BIN_DIR", () => {
			const p = getWrapperPath("claude");
			expect(p).toBe(path.join(TEST_BIN_DIR, "claude"));
		});
	});
});
