"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import type { SecretType } from "../../../../lib/secret-scrubber";

interface SecretWarningProps {
	redactedCount: number;
	redactedTypes: SecretType[];
	onProceed: () => void;
	onCancel: () => void;
}

const SECRET_TYPE_KEYS: Record<SecretType, string> = {
	api_key: "apiKey",
	bearer_token: "bearerToken",
	password: "password",
	private_key: "privateKey",
	connection_string: "connectionString",
	aws_key: "awsKey",
	github_token: "githubToken",
	generic_secret: "genericSecret",
};

export function SecretWarning({ redactedCount, redactedTypes, onProceed, onCancel }: SecretWarningProps) {
	const t = useTranslations("missionControl.share");
	const [dontWarn, setDontWarn] = useState(false);

	function handleProceed() {
		if (dontWarn) {
			localStorage.setItem("lunaria:skip-secret-warning", "true");
		}
		onProceed();
	}

	return (
		<div className="bg-yellow-900/20 border border-yellow-600 rounded-lg p-4">
			<div className="flex items-start gap-3 mb-3">
				<span className="text-yellow-400 text-xl">⚠</span>
				<div>
					<p className="text-yellow-300 font-medium text-sm">
						{t("secretsDetected", { count: redactedCount })}
					</p>
					{redactedTypes.length > 0 && (
						<div className="mt-2">
							<p className="text-xs text-gray-400 mb-1">{t("secretTypes")}:</p>
							<div className="flex flex-wrap gap-1">
								{redactedTypes.map((type) => (
									<span
										key={type}
										className="text-xs bg-red-900/40 text-red-300 px-2 py-0.5 rounded"
									>
										{t(SECRET_TYPE_KEYS[type] as any)}
									</span>
								))}
							</div>
						</div>
					)}
				</div>
			</div>

			<label className="flex items-center gap-2 mb-4 cursor-pointer">
				<input
					type="checkbox"
					checked={dontWarn}
					onChange={(e) => setDontWarn(e.target.checked)}
					className="w-4 h-4"
				/>
				<span className="text-xs text-gray-400">{t("dontWarnAgain")}</span>
			</label>

			<div className="flex gap-2 justify-end">
				<button
					type="button"
					onClick={onCancel}
					className="px-3 py-1.5 text-sm text-gray-400 hover:text-white transition-colors"
				>
					{t("cancel")}
				</button>
				<button
					type="button"
					onClick={handleProceed}
					className="px-3 py-1.5 text-sm bg-yellow-600 text-white rounded-md hover:bg-yellow-500 transition-colors"
				>
					{t("proceedWithRedaction")}
				</button>
			</div>
		</div>
	);
}
