"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { CostTracker } from "./CostTracker";

interface StatusBarProps {
	completedTasks: number;
	totalTasks: number;
	activeAgents: number;
	totalCostUsd: number;
	costByAgent: Record<string, number>;
	startedAt: number | null;
}

function formatElapsed(ms: number): string {
	const totalSecs = Math.floor(ms / 1000);
	const mins = Math.floor(totalSecs / 60);
	const secs = totalSecs % 60;
	return `${mins}m ${secs.toString().padStart(2, "0")}s`;
}

export function StatusBar({
	completedTasks,
	totalTasks,
	activeAgents,
	totalCostUsd,
	costByAgent,
	startedAt,
}: StatusBarProps) {
	const t = useTranslations("missionControl");
	const [elapsed, setElapsed] = useState(0);
	const [showStartTooltip, setShowStartTooltip] = useState(false);
	const intervalRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

	useEffect(() => {
		if (!startedAt) return;
		intervalRef.current = setInterval(() => {
			setElapsed(Date.now() - startedAt);
		}, 1000);
		return () => clearInterval(intervalRef.current);
	}, [startedAt]);

	const startTime = startedAt ? new Date(startedAt).toLocaleTimeString() : null;

	return (
		<div className="flex items-center gap-4 px-4 py-2 bg-gray-900 border-t border-gray-700 text-sm flex-wrap">
			{/* Task progress */}
			<span className="text-gray-300">
				<span className="font-medium text-white">{completedTasks}</span>
				{"/"}
				<span className="font-medium text-white">{totalTasks}</span>
				{" "}
				{t("tasks")}
			</span>

			<span className="text-gray-600">•</span>

			{/* Active agents */}
			<span className="text-gray-300">
				<span className="font-medium text-white">{activeAgents}</span>
				{" "}
				{t("agentsActive")}
			</span>

			<span className="text-gray-600">•</span>

			{/* Cost */}
			<CostTracker
				totalUsd={totalCostUsd}
				byAgent={costByAgent}
				isRunning={activeAgents > 0}
			/>

			<span className="text-gray-600">•</span>

			{/* Elapsed time */}
			<div
				className="relative"
				onMouseEnter={() => setShowStartTooltip(true)}
				onMouseLeave={() => setShowStartTooltip(false)}
			>
				<span className="text-gray-300 cursor-default">
					{formatElapsed(elapsed)}
				</span>
				{showStartTooltip && startTime && (
					<div className="absolute bottom-full left-0 mb-1 bg-gray-800 border border-gray-600 rounded px-2 py-1 text-xs text-gray-200 whitespace-nowrap z-50">
						{t("startedAt")}: {startTime}
					</div>
				)}
			</div>
		</div>
	);
}
