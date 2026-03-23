// Design tokens for Mission Control panel

export const TERMINAL_FONT =
	'"JetBrains Mono", "Fira Code", "Cascadia Code", monospace';

export const AGENT_COLORS = {
	"claude-code": "#FF6B35",
	codex: "#00C853",
	gemini: "#2196F3",
	unknown: "#9E9E9E",
} as const;

export const GRID = 8; // px; use multiples: 8, 16, 24, 32, 40, 48

export const STATUS_COLORS = {
	completed: "text-green-400",
	failed: "text-red-400",
	partial_failure: "text-yellow-400",
	cancelled: "text-gray-400",
	running: "text-blue-400",
	pending: "text-gray-500",
	timed_out: "text-orange-400",
} as const;

export type AgentColorKey = keyof typeof AGENT_COLORS;
export type StatusColorKey = keyof typeof STATUS_COLORS;
