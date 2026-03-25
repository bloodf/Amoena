import { describe, expect, it } from "bun:test";
import { isUpstreamMissingError, isNoPullRequestFoundMessage } from "./git-utils";

describe("git-utils", () => {
	describe("isUpstreamMissingError", () => {
		it("detects 'no such ref was fetched'", () => {
			expect(isUpstreamMissingError("fatal: no such ref was fetched")).toBe(true);
		});

		it("detects 'no tracking information'", () => {
			expect(
				isUpstreamMissingError("There is no tracking information for the current branch"),
			).toBe(true);
		});

		it("detects 'couldn't find remote ref'", () => {
			expect(isUpstreamMissingError("fatal: couldn't find remote ref feature")).toBe(true);
		});

		it("detects 'cannot be resolved to branch'", () => {
			expect(isUpstreamMissingError("fatal: cannot be resolved to branch")).toBe(true);
		});

		it("returns false for unrelated errors", () => {
			expect(isUpstreamMissingError("permission denied")).toBe(false);
			expect(isUpstreamMissingError("network timeout")).toBe(false);
			expect(isUpstreamMissingError("")).toBe(false);
		});
	});

	describe("isNoPullRequestFoundMessage", () => {
		it("detects 'no pull request' (case insensitive)", () => {
			expect(isNoPullRequestFoundMessage("No pull request found")).toBe(true);
			expect(isNoPullRequestFoundMessage("no pull request exists")).toBe(true);
			expect(isNoPullRequestFoundMessage("NO PULL REQUEST")).toBe(true);
		});

		it("returns false for unrelated messages", () => {
			expect(isNoPullRequestFoundMessage("merge conflict")).toBe(false);
			expect(isNoPullRequestFoundMessage("")).toBe(false);
		});
	});
});
