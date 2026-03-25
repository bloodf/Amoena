"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { GoalInput } from "./components/GoalInput";
import { TaskGraph } from "./components/TaskGraph";
import { AgentPanel } from "./components/AgentPanel";
import { AgentPanelGrid } from "./components/AgentPanelGrid";
import { CostTracker } from "./components/CostTracker";
import { StatusBar } from "./components/StatusBar";
import { RunReport } from "./components/RunReport";
import { OnboardingWizard } from "./components/OnboardingWizard";
import { useGoalRun } from "./hooks/use-goal-run";
import { useRunHistory } from "./hooks/use-run-history";
import { AGENT_COLORS } from "./tokens";
import type { GoalOptions } from "./types";

// Audio helpers — all calls wrapped in try/catch so audio never crashes the UI
function createAudioContext(): AudioContext | null {
	try {
		return new AudioContext();
	} catch {
		return null;
	}
}

function playTerminalClick(ctx: AudioContext | null): void {
	if (!ctx) return;
	try {
		const osc = ctx.createOscillator();
		const gain = ctx.createGain();
		osc.connect(gain);
		gain.connect(ctx.destination);
		osc.frequency.value = 440;
		gain.gain.setValueAtTime(0.02, ctx.currentTime);
		gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.02);
		osc.start(ctx.currentTime);
		osc.stop(ctx.currentTime + 0.02);
	} catch {
		// silent
	}
}

function playCompletionChime(ctx: AudioContext | null, notes: number[]): void {
	if (!ctx) return;
	notes.forEach((freq, i) => {
		try {
			const osc = ctx.createOscillator();
			const gain = ctx.createGain();
			osc.connect(gain);
			gain.connect(ctx.destination);
			osc.frequency.value = freq;
			const startTime = ctx.currentTime + i * 0.08;
			gain.gain.setValueAtTime(0.1, startTime);
			gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.08);
			osc.start(startTime);
			osc.stop(startTime + 0.08);
		} catch {
			// silent
		}
	});
}

const AUDIO_STORAGE_KEY = "amoena.missionControl.audio";

function loadAudioSettings() {
	try {
		const raw = localStorage.getItem(AUDIO_STORAGE_KEY);
		if (!raw) return { enabled: true, terminalClicks: true, completionChime: true };
		return JSON.parse(raw);
	} catch {
		return { enabled: true, terminalClicks: true, completionChime: true };
	}
}

function saveAudioSettings(settings: {
	enabled: boolean;
	terminalClicks: boolean;
	completionChime: boolean;
}) {
	try {
		localStorage.setItem(AUDIO_STORAGE_KEY, JSON.stringify(settings));
	} catch {
		// ignore
	}
}

