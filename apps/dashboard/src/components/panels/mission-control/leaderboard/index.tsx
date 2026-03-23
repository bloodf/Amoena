"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import type Database from "better-sqlite3";
import type {
	AgentTrendPoint,
	LeaderboardEntry,
} from "../../../../lib/leaderboard-queries";
import {
	getAgentTrend,
	getLeaderboard,
} from "../../../../lib/leaderboard-queries";
import { AgentScoreCard } from "./AgentScoreCard";
import { LeaderboardEmpty } from "./LeaderboardEmpty";
import { LeaderboardTable } from "./LeaderboardTable";

interface LeaderboardPanelProps {
	db: Database.Database;
}

const TIME_WINDOWS = [
	{ label: "7d", days: 7 },
	{ label: "30d", days: 30 },
	{ label: "90d", days: 90 },
	{ label: "All", days: null },
] as const;

export function LeaderboardPanel({ db }: LeaderboardPanelProps) {
	const t = useTranslations("missionControl");

	const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
	const [sortBy, setSortBy] =
		useState<keyof LeaderboardEntry>("score");
	const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
	const [windowDays, setWindowDays] = useState<number | null>(null);
	const [minTasks, setMinTasks] = useState(3);
	const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
	const [trendData, setTrendData] = useState<AgentTrendPoint[]>([]);

	useEffect(() => {
		const result = getLeaderboard(db, {
			sortBy,
			sortDir,
			windowDays,
			minTasks,
		});
		setEntries(result);
	}, [db, sortBy, sortDir, windowDays, minTasks]);

	useEffect(() => {
		if (!selectedAgent) {
			setTrendData([]);
			return;
		}
		const trend = getAgentTrend(db, selectedAgent, 30);
		setTrendData(trend);
	}, [db, selectedAgent]);

	function handleSort(field: keyof LeaderboardEntry) {
		if (sortBy === field) {
			setSortDir((d) => (d === "asc" ? "desc" : "asc"));
		} else {
			setSortBy(field);
			setSortDir("desc");
		}
	}

	const selectedEntry = entries.find((e) => e.agentType === selectedAgent);

	return (
		<div className="relative">
			<div className="mb-4 flex flex-wrap items-center gap-4">
				<div className="flex items-center gap-2">
					<span className="text-xs text-gray-400">
						{t("leaderboard.timeWindow")}
					</span>
					<div className="flex rounded-md overflow-hidden border border-gray-700">
						{TIME_WINDOWS.map(({ label, days }) => (
							<button
								key={label}
								onClick={() => setWindowDays(days)}
								className={`px-3 py-1 text-xs transition-colors ${
									windowDays === days
										? "bg-blue-600 text-white"
										: "bg-gray-800 text-gray-400 hover:text-white"
								}`}
							>
								{days === null ? t("leaderboard.allTime") : label}
							</button>
						))}
					</div>
				</div>

				<div className="flex items-center gap-2">
					<span className="text-xs text-gray-400">
						{t("leaderboard.minTasks")}: {minTasks}
					</span>
					<input
						type="range"
						min={1}
						max={20}
						value={minTasks}
						onChange={(e) => setMinTasks(Number(e.target.value))}
						className="w-24"
					/>
				</div>
			</div>

			{entries.length === 0 ? (
				<LeaderboardEmpty />
			) : (
				<LeaderboardTable
					entries={entries}
					sortBy={sortBy}
					sortDir={sortDir}
					onSort={handleSort}
					onSelectAgent={setSelectedAgent}
				/>
			)}

			{selectedEntry && (
				<AgentScoreCard
					entry={selectedEntry}
					trend={trendData}
					onClose={() => setSelectedAgent(null)}
				/>
			)}
		</div>
	);
}
