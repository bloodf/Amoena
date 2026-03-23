"use client";

import type { ParsedTemplate } from "../../../../lib/template-queries";
import { TemplateCard } from "./TemplateCard";

interface TemplateGridProps {
	templates: ParsedTemplate[];
	onSelect: (templateId: string) => void;
}

export function TemplateGrid({ templates, onSelect }: TemplateGridProps) {
	if (templates.length === 0) {
		return (
			<div className="text-center text-gray-500 py-12 text-sm">
				No templates found.
			</div>
		);
	}

	return (
		<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
			{templates.map((template) => (
				<TemplateCard key={template.id} template={template} onSelect={onSelect} />
			))}
		</div>
	);
}