export function MissionControlPanel() {
	const t = useTranslations("missionControl");
	const { state, submitGoal, cancelGoal, resetToPreRun } = useGoalRun();
	const { runs } = useRunHistory(5);

	const [highlightedTaskId, setHighlightedTaskId] = useState<string | null>(null);
	const [selectedAgentIndex, setSelectedAgentIndex] = useState(0);
	const [showOnboarding, setShowOnboarding] = useState(false);
	const [audioSettings, setAudioSettings] = useState(() => loadAudioSettings());
	const [audioCtx] = useState<AudioContext | null>(() =>
		typeof window !== "undefined" ? createAudioContext() : null,
	);
	const [showAudioMenu, setShowAudioMenu] = useState(false);
	const [checkingAdapters, setCheckingAdapters] = useState(true);

	// Check adapter availability on mount
	useEffect(() => {
		let cancelled = false;
		fetch("/api/mission-control/adapters/available")
			.then((r) => r.json())
			.then((data) => {
				if (!cancelled && Array.isArray(data.available) && data.available.length === 0) {
					setShowOnboarding(true);
				}
			})
			.catch(() => {
				// best-effort: don't block on failure
			})
			.finally(() => {
				if (!cancelled) setCheckingAdapters(false);
			});
		return () => {
			cancelled = true;
		};
	}, []);

	// Audio: terminal click on each new output line
	useEffect(() => {
		if (!audioSettings.enabled || !audioSettings.terminalClicks) return;
		// Fire a click sound on any new output line
		const total = state.panels.reduce((s, p) => s + p.outputLines.length, 0);
		if (total > 0) playTerminalClick(audioCtx);
	}, [state.panels, audioSettings, audioCtx]); // eslint-disable-line react-hooks/exhaustive-deps

	// Audio: completion chime — distinct tones per outcome
	useEffect(() => {
		if (!audioSettings.enabled || !audioSettings.completionChime) return;
		if (state.viewState === "post-run") {
			const status = state.goalStatus;
			const notes =
				status === "completed" ? [523, 659, 784] :   // C5, E5, G5 — ascending
				status === "partial_failure" ? [262, 262] :  // C4, C4 — flat
				[392, 330, 262];                             // G4, E4, C4 — descending
			playCompletionChime(audioCtx, notes);
		}
	}, [state.viewState, state.goalStatus, audioSettings, audioCtx]);

	function toggleAudio() {
		const next = { ...audioSettings, enabled: !audioSettings.enabled };
		setAudioSettings(next);
		saveAudioSettings(next);
	}

	const handleTaskClick = useCallback((taskId: string) => {
		setHighlightedTaskId((prev) => (prev === taskId ? null : taskId));
	}, []);

	const handleConfigureAgent = useCallback(
		(_cfg: { provider: string; credential: string }) => {
			setShowOnboarding(false);
		},
		[],
	);

	const completedTasks = state.tasks.filter((t) => t.status === "completed").length;
	const activeAgents = state.panels.filter((p) => p.status === "running").length;

	if (checkingAdapters) {
		return (
			<div className="h-full flex items-center justify-center bg-gray-900">
				<div className="text-gray-400 text-sm">{t("loading")}</div>
			</div>
		);
	}

	if (showOnboarding) {
		return (
			<OnboardingWizard
				onConfigureAgent={handleConfigureAgent}
				onSkip={() => setShowOnboarding(false)}
			/>
		);
	}

	return (
		<div className="h-full flex flex-col bg-gray-900 text-white">
			{/* Panel header */}
			<div className="flex items-center justify-between px-4 py-3 border-b border-gray-700 flex-shrink-0">
				<h2 className="text-lg font-semibold">{t("title")}</h2>
				<div className="flex items-center gap-3">
					{state.viewState === "during-run" && (
						<button
							type="button"
							onClick={cancelGoal}
							className="px-3 py-2 text-sm bg-red-900/50 hover:bg-red-900 text-red-400 hover:text-red-300 border border-red-800 rounded-lg transition-colors min-h-[44px]"
						>
							{t("cancel")}
						</button>
					)}

					{/* Audio toggle */}
					<div className="relative">
						<button
							type="button"
							onClick={() => setShowAudioMenu((s) => !s)}
							className="px-3 py-2 text-sm text-gray-400 hover:text-gray-200 min-h-[44px]"
							aria-label={t("audioSettings")}
						>
							{audioSettings.enabled ? "🔊" : "🔇"}
						</button>
						{showAudioMenu && (
							<div className="absolute right-0 top-full mt-1 bg-gray-800 border border-gray-700 rounded-lg p-3 shadow-xl z-50 min-w-[180px]">
								<label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer min-h-[44px]">
									<input
										type="checkbox"
										checked={audioSettings.enabled}
										onChange={toggleAudio}
									/>
									{t("audioEnabled")}
								</label>
							</div>
						)}
					</div>
				</div>
			</div>

			{/* Visually-hidden live region for status announcements */}
			<div className="sr-only" aria-live="assertive" aria-atomic="true">
				{state.tasks.filter((t) => t.status === "failed").length > 0 &&
					t("taskFailedAnnouncement")}
			</div>
			<div className="sr-only" aria-live="polite" aria-atomic="true">
				{state.viewState === "post-run" && t("runCompletedAnnouncement")}
			</div>

			{/* Main content */}
			<div className="flex-1 overflow-hidden">
				{/* === PRE-RUN === */}
				{state.viewState === "pre-run" && (
					<div className="h-full overflow-y-auto p-4 md:p-6 flex flex-col gap-6">
						<div className="max-w-2xl mx-auto w-full">
							<p className="text-gray-400 text-sm mb-4">{t("goalInputHint")}</p>
							<GoalInput
								onSubmit={(desc: string, opts: GoalOptions) => submitGoal(desc, opts)}
								isSubmitting={state.isSubmitting}
							/>
							{state.error && (
								<p className="mt-3 text-red-400 text-sm" role="alert">
									{state.error}
								</p>
							)}
						</div>

						{/* Recent runs */}
						{runs.length > 0 && (
							<div className="max-w-2xl mx-auto w-full">
								<h3 className="text-sm font-medium text-gray-400 mb-3">
									{t("recentRuns")}
								</h3>
								<div className="flex flex-col gap-2">
									{runs.map((run) => (
										<div
											key={run.goalId}
											className="flex items-center justify-between px-3 py-2 bg-gray-800 rounded-lg border border-gray-700 text-sm"
										>
											<span className="text-gray-300 truncate">
												{run.description}
											</span>
											<span
												className={`ml-3 text-xs flex-shrink-0 ${
													run.status === "completed"
														? "text-green-400"
														: run.status === "failed"
															? "text-red-400"
															: "text-gray-400"
												}`}
											>
												{run.status}
											</span>
										</div>
									))}
								</div>
							</div>
						)}
					</div>
				)}

				{/* === DURING-RUN === */}
				{state.viewState === "during-run" && (
					<div className="h-full flex flex-col">
						{/* Goal bar */}
						<div className="px-4 py-2 border-b border-gray-700 text-sm text-gray-300 flex items-center gap-2 flex-shrink-0">
							<span className="text-blue-400 font-medium">{t("goal")}:</span>
							<span className="truncate">{state.goalDescription}</span>
							<span className="ml-auto text-blue-400 text-xs animate-pulse flex-shrink-0">
								⟳ {t("running")}
							</span>
						</div>

						{/* Split layout: desktop side-by-side, tablet/mobile stacked */}
						<div className="flex-1 overflow-hidden flex flex-col xl:flex-row min-h-0">
							{/* Task graph — 25% on desktop, collapsed on tablet/mobile */}
							<div className="xl:w-1/4 xl:border-r border-gray-700 overflow-y-auto p-3 hidden md:hidden xl:block">
								<h3 className="text-xs font-medium text-gray-400 mb-2 uppercase tracking-wide">
									{t("taskGraph")}
								</h3>
								<TaskGraph
									tasks={state.tasks}
									onTaskClick={handleTaskClick}
								/>
							</div>

							{/* Task graph dropdown for tablet */}
							<div className="xl:hidden border-b border-gray-700 p-3">
								<details>
									<summary className="text-xs font-medium text-gray-400 uppercase tracking-wide cursor-pointer">
										{t("taskGraph")} ({state.tasks.length})
									</summary>
									<div className="mt-2 overflow-x-auto">
										<TaskGraph
											tasks={state.tasks}
											onTaskClick={handleTaskClick}
										/>
									</div>
								</details>
							</div>

							{/* Agent panels — 60%+ on desktop */}
							<div className="flex-1 overflow-y-auto p-3 min-h-0">
								{/* Mobile tabbed view */}
								<div className="md:hidden flex flex-col h-full">
									{state.panels.length > 0 && (
										<div className="flex overflow-x-auto gap-1 pb-1 flex-shrink-0">
											{state.panels.map((panel, i) => {
												const color =
													AGENT_COLORS[panel.adapterId as keyof typeof AGENT_COLORS] ??
													AGENT_COLORS.unknown;
												const isSelected = selectedAgentIndex === i;
												return (
													<button
														key={panel.taskId}
														type="button"
														onClick={() => setSelectedAgentIndex(i)}
														className="flex-shrink-0 px-3 py-1.5 rounded text-xs font-medium transition-colors min-h-[36px]"
														style={{
															backgroundColor: isSelected ? color : "transparent",
															color: isSelected ? "#fff" : color,
															border: `1px solid ${color}`,
														}}
													>
														{panel.adapterId}
													</button>
												);
											})}
										</div>
									)}
									{state.panels[selectedAgentIndex] && (
										<div className="flex-1 min-h-0">
											<AgentPanel
												{...state.panels[selectedAgentIndex]}
												isHighlighted={
													highlightedTaskId === state.panels[selectedAgentIndex].taskId
												}
											/>
										</div>
									)}
								</div>
								{/* Desktop/tablet grid */}
								<div className="hidden md:block h-full">
									<AgentPanelGrid
										panels={state.panels}
										highlightedTaskId={highlightedTaskId}
									/>
								</div>
							</div>
						</div>

						{/* Status bar */}
						<StatusBar
							completedTasks={completedTasks}
							totalTasks={state.tasks.length}
							activeAgents={activeAgents}
							totalCostUsd={state.totalCostUsd}
							costByAgent={state.costByAgent}
							startedAt={state.startedAt}
						/>
					</div>
				)}

				{/* === POST-RUN === */}
				{state.viewState === "post-run" && state.report && (
					<RunReport report={state.report} onNewGoal={resetToPreRun} />
				)}

				{/* Post-run but no report (e.g. cancelled without report) */}
				{state.viewState === "post-run" && !state.report && (
					<div className="h-full flex flex-col items-center justify-center gap-4">
						<p className="text-gray-400">{t("runEnded")}</p>
						<button
							type="button"
							onClick={resetToPreRun}
							className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg min-h-[44px]"
						>
							{t("newGoal")}
						</button>
					</div>
				)}
			</div>

			{/* Mobile tab bar (bottom) — shown only in during-run on small screens */}
			{state.viewState === "during-run" && (
				<div className="md:hidden flex border-t border-gray-700">
					<CostTracker
						totalUsd={state.totalCostUsd}
						byAgent={state.costByAgent}
						isRunning={activeAgents > 0}
					/>
				</div>
			)}
		</div>
	);
}

export default MissionControlPanel;
