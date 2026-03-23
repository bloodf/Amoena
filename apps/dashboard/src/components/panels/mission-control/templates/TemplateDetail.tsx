"use client";

import { useTranslations } from "next-intl";
import type { ParsedTemplate, TemplateOptions } from "../../../../lib/template-queries";
import { TemplateLauncher } from "./TemplateLauncher";

interface TemplateDetailProps {
	template: ParsedTemplate;
	onLaunch: (goalText: string, options: TemplateOptions) => void;
	onEdit: (template: ParsedTemplate) => void;
	onDelete: (templateId: string) => void;
	onBack: () => void;
}

export function TemplateDetail({ template, onLaunch, onEdit, onDelete, onBack }: TemplateDetailProps) {
	const t = useTranslations("missionControl.templates");

	return (
		<div className="flex flex-col gap-4">
			<div className="flex items-center gap-2 mb-2">
				<button
					type="button"
					onClick={onBack}
					className="text-gray-400 hover:text-white text-sm transition-colors"
				>
					← Back
				</button>
			</div>

			<TemplateLauncher template={template} onLaunch={onLaunch} onCancel={onBack} />

			{template.category === "custom" && (
				<div className="flex gap-2 border-t border-gray-700 pt-3">
					<button
						type="button"
						onClick={() => onEdit(template)}
						className="px-3 py-1.5 text-xs bg-gray-800 text-gray-300 rounded hover:bg-gray-700 transition-colors"
					>
						{t("editTemplate")}
					</button>
					<button
						type="button"
						onClick={() => onDelete(template.id)}
						className="px-3 py-1.5 text-xs bg-red-900 text-red-300 rounded hover:bg-red-800 transition-colors"
					>
						{t("deleteTemplate")}
					</button>
				</div>
			)}

			{template.category === "built-in" && (
				<p className="text-xs text-gray-500 italic">{t("cannotEditBuiltIn")}</p>
			)}
		</div>
	);
}
