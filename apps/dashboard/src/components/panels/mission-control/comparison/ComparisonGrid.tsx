"use client";

import { useTranslations } from "next-intl";
import type {
	ComparisonDelta,
	RunSummary,
} from "../../../../lib/comparison-queries";
import { DeltaBar } from "./DeltaBar";

interface ComparisonGridProps {
	runs: RunSummary[];
	deltas: ComparisonDelta[];
}

function formatDuration(ms: number | null): string {
	if (ms == null) return "—";
	const s = ms / 1000;
	if (s < 60) return `${s.toFixed(1)}s`;
	return `${(s / 60).toFixed(1)}m`;
}

function formatCost(usd: number): string {
	return `$${usd.toFixed(4)}`;
}

function cellClass(
	direction: "better" | "worse" | "neutral",
	isFirst: boolean,
): string {
	if (isFirst) return "text-gray-300";
	if (direction === "better") return "text-green-400";
	if (direction === "worse") return "text-red-400";
	return "text-gray-300";
}

export function ComparisonGrid({ runs, deltas }: ComparisonGridProps) {
	const t = useTranslations("missionControl");

	const rows = [
		{
			label: t("comparison.duration"),
			metric: "duration",
			format: (r: RunSummary) => formatDuration(r.totalDurationMs),
		},
		{
			label: t("comparison.cost"),
			metric: "cost",
			format: (r: RunSummary) => formatCost(r.totalCostUsd),
		},
		{
			label: t("comparison.successRate"),
			metric: "success_rate",
			format: (r: RunSummary) =>
				r.taskCount > 0
					? `${((r.completedCount / r.taskCount) * 100).toFixed(0)}%`
					: "—",
		},
		{
			label: t("comparison.tasksCompleted"),
			metric: "task_count",
			format: (r: RunSummary) => String(r.completedCount),
		},
		{
			label: t("comparison.tasksFailed"),
			metric: "task_count",
			format: (r: RunSummary) => String(r.failedCount),
		},
	];

	return (
		<div className="overflow-x-auto">
			<table role="table" className="w-full text-sm">
				<thead>
					<tr className="border-b border-gray-700 text-xs text-gray-400">
						<th className="px-3 py-2 text-left">Metric</th>
						{runs.map((r) => (
							<th key={r.goalId} className="px-3 py-2 text-left">
								{r.description.slice(0, 30)}
							</th>
						))}
						<th className="px-3 py-2 text-left">Change</th>
					</tr>
				</thead>
				<tbody>
					{rows.map(({ label, metric, format }) => {
						const delta = deltas.find((d) => d.metric === metric);
						return (
							<tr
								key={label}
								className="border-b border-gray-800"
							>
								<td className="px-3 py-2 text-gray-400">{label}</td>
								{runs.map((r, i) => (
									<td
										key={r.goalId}
										className={`px-3 py-2 font-medium ${cellClass(
											delta?.direction ?? "neutral",
											i === 0,
										)}`}
									>
										{format(r)}
									</td>
								))}
								<td className="px-3 py-2">
									{delta && (
										<DeltaBar
											change={delta.change}
											direction={delta.direction}
											label={label}
										/>
									)}
								</td>
							</tr>
						);
					})}
				</tbody>
			</table>
		</div>
	);
}
