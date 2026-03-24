"use client";

import { useTranslations } from "next-intl";
import { AGENT_COLORS, STATUS_COLORS } from "../tokens";
import type { TaskRunRow } from "../types";

interface TaskGraphProps {
	tasks: TaskRunRow[];
	onTaskClick: (taskId: string) => void;
}

const NODE_W = 110;
const NODE_H = 40;
const H_GAP = 48;
const V_GAP = 16;
const PADDING = 16;

type Layer = TaskRunRow[][];

function buildLayers(tasks: TaskRunRow[]): Layer {
	if (tasks.length === 0) return [];

	const byId = new Map(tasks.map((t) => [t.taskId, t]));
	const layerMap = new Map<string, number>();

	function getLayer(taskId: string, visiting: Set<string> = new Set()): number {
		if (layerMap.has(taskId)) return layerMap.get(taskId)!;
		if (visiting.has(taskId)) return 0; // cycle detected — treat as root
		const task = byId.get(taskId);
		if (!task || !task.dependsOn || task.dependsOn.length === 0) {
			layerMap.set(taskId, 0);
			return 0;
		}
		visiting.add(taskId);
		const maxParentLayer = Math.max(...task.dependsOn.map((id) => getLayer(id, visiting)));
		visiting.delete(taskId);
		const layer = maxParentLayer + 1;
		layerMap.set(taskId, layer);
		return layer;
	}

	for (const task of tasks) getLayer(task.taskId);

	const maxLayer = Math.max(...Array.from(layerMap.values()));
	const layers: Layer = Array.from({ length: maxLayer + 1 }, () => []);
	for (const task of tasks) {
		layers[layerMap.get(task.taskId) ?? 0].push(task);
	}
	return layers;
}

function shortId(taskId: string): string {
	return taskId.length > 8 ? taskId.slice(0, 8) : taskId;
}

function getStatusFill(status: TaskRunRow["status"]): string {
	switch (status) {
		case "completed": return "#166534";
		case "failed": return "#7f1d1d";
		case "running": return "#1e3a5f";
		case "pending": return "#374151";
		case "partial_failure": return "#713f12";
		case "cancelled": return "#374151";
		case "timed_out": return "#7c2d12";
		default: return "#374151";
	}
}

function getStatusBorder(status: TaskRunRow["status"]): string {
	const cls = STATUS_COLORS[status] ?? "text-gray-500";
	// Map tailwind class to hex
	if (cls.includes("green")) return "#4ade80";
	if (cls.includes("red")) return "#f87171";
	if (cls.includes("yellow")) return "#facc15";
	if (cls.includes("blue")) return "#60a5fa";
	if (cls.includes("orange")) return "#fb923c";
	return "#6b7280";
}

export function TaskGraph({ tasks, onTaskClick }: TaskGraphProps) {
	const t = useTranslations("missionControl");

	if (tasks.length === 0) {
		return (
			<div className="flex flex-col gap-2 p-4" aria-label={t("taskGraphLabel")}>
				{/* Loading skeleton */}
				{[1, 2, 3].map((i) => (
					<div
						key={i}
						className="h-10 bg-gray-700/50 rounded animate-pulse"
						style={{ width: `${60 + i * 15}%` }}
					/>
				))}
				<p className="text-xs text-gray-500 mt-2">{t("noTasksYet")}</p>
			</div>
		);
	}

	const layers = buildLayers(tasks);
	const maxColCount = Math.max(...layers.map((l) => l.length), 1);
	const svgWidth = layers.length * (NODE_W + H_GAP) + PADDING * 2;
	const svgHeight = maxColCount * (NODE_H + V_GAP) + PADDING * 2;

	// Build position map
	const positions = new Map<string, { x: number; y: number }>();
	layers.forEach((col, colIdx) => {
		const colH = col.length * (NODE_H + V_GAP) - V_GAP;
		const startY = (svgHeight - colH) / 2;
		col.forEach((task, rowIdx) => {
			positions.set(task.taskId, {
				x: PADDING + colIdx * (NODE_W + H_GAP),
				y: startY + rowIdx * (NODE_H + V_GAP),
			});
		});
	});

	// Build edges
	const edges: { x1: number; y1: number; x2: number; y2: number; taskId: string }[] = [];
	for (const task of tasks) {
		if (!task.dependsOn) continue;
		const toPos = positions.get(task.taskId);
		if (!toPos) continue;
		for (const depId of task.dependsOn) {
			const fromPos = positions.get(depId);
			if (!fromPos) continue;
			edges.push({
				x1: fromPos.x + NODE_W,
				y1: fromPos.y + NODE_H / 2,
				x2: toPos.x,
				y2: toPos.y + NODE_H / 2,
				taskId: task.taskId,
			});
		}
	}

	return (
		<div
			className="overflow-auto"
			aria-label={t("taskGraphLabel")}
		>
			<svg
				width={svgWidth}
				height={svgHeight}
				style={{ minWidth: svgWidth, minHeight: svgHeight }}
			>
				<defs>
					<marker
						id="arrowhead"
						markerWidth="8"
						markerHeight="6"
						refX="8"
						refY="3"
						orient="auto"
					>
						<polygon points="0 0, 8 3, 0 6" fill="#4b5563" />
					</marker>
				</defs>

				{/* Edges */}
				{edges.map((e, i) => (
					<line
						key={i}
						x1={e.x1}
						y1={e.y1}
						x2={e.x2}
						y2={e.y2}
						stroke="#4b5563"
						strokeWidth={1.5}
						markerEnd="url(#arrowhead)"
					/>
				))}

				{/* Nodes */}
				{tasks.map((task) => {
					const pos = positions.get(task.taskId);
					if (!pos) return null;
					const agentColor =
						AGENT_COLORS[task.adapterId as keyof typeof AGENT_COLORS] ??
						AGENT_COLORS.unknown;
					const fill = getStatusFill(task.status);
					const border = getStatusBorder(task.status);
					const label = `${shortId(task.taskId)} ${task.taskType ?? ""}`.trim();

					return (
						<g
							key={task.taskId}
							transform={`translate(${pos.x},${pos.y})`}
							role="button"
							tabIndex={0}
							aria-label={`${t("taskNodeAriaLabel")}: ${task.description}, ${t("statusLabel")}: ${task.status}`}
							onClick={() => onTaskClick(task.taskId)}
							onKeyDown={(e) => {
								if (e.key === "Enter" || e.key === " ") onTaskClick(task.taskId);
							}}
							style={{ cursor: "pointer" }}
						>
							<rect
								width={NODE_W}
								height={NODE_H}
								rx={4}
								fill={fill}
								stroke={border}
								strokeWidth={1.5}
							/>
							{/* Agent color accent on left edge */}
							<rect
								width={4}
								height={NODE_H}
								rx={2}
								fill={agentColor}
							/>
							<text
								x={10}
								y={NODE_H / 2 + 4}
								fill="#e5e7eb"
								fontSize={10}
								fontFamily="monospace"
							>
								{label.length > 14 ? label.slice(0, 13) + "…" : label}
							</text>
						</g>
					);
				})}
			</svg>
		</div>
	);
}
