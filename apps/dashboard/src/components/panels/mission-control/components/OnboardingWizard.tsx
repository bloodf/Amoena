"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

type Provider = "claude-code" | "codex" | "gemini";

interface OnboardingWizardProps {
	onConfigureAgent: (config: { provider: Provider; credential: string }) => void;
	onSkip?: () => void;
}

const PROVIDERS: { id: Provider; label: string; hint: string }[] = [
	{ id: "claude-code", label: "Claude (claude-code)", hint: "Anthropic API key" },
	{ id: "codex", label: "Codex (OpenAI)", hint: "OpenAI API key" },
	{ id: "gemini", label: "Gemini (Google)", hint: "Google AI API key" },
];

type Step = 1 | 2 | 3 | 4 | 5;

export function OnboardingWizard({ onConfigureAgent, onSkip }: OnboardingWizardProps) {
	const t = useTranslations("missionControl");
	const [step, setStep] = useState<Step>(1);
	const [provider, setProvider] = useState<Provider>("claude-code");
	const [credential, setCredential] = useState("");
	const [testing, setTesting] = useState(false);
	const [testResult, setTestResult] = useState<"ok" | "error" | null>(null);
	const [testError, setTestError] = useState<string | null>(null);

	async function handleTestConnection() {
		setTesting(true);
		setTestResult(null);
		setTestError(null);
		try {
			const res = await fetch("/api/mission-control/adapters/test", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ provider, credential }),
			});
			if (res.ok) {
				setTestResult("ok");
				setStep(5);
			} else {
				const data = await res.json().catch(() => ({}));
				setTestResult("error");
				setTestError(data.error ?? t("testConnectionFailed"));
			}
		} catch {
			setTestResult("error");
			setTestError(t("testConnectionFailed"));
		} finally {
			setTesting(false);
		}
	}

	function handleFinish() {
		onConfigureAgent({ provider, credential });
	}

	return (
		<div className="flex items-center justify-center h-full bg-gray-900 p-6">
			<div className="bg-gray-800 rounded-xl border border-gray-700 p-8 max-w-md w-full shadow-xl">
				{/* Progress dots */}
				<div className="flex gap-2 mb-6" aria-label={t("wizardProgress")}>
					{([1, 2, 3, 4, 5] as Step[]).map((s) => (
						<div
							key={s}
							className={`h-1.5 flex-1 rounded-full transition-colors ${
								s <= step ? "bg-blue-500" : "bg-gray-600"
							}`}
						/>
					))}
				</div>

				{/* Step 1: Welcome */}
				{step === 1 && (
					<div>
						<h2 className="text-xl font-bold text-white mb-2">
							{t("wizardWelcomeTitle")}
						</h2>
						<p className="text-gray-400 mb-6">{t("wizardWelcomeDesc")}</p>
						<button
							type="button"
							onClick={() => setStep(2)}
							className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium min-h-[44px]"
						>
							{t("getStarted")}
						</button>
					</div>
				)}

				{/* Step 2: Choose provider */}
				{step === 2 && (
					<div>
						<h2 className="text-xl font-bold text-white mb-2">
							{t("wizardChooseProvider")}
						</h2>
						<p className="text-gray-400 mb-4">{t("wizardChooseProviderDesc")}</p>
						<fieldset className="flex flex-col gap-3 mb-6">
							<legend className="sr-only">{t("wizardChooseProvider")}</legend>
							{PROVIDERS.map((p) => (
								<label
									key={p.id}
									className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors min-h-[44px] ${
										provider === p.id
											? "border-blue-500 bg-blue-900/20"
											: "border-gray-600 hover:border-gray-500"
									}`}
								>
									<input
										type="radio"
										name="provider"
										value={p.id}
										checked={provider === p.id}
										onChange={() => setProvider(p.id)}
										className="mt-0.5"
									/>
									<div>
										<div className="text-white font-medium">{p.label}</div>
										<div className="text-xs text-gray-400">{p.hint}</div>
									</div>
								</label>
							))}
						</fieldset>
						<div className="flex gap-3">
							<button
								type="button"
								onClick={() => setStep(1)}
								className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg min-h-[44px]"
							>
								{t("back")}
							</button>
							<button
								type="button"
								onClick={() => setStep(3)}
								className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium min-h-[44px]"
							>
								{t("next")}
							</button>
						</div>
					</div>
				)}

				{/* Step 3: Enter credentials */}
				{step === 3 && (
					<div>
						<h2 className="text-xl font-bold text-white mb-2">
							{t("wizardEnterCredentials")}
						</h2>
						<p className="text-gray-400 mb-4">
							{t("wizardCredentialHint", {
								provider:
									PROVIDERS.find((p) => p.id === provider)?.hint ?? "",
							})}
						</p>
						<input
							type="password"
							value={credential}
							onChange={(e) => setCredential(e.target.value)}
							placeholder={t("apiKeyPlaceholder")}
							className="w-full bg-gray-700 text-white rounded-lg px-4 py-3 mb-6 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px]"
							autoComplete="off"
						/>
						<div className="flex gap-3">
							<button
								type="button"
								onClick={() => setStep(2)}
								className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg min-h-[44px]"
							>
								{t("back")}
							</button>
							<button
								type="button"
								onClick={() => setStep(4)}
								disabled={!credential.trim()}
								className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-lg font-medium min-h-[44px]"
							>
								{t("next")}
							</button>
						</div>
					</div>
				)}

				{/* Step 4: Test connection */}
				{step === 4 && (
					<div>
						<h2 className="text-xl font-bold text-white mb-2">
							{t("wizardTestConnection")}
						</h2>
						<p className="text-gray-400 mb-6">
							{t("wizardTestConnectionDesc")}
						</p>
						{testResult === "error" && testError && (
							<p className="text-red-400 text-sm mb-4" role="alert">
								{testError}
							</p>
						)}
						<div className="flex gap-3">
							<button
								type="button"
								onClick={() => setStep(3)}
								className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg min-h-[44px]"
							>
								{t("back")}
							</button>
							<button
								type="button"
								onClick={handleTestConnection}
								disabled={testing}
								className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white rounded-lg font-medium min-h-[44px] flex items-center justify-center gap-2"
							>
								{testing && (
									<span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
								)}
								{testing ? t("testing") : t("testConnection")}
							</button>
						</div>
					</div>
				)}

				{/* Step 5: Done */}
				{step === 5 && (
					<div>
						<div className="text-4xl mb-4 text-center">✅</div>
						<h2 className="text-xl font-bold text-white mb-2 text-center">
							{t("wizardDoneTitle")}
						</h2>
						<p className="text-gray-400 mb-6 text-center">
							{t("wizardDoneDesc")}
						</p>
						<button
							type="button"
							onClick={handleFinish}
							className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium min-h-[44px]"
						>
							{t("startUsing")}
						</button>
					</div>
				)}

				{/* Skip link */}
				{onSkip && step !== 5 && (
					<button
						type="button"
						onClick={onSkip}
						className="mt-4 w-full text-center text-xs text-gray-500 hover:text-gray-300 transition-colors min-h-[44px]"
					>
						{t("skipForNow")}
					</button>
				)}
			</div>
		</div>
	);
}
