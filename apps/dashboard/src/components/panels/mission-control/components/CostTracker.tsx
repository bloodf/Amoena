"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

interface CostTrackerProps {
	totalUsd: number;
	byAgent: Record<string, number>;
	isRunning: boolean;
}

export function CostTracker({ totalUsd, byAgent, isRunning }: CostTrackerProps) {
	const t = useTranslations("missionControl");
	const [showTooltip, setShowTooltip] = useState(false);

	const formatted = `$${totalUsd.toFixed(4)}`;

	return (
		<div
			className="relative inline-flex items-center"
			onMouseEnter={() => setShowTooltip(true)}
			onMouseLeave={() => setShowTooltip(false)}
		>
			<span
				className={`font-mono text-sm text-gray-300 cursor-default select-none ${
					isRunning ? "animate-pulse" : ""
				}`}
				aria-label={`${t("totalCost")}: ${formatted}`}
			>
				{formatted}
			</span>

			{/* Breakdown tooltip */}
			{showTooltip && Object.keys(byAgent).length > 0 && (
				<div className="absolute bottom-full left-0 mb-2 bg-gray-800 border border-gray-600 rounded-lg p-3 shadow-xl z-50 min-w-[160px]">
					<p className="text-xs text-gray-400 mb-2 font-medium">
						{t("costBreakdown")}
					</p>
					<table className="text-xs w-full">
						<tbody>
							{Object.entries(byAgent).map(([agent, cost]) => (
								<tr key={agent}>
									<td className="text-gray-300 pr-3 py-0.5">{agent}</td>
									<td className="text-gray-100 text-right font-mono">
										${cost.toFixed(4)}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}
		</div>
	);
}
