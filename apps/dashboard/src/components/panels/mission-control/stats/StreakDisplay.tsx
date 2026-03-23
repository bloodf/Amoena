"use client";

import { useTranslations } from "next-intl";
import type { StreakInfo } from "../../../../lib/stats-queries";

interface StreakDisplayProps {
	streak: StreakInfo;
}

const MILESTONE_ICONS: Record<number, string> = {
	5: "⭐",
	10: "🌟",
	25: "💫",
	50: "🏆",
	100: "👑",
};

export function StreakDisplay({ streak }: StreakDisplayProps) {
	const t = useTranslations("missionControl");

	return (
		<div className="space-y-3">
			<div className="flex items-center gap-3">
				<div className="text-4xl font-bold text-white" aria-label={`${t("stats.currentStreak")}: ${streak.currentStreak}`}>
					{streak.currentStreak}
					{streak.isActive && (
						<span className="ml-1" role="img" aria-label="active streak">
							🔥
						</span>
					)}
				</div>
				<div className="text-sm text-gray-400">
					<p className="font-medium text-gray-300">{t("stats.streak")}</p>
					<p>
						{t("stats.longestStreak")}: {streak.longestStreak}
					</p>
				</div>
			</div>

			<div className="flex flex-wrap gap-2">
				{streak.milestones.map((m) => {
					const icon = MILESTONE_ICONS[m.count] ?? "🏅";
					const achieved = m.achievedAt != null;
					return (
						<span
							key={m.count}
							className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs ${
								achieved
									? "bg-yellow-900/40 text-yellow-300"
									: "bg-gray-800 text-gray-600"
							}`}
							title={achieved ? m.label : `${m.label} (locked)`}
							aria-label={`${m.label} milestone${achieved ? " achieved" : " locked"}`}
						>
							{icon} {m.count}
						</span>
					);
				})}
			</div>
		</div>
	);
}
