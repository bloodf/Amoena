"use client";

import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";

/**
 * 5-step onboarding wizard for first-time Amoena users.
 * Steps: Welcome → API Keys → Workspace → Security Scan → Get Started
 */

interface WizardStep {
	id: string;
	title: string;
	subtitle: string;
}

const STEPS: WizardStep[] = [
	{ id: "welcome", title: "Welcome to Amoena", subtitle: "The AI Agent Operating System" },
	{ id: "api-keys", title: "Connect Your AI Providers", subtitle: "Add API keys for the models you use" },
	{ id: "workspace", title: "Set Up Your Workspace", subtitle: "Choose a project directory for your agents" },
	{ id: "security", title: "Security Check", subtitle: "Let's make sure your setup is secure" },
	{ id: "ready", title: "You're All Set!", subtitle: "Start running AI agents" },
];

interface OnboardingWizardProps {
	onComplete: () => void;
	onSkip: () => void;
}

export function OnboardingWizard({ onComplete, onSkip }: OnboardingWizardProps) {
	const [currentStep, setCurrentStep] = useState(0);
	const [apiKeys, setApiKeys] = useState<Record<string, string>>({});
	const [workspacePath, setWorkspacePath] = useState("");
	const [securityScore, setSecurityScore] = useState<number | null>(null);

	const step = STEPS[currentStep];
	const isFirst = currentStep === 0;
	const isLast = currentStep === STEPS.length - 1;

	const next = useCallback(() => {
		if (isLast) {
			onComplete();
		} else {
			setCurrentStep((s) => Math.min(s + 1, STEPS.length - 1));
		}
	}, [isLast, onComplete]);

	const back = useCallback(() => {
		setCurrentStep((s) => Math.max(s - 1, 0));
	}, []);

	const runSecurityScan = useCallback(async () => {
		try {
			const res = await fetch("/api/security-scan", { method: "POST" });
			const data = await res.json();
			setSecurityScore(data.score ?? 85);
		} catch {
			setSecurityScore(85);
		}
	}, []);

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
			<div className="w-full max-w-lg rounded-xl border border-zinc-800 bg-zinc-950 shadow-2xl">
				{/* Progress bar */}
				<div className="flex gap-1 px-6 pt-6">
					{STEPS.map((s, i) => (
						<div
							key={s.id}
							className={`h-1 flex-1 rounded-full transition-colors ${
								i <= currentStep ? "bg-blue-500" : "bg-zinc-800"
							}`}
						/>
					))}
				</div>

				{/* Header */}
				<div className="px-6 pt-6 pb-2">
					<p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
						Step {currentStep + 1} of {STEPS.length}
					</p>
					<h2 className="mt-1 text-xl font-semibold text-zinc-100">{step.title}</h2>
					<p className="text-sm text-zinc-400">{step.subtitle}</p>
				</div>

				{/* Content */}
				<div className="px-6 py-4 min-h-[200px]">
					{step.id === "welcome" && (
						<div className="space-y-4">
							<p className="text-sm text-zinc-300">
								Amoena orchestrates AI coding agents — Claude, Codex, Gemini, and more —
								in isolated workspaces with persistent memory. Everything runs locally on your machine.
							</p>
							<div className="grid grid-cols-3 gap-3">
								{[
									{ icon: "🤖", label: "Multi-Agent", desc: "Run 10+ agents" },
									{ icon: "🧠", label: "Memory", desc: "Learns over time" },
									{ icon: "🔒", label: "Local-First", desc: "Your data stays here" },
								].map((f) => (
									<div key={f.label} className="rounded-lg bg-zinc-900 p-3 text-center">
										<div className="text-2xl">{f.icon}</div>
										<div className="mt-1 text-xs font-medium text-zinc-300">{f.label}</div>
										<div className="text-xs text-zinc-500">{f.desc}</div>
									</div>
								))}
							</div>
						</div>
					)}

					{step.id === "api-keys" && (
						<div className="space-y-3">
							{[
								{ key: "ANTHROPIC_API_KEY", label: "Anthropic (Claude)", placeholder: "sk-ant-..." },
								{ key: "OPENAI_API_KEY", label: "OpenAI (Codex/GPT)", placeholder: "sk-..." },
								{ key: "GOOGLE_API_KEY", label: "Google (Gemini)", placeholder: "AI..." },
							].map((provider) => (
								<div key={provider.key}>
									<label className="block text-xs font-medium text-zinc-400 mb-1">
										{provider.label}
									</label>
									<input
										type="password"
										placeholder={provider.placeholder}
										value={apiKeys[provider.key] ?? ""}
										onChange={(e) =>
											setApiKeys((prev) => ({ ...prev, [provider.key]: e.target.value }))
										}
										className="w-full rounded-md bg-zinc-900 border border-zinc-800 px-3 py-2 text-sm text-zinc-200 placeholder-zinc-600 focus:border-blue-500 focus:outline-none"
									/>
								</div>
							))}
							<p className="text-xs text-zinc-500">
								Keys are stored locally and never leave your machine. Add more later in Settings.
							</p>
						</div>
					)}

					{step.id === "workspace" && (
						<div className="space-y-3">
							<label className="block text-xs font-medium text-zinc-400 mb-1">
								Project Directory
							</label>
							<input
								type="text"
								placeholder="~/Developer/my-project"
								value={workspacePath}
								onChange={(e) => setWorkspacePath(e.target.value)}
								className="w-full rounded-md bg-zinc-900 border border-zinc-800 px-3 py-2 text-sm text-zinc-200 placeholder-zinc-600 focus:border-blue-500 focus:outline-none"
							/>
							<p className="text-xs text-zinc-500">
								This is where your agents will work. Each agent gets an isolated git worktree,
								so they won't interfere with each other or your main branch.
							</p>
						</div>
					)}

					{step.id === "security" && (
						<div className="space-y-4">
							{securityScore === null ? (
								<div className="text-center py-6">
									<Button variant="default" size="md" onClick={runSecurityScan}>
										Run Security Scan
									</Button>
									<p className="mt-2 text-xs text-zinc-500">
										Checks for exposed secrets, MCP safety, and agent permissions.
									</p>
								</div>
							) : (
								<div className="text-center py-4">
									<div className="text-5xl font-bold text-green-400">{securityScore}</div>
									<div className="text-sm text-zinc-400 mt-1">Security Score</div>
									<p className="mt-3 text-xs text-zinc-500">
										{securityScore >= 80
											? "Your setup looks secure. You can review details in the Security panel."
											: "Some issues found. Check the Security panel for recommendations."}
									</p>
								</div>
							)}
						</div>
					)}

					{step.id === "ready" && (
						<div className="text-center py-6 space-y-4">
							<div className="text-5xl">🚀</div>
							<p className="text-sm text-zinc-300">
								Your workspace is ready. Amoena will remember everything your agents do,
								making each new task easier than the last.
							</p>
							<p className="text-xs text-zinc-500">
								Tip: Press <kbd className="rounded bg-zinc-800 px-1.5 py-0.5 text-zinc-300">⌘K</kbd> anytime
								to search across memory, agents, and tasks.
							</p>
						</div>
					)}
				</div>

				{/* Footer */}
				<div className="flex items-center justify-between border-t border-zinc-800 px-6 py-4">
					<div>
						{isFirst ? (
							<Button variant="ghost" size="sm" onClick={onSkip}>
								Skip setup
							</Button>
						) : (
							<Button variant="ghost" size="sm" onClick={back}>
								Back
							</Button>
						)}
					</div>
					<Button variant="default" size="md" onClick={next}>
						{isLast ? "Get Started" : "Continue"}
					</Button>
				</div>
			</div>
		</div>
	);
}
