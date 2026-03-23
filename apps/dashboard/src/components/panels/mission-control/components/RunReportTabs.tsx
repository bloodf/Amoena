"use client";

import { useTranslations } from "next-intl";

export type ReportTab = "summary" | "tasks" | "agents" | "routing" | "raw";

interface RunReportTabsProps {
	activeTab: ReportTab;
	onTabChange: (tab: ReportTab) => void;
}

const TABS: { id: ReportTab; labelKey: string }[] = [
	{ id: "summary", labelKey: "tabSummary" },
	{ id: "tasks", labelKey: "tabTasks" },
	{ id: "agents", labelKey: "tabAgents" },
	{ id: "routing", labelKey: "tabRouting" },
	{ id: "raw", labelKey: "tabRaw" },
];

export function RunReportTabs({ activeTab, onTabChange }: RunReportTabsProps) {
	const t = useTranslations("missionControl");

	return (
		<div
			className="flex border-b border-gray-700"
			role="tablist"
			aria-label={t("reportTabs")}
		>
			{TABS.map((tab) => (
				<button
					key={tab.id}
					type="button"
					role="tab"
					aria-selected={activeTab === tab.id}
					aria-controls={`tab-panel-${tab.id}`}
					id={`tab-${tab.id}`}
					onClick={() => onTabChange(tab.id)}
					className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors min-h-[44px] -mb-px ${
						activeTab === tab.id
							? "border-blue-500 text-blue-400"
							: "border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500"
					}`}
				>
					{t(tab.labelKey)}
				</button>
			))}
		</div>
	);
}
