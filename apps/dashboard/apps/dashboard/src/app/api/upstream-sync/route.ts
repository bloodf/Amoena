import { NextResponse } from "next/server";

const UPSTREAM_REPOS = [
	{ owner: "builderz-labs", repo: "mission-control", package: "@lunaria/dashboard" },
	{ owner: "superset-sh", repo: "superset", package: "@lunaria/desktop" },
	{ owner: "thedotmack", repo: "claude-mem", package: "@lunaria/memory" },
];

export async function GET() {
	try {
		const results = await Promise.allSettled(
			UPSTREAM_REPOS.map(async (repo) => {
				const url = `https://api.github.com/repos/${repo.owner}/${repo.repo}/releases/latest`;
				const res = await fetch(url, {
					headers: { Accept: "application/vnd.github.v3+json" },
					next: { revalidate: 3600 },
				});
				if (!res.ok) return { repo, release: null, hasUpdate: false };
				const data = await res.json();
				return {
					repo,
					release: {
						tag: data.tag_name,
						publishedAt: data.published_at,
						url: data.html_url,
						body: (data.body ?? "").slice(0, 500),
					},
					hasUpdate: true,
				};
			}),
		);

		const statuses = results
			.filter((r): r is PromiseFulfilledResult<any> => r.status === "fulfilled")
			.map((r) => r.value);

		return NextResponse.json({ upstreams: statuses, checkedAt: new Date().toISOString() });
	} catch {
		return NextResponse.json({ error: "Failed to check upstreams" }, { status: 500 });
	}
}
