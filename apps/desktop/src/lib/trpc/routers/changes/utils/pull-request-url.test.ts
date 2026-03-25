import { describe, expect, test } from "bun:test";
import {
	buildPullRequestCompareUrl,
	normalizeGitHubRepoUrl,
	parseUpstreamRef,
} from "./pull-request-url";

describe("pull-request-url", () => {
	test("normalizes GitHub remote URLs", () => {
		expect(
			normalizeGitHubRepoUrl("https://github.com/Amoena/amoena.git"),
		).toBe("https://github.com/Amoena/amoena");
		expect(normalizeGitHubRepoUrl("git@github.com:Kitenite/amoena.git")).toBe(
			"https://github.com/Kitenite/amoena",
		);
		expect(
			normalizeGitHubRepoUrl("ssh://git@github.com/Kitenite/amoena.git"),
		).toBe("https://github.com/Kitenite/amoena");
	});

	test("parses upstream refs with slashes in branch names", () => {
		expect(parseUpstreamRef("kitenite/kitenite/halved-position")).toEqual({
			remoteName: "kitenite",
			branchName: "kitenite/halved-position",
		});
	});

	test("builds compare URLs for fork branches", () => {
		expect(
			buildPullRequestCompareUrl({
				baseRepoUrl: "https://github.com/Amoena/amoena.git",
				baseBranch: "main",
				headRepoOwner: "Kitenite",
				headBranch: "kitenite/halved-position",
			}),
		).toBe(
			"https://github.com/Amoena/amoena/compare/main...Kitenite:kitenite/halved-position?expand=1",
		);
	});
});
