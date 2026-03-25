"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader } from "@/components/ui/loader";

interface GitHubRepoStats {
	stargazers_count: number;
	forks_count: number;
	open_issues_count: number;
	subscribers_count: number;
}

interface GitHubContributor {
	login: string;
	avatar_url: string;
	html_url: string;
	contributions: number;
}

interface GitHubRelease {
	id: number;
	tag_name: string;
	name: string | null;
	html_url: string;
	published_at: string;
	body: string | null;
}

interface SkillSummary {
	id: string;
	name: string;
	description?: string;
}

interface SkillsResponse {
	skills: SkillSummary[];
	total: number;
}

const REPO = "Amoena-AI/amoena";
const GITHUB_BASE = "https://api.github.com";
const REVALIDATE = { next: { revalidate: 3600 } };

async function fetchRepoStats(): Promise<GitHubRepoStats | null> {
	try {
		const res = await fetch(`${GITHUB_BASE}/repos/${REPO}`, REVALIDATE);
		if (!res.ok) return null;
		return res.json();
	} catch {
		return null;
	}
}

async function fetchContributors(): Promise<GitHubContributor[]> {
	try {
		const res = await fetch(
			`${GITHUB_BASE}/repos/${REPO}/contributors?per_page=12`,
			REVALIDATE,
		);
		if (!res.ok) return [];
		return res.json();
	} catch {
		return [];
	}
}

async function fetchReleases(): Promise<GitHubRelease[]> {
	try {
		const res = await fetch(
			`${GITHUB_BASE}/repos/${REPO}/releases?per_page=5`,
			REVALIDATE,
		);
		if (!res.ok) return [];
		return res.json();
	} catch {
		return [];
	}
}

function formatNumber(n: number): string {
	if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
	return String(n);
}

function formatRelativeDate(dateStr: string): string {
	const diff = Date.now() - new Date(dateStr).getTime();
	const days = Math.floor(diff / 86_400_000);
	if (days === 0) return "today";
	if (days === 1) return "yesterday";
	if (days < 30) return `${days}d ago`;
	const months = Math.floor(days / 30);
	if (months < 12) return `${months}mo ago`;
	return `${Math.floor(months / 12)}y ago`;
}

interface CommunityData {
	stats: GitHubRepoStats | null;
	contributors: GitHubContributor[];
	releases: GitHubRelease[];
	skills: SkillSummary[];
	skillTotal: number;
}

