"use client";

import { useTranslations } from "next-intl";
import type { RunSummary } from "../../../../lib/comparison-queries";
import { STATUS_COLORS } from "../tokens";

interface RunPickerProps {
	availableRuns: RunSummary[];
	selectedIds: string[];
	onSelectionChange: (ids: string[]) => void;
	maxSelections?: number;
}

function formatDate(ts: number): string {
	return new Date(ts * 1000).toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
		year: "2-digit",
	});
}

export function RunPicker({
	availableRuns,
	selectedIds,
	onSelectionChange,
	maxSelections = 5,
}: RunPickerProps) {
	const t = useTranslations("missionControl");

	function toggleRun(id: string) {
		if (selectedIds.includes(id)) {
			onSelectionChange(selectedIds.filter((s) => s !== id));
		} else if (selectedIds.length < maxSelections) {
			onSelectionChange([...selectedIds, id]);
		}
	}

	const canCompare = selectedIds.length >= 2;

	return (
		<div className="space-y-2">
			<p className="text-xs text-gray-400">{t("comparison.selectRuns")}</p>
			<div className="max-h-48 overflow-y-auto space-y-1 rounded-lg border border-gray-700 p-2">
				{availableRuns.map((run) => {
					const selected = selectedIds.includes(run.goalId);
					const disabled =
						!selected && selectedIds.length >= maxSelections;
					return (
						<label
							key={run.goalId}
							className={`flex cursor-pointer items-center gap-3 rounded px-2 py-1.5 transition-colors ${
								selected
									? "bg-blue-900/40 text-white"
									: disabled
										? "cursor-not-allowed opacity-50 text-gray-500"
										: "text-gray-300 hover:bg-gray-800"
							}`}
						>
							<input
								type="checkbox"
								checked={selected}
								disabled={disabled}
								onChange={() => !disabled && toggleRun(run.goalId)}
								className="rounded"
							/>
							<span className="flex-1 truncate text-sm">
								{run.description.slice(0, 40)}
								{run.description.length > 40 ? "…" : ""}
							</span>
							<span className="text-xs text-gray-500">
								{formatDate(run.startedAt)}
							</span>
							<span
								className={`text-xs ${STATUS_COLORS[run.status as keyof typeof STATUS_COLORS] ?? "text-gray-400"}`}
							>
								{run.status}
							</span>
						</label>
					);
				})}
			</div>
			<div className="flex items-center justify-between">
				<span className="text-xs text-gray-500">
					{selectedIds.length}/{maxSelections} selected
				</span>
				<button
					disabled={!canCompare}
					className={`rounded px-4 py-1.5 text-sm font-medium transition-colors ${
						canCompare
							? "bg-blue-600 text-white hover:bg-blue-500"
							: "cursor-not-allowed bg-gray-700 text-gray-500"
					}`}
				>
					{t("comparison.compare")}
				</button>
			</div>
		</div>
	);
}
