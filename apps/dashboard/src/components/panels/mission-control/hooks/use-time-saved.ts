"use client";

import { useEffect, useState } from "react";
import type Database from "better-sqlite3";
import type { TimeSavedStats } from "../../../../lib/stats-queries";
import { getTimeSaved } from "../../../../lib/stats-queries";

export function useTimeSaved(db: Database.Database): TimeSavedStats | null {
	const [stats, setStats] = useState<TimeSavedStats | null>(null);

	useEffect(() => {
		const result = getTimeSaved(db);
		setStats(result);
	}, [db]);

	return stats;
}
