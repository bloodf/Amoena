"use client";

import { useCallback, useState } from "react";
import { useTranslations } from "next-intl";
import { RunReportTabs, type ReportTab } from "./RunReportTabs";
import type { RunReport as RunReportType } from "../types";

interface RunReportProps {
	report: RunReportType;
	onNewGoal: () => void;
}

function formatMs(ms?: number): string {
	if (!ms) return "—";
	if (ms < 1000) return `${ms}ms`;
	return `${(ms / 1000).toFixed(1)}s`;
}

function formatCost(usd?: number): string {
	if (usd === undefined || usd === null) return "—";
	return `$${usd.toFixed(4)}`;
}

export function RunReport({ report, onNewGoal }: RunReportProps) {
	const t = useTranslations("missionControl");
	const [activeTab, setActiveTab] = useState<ReportTab>("summary");
	const [copied, setCopied] = useState(false);

	const handleCopy = useCallback(() => {
		navigator.clipboard.writeText(JSON.stringify(report, null, 2)).then(() => {
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		});
	}, [report]);

	const statusCounts = report.tasks.reduce(
		(acc, t) => {
			acc[t.status] = (acc[t.status] ?? 0) + 1;
			return acc;
		},
		{} as Record<string, number>,
	);

	return (
		<div className="flex flex-col h-full bg-gray-900">
			{/* Header */}
			<div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
				<div>
					<h2 className="text-base font-semibold text-white">
						{t("runReportTitle")}
					</h2>
					<p className="text-sm text-gray-400 truncate max-w-[500px]">
						{report.description}
					</p>
				</div>
				<button
					type="button"
					onClick={onNewGoal}
					className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors min-h-[44px]"
				>
					{t("newGoal")}
				</button>
			</div>

			{/* Tabs */}
			<RunReportTabs activeTab={activeTab} onTabChange={setActiveTab} />

			{/* Tab content */}
			<div className="flex-1 overflow-y-auto p-4">
				{/* Summary */}
				{activeTab === "summary" && (
					<div
						id="tab-panel-summary"
						role="tabpanel"
						aria-labelledby="tab-summary"
					>
						<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
							<div className="bg-gray-800 rounded-lg p-4">
								<div className="text-2xl font-bold text-white">
									{report.tasks.length}
								</div>
								<div className="text-sm text-gray-400">{t("totalTasks")}</div>
							</div>
							<div className="bg-gray-800 rounded-lg p-4">
								<div className="text-2xl font-bold text-green-400">
									{statusCounts.completed ?? 0}
								</div>
								<div className="text-sm text-gray-400">{t("completed")}</div>
							</div>
							<div className="bg-gray-800 rounded-lg p-4">
								<div className="text-2xl font-bold text-white">
									{formatCost(report.totalCostUsd)}
								</div>
								<div className="text-sm text-gray-400">{t("totalCost")}</div>
							</div>
							<div className="bg-gray-800 rounded-lg p-4">
								<div className="text-2xl font-bold text-white">
									{formatMs(report.durationMs)}
								</div>
								<div className="text-sm text-gray-400">{t("duration")}</div>
							</div>
						</div>

						{/* Status breakdown */}
						{Object.keys(statusCounts).length > 0 && (
							<div className="mt-4 bg-gray-800 rounded-lg p-4">
								<h3 className="text-sm font-medium text-gray-300 mb-3">
									{t("statusBreakdown")}
								</h3>
								<div className="flex flex-wrap gap-3">
									{Object.entries(statusCounts).map(([status, count]) => (
										<div
											key={status}
											className="flex items-center gap-2 text-sm"
										>
											<span className="text-gray-400">{status}:</span>
											<span className="font-medium text-white">{count}</span>
										</div>
									))}
								</div>
							</div>
						)}
					</div>
				)}

				{/* Tasks */}
				{activeTab === "tasks" && (
					<div
						id="tab-panel-tasks"
						role="tabpanel"
						aria-labelledby="tab-tasks"
					>
						{report.tasks.length === 0 ? (
							<p className="text-gray-500">{t("noTasksInRun")}</p>
						) : (
							<div className="overflow-x-auto">
								<table className="w-full text-sm">
									<thead>
										<tr className="text-gray-400 border-b border-gray-700 text-left">
											<th className="pb-2 pr-4">{t("description")}</th>
											<th className="pb-2 pr-4">{t("type")}</th>
											<th className="pb-2 pr-4">{t("agent")}</th>
											<th className="pb-2 pr-4">{t("statusLabel")}</th>
											<th className="pb-2 pr-4">{t("duration")}</th>
											<th className="pb-2 pr-4">{t("cost")}</th>
											<th className="pb-2">{t("attempts")}</th>
										</tr>
									</thead>
									<tbody>
										{report.tasks.map((task) => (
											<tr
												key={task.taskId}
												className="border-b border-gray-800 hover:bg-gray-800/50"
											>
												<td className="py-2 pr-4 text-gray-300 max-w-[200px] truncate">
													{task.description}
												</td>
												<td className="py-2 pr-4 text-gray-400">
													{task.taskType}
												</td>
												<td className="py-2 pr-4 text-gray-400">
													{task.adapterId}
												</td>
												<td className="py-2 pr-4 text-gray-300">
													{task.status}
												</td>
												<td className="py-2 pr-4 text-gray-400 font-mono">
													{formatMs(task.durationMs)}
												</td>
												<td className="py-2 pr-4 text-gray-400 font-mono">
													{formatCost(task.costUsd)}
												</td>
												<td className="py-2 text-gray-400">
													{task.attempts ?? 1}
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						)}
					</div>
				)}

				{/* Agents */}
				{activeTab === "agents" && (
					<div
						id="tab-panel-agents"
						role="tabpanel"
						aria-labelledby="tab-agents"
					>
						{report.agents.length === 0 ? (
							<p className="text-gray-500">{t("noAgentData")}</p>
						) : (
							<div className="overflow-x-auto">
								<table className="w-full text-sm">
									<thead>
										<tr className="text-gray-400 border-b border-gray-700 text-left">
											<th className="pb-2 pr-4">{t("agent")}</th>
											<th className="pb-2 pr-4">{t("assigned")}</th>
											<th className="pb-2 pr-4">{t("completed")}</th>
											<th className="pb-2 pr-4">{t("failed")}</th>
											<th className="pb-2 pr-4">{t("avgDuration")}</th>
											<th className="pb-2 pr-4">{t("totalCost")}</th>
											<th className="pb-2">{t("successRate")}</th>
										</tr>
									</thead>
									<tbody>
										{report.agents.map((agent) => (
											<tr
												key={agent.adapterId}
												className="border-b border-gray-800 hover:bg-gray-800/50"
											>
												<td className="py-2 pr-4 text-gray-300">
													{agent.adapterId}
												</td>
												<td className="py-2 pr-4 text-gray-400">
													{agent.assigned}
												</td>
												<td className="py-2 pr-4 text-green-400">
													{agent.completed}
												</td>
												<td className="py-2 pr-4 text-red-400">
													{agent.failed}
												</td>
												<td className="py-2 pr-4 text-gray-400 font-mono">
													{formatMs(agent.avgDurationMs)}
												</td>
												<td className="py-2 pr-4 text-gray-400 font-mono">
													{formatCost(agent.totalCostUsd)}
												</td>
												<td className="py-2 text-gray-400">
													{agent.successRate !== undefined
														? `${(agent.successRate * 100).toFixed(0)}%`
														: "—"}
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						)}
					</div>
				)}

				{/* Routing */}
				{activeTab === "routing" && (
					<div
						id="tab-panel-routing"
						role="tabpanel"
						aria-labelledby="tab-routing"
					>
						{report.routing.length === 0 ? (
							<p className="text-gray-500">{t("noRoutingData")}</p>
						) : (
							<div className="flex flex-col gap-2">
								{report.routing.map((r) => (
									<div
										key={r.taskId}
										className={`p-3 rounded-lg border ${
											r.couldImprove
												? "border-yellow-500/50 bg-yellow-900/10"
												: "border-gray-700 bg-gray-800/50"
										}`}
									>
										<div className="flex items-start justify-between gap-2">
											<div>
												<span className="text-sm text-gray-300 font-medium">
													{r.taskId}
												</span>
												<span className="mx-2 text-gray-600">→</span>
												<span className="text-sm text-blue-300">
													{r.adapterId}
												</span>
											</div>
											{r.couldImprove && (
												<span className="text-xs px-2 py-0.5 bg-yellow-900/40 text-yellow-400 rounded border border-yellow-600/30 flex-shrink-0">
													{t("couldImprove")}
												</span>
											)}
										</div>
										<p className="text-xs text-gray-400 mt-1">{r.reason}</p>
									</div>
								))}
							</div>
						)}
					</div>
				)}

				{/* Raw JSON */}
				{activeTab === "raw" && (
					<div
						id="tab-panel-raw"
						role="tabpanel"
						aria-labelledby="tab-raw"
					>
						<div className="flex justify-end mb-3">
							<button
								type="button"
								onClick={handleCopy}
								className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-sm text-gray-200 rounded transition-colors min-h-[44px]"
							>
								{copied ? t("copied") : t("copyJson")}
							</button>
						</div>
						<pre className="bg-gray-800 rounded-lg p-4 text-xs text-gray-300 overflow-auto font-mono whitespace-pre-wrap break-all">
							{JSON.stringify(report, null, 2)}
						</pre>
					</div>
				)}
			</div>
		</div>
	);
}
