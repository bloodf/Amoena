"use client";

import { useTranslations } from "next-intl";

interface TimeSavedBadgeProps {
	totalTimeSavedMs: number;
	isCompact?: boolean;
}

function formatTimeSaved(ms: number): { value: string; unit: "h" | "m" } {
	const minutes = ms / 60_000;
	if (minutes >= 60) {
		return { value: (minutes / 60).toFixed(1), unit: "h" };
	}
	return { value: Math.round(minutes).toString(), unit: "m" };
}

export function TimeSavedBadge({
	totalTimeSavedMs,
	isCompact = true,
}: TimeSavedBadgeProps) {
	const t = useTranslations("missionControl");

	if (totalTimeSavedMs <= 0) return null;

	const { value, unit } = formatTimeSaved(totalTimeSavedMs);
	const label =
		unit === "h"
			? t("stats.hoursSaved", { hours: value })
			: t("stats.minutesSaved", { minutes: value });

	return (
		<span
			className="inline-flex items-center gap-1 rounded-full bg-gray-800 px-2 py-0.5 text-xs text-gray-300"
			aria-label={`${t("stats.timeSaved")}: ${value}${unit}`}
			title="Estimated time saved vs. manual work"
		>
			⏱ {label}
		</span>
	);
}
