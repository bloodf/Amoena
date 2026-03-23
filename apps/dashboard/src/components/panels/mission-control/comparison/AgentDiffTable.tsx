"use client";

import { useTranslations } from "next-intl";
import type { AgentDiff, RunSummary } from "../../../../lib/comparison-queries";
import { AGENT_COLORS } from "../tokens";

interface AgentDiffTableProps {
	runs: RunSummary[];
	agentDiffs: AgentDiff[];
}

function formatDuration(ms: number): string {
	const s = ms / 1000;
	return s < 60 ? `${s.toFixed(1)}s` : `${(s / 60).toFixed(1)}m`;
}

export function AgentDiffTable({ runs, agentDiffs }: AgentDiffTableProps) {
	const t = useTranslations("missionControl");

	return (
		<div className="overflow-x-auto">
			<h3 className="mb-2 text-sm font-semibold text-gray-300">
				{t("comparison.agentDiff")}
			</h3>
			<table role="table" className="w-full text-xs">
				<thead>
					<tr className="border-b border-gray-700 text-gray-400">
						<th className="px-3 py-2 text-left">Agent</th>
						{runs.map((r) => (
							<th key={r.goalId} className="px-3 py-2 text-left" colSpan={2}>
								{r.description.slice(0, 20)}
							</th>
						))}
					</tr>
					<tr className="border-b border-gray-800 text-gray-500">
						<th className="px-3 py-1" />
						{runs.map((r) => (
							<>
								<th key={`${r.goalId}-tasks`} className="px-3 py-1 text-left">
									Tasks
								</th>
								<th key={`${r.goalId}-rate`} className="px-3 py-1 text-left">
									Success
								</th>
							</>
						))}
					</tr>
				</thead>
				<tbody>
					{agentDiffs.map((diff) => {
						const color =
							AGENT_COLORS[diff.agentType as keyof typeof AGENT_COLORS] ??
							AGENT_COLORS.unknown;
						return (
							<tr
								key={diff.agentType}
								className="border-b border-gray-800"
							>
								<td
									className="px-3 py-2 font-medium"
									style={{ color }}
								>
									{diff.agentType}
								</td>
								{diff.perRun.map((stats) => (
									<>
										<td
											key={`${stats.goalId}-tasks`}
											className="px-3 py-2 text-gray-300"
										>
											{stats.tasksCompleted}/{stats.tasksAssigned}
										</td>
										<td
											key={`${stats.goalId}-rate`}
											className={`px-3 py-2 ${
												stats.successRate >= 0.8
													? "text-green-400"
													: stats.successRate >= 0.5
														? "text-yellow-400"
														: "text-red-400"
											}`}
										>
											{(stats.successRate * 100).toFixed(0)}%
										</td>
									</>
								))}
							</tr>
						);
					})}
				</tbody>
			</table>
		</div>
	);
}
