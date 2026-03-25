/**
 * Upstream Sync Pipeline — watches source repos for new releases
 * and generates merge suggestions for Amoena.
 *
 * Monitors: mission-control, superset, claude-mem
 */

export interface UpstreamRepo {
	readonly owner: string;
	readonly repo: string;
	readonly package: string;
	readonly description: string;
}

export const UPSTREAM_REPOS: readonly UpstreamRepo[] = [
	{
		owner: "builderz-labs",
		repo: "mission-control",
		package: "@lunaria/dashboard",
		description: "AI agent orchestration dashboard",
	},
	{
		owner: "superset-sh",
		repo: "superset",
		package: "@lunaria/desktop",
		description: "Electron IDE for AI agents",
	},
	{
		owner: "thedotmack",
		repo: "claude-mem",
		package: "@lunaria/memory",
		description: "Persistent memory engine",
	},
] as const;

export interface ReleaseInfo {
	readonly repo: UpstreamRepo;
	readonly tag: string;
	readonly publishedAt: string;
	readonly url: string;
	readonly body: string;
}

export interface SyncStatus {
	readonly repo: UpstreamRepo;
	readonly lastChecked: string;
	readonly latestRelease: ReleaseInfo | null;
	readonly currentVersion: string | null;
	readonly hasUpdate: boolean;
}

/**
 * Check a GitHub repo for its latest release.
 * Uses the GitHub API (no auth required for public repos).
 */
export async function checkLatestRelease(
	repo: UpstreamRepo,
): Promise<ReleaseInfo | null> {
	try {
		const url = `https://api.github.com/repos/${repo.owner}/${repo.repo}/releases/latest`;
		const response = await fetch(url, {
			headers: { Accept: "application/vnd.github.v3+json" },
		});

		if (!response.ok) return null;

		const data = (await response.json()) as {
			tag_name: string;
			published_at: string;
			html_url: string;
			body: string;
		};

		return {
			repo,
			tag: data.tag_name,
			publishedAt: data.published_at,
			url: data.html_url,
			body: data.body ?? "",
		};
	} catch {
		return null;
	}
}

/**
 * Check all upstream repos for updates.
 */
export async function checkAllUpstreams(): Promise<readonly SyncStatus[]> {
	const results = await Promise.allSettled(
		UPSTREAM_REPOS.map(async (repo) => {
			const release = await checkLatestRelease(repo);
			return {
				repo,
				lastChecked: new Date().toISOString(),
				latestRelease: release,
				currentVersion: null as string | null,
				hasUpdate: release !== null,
			} satisfies SyncStatus;
		}),
	);

	return results
		.filter(
			(r): r is PromiseFulfilledResult<SyncStatus> => r.status === "fulfilled",
		)
		.map((r) => r.value);
}

/**
 * Generate a summary of what changed in an upstream release.
 * This can be fed to an AI agent to create merge suggestions.
 */
export function generateMergeSummary(release: ReleaseInfo): string {
	return [
		`## Upstream Update: ${release.repo.owner}/${release.repo.repo}`,
		`**Release:** ${release.tag}`,
		`**Published:** ${release.publishedAt}`,
		`**URL:** ${release.url}`,
		`**Amoena package:** ${release.repo.package}`,
		``,
		`### Release Notes`,
		release.body || "(no release notes)",
		``,
		`### Suggested Actions`,
		`1. Review the release notes for breaking changes`,
		`2. Compare the diff: \`git diff ${release.tag}..HEAD -- ${release.repo.package}\``,
		`3. Cherry-pick relevant changes into the Amoena package`,
		`4. Run tests to verify compatibility`,
	].join("\n");
}
