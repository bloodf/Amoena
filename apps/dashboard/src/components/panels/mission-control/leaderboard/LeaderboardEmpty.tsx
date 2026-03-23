"use client";

import { useTranslations } from "next-intl";

export function LeaderboardEmpty() {
	const t = useTranslations("missionControl");

	return (
		<div className="flex flex-col items-center justify-center py-16 text-center">
			<svg
				width="64"
				height="64"
				viewBox="0 0 64 64"
				fill="none"
				className="mb-4 opacity-30"
				aria-hidden="true"
			>
				<rect x="8" y="32" width="12" height="24" rx="2" fill="#9CA3AF" />
				<rect x="26" y="20" width="12" height="36" rx="2" fill="#9CA3AF" />
				<rect x="44" y="40" width="12" height="16" rx="2" fill="#9CA3AF" />
				<circle cx="32" cy="10" r="6" fill="#9CA3AF" />
				<path
					d="M26 10 L38 10"
					stroke="#9CA3AF"
					strokeWidth="2"
					strokeLinecap="round"
				/>
			</svg>
			<p className="text-lg font-medium text-gray-300">
				{t("leaderboard.emptyTitle")}
			</p>
			<p className="mt-1 text-sm text-gray-500">
				{t("leaderboard.emptyDescription")}
			</p>
		</div>
	);
}
