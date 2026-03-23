"use client";

import { useTranslations } from "next-intl";
import type { RunSummary, TaskDiff } from "../../../../lib/comparison-queries";
import { STATUS_COLORS } from "../tokens";

interface TaskDiffTableProps {
	runs: RunSummary[];
	taskDiffs: TaskDiff[];
}

function formatDuration(ms: number | null): string {
	if (ms == null) return "—";
	const s = ms / 1000;
	return s < 60 ? `${s.toFixed(1)}s` : `${(s / 60).toFixed(1)}m`;
}

export function TaskDiffTable({ runs, taskDiffs }: TaskDiffTableProps) {
	const t = useTranslations("missionControl");

	return (
		<div className="overflow-x-auto">
			<h3 className="mb-2 text-sm font-semibold text-gray-300">
				{t("comparison.taskDiff")}
			</h3>
			<table role="table" className="w-full text-xs">
				<thead>
					<tr className="border-b border-gray-700 text-gray-400">
						<th className="px-3 py-2 text-left">Task</th>
						{runs.map((r) => (
							<th key={r.goalId} className="px-3 py-2 text-left">
								{r.description.slice(0, 25)}
							</th>
						))}
					</tr>
				</thead>
				<tbody>
					{taskDiffs.map((diff) => (
						<tr
							key={`${diff.taskType}/${diff.complexity}`}
							className="border-b border-gray-800"
						>
							<td className="px-3 py-2 text-gray-300">
								{diff.taskType}/{diff.complexity}
							</td>
							{diff.entries.map((entry, i) => {
								if (!entry) {
									return (
										<td key={i} className="px-3 py-2 text-gray-600">
											—
										</td>
									);
								}
								// Highlight red if failed in this run but succeeded in another
								const anySucceeded = diff.entries.some(
									(e) => e?.status === "completed",
								);
								const isRegression =
									entry.status !== "completed" && anySucceeded;

								return (
									<td
										key={i}
										className={`px-3 py-2 ${
											isRegression ? "bg-red-900/20" : ""
										}`}
									>
										<div className="flex items-center gap-1">
											<span
												className={
													STATUS_COLORS[
														entry.status as keyof typeof STATUS_COLORS
													] ?? "text-gray-400"
												}
											>
												{entry.status === "completed"
													? "✓"
													: entry.status === "failed"
														? "✗"
														: "⏱"}
											</span>
											{entry.agentType && (
												<span className="text-gray-400">
													{entry.agentType}
												</span>
											)}
											<span className="text-gray-500">
												{formatDuration(entry.durationMs)}
											</span>
										</div>
									</td>
								);
							})}
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}
