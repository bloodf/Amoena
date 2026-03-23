"use client";

import { useState } from "react";
import type { AgentTrendPoint } from "../../../../lib/leaderboard-queries";

interface AgentTrendChartProps {
	trend: AgentTrendPoint[];
	color: string;
	width?: number;
	height?: number;
}

export function AgentTrendChart({
	trend,
	color,
	width = 200,
	height = 60,
}: AgentTrendChartProps) {
	const [tooltip, setTooltip] = useState<{
		x: number;
		y: number;
		point: AgentTrendPoint;
	} | null>(null);

	if (trend.length === 0) {
		return (
			<div
				style={{ width, height }}
				className="flex items-center justify-center text-xs text-gray-500"
			>
				No data
			</div>
		);
	}

	const padding = 8;
	const innerW = width - padding * 2;
	const innerH = height - padding * 2;

	const minRate = 0;
	const maxRate = 1;
	const xStep = trend.length > 1 ? innerW / (trend.length - 1) : innerW;

	const toX = (i: number) => padding + i * xStep;
	const toY = (rate: number) =>
		padding + innerH - ((rate - minRate) / (maxRate - minRate)) * innerH;

	const points = trend.map((p, i) => ({ x: toX(i), y: toY(p.successRate) }));

	const pathD =
		points.length === 1
			? `M ${points[0].x} ${points[0].y}`
			: points
					.map((pt, i) => (i === 0 ? `M ${pt.x} ${pt.y}` : `L ${pt.x} ${pt.y}`))
					.join(" ");

	return (
		<div className="relative" style={{ width, height }}>
			<svg
				width={width}
				height={height}
				role="img"
				aria-label="Agent performance trend chart"
			>
				<path
					d={pathD}
					stroke={color}
					strokeWidth="2"
					fill="none"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
				{points.map((pt, i) => (
					<circle
						key={trend[i].date}
						cx={pt.x}
						cy={pt.y}
						r="3"
						fill={color}
						className="cursor-pointer"
						onMouseEnter={() =>
							setTooltip({ x: pt.x, y: pt.y, point: trend[i] })
						}
						onMouseLeave={() => setTooltip(null)}
					/>
				))}
			</svg>
			{tooltip && (
				<div
					className="pointer-events-none absolute z-10 rounded bg-gray-800 px-2 py-1 text-xs text-white shadow-lg"
					style={{
						left: Math.min(tooltip.x, width - 100),
						top: Math.max(0, tooltip.y - 40),
					}}
				>
					<div>{tooltip.point.date}</div>
					<div>
						Success: {Math.round(tooltip.point.successRate * 100)}%
					</div>
					<div>Tasks: {tooltip.point.tasksCompleted}</div>
				</div>
			)}
		</div>
	);
}
