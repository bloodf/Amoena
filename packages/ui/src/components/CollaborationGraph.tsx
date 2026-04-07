import { cn } from '../lib/utils.ts';
import { type AgentStatus, AgentStatusDot } from "./AgentStatusDot";

export interface CollaborationAgent {
	id: string;
	name: string;
	/** Mapped to AgentStatusDot status; falls back to "idle" for unknown values. */
	status: string;
}

export interface CollaborationConnection {
	from: string;
	to: string;
	/** Connection type label (e.g. "delegates", "reviews", "notifies"). */
	type: string;
}

export interface CollaborationGraphProps {
	agents: CollaborationAgent[];
	connections: CollaborationConnection[];
}

const VALID_STATUSES: AgentStatus[] = ["active", "paused", "failed", "idle"];

function toAgentStatus(status: string): AgentStatus {
	return VALID_STATUSES.includes(status as AgentStatus)
		? (status as AgentStatus)
		: "idle";
}

/** Lay agents out in a circle and return (cx, cy) per id. */
function circleLayout(
	agents: CollaborationAgent[],
	cx: number,
	cy: number,
	r: number,
): Map<string, { x: number; y: number }> {
	const map = new Map<string, { x: number; y: number }>();
	agents.forEach((agent, i) => {
		const angle = (Math.PI * 2 * i) / agents.length - Math.PI / 2;
		map.set(agent.id, {
			x: cx + r * Math.cos(angle),
			y: cy + r * Math.sin(angle),
		});
	});
	return map;
}

const NODE_R = 20;
const SVG_SIZE = 360;
const LAYOUT_RADIUS = 120;

/**
 * SVG-based inter-agent communication graph.
 * Agents are placed in a circle; directed edges indicate communication flow.
 * A future phase will replace this with a full @xyflow/react integration.
 */
export function CollaborationGraph({
	agents,
	connections,
}: CollaborationGraphProps) {
	const cx = SVG_SIZE / 2;
	const cy = SVG_SIZE / 2;
	const positions = circleLayout(agents, cx, cy, LAYOUT_RADIUS);

	if (agents.length === 0) {
		return (
			<div className="flex items-center justify-center h-full text-[12px] text-muted-foreground">
				No agents connected
			</div>
		);
	}

	return (
		<div className="relative w-full">
			<svg
				width="100%"
				viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}
				aria-label="Agent collaboration graph"
				className="select-none"
			>
				<defs>
					<marker
						id="arrow"
						markerWidth="6"
						markerHeight="6"
						refX="5"
						refY="3"
						orient="auto"
					>
						<path d="M0,0 L0,6 L6,3 z" fill="rgba(255,255,255,0.2)" />
					</marker>
				</defs>

				{/* Edges */}
				{connections.map((conn, _i) => {
					const from = positions.get(conn.from);
					const to = positions.get(conn.to);
					if (!from || !to) return null;

					// Shorten line so it doesn't overlap node circles
					const dx = to.x - from.x;
					const dy = to.y - from.y;
					const len = Math.sqrt(dx * dx + dy * dy) || 1;
					const x1 = from.x + (dx / len) * (NODE_R + 2);
					const y1 = from.y + (dy / len) * (NODE_R + 2);
					const x2 = to.x - (dx / len) * (NODE_R + 8);
					const y2 = to.y - (dy / len) * (NODE_R + 8);

					return (
						<line
							key={`${conn.from}-${conn.to}`}
							x1={x1}
							y1={y1}
							x2={x2}
							y2={y2}
							stroke="rgba(255,255,255,0.15)"
							strokeWidth={1.5}
							markerEnd="url(#arrow)"
						/>
					);
				})}

				{/* Nodes */}
				{agents.map((agent) => {
					const pos = positions.get(agent.id);
					if (!pos) return null;
					return (
						<g key={agent.id}>
							<circle
								cx={pos.x}
								cy={pos.y}
								r={NODE_R}
								fill="rgba(99,102,241,0.15)"
								stroke="#6366f1"
								strokeWidth={1}
							/>
							<text
								x={pos.x}
								y={pos.y + NODE_R + 12}
								textAnchor="middle"
								fontSize={10}
								fill="#a1a1aa"
							>
								{agent.name}
							</text>
							{/* Status dot — rendered as a foreignObject so we can reuse the React component */}
							<foreignObject x={pos.x - 5} y={pos.y - 5} width={10} height={10}>
								<AgentStatusDot
									status={toAgentStatus(agent.status)}
									size="sm"
								/>
							</foreignObject>
						</g>
					);
				})}
			</svg>

			{/* Connection type legend */}
			{connections.length > 0 && (
				<div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 px-1">
					{Array.from(new Set(connections.map((c) => c.type))).map((type) => (
						<span
							key={type}
							className={cn(
								"text-[10px] text-muted-foreground flex items-center gap-1",
							)}
						>
							<span className="inline-block h-px w-3 bg-white/20" />
							{type}
						</span>
					))}
				</div>
			)}
		</div>
	);
}
