"use client";

import { useCallback, useEffect, useState } from "react";
import type { GoalRunRow } from "../types";

export function useRunHistory(limit = 5) {
	const [runs, setRuns] = useState<GoalRunRow[]>([]);
	const [loading, setLoading] = useState(false);

	const fetchHistory = useCallback(async () => {
		setLoading(true);
		try {
			const res = await fetch(`/api/mission-control/history?limit=${limit}`);
			if (!res.ok) return;
			const data = await res.json();
			setRuns(data.runs ?? []);
		} catch {
			// best-effort
		} finally {
			setLoading(false);
		}
	}, [limit]);

	useEffect(() => {
		fetchHistory();
	}, [fetchHistory]);

	return { runs, loading, refresh: fetchHistory };
}
