"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import type { StreakMilestone } from "../../../../lib/stats-queries";

interface MilestoneToastProps {
	milestone: StreakMilestone;
	onDismiss: () => void;
}

const MILESTONE_ICONS: Record<number, string> = {
	5: "⭐",
	10: "🌟",
	25: "💫",
	50: "🏆",
	100: "👑",
};

export function MilestoneToast({ milestone, onDismiss }: MilestoneToastProps) {
	const t = useTranslations("missionControl");
	const [visible, setVisible] = useState(true);
	const icon = MILESTONE_ICONS[milestone.count] ?? "🏅";

	useEffect(() => {
		const timer = setTimeout(() => {
			setVisible(false);
			onDismiss();
		}, 5000);
		return () => clearTimeout(timer);
	}, [onDismiss]);

	if (!visible) return null;

	return (
		<div
			role="alert"
			aria-live="assertive"
			className="fixed bottom-4 right-4 z-50 flex cursor-pointer items-center gap-3 rounded-lg border border-yellow-700 bg-gray-900 px-4 py-3 shadow-2xl animate-bounce-once"
			onClick={() => {
				setVisible(false);
				onDismiss();
			}}
		>
			<span className="text-2xl" aria-hidden="true">
				{icon}
			</span>
			<div>
				<p className="text-xs font-semibold text-yellow-400">
					{t("stats.milestoneAchieved")}
				</p>
				<p className="text-sm text-white">{milestone.label}</p>
				<p className="text-xs text-gray-400">
					{milestone.count} streak
				</p>
			</div>
		</div>
	);
}
