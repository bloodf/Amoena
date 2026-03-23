"use client";

import { AgentPanel } from "./AgentPanel";
import type { AgentPanelState } from "../types";

interface AgentPanelGridProps {
	panels: AgentPanelState[];
	highlightedTaskId: string | null;
}

export function AgentPanelGrid({ panels, highlightedTaskId }: AgentPanelGridProps) {
	const count = panels.length;

	// Determine grid class based on panel count
	const gridClass =
		count === 1
			? "grid-cols-1"
			: count === 2
				? "grid-cols-2"
				: count === 3
					? "grid-cols-3"
					: "grid-cols-2";

	if (count === 0) return null;

	return (
		<div className={`grid ${gridClass} gap-3 h-full`}>
			{panels.map((panel) => (
				<AgentPanel
					key={panel.taskId}
					{...panel}
					isHighlighted={highlightedTaskId === panel.taskId}
				/>
			))}
		</div>
	);
}
