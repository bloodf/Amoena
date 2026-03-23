"use client";

import { useTranslations } from "next-intl";
import type {
	AgentTrendPoint,
	LeaderboardEntry,
} from "../../../../lib/leaderboard-queries";
import { AGENT_COLORS } from "../tokens";
import { AgentTrendChart } from "./AgentTrendChart";

interface AgentScoreCardProps {
	entry: LeaderboardEntry;
	trend: AgentTrendPoint[];
	onClose: () => void;
}

function MetricCard({
	label,
	value,
}: {
	label: string;
	value: string | number;
}) {
	return (
		<div className="rounded-lg bg-gray-800 p-3">
			<p className="text-xs text-gray-400">{label}</p>
			<p className="mt-1 text-lg font-semibold text-white">{value}</p>
		</div>
	);
}

function formatDuration(ms: number): string {
	if (ms < 1000) return `${ms}ms`;
	const s = ms / 1000;
	if (s < 60) return `${s.toFixed(1)}s`;
	return `${(s / 60).toFixed(1)}m`;
}

export function AgentScoreCard({ entry, trend, onClose }: AgentScoreCardProps) {
	const t = useTranslations("missionControl");
	const agentColor =
		AGENT_COLORS[entry.agentType as keyof typeof AGENT_COLORS] ??
		AGENT_COLORS.unknown;

	const trendColor =
		entry.trend === "improving"
			? "#22c55e"
			: entry.trend === "declining"
				? "#ef4444"
				: "#9ca3af";

	return (
		<div className="fixed inset-y-0 right-0 z-50 w-96 overflow-y-auto bg-gray-900 shadow-2xl">
			<div className="flex items-center justify-between border-b border-gray-700 p-4">
				<h2
					className="text-lg font-semibold"
					style={{ color: agentColor }}
				>
					{entry.agentType}
				</h2>
				<button
					onClick={onClose}
					aria-label="Close agent details"
					className="rounded p-1 text-gray-400 hover:bg-gray-800 hover:text-white"
				>
					✕
				</button>
			</div>

			<div className="p-4 space-y-4">
				<div className="grid grid-cols-2 gap-3">
					<MetricCard
						label={t("leaderboard.score")}
						value={entry.score.toFixed(1)}
					/>
					<MetricCard
						label={t("leaderboard.successRate")}
						value={`${(entry.successRate * 100).toFixed(1)}%`}
					/>
					<MetricCard
						label={t("leaderboard.avgDuration")}
						value={formatDuration(entry.avgDurationMs)}
					/>
					<MetricCard
						label={t("leaderboard.tasks")}
						value={entry.completedTasks}
					/>
					<MetricCard
						label={t("leaderboard.costPerTask")}
						value={`$${entry.avgCostPerTask.toFixed(4)}`}
					/>
					<MetricCard
						label={t("leaderboard.trend")}
						value={t(`leaderboard.${entry.trend}`)}
					/>
				</div>

				{trend.length > 0 && (
					<div>
						<p className="mb-2 text-sm text-gray-400">{t("leaderboard.details")}</p>
						<AgentTrendChart trend={trend} color={trendColor} width={320} height={80} />
					</div>
				)}
			</div>
		</div>
	);
}
