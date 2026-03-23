"use client";

import { useTranslations } from "next-intl";
import type { TimeSavedStats, WeeklyDigest } from "../../../../lib/stats-queries";

interface TimeSavedDetailProps {
	stats: TimeSavedStats;
	weeklyDigests: WeeklyDigest[];
}

function formatHours(ms: number): string {
	return (ms / 3_600_000).toFixed(1);
}

function formatMinutes(ms: number): string {
	return Math.round(ms / 60_000).toString();
}

export function TimeSavedDetail({ stats, weeklyDigests }: TimeSavedDetailProps) {
	const t = useTranslations("missionControl");

	const hours = formatHours(stats.totalTimeSavedMs);
	const weekHours = formatHours(stats.weekTimeSavedMs);
	const monthHours = formatHours(stats.monthTimeSavedMs);
	const perGoalMin = formatMinutes(stats.avgTimeSavedPerGoalMs);

	const maxWeeklySaved = Math.max(
		...weeklyDigests.map((d) => d.totalTimeSavedMs),
		1,
	);

	return (
		<div className="space-y-4">
			<div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
				<div className="rounded-lg bg-gray-800 p-3">
					<p className="text-xs text-gray-400">{t("stats.timeSaved")}</p>
					<p className="mt-1 text-xl font-bold text-white">{hours}h</p>
				</div>
				<div className="rounded-lg bg-gray-800 p-3">
					<p className="text-xs text-gray-400">{t("stats.thisWeek")}</p>
					<p className="mt-1 text-xl font-bold text-white">{weekHours}h</p>
				</div>
				<div className="rounded-lg bg-gray-800 p-3">
					<p className="text-xs text-gray-400">{t("stats.thisMonth")}</p>
					<p className="mt-1 text-xl font-bold text-white">{monthHours}h</p>
				</div>
				<div className="rounded-lg bg-gray-800 p-3">
					<p className="text-xs text-gray-400">{t("stats.perGoal")}</p>
					<p className="mt-1 text-xl font-bold text-white">{perGoalMin}m</p>
				</div>
			</div>

			{stats.humanEquivalentHours > 0 && (
				<p className="text-sm text-blue-400">
					{t("stats.humanEquivalent", {
						hours: stats.humanEquivalentHours.toFixed(1),
					})}
				</p>
			)}

			{weeklyDigests.length > 0 && (
				<div>
					<p className="mb-2 text-xs text-gray-400">{t("stats.weeklyDigest")}</p>
					<div className="flex items-end gap-1">
						{weeklyDigests.slice(-4).map((d) => {
							const pct = (d.totalTimeSavedMs / maxWeeklySaved) * 100;
							return (
								<div
									key={d.weekStart}
									className="flex flex-1 flex-col items-center gap-1"
								>
									<div className="w-full rounded-t bg-blue-600" style={{ height: `${Math.max(4, pct)}px` }} />
									<span className="text-xs text-gray-600">
										{d.weekStart.slice(5)}
									</span>
								</div>
							);
						})}
					</div>
				</div>
			)}
		</div>
	);
}
