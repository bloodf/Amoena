"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import type { ParsedTemplate } from "../../../../lib/template-queries";

interface TemplateEditorProps {
	existing?: ParsedTemplate;
	onSave: (template: ParsedTemplate) => void;
	onCancel: () => void;
}

export function TemplateEditor({ existing, onSave, onCancel }: TemplateEditorProps) {
	const t = useTranslations("missionControl.templates");
	const isBuiltIn = existing?.category === "built-in";
	const isEdit = !!existing;

	const [name, setName] = useState(existing?.name ?? "");
	const [description, setDescription] = useState(existing?.description ?? "");
	const [goalText, setGoalText] = useState(existing?.goalText ?? "");
	const [tagsInput, setTagsInput] = useState(existing?.tags.join(", ") ?? "");

	const nameValid = name.trim().length >= 3 && name.trim().length <= 50;
	const goalValid = goalText.trim().length >= 10 && goalText.trim().length <= 2000;
	const canSave = nameValid && goalValid && !isBuiltIn;

	function handleSave() {
		if (!canSave) return;
		const tags = tagsInput
			.split(",")
			.map((t) => t.trim())
			.filter(Boolean);

		const template: ParsedTemplate = {
			id: existing?.id ?? "",
			name: name.trim(),
			description: description.trim(),
			goalText: goalText.trim(),
			category: "custom",
			tags,
			taskHints: existing?.taskHints ?? [],
			options: existing?.options ?? {},
			useCount: existing?.useCount ?? 0,
			lastUsedAt: existing?.lastUsedAt ?? null,
			createdAt: existing?.createdAt ?? Date.now(),
		};
		onSave(template);
	}

	return (
		<div className="flex flex-col gap-4">
			<h3 className="text-white font-medium">
				{isEdit ? t("editTemplate") : t("createTemplate")}
			</h3>

			{isBuiltIn && (
				<p className="text-sm text-yellow-400 bg-yellow-900/20 rounded p-2">
					{t("cannotEditBuiltIn")}
				</p>
			)}

			<div>
				<label className="block text-xs text-gray-400 mb-1">{t("name")}</label>
				<input
					type="text"
					value={name}
					onChange={(e) => setName(e.target.value)}
					disabled={isBuiltIn}
					maxLength={50}
					className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-sm text-white disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
				/>
			</div>

			<div>
				<label className="block text-xs text-gray-400 mb-1">{t("description")}</label>
				<input
					type="text"
					value={description}
					onChange={(e) => setDescription(e.target.value)}
					disabled={isBuiltIn}
					className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-sm text-white disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
				/>
			</div>

			<div>
				<label className="block text-xs text-gray-400 mb-1">{t("goalText")}</label>
				<textarea
					value={goalText}
					onChange={(e) => setGoalText(e.target.value)}
					disabled={isBuiltIn}
					rows={3}
					maxLength={2000}
					className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-sm text-white disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
				/>
				<p className="text-xs text-gray-500 mt-1">
					Use {"{placeholder}"} for variables. e.g. "Fix {"{bug}"} in {"{module}"}".
				</p>
			</div>

			<div>
				<label className="block text-xs text-gray-400 mb-1">{t("tags")}</label>
				<input
					type="text"
					value={tagsInput}
					onChange={(e) => setTagsInput(e.target.value)}
					disabled={isBuiltIn}
					placeholder="tag1, tag2, tag3"
					className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-sm text-white disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
				/>
			</div>

			<div className="flex gap-2 justify-end pt-2">
				<button
					type="button"
					onClick={onCancel}
					className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
				>
					{t("cancel")}
				</button>
				<button
					type="button"
					onClick={handleSave}
					disabled={!canSave}
					className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
				>
					{t("save")}
				</button>
			</div>
		</div>
	);
}
