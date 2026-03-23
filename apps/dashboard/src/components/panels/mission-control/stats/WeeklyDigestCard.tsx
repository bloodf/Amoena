"use client";

import { useTranslations } from "next-intl";
import type { WeeklyDigest } from "../../../../lib/stats-queries";

interface WeeklyDigestCardProps {
	digest: WeeklyDigest;
}

function formatMs(ms: number): string {
	const min = Math.round(ms / 60_000);
	return min >= 60 ? `${(min / 60).toFixed(1)}h` : `${min}m`;
}

export function WeeklyDigestCard({ digest }: WeeklyDigestCardProps) {
	const t = useTranslations("missionControl");

	return (
		<div className="rounded-lg border border-gray-700 bg-gray-800 p-3">
			<div className="mb-2 flex items-center justify-between">
				<p className="text-xs font-medium text-gray-400">{digest.weekStart}</p>
				{digest.streakMaintained ? (
					<span className="text-green-400" title="Streak maintained">
						✓
					</span>
				) : (
					<span className="text-red-400" title={t("stats.streakBroken")}>
						✗
					</span>
				)}
			</div>
			<div className="grid grid-cols-2 gap-2 text-xs">
				<div>
					<p className="text-gray-500">{t("stats.goalsCompleted")}</p>
					<p className="font-medium text-white">{digest.goalsCompleted}</p>
				</div>
				<div>
					<p className="text-gray-500">{t("stats.timeSaved")}</p>
					<p className="font-medium text-white">
						{formatMs(digest.totalTimeSavedMs)}
					</p>
				</div>
				<div>
					<p className="text-gray-500">{t("stats.topAgent")}</p>
					<p className="font-medium text-white">
						{digest.topAgent ?? "—"}
					</p>
				</div>
				<div>
					<p className="text-gray-500">Cost</p>
					<p className="font-medium text-white">
						${digest.totalCostUsd.toFixed(3)}
					</p>
				</div>
			</div>
		</div>
	);
}
