"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { AGENT_COLORS, TERMINAL_FONT } from "../tokens";
import type { OutputLine, TaskStatus } from "../types";

export interface AgentPanelProps {
	adapterId: string;
	taskId: string;
	taskDescription: string;
	status: TaskStatus;
	outputLines: OutputLine[];
	isHighlighted: boolean;
}

const STATUS_BADGES: Record<TaskStatus, string> = {
	pending: "bg-gray-600 text-gray-300",
	running: "bg-blue-900 text-blue-300",
	completed: "bg-green-900 text-green-300",
	failed: "bg-red-900 text-red-300",
	partial_failure: "bg-yellow-900 text-yellow-300",
	cancelled: "bg-gray-700 text-gray-400",
	timed_out: "bg-orange-900 text-orange-300",
};

export function AgentPanel({
	adapterId,
	taskDescription,
	status,
	outputLines,
	isHighlighted,
}: AgentPanelProps) {
	const t = useTranslations("missionControl");
	const scrollRef = useRef<HTMLDivElement>(null);
	const [autoScroll, setAutoScroll] = useState(true);

	const agentColor =
		AGENT_COLORS[adapterId as keyof typeof AGENT_COLORS] ?? AGENT_COLORS.unknown;
	const badgeCls = STATUS_BADGES[status] ?? STATUS_BADGES.pending;
	const truncatedDesc =
		taskDescription.length > 60
			? taskDescription.slice(0, 57) + "…"
			: taskDescription;

	// Auto-scroll to bottom when new lines arrive
	useEffect(() => {
		if (!autoScroll || !scrollRef.current) return;
		scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
	}, [outputLines, autoScroll]);

	// Detect manual scroll up → pause auto-scroll
	function handleScroll() {
		const el = scrollRef.current;
		if (!el) return;
		const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 8;
		setAutoScroll(atBottom);
	}

	return (
		<div
			className={`flex flex-col h-full bg-gray-900 rounded-lg border transition-colors ${
				isHighlighted ? "border-blue-500" : "border-gray-700"
			}`}
		>
			{/* Header */}
			<div
				className="flex items-center gap-2 px-3 py-2 border-b border-gray-700"
				style={{ borderLeftWidth: 3, borderLeftColor: agentColor }}
			>
				{/* Agent color dot */}
				<span
					className="inline-block w-2.5 h-2.5 rounded-full flex-shrink-0"
					style={{ backgroundColor: agentColor }}
					aria-hidden="true"
				/>
				<span className="text-sm font-medium text-gray-200 flex-shrink-0">
					{adapterId}
				</span>
				{/* Status badge */}
				<span
					className={`text-xs px-1.5 py-0.5 rounded ${badgeCls} flex-shrink-0`}
				>
					{status}
				</span>
				{/* Task description */}
				<span
					className="text-xs text-gray-400 truncate"
					title={taskDescription}
				>
					{truncatedDesc}
				</span>
			</div>

			{/* Output area */}
			<div
				ref={scrollRef}
				onScroll={handleScroll}
				className="flex-1 overflow-y-auto p-3 text-xs"
				style={{ fontFamily: TERMINAL_FONT }}
				role="log"
				aria-live="polite"
				aria-label={`${adapterId} ${t("agentOutputLabel")}`}
			>
				{outputLines.length === 0 ? (
					<p className="text-gray-500 italic">{t("waitingForOutput")}</p>
				) : (
					outputLines.map((line, i) => (
						<div
							key={i}
							className={
								line.type === "stderr" ? "text-red-400" : "text-gray-300"
							}
						>
							{line.text}
						</div>
					))
				)}
			</div>

			{/* Auto-scroll paused indicator */}
			{!autoScroll && (
				<div className="px-3 py-1 text-xs text-gray-500 border-t border-gray-700 flex justify-between items-center">
					<span>{t("scrollPaused")}</span>
					<button
						type="button"
						onClick={() => {
							setAutoScroll(true);
							if (scrollRef.current) {
								scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
							}
						}}
						className="text-blue-400 hover:text-blue-300 underline min-h-[44px] min-w-[44px]"
					>
						{t("resumeScroll")}
					</button>
				</div>
			)}
		</div>
	);
}
