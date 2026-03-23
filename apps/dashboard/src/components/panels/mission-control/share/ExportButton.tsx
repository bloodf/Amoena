"use client";

import { useTranslations } from "next-intl";
import { useRef, useState } from "react";
import { type ExportFormat, type ExportResult, exportReport } from "../../../../lib/report-exporter";
import { containsSecrets, scrubReport } from "../../../../lib/secret-scrubber";
import type { RunReport } from "../../../../lib/run-reporter";
import { SecretWarning } from "./SecretWarning";
import type { SecretType } from "../../../../lib/secret-scrubber";

interface ExportButtonProps {
	report: RunReport;
	onExport: (result: ExportResult) => void;
}

export function ExportButton({ report, onExport }: ExportButtonProps) {
	const t = useTranslations("missionControl.share");
	const [open, setOpen] = useState(false);
	const [pendingFormat, setPendingFormat] = useState<ExportFormat | null>(null);
	const [secretInfo, setSecretInfo] = useState<{
		count: number;
		types: SecretType[];
	} | null>(null);
	const menuRef = useRef<HTMLDivElement>(null);

	const formats: { format: ExportFormat; label: string }[] = [
		{ format: "html", label: t("exportHtml") },
		{ format: "markdown", label: t("exportMarkdown") },
		{ format: "json", label: t("exportJson") },
	];

	function hasSecrets(): boolean {
		const skipWarning = localStorage.getItem("lunaria:skip-secret-warning") === "true";
		if (skipWarning) return false;
		// Check if report contains secrets
		const { totalRedacted, types } = scrubReport(report);
		if (totalRedacted > 0) {
			setSecretInfo({ count: totalRedacted, types });
			return true;
		}
		return false;
	}

	function triggerExport(format: ExportFormat) {
		const result = exportReport(report, { format });
		onExport(result);
		// Trigger download
		const blob = new Blob([result.content], { type: result.mimeType });
		const url = URL.createObjectURL(blob);
		const anchor = document.createElement("a");
		anchor.href = url;
		anchor.download = result.filename;
		document.body.appendChild(anchor);
		anchor.click();
		document.body.removeChild(anchor);
		URL.revokeObjectURL(url);
	}

	function handleFormatClick(format: ExportFormat) {
		setOpen(false);
		if (hasSecrets()) {
			setPendingFormat(format);
		} else {
			triggerExport(format);
		}
	}

	function handleProceed() {
		setSecretInfo(null);
		if (pendingFormat) {
			triggerExport(pendingFormat);
			setPendingFormat(null);
		}
	}

	function handleCancelWarning() {
		setSecretInfo(null);
		setPendingFormat(null);
	}

	if (secretInfo) {
		return (
			<SecretWarning
				redactedCount={secretInfo.count}
				redactedTypes={secretInfo.types}
				onProceed={handleProceed}
				onCancel={handleCancelWarning}
			/>
		);
	}

	return (
		<div className="relative inline-block" ref={menuRef}>
			<button
				type="button"
				onClick={() => setOpen((prev) => !prev)}
				className="flex items-center gap-1 px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-500 transition-colors"
			>
				{t("title")}
				<span className="ml-1 text-xs">▼</span>
			</button>

			{open && (
				<div className="absolute right-0 mt-1 w-44 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-10">
					{formats.map(({ format, label }) => (
						<button
							key={format}
							type="button"
							onClick={() => handleFormatClick(format)}
							className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white first:rounded-t-lg last:rounded-b-lg transition-colors"
						>
							{label}
						</button>
					))}
				</div>
			)}
		</div>
	);
}
