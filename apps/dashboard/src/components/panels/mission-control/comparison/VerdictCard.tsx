"use client";

import { useTranslations } from "next-intl";
import type { ComparisonVerdict } from "../../../../lib/comparison-queries";

interface VerdictCardProps {
	verdict: ComparisonVerdict;
}

export function VerdictCard({ verdict }: VerdictCardProps) {
	const t = useTranslations("missionControl");

	return (
		<div className="rounded-lg border border-gray-700 bg-gray-800 p-4">
			<h3 className="mb-3 text-sm font-semibold text-gray-200">
				{t("comparison.verdict")}
			</h3>
			<p className="mb-4 text-base text-white">{verdict.summary}</p>

			<div className="grid gap-3 sm:grid-cols-3">
				{verdict.improvements.length > 0 && (
					<div>
						<p className="mb-1 text-xs font-medium text-green-400">
							{t("comparison.improvements")}
						</p>
						<ul className="space-y-1">
							{verdict.improvements.map((item) => (
								<li key={item} className="flex items-start gap-1 text-xs text-gray-300">
									<span className="text-green-400">✓</span>
									{item}
								</li>
							))}
						</ul>
					</div>
				)}

				{verdict.regressions.length > 0 && (
					<div>
						<p className="mb-1 text-xs font-medium text-red-400">
							{t("comparison.regressions")}
						</p>
						<ul className="space-y-1">
							{verdict.regressions.map((item) => (
								<li key={item} className="flex items-start gap-1 text-xs text-gray-300">
									<span className="text-red-400">✗</span>
									{item}
								</li>
							))}
						</ul>
					</div>
				)}

				{verdict.unchanged.length > 0 && (
					<div>
						<p className="mb-1 text-xs font-medium text-gray-400">
							{t("comparison.unchanged")}
						</p>
						<ul className="space-y-1">
							{verdict.unchanged.map((item) => (
								<li key={item} className="flex items-start gap-1 text-xs text-gray-500">
									<span>→</span>
									{item}
								</li>
							))}
						</ul>
					</div>
				)}
			</div>
		</div>
	);
}
