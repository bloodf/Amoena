"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import type Database from "better-sqlite3";
import type {
	RunComparisonResult,
	RunSummary,
} from "../../../../lib/comparison-queries";
import {
	compareRuns,
	listComparableRuns,
} from "../../../../lib/comparison-queries";
import { AgentDiffTable } from "./AgentDiffTable";
import { ComparisonEmpty } from "./ComparisonEmpty";
import { ComparisonGrid } from "./ComparisonGrid";
import { RunPicker } from "./RunPicker";
import { TaskDiffTable } from "./TaskDiffTable";
import { VerdictCard } from "./VerdictCard";

interface ComparisonPanelProps {
	db: Database.Database;
}

export function ComparisonPanel({ db }: ComparisonPanelProps) {
	const t = useTranslations("missionControl");

	const [availableRuns, setAvailableRuns] = useState<RunSummary[]>([]);
	const [selectedIds, setSelectedIds] = useState<string[]>([]);
	const [result, setResult] = useState<RunComparisonResult | null>(null);

	useEffect(() => {
		const runs = listComparableRuns(db, 20);
		setAvailableRuns(runs);
	}, [db]);

	function handleCompare() {
		if (selectedIds.length < 2) return;
		const comparison = compareRuns(db, selectedIds);
		setResult(comparison);
	}

	if (availableRuns.length < 2) {
		return <ComparisonEmpty />;
	}

	return (
		<div className="space-y-6">
			<div>
				<h2 className="mb-3 text-base font-semibold text-gray-200">
					{t("comparison.title")}
				</h2>
				<RunPicker
					availableRuns={availableRuns}
					selectedIds={selectedIds}
					onSelectionChange={(ids) => {
						setSelectedIds(ids);
						// Auto-compare when selection changes and ≥ 2 selected
						if (ids.length >= 2) {
							const comparison = compareRuns(db, ids);
							setResult(comparison);
						} else {
							setResult(null);
						}
					}}
					maxSelections={5}
				/>
			</div>

			{result && (
				<>
					<VerdictCard verdict={result.verdict} />
					<ComparisonGrid runs={result.runs} deltas={result.deltas} />
					{result.taskDiffs.length > 0 && (
						<TaskDiffTable runs={result.runs} taskDiffs={result.taskDiffs} />
					)}
					{result.agentDiffs.length > 0 && (
						<AgentDiffTable runs={result.runs} agentDiffs={result.agentDiffs} />
					)}
				</>
			)}
		</div>
	);
}
