"use client";

import { useTranslations } from "next-intl";
import type { ExportFormat } from "../../../../lib/report-exporter";

interface ExportPreviewProps {
	content: string;
	format: ExportFormat;
	onConfirm: () => void;
	onCancel: () => void;
}

export function ExportPreview({ content, format, onConfirm, onCancel }: ExportPreviewProps) {
	const t = useTranslations("missionControl.share");

	return (
		<div className="flex flex-col gap-4">
			<h3 className="text-white font-medium">{t("preview")}</h3>

			<div className="border border-gray-700 rounded-lg overflow-hidden">
				{format === "html" ? (
					<iframe
						srcDoc={content}
						sandbox="allow-same-origin"
						className="w-full h-96"
						title="Report preview"
					/>
				) : (
					<pre className="bg-gray-900 text-gray-300 text-xs p-4 overflow-auto max-h-96 whitespace-pre-wrap">
						{content}
					</pre>
				)}
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
					onClick={onConfirm}
					className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-500 transition-colors"
				>
					{t("download")}
				</button>
			</div>
		</div>
	);
}