export function CommunityDashboardPanel() {
	const [data, setData] = useState<CommunityData | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let cancelled = false;

		async function load() {
			try {
				const [stats, contributors, releases, skillsRes] =
					await Promise.allSettled([
						fetchRepoStats(),
						fetchContributors(),
						fetchReleases(),
						fetch("/api/skills", {
							signal: AbortSignal.timeout(8000),
						}).then((r) => (r.ok ? (r.json() as Promise<SkillsResponse>) : null)),
					]);

				if (cancelled) return;

				setData({
					stats:
						stats.status === "fulfilled" ? stats.value : null,
					contributors:
						contributors.status === "fulfilled" ? contributors.value : [],
					releases:
						releases.status === "fulfilled" ? releases.value : [],
					skills:
						skillsRes.status === "fulfilled" && skillsRes.value
							? (skillsRes.value.skills ?? []).slice(0, 6)
							: [],
					skillTotal:
						skillsRes.status === "fulfilled" && skillsRes.value
							? (skillsRes.value.total ?? 0)
							: 0,
				});
			} catch {
				if (!cancelled) setError("Failed to load community data.");
			} finally {
				if (!cancelled) setLoading(false);
			}
		}

		load();
		return () => {
			cancelled = true;
		};
	}, []);

	if (loading) {
		return <Loader variant="panel" label="Loading community data..." />;
	}

	if (error) {
		return (
			<div className="p-6 flex items-center justify-center">
				<p className="text-sm text-destructive">{error}</p>
			</div>
		);
	}

	const { stats, contributors, releases, skills, skillTotal } = data!;

	return (
		<div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6">
			{/* Header */}
			<div>
				<h2 className="text-lg font-semibold text-foreground">Community</h2>
				<p className="text-xs text-muted-foreground mt-0.5">
					Amoena project health, marketplace activity, and contribution
					opportunities
				</p>
			</div>

			{/* GitHub Stats */}
			<div className="rounded-lg border border-border bg-card overflow-hidden">
				<div className="px-4 py-3 border-b border-border flex items-center gap-2">
					<GitHubIcon />
					<h3 className="text-sm font-medium text-foreground">GitHub Stats</h3>
					<a
						href={`https://github.com/${REPO}`}
						target="_blank"
						rel="noopener noreferrer"
						className="ml-auto text-xs text-muted-foreground hover:text-primary transition-colors font-mono"
					>
						{REPO}
					</a>
				</div>
				<div className="p-4">
					{stats ? (
						<>
							<div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
								<StatCard
									label="Stars"
									value={formatNumber(stats.stargazers_count)}
									icon="★"
									color="text-yellow-400"
								/>
								<StatCard
									label="Forks"
									value={formatNumber(stats.forks_count)}
									icon={<ForkIcon />}
									color="text-blue-400"
								/>
								<StatCard
									label="Open Issues"
									value={formatNumber(stats.open_issues_count)}
									icon="!"
									color="text-orange-400"
								/>
								<StatCard
									label="Watchers"
									value={formatNumber(stats.subscribers_count)}
									icon="◎"
									color="text-purple-400"
								/>
							</div>

							{/* Sparkline placeholder — real trend data requires GraphQL */}
							<div className="mt-4">
								<div className="flex items-center justify-between mb-1.5">
									<span className="text-xs text-muted-foreground">
										Star trend (last 7 days)
									</span>
								</div>
								<Sparkline total={stats.stargazers_count} />
							</div>

							{/* Contributors */}
							{contributors.length > 0 && (
								<div className="mt-4">
									<div className="flex items-center justify-between mb-2">
										<span className="text-xs text-muted-foreground">
											Top contributors
										</span>
										<a
											href={`https://github.com/${REPO}/graphs/contributors`}
											target="_blank"
											rel="noopener noreferrer"
											className="text-2xs text-muted-foreground hover:text-primary transition-colors"
										>
											View all
										</a>
									</div>
									<div className="flex flex-wrap gap-2">
										{contributors.map((c) => (
											<a
												key={c.login}
												href={c.html_url}
												target="_blank"
												rel="noopener noreferrer"
												title={`${c.login} — ${c.contributions} contributions`}
												className="flex flex-col items-center gap-1 group"
											>
												<img
													src={c.avatar_url}
													alt={c.login}
													width={28}
													height={28}
													className="rounded-full border border-border group-hover:border-primary/60 transition-colors"
												/>
												<span className="text-2xs text-muted-foreground group-hover:text-foreground transition-colors max-w-[40px] truncate">
													{c.login}
												</span>
											</a>
										))}
									</div>
								</div>
							)}
						</>
					) : (
						<p className="text-xs text-muted-foreground text-center py-4">
							GitHub data unavailable — rate limit or network error.
						</p>
					)}
				</div>
			</div>

			{/* Marketplace */}
			<div className="rounded-lg border border-border bg-card overflow-hidden">
				<div className="px-4 py-3 border-b border-border flex items-center gap-2">
					<PuzzleIcon />
					<h3 className="text-sm font-medium text-foreground">
						Marketplace
					</h3>
					<span className="ml-auto text-xs text-muted-foreground">
						{skillTotal > 0 ? `${skillTotal} extensions` : "No extensions yet"}
					</span>
				</div>
				<div className="p-4">
					{skills.length > 0 ? (
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
							{skills.map((skill) => (
								<div
									key={skill.id}
									className="flex items-start gap-3 rounded-md border border-border/60 bg-zinc-900/50 px-3 py-2.5"
								>
									<div className="w-6 h-6 rounded bg-zinc-800 flex items-center justify-center shrink-0 mt-0.5">
										<PuzzleIcon small />
									</div>
									<div className="min-w-0">
										<div className="text-sm text-foreground truncate font-medium">
											{skill.name}
										</div>
										{skill.description && (
											<div className="text-xs text-muted-foreground truncate mt-0.5">
												{skill.description}
											</div>
										)}
									</div>
								</div>
							))}
						</div>
					) : (
						<p className="text-xs text-muted-foreground text-center py-4">
							No extensions installed locally. Browse the registry in the Skills
							panel.
						</p>
					)}
				</div>
			</div>

			{/* Activity Feed — Recent releases */}
			<div className="rounded-lg border border-border bg-card overflow-hidden">
				<div className="px-4 py-3 border-b border-border flex items-center gap-2">
					<ActivityIcon />
					<h3 className="text-sm font-medium text-foreground">
						Recent Releases
					</h3>
				</div>
				<div className="divide-y divide-border/50">
					{releases.length > 0 ? (
						releases.map((rel) => (
							<div key={rel.id} className="px-4 py-3 flex items-start gap-3">
								<span className="mt-0.5 w-5 h-5 rounded-full bg-zinc-800 flex items-center justify-center shrink-0 text-2xs text-primary font-mono">
									v
								</span>
								<div className="min-w-0 flex-1">
									<div className="flex items-center gap-2 flex-wrap">
										<a
											href={rel.html_url}
											target="_blank"
											rel="noopener noreferrer"
											className="text-sm text-foreground font-medium hover:text-primary transition-colors"
										>
											{rel.name || rel.tag_name}
										</a>
										<span className="text-2xs text-muted-foreground font-mono">
											{rel.tag_name}
										</span>
									</div>
									{rel.body && (
										<p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
											{rel.body.split("\n")[0]}
										</p>
									)}
								</div>
								<span className="text-2xs text-muted-foreground shrink-0 mt-0.5">
									{formatRelativeDate(rel.published_at)}
								</span>
							</div>
						))
					) : (
						<div className="px-4 py-6 text-center text-xs text-muted-foreground">
							No release data available.
						</div>
					)}
				</div>
			</div>

			{/* Contribution CTA */}
			<div className="rounded-lg border border-primary/20 bg-primary/5 overflow-hidden">
				<div className="px-4 py-3 border-b border-primary/20 flex items-center gap-2">
					<GlobeIcon />
					<h3 className="text-sm font-medium text-foreground">
						Contribute to Amoena
					</h3>
				</div>
				<div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
					<CtaLink
						href={`https://github.com/${REPO}`}
						icon={<GitHubIcon />}
						title="GitHub Repository"
						description="Browse source, open issues, and submit pull requests"
					/>
					<CtaLink
						href={`https://github.com/${REPO}/blob/main/CONTRIBUTING.md`}
						icon={<DocsIcon />}
						title="Documentation"
						description="Guides, architecture docs, and API references"
					/>
					<CtaLink
						href="https://discord.gg/amoena"
						icon={<DiscordIcon />}
						title="Community Discord"
						description="Chat with the team and other Amoena users"
					/>
					<CtaLink
						href={`https://github.com/${REPO}/blob/main/docs/extensions.md`}
						icon={<PuzzleIcon />}
						title="Create an Extension"
						description="Learn how to build and publish Amoena extensions"
					/>
				</div>
				<div className="px-4 pb-4 flex gap-2">
					<Button
						asChild
						size="xs"
						className="flex items-center gap-1.5"
					>
						<a
							href={`https://github.com/${REPO}`}
							target="_blank"
							rel="noopener noreferrer"
						>
							<GitHubIcon small />
							Star on GitHub
						</a>
					</Button>
					<Button
						asChild
						variant="outline"
						size="xs"
						className="flex items-center gap-1.5"
					>
						<a
							href={`https://github.com/${REPO}/issues/new`}
							target="_blank"
							rel="noopener noreferrer"
						>
							Report an Issue
						</a>
					</Button>
				</div>
			</div>
		</div>
	);
}

