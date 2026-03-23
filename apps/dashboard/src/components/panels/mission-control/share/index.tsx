"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import type { ExportResult } from "../../../../lib/report-exporter";
import type { RunReport } from "../../../../lib/run-reporter";
import { ExportButton } from "./ExportButton";
import { ExportPreview } from "./ExportPreview";

interface SharePanelProps {
	report: RunReport;
}

export function SharePanel({ report }: SharePanelProps) {
	const t = useTranslations("missionControl.share");
	const [lastExport, setLastExport] = useState<ExportResult | null>(null);
	const [showPreview, setShowPreview] = useState(false);

	function handleExport(result: ExportResult) {
		setLastExport(result);
	}

	if (showPreview && lastExport) {
		return (
			<ExportPreview
				content={lastExport.content}
				format={lastExport.filename.endsWith(".html") ? "html" : lastExport.filename.endsWith(".md") ? "markdown" : "json"}
				onConfirm={() => setShowPreview(false)}
				onCancel={() => setShowPreview(false)}
			/>
		);
	}

	return (
		<div className="flex flex-col gap-4">
			<div className="flex items-center justify-between">
				<h2 className="text-white font-semibold">{t("title")}</h2>
				<ExportButton report={report} onExport={handleExport} />
			</div>

			{lastExport && (
				<div className="bg-gray-800 rounded-lg p-3 text-sm text-gray-300 flex items-center justify-between">
					<span>
						{t("exportSuccess")} — {lastExport.filename}
						{lastExport.secretsRedacted > 0 && (
							<span className="ml-2 text-xs text-yellow-400">
								({lastExport.secretsRedacted} secrets redacted)
							</span>
						)}
					</span>
					<button
						type="button"
						onClick={() => setShowPreview(true)}
						className="text-xs text-blue-400 hover:text-blue-300 ml-3"
					>
						{t("preview")}
					</button>
				</div>
			)}
		</div>
	);
}
