"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import type Database from "better-sqlite3";
import type {
	StreakInfo,
	TimeSavedStats,
	WeeklyDigest,
} from "../../../../lib/stats-queries";
import {
	getStreakInfo,
	getTimeSaved,
	getWeeklyDigests,
} from "../../../../lib/stats-queries";
import { MilestoneToast } from "./MilestoneToast";
import { StreakDisplay } from "./StreakDisplay";
import { TimeSavedDetail } from "./TimeSavedDetail";
import { WeeklyDigestCard } from "./WeeklyDigestCard";

export { TimeSavedBadge } from "./TimeSavedBadge";

interface StatsPanelProps {
	db: Database.Database;
}

export function StatsPanel({ db }: StatsPanelProps) {
	const t = useTranslations("missionControl");
	const [timeSaved, setTimeSaved] = useState<TimeSavedStats | null>(null);
	const [streak, setStreak] = useState<StreakInfo | null>(null);
	const [digests, setDigests] = useState<WeeklyDigest[]>([]);
	const [shownMilestones, setShownMilestones] = useState<Set<number>>(new Set());

	useEffect(() => {
		const ts = getTimeSaved(db);
		const si = getStreakInfo(db);
		const wd = getWeeklyDigests(db, 4);
		setTimeSaved(ts);
		setStreak(si);
		setDigests(wd);
	}, [db]);

	const pendingMilestone =
		streak?.milestones.find(
			(m) => m.achievedAt != null && !shownMilestones.has(m.count),
		) ?? null;

	return (
		<div className="space-y-6">
			{timeSaved && (
				<section>
					<h3 className="mb-3 text-sm font-semibold text-gray-300">
						{t("stats.timeSaved")}
					</h3>
					<TimeSavedDetail stats={timeSaved} weeklyDigests={digests} />
				</section>
			)}

			{streak && (
				<section>
					<h3 className="mb-3 text-sm font-semibold text-gray-300">
						{t("stats.streak")}
					</h3>
					<StreakDisplay streak={streak} />
				</section>
			)}

			{digests.length > 0 && (
				<section>
					<h3 className="mb-3 text-sm font-semibold text-gray-300">
						{t("stats.weeklyDigest")}
					</h3>
					<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
						{digests.map((d) => (
							<WeeklyDigestCard key={d.weekStart} digest={d} />
						))}
					</div>
				</section>
			)}

			{pendingMilestone && (
				<MilestoneToast
					milestone={pendingMilestone}
					onDismiss={() =>
						setShownMilestones((prev) => new Set([...prev, pendingMilestone.count]))
					}
				/>
			)}
		</div>
	);
}
