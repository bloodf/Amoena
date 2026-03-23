"use client";

import { useTranslations } from "next-intl";
import type { LeaderboardEntry } from "../../../../lib/leaderboard-queries";
import { AGENT_COLORS } from "../tokens";

interface LeaderboardTableProps {
	entries: LeaderboardEntry[];
	sortBy: keyof LeaderboardEntry;
	sortDir: "asc" | "desc";
	onSort: (field: keyof LeaderboardEntry) => void;
	onSelectAgent: (agentType: string) => void;
}

function formatDuration(ms: number): string {
	if (ms < 1000) return `${ms}ms`;
	const s = ms / 1000;
	if (s < 60) return `${s.toFixed(1)}s`;
	return `${(s / 60).toFixed(1)}m`;
}

function SuccessRateBadge({ rate }: { rate: number }) {
	const pct = Math.round(rate * 100);
	const color =
		pct >= 80
			? "text-green-400"
			: pct >= 50
				? "text-yellow-400"
				: "text-red-400";
	return <span className={color}>{pct}%</span>;
}

function TrendArrow({
	trend,
	label,
}: {
	trend: "improving" | "declining" | "stable";
	label: string;
}) {
	if (trend === "improving")
		return (
			<span className="text-green-400" aria-label={label}>
				↑
			</span>
		);
	if (trend === "declining")
		return (
			<span className="text-red-400" aria-label={label}>
				↓
			</span>
		);
	return (
		<span className="text-gray-400" aria-label={label}>
			→
		</span>
	);
}

function ScoreBar({ score }: { score: number }) {
	return (
		<div className="flex items-center gap-2">
			<div className="h-2 w-24 overflow-hidden rounded-full bg-gray-700">
				<div
					className="h-full rounded-full bg-blue-500"
					style={{ width: `${Math.min(100, score)}%` }}
				/>
			</div>
			<span className="text-xs text-gray-300">{score.toFixed(1)}</span>
		</div>
	);
}

export function LeaderboardTable({
	entries,
	sortBy,
	sortDir,
	onSort,
	onSelectAgent,
}: LeaderboardTableProps) {
	const t = useTranslations("missionControl");

	type SortableCol = {
		key: keyof LeaderboardEntry;
		label: string;
	};

	const columns: SortableCol[] = [
		{ key: "rank", label: t("leaderboard.rank") },
		{ key: "agentType", label: t("leaderboard.agent") },
		{ key: "score", label: t("leaderboard.score") },
		{ key: "successRate", label: t("leaderboard.successRate") },
		{ key: "avgDurationMs", label: t("leaderboard.avgDuration") },
		{ key: "avgCostPerTask", label: t("leaderboard.costPerTask") },
		{ key: "completedTasks", label: t("leaderboard.tasks") },
		{ key: "trend", label: t("leaderboard.trend") },
	];

	return (
		<table role="table" className="w-full text-sm">
			<thead>
				<tr className="border-b border-gray-700 text-left text-xs text-gray-400">
					{columns.map(({ key, label }) => (
						<th
							key={key}
							className="cursor-pointer select-none px-3 py-2 hover:text-white"
							aria-sort={
								sortBy === key
									? sortDir === "asc"
										? "ascending"
										: "descending"
									: "none"
							}
							onClick={() => onSort(key)}
						>
							{label}
							{sortBy === key && (
								<span className="ml-1">{sortDir === "asc" ? "▲" : "▼"}</span>
							)}
						</th>
					))}
				</tr>
			</thead>
			<tbody>
				{entries.map((entry) => {
					const agentColor =
						AGENT_COLORS[entry.agentType as keyof typeof AGENT_COLORS] ??
						AGENT_COLORS.unknown;
					return (
						<tr
							key={entry.agentType}
							className="cursor-pointer border-b border-gray-800 hover:bg-gray-800"
							onClick={() => onSelectAgent(entry.agentType)}
						>
							<td className="px-3 py-2 text-gray-400">{entry.rank}</td>
							<td
								className="px-3 py-2 font-medium"
								style={{ color: agentColor }}
							>
								{entry.agentType}
							</td>
							<td className="px-3 py-2">
								<ScoreBar score={entry.score} />
							</td>
							<td className="px-3 py-2">
								<SuccessRateBadge rate={entry.successRate} />
							</td>
							<td className="px-3 py-2 text-gray-300">
								{formatDuration(entry.avgDurationMs)}
							</td>
							<td className="px-3 py-2 text-gray-300">
								${entry.avgCostPerTask.toFixed(4)}
							</td>
							<td className="px-3 py-2 text-gray-300">
								{entry.completedTasks}
							</td>
							<td className="px-3 py-2">
								<TrendArrow
									trend={entry.trend}
									label={t(`leaderboard.${entry.trend}`)}
								/>
							</td>
						</tr>
					);
				})}
			</tbody>
		</table>
	);
}
