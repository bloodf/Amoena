"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { eventBus } from "../../../../lib/event-bus";
import { extractPlaceholders } from "../../../../lib/template-queries";
import type { ParsedTemplate, TemplateOptions } from "../../../../lib/template-queries";

interface TemplateLauncherProps {
	template: ParsedTemplate;
	onLaunch: (goalText: string, options: TemplateOptions) => void;
	onCancel: () => void;
}

export function TemplateLauncher({ template, onLaunch, onCancel }: TemplateLauncherProps) {
	const t = useTranslations("missionControl.templates");
	const placeholders = extractPlaceholders(template.goalText);
	const [values, setValues] = useState<Record<string, string>>(
		Object.fromEntries(placeholders.map((p) => [p, ""])),
	);

	const allFilled = placeholders.every((p) => values[p]?.trim().length > 0);

	const filledGoalText = template.goalText.replace(
		/\{([^}]+)\}/g,
		(_, key) => values[key] ?? `{${key}}`,
	);

	function handleLaunch() {
		if (!allFilled && placeholders.length > 0) return;
		eventBus.broadcast("lunaria:load-template" as any, {
			templateId: template.id,
			goalText: filledGoalText,
			options: template.options,
			taskHints: template.taskHints,
		});
		onLaunch(filledGoalText, template.options);
	}

	return (
		<div className="flex flex-col gap-4">
			<div>
				<h3 className="text-white font-medium mb-1">{template.name}</h3>
				<p className="text-gray-400 text-sm">{template.description}</p>
			</div>

			{placeholders.length > 0 && (
				<div>
					<p className="text-sm font-medium text-gray-300 mb-2">{t("fillPlaceholders")}</p>
					<div className="flex flex-col gap-3">
						{placeholders.map((placeholder) => (
							<div key={placeholder}>
								<label
									htmlFor={`placeholder-${placeholder}`}
									className="block text-xs text-gray-400 mb-1"
								>
									{placeholder.replace(/_/g, " ")}
								</label>
								<input
									id={`placeholder-${placeholder}`}
									type="text"
									value={values[placeholder] ?? ""}
									onChange={(e) =>
										setValues((prev) => ({ ...prev, [placeholder]: e.target.value }))
									}
									className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
								/>
							</div>
						))}
					</div>
				</div>
			)}

			<div>
				<p className="text-xs font-medium text-gray-400 mb-1">{t("preview")}</p>
				<p className="text-sm text-gray-200 bg-gray-800 rounded-md p-3 border border-gray-700">
					{filledGoalText}
				</p>
			</div>

			<div className="flex gap-2 justify-end">
				<button
					type="button"
					onClick={onCancel}
					className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
				>
					{t("cancel")}
				</button>
				<button
					type="button"
					onClick={handleLaunch}
					disabled={!allFilled && placeholders.length > 0}
					className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
				>
					{t("launch")}
				</button>
			</div>
		</div>
	);
}
