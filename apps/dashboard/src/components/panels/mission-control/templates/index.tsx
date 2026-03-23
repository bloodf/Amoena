"use client";

import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import type { ParsedTemplate, TemplateOptions } from "../../../../lib/template-queries";
import { TemplateDetail } from "./TemplateDetail";
import { TemplateEditor } from "./TemplateEditor";
import { TemplateGrid } from "./TemplateGrid";
import { TemplateSearch, type CategoryFilter, type SortOrder } from "./TemplateSearch";

interface TemplatesPanelProps {
	templates: ParsedTemplate[];
	onLaunch: (goalText: string, options: TemplateOptions) => void;
	onCreateTemplate: (template: Omit<ParsedTemplate, "id" | "useCount" | "lastUsedAt" | "createdAt">) => void;
	onUpdateTemplate: (id: string, updates: Partial<ParsedTemplate>) => void;
	onDeleteTemplate: (id: string) => void;
}

type View = "list" | "detail" | "editor";

export function TemplatesPanel({
	templates,
	onLaunch,
	onCreateTemplate,
	onUpdateTemplate,
	onDeleteTemplate,
}: TemplatesPanelProps) {
	const t = useTranslations("missionControl.templates");
	const [view, setView] = useState<View>("list");
	const [selectedId, setSelectedId] = useState<string | null>(null);
	const [editTarget, setEditTarget] = useState<ParsedTemplate | undefined>(undefined);
	const [query, setQuery] = useState("");
	const [category, setCategory] = useState<CategoryFilter>("all");
	const [sort, setSort] = useState<SortOrder>("most-used");

	const selectedTemplate = selectedId ? templates.find((t) => t.id === selectedId) ?? null : null;

	const filtered = useMemo(() => {
		let result = templates.filter((tmpl) => {
			if (category !== "all" && tmpl.category !== category) return false;
			if (query.trim()) {
				const q = query.toLowerCase();
				return (
					tmpl.name.toLowerCase().includes(q) ||
					tmpl.description.toLowerCase().includes(q) ||
					tmpl.tags.some((tag) => tag.toLowerCase().includes(q))
				);
			}
			return true;
		});

		if (sort === "most-used") {
			result = [...result].sort((a, b) => b.useCount - a.useCount);
		} else if (sort === "recently-used") {
			result = [...result].sort((a, b) => (b.lastUsedAt ?? 0) - (a.lastUsedAt ?? 0));
		} else {
			result = [...result].sort((a, b) => a.name.localeCompare(b.name));
		}

		return result;
	}, [templates, query, category, sort]);

	function handleSelect(templateId: string) {
		setSelectedId(templateId);
		setView("detail");
	}

	function handleEdit(template: ParsedTemplate) {
		setEditTarget(template);
		setView("editor");
	}

	function handleDelete(templateId: string) {
		onDeleteTemplate(templateId);
		setView("list");
	}

	function handleSave(template: ParsedTemplate) {
		if (editTarget) {
			onUpdateTemplate(template.id, template);
		} else {
			onCreateTemplate(template);
		}
		setEditTarget(undefined);
		setView("list");
	}

	if (view === "detail" && selectedTemplate) {
		return (
			<TemplateDetail
				template={selectedTemplate}
				onLaunch={onLaunch}
				onEdit={handleEdit}
				onDelete={handleDelete}
				onBack={() => setView("list")}
			/>
		);
	}

	if (view === "editor") {
		return (
			<TemplateEditor
				existing={editTarget}
				onSave={handleSave}
				onCancel={() => { setEditTarget(undefined); setView("list"); }}
			/>
		);
	}

	return (
		<div className="flex flex-col gap-4">
			<div className="flex items-center justify-between">
				<h2 className="text-white font-semibold">{t("title")}</h2>
				<button
					type="button"
					onClick={() => { setEditTarget(undefined); setView("editor"); }}
					className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-500 transition-colors"
				>
					{t("createTemplate")}
				</button>
			</div>
			<TemplateSearch
				query={query}
				onQueryChange={setQuery}
				category={category}
				onCategoryChange={setCategory}
				sort={sort}
				onSortChange={setSort}
			/>
			<TemplateGrid templates={filtered} onSelect={handleSelect} />
		</div>
	);
}