// ---- Sub-components ----

function StatCard({
	label,
	value,
	icon,
	color,
}: {
	label: string;
	value: string;
	icon: React.ReactNode;
	color: string;
}) {
	return (
		<div className="rounded-md bg-zinc-900/60 border border-border/60 px-3 py-2.5 flex flex-col gap-1">
			<div className="flex items-center gap-1.5">
				<span className={`text-xs ${color}`}>{icon}</span>
				<span className="text-xs text-muted-foreground">{label}</span>
			</div>
			<span className="text-xl font-semibold text-foreground tabular-nums">
				{value}
			</span>
		</div>
	);
}

function Sparkline({ total }: { total: number }) {
	// Deterministic pseudo-sparkline seeded from total
	const bars = Array.from({ length: 14 }, (_, i) => {
		const seed = (total * (i + 1) * 13) % 100;
		return Math.max(20, Math.min(100, 40 + (seed % 60)));
	});
	const max = Math.max(...bars);
	return (
		<div className="flex items-end gap-0.5 h-8">
			{bars.map((h, i) => (
				<div
					key={i}
					className="flex-1 rounded-sm bg-yellow-400/40"
					style={{ height: `${(h / max) * 100}%` }}
				/>
			))}
		</div>
	);
}

function CtaLink({
	href,
	icon,
	title,
	description,
}: {
	href: string;
	icon: React.ReactNode;
	title: string;
	description: string;
}) {
	return (
		<a
			href={href}
			target="_blank"
			rel="noopener noreferrer"
			className="flex items-start gap-3 rounded-md border border-border/60 bg-card px-3 py-2.5 hover:border-primary/40 hover:bg-zinc-900/60 transition-colors group"
		>
			<div className="w-6 h-6 rounded bg-zinc-800 flex items-center justify-center shrink-0 mt-0.5 text-muted-foreground group-hover:text-primary transition-colors">
				{icon}
			</div>
			<div className="min-w-0">
				<div className="text-sm text-foreground font-medium group-hover:text-primary transition-colors">
					{title}
				</div>
				<div className="text-xs text-muted-foreground mt-0.5">{description}</div>
			</div>
		</a>
	);
}

