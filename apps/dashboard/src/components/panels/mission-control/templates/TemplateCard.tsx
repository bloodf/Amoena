"use client";

import { useTranslations } from "next-intl";
import type { ParsedTemplate } from "../../../../lib/template-queries";

interface TemplateCardProps {
	template: ParsedTemplate;
	onSelect: (templateId: string) => void;
}

export function TemplateCard({ template, onSelect }: TemplateCardProps) {
	const t = useTranslations("missionControl.templates");

	return (
		<button
			type="button"
			onClick={() => onSelect(template.id)}
			className="w-full text-left p-4 rounded-lg border border-gray-700 bg-gray-900 hover:bg-gray-800 hover:shadow-md transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500"
		>
			<div className="flex items-start justify-between gap-2 mb-2">
				<div className="flex items-center gap-2">
					{template.category === "built-in" && (
						<span className="text-yellow-400 text-sm" title="Built-in">★</span>
					)}
					<h3 className="font-medium text-white text-sm">{template.name}</h3>
				</div>
				<span
					className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${
						template.category === "built-in"
							? "bg-yellow-900 text-yellow-300"
							: "bg-blue-900 text-blue-300"
					}`}
				>
					{template.category === "built-in" ? t("builtIn") : t("custom")}
				</span>
			</div>

			<p className="text-gray-400 text-xs line-clamp-2 mb-3">{template.description}</p>

			<div className="flex flex-wrap gap-1 mb-2">
				{template.tags.slice(0, 4).map((tag) => (
					<span key={tag} className="text-xs bg-gray-700 text-gray-300 px-1.5 py-0.5 rounded">
						{tag}
					</span>
				))}
			</div>

			<p className="text-xs text-gray-500">
				{template.useCount > 0 ? t("usedCount", { count: template.useCount }) : t("neverUsed")}
			</p>
		</button>
	);
}
