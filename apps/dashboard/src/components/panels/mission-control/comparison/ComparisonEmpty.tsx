"use client";

import { useTranslations } from "next-intl";

export function ComparisonEmpty() {
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
				<rect x="4" y="8" width="24" height="48" rx="3" fill="#9CA3AF" />
				<rect x="36" y="8" width="24" height="48" rx="3" fill="#9CA3AF" />
				<path
					d="M28 32 L36 32"
					stroke="#6B7280"
					strokeWidth="2"
					strokeLinecap="round"
					strokeDasharray="2 2"
				/>
			</svg>
			<p className="text-lg font-medium text-gray-300">
				{t("comparison.emptyTitle")}
			</p>
			<p className="mt-1 text-sm text-gray-500">
				{t("comparison.emptyDescription")}
			</p>
		</div>
	);
}
