"use client";

import { useTranslations } from "next-intl";

export type CategoryFilter = "all" | "built-in" | "custom";
export type SortOrder = "most-used" | "recently-used" | "alphabetical";

interface TemplateSearchProps {
	query: string;
	onQueryChange: (q: string) => void;
	category: CategoryFilter;
	onCategoryChange: (c: CategoryFilter) => void;
	sort: SortOrder;
	onSortChange: (s: SortOrder) => void;
}

export function TemplateSearch({
	query,
	onQueryChange,
	category,
	onCategoryChange,
	sort,
	onSortChange,
}: TemplateSearchProps) {
	const t = useTranslations("missionControl.templates");

	const categories: { value: CategoryFilter; label: string }[] = [
		{ value: "all", label: t("all") },
		{ value: "built-in", label: t("builtIn") },
		{ value: "custom", label: t("custom") },
	];

	return (
		<div className="flex flex-col gap-3">
			<input
				type="text"
				value={query}
				onChange={(e) => onQueryChange(e.target.value)}
				placeholder={t("searchPlaceholder")}
				className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
			/>
			<div className="flex items-center justify-between gap-3">
				<div className="flex gap-1">
					{categories.map((cat) => (
						<button
							key={cat.value}
							type="button"
							onClick={() => onCategoryChange(cat.value)}
							className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
								category === cat.value
									? "bg-blue-600 text-white"
									: "bg-gray-800 text-gray-400 hover:bg-gray-700"
							}`}
						>
							{cat.label}
						</button>
					))}
				</div>
				<select
					value={sort}
					onChange={(e) => onSortChange(e.target.value as SortOrder)}
					className="bg-gray-800 border border-gray-700 rounded-md px-2 py-1 text-xs text-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
				>
					<option value="most-used">Most Used</option>
					<option value="recently-used">Recently Used</option>
					<option value="alphabetical">Alphabetical</option>
				</select>
			</div>
		</div>
	);
}