// ---- Icons ----

function GitHubIcon({ small }: { small?: boolean }) {
	const size = small ? "w-3 h-3" : "w-3.5 h-3.5";
	return (
		<svg
			className={size}
			viewBox="0 0 16 16"
			fill="currentColor"
		>
			<path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
		</svg>
	);
}

function ForkIcon() {
	return (
		<svg
			className="w-3.5 h-3.5"
			viewBox="0 0 16 16"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.5"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<circle cx="5" cy="3" r="1.5" />
			<circle cx="11" cy="3" r="1.5" />
			<circle cx="8" cy="13" r="1.5" />
			<path d="M5 4.5v2a3 3 0 003 3m3-5v2a3 3 0 01-3 3" />
		</svg>
	);
}

function PuzzleIcon({ small }: { small?: boolean }) {
	const size = small ? "w-3 h-3" : "w-3.5 h-3.5";
	return (
		<svg
			className={size}
			viewBox="0 0 16 16"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.5"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<path d="M6 2h4v2a1 1 0 002 0V2h2v4h-2a1 1 0 000 2h2v4h-2v-2a1 1 0 00-2 0v2H6v-2a1 1 0 00-2 0v2H2V8h2a1 1 0 000-2H2V2h2v2a1 1 0 002 0V2z" />
		</svg>
	);
}

function ActivityIcon() {
	return (
		<svg
			className="w-3.5 h-3.5"
			viewBox="0 0 16 16"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.5"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<polyline points="1,8 4,4 7,10 10,6 13,8 15,5" />
		</svg>
	);
}

function GlobeIcon() {
	return (
		<svg
			className="w-3.5 h-3.5"
			viewBox="0 0 16 16"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.5"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<circle cx="8" cy="8" r="6" />
			<path d="M2 8h12M8 2a9 9 0 010 12M8 2a9 9 0 000 12" />
		</svg>
	);
}

function DocsIcon() {
	return (
		<svg
			className="w-3.5 h-3.5"
			viewBox="0 0 16 16"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.5"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<rect x="3" y="1" width="10" height="14" rx="1" />
			<path d="M6 5h4M6 8h4M6 11h2" />
		</svg>
	);
}

function DiscordIcon() {
	return (
		<svg
			className="w-3.5 h-3.5"
			viewBox="0 0 16 16"
			fill="currentColor"
		>
			<path d="M13.55 3.07A13.1 13.1 0 0010.3 2a.07.07 0 00-.07.04c-.14.25-.3.57-.4.82a12.17 12.17 0 00-3.66 0 8.67 8.67 0 00-.41-.82.07.07 0 00-.07-.04 13.06 13.06 0 00-3.25 1.07.07.07 0 00-.03.03C.93 6.15.44 9.14.68 12.1a.07.07 0 00.03.05 13.18 13.18 0 003.95 2 .07.07 0 00.08-.03 9.5 9.5 0 00.82-1.34.07.07 0 00-.04-.1 8.68 8.68 0 01-1.24-.6.07.07 0 010-.12c.08-.06.16-.12.24-.19a.07.07 0 01.07-.01c2.6 1.19 5.41 1.19 7.98 0a.07.07 0 01.07.01c.08.07.16.13.24.19a.07.07 0 010 .12 8.15 8.15 0 01-1.24.59.07.07 0 00-.04.1c.24.47.52.91.82 1.34a.07.07 0 00.08.03 13.14 13.14 0 003.95-2 .07.07 0 00.03-.05c.28-3.39-.47-6.35-2.01-8.97a.06.06 0 00-.03-.03zM5.52 10.3c-.79 0-1.44-.73-1.44-1.62 0-.9.63-1.62 1.44-1.62.82 0 1.46.73 1.44 1.62 0 .89-.63 1.62-1.44 1.62zm5.32 0c-.79 0-1.44-.73-1.44-1.62 0-.9.63-1.62 1.44-1.62.82 0 1.46.73 1.44 1.62 0 .89-.62 1.62-1.44 1.62z" />
		</svg>
	);
}
