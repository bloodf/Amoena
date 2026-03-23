"use client";

import { useCallback, useEffect, useReducer, useRef } from "react";
import type {
	AgentPanelState,
	GoalOptions,
	MCClientEvent,
	MCServerEvent,
	OutputLine,
	RunReport,
	TaskRunRow,
	ViewState,
} from "../types";

const MAX_OUTPUT_LINES = 5000;
const RECONNECT_DELAY_MS = 2000;

// --- State ---

export interface GoalRunState {
	viewState: ViewState;
	goalId: string | null;
	goalDescription: string;
	goalStatus: string | null;
	tasks: TaskRunRow[];
	panels: AgentPanelState[];
	totalCostUsd: number;
	costByAgent: Record<string, number>;
	report: RunReport | null;
	isSubmitting: boolean;
	error: string | null;
	startedAt: number | null;
}

const initialState: GoalRunState = {
	viewState: "pre-run",
	goalId: null,
	goalDescription: "",
	goalStatus: null,
	tasks: [],
	panels: [],
	totalCostUsd: 0,
	costByAgent: {},
	report: null,
	isSubmitting: false,
	error: null,
	startedAt: null,
};

// --- Actions ---

type Action =
	| { type: "SUBMIT_START"; description: string }
	| { type: "SUBMIT_DONE"; goalId: string }
	| { type: "SUBMIT_ERROR"; error: string }
	| { type: "TASK_DISPATCHED"; taskId: string; adapterId: string; routingReason: string; description: string }
	| { type: "TASK_OUTPUT"; taskId: string; line: OutputLine }
	| { type: "TASK_STATUS"; taskId: string; status: TaskRunRow["status"] }
	| { type: "TASK_COMPLETED"; task: TaskRunRow }
	| { type: "TASK_FAILED"; task: TaskRunRow }
	| { type: "COST_UPDATE"; totalUsd: number; byAgent: Record<string, number> }
	| { type: "GOAL_COMPLETED"; report: RunReport }
	| { type: "GOAL_CANCELLED" }
	| { type: "REHYDRATE"; tasks: TaskRunRow[] }
	| { type: "RESET" };

function appendLine(lines: OutputLine[], line: OutputLine): OutputLine[] {
	const next = [...lines, line];
	return next.length > MAX_OUTPUT_LINES ? next.slice(next.length - MAX_OUTPUT_LINES) : next;
}

function reducer(state: GoalRunState, action: Action): GoalRunState {
	switch (action.type) {
		case "SUBMIT_START":
			return {
				...state,
				isSubmitting: true,
				error: null,
				goalDescription: action.description,
			};

		case "SUBMIT_DONE":
			return {
				...state,
				isSubmitting: false,
				viewState: "during-run",
				goalId: action.goalId,
				startedAt: Date.now(),
				tasks: [],
				panels: [],
				totalCostUsd: 0,
				costByAgent: {},
				report: null,
			};

		case "SUBMIT_ERROR":
			return { ...state, isSubmitting: false, error: action.error };

		case "TASK_DISPATCHED": {
			const panelExists = state.panels.some((p) => p.taskId === action.taskId);
			return {
				...state,
				panels: panelExists
					? state.panels
					: [
							...state.panels,
							{
								adapterId: action.adapterId,
								taskId: action.taskId,
								taskDescription: action.description,
								status: "pending",
								outputLines: [],
							},
						],
			};
		}

		case "TASK_OUTPUT": {
			return {
				...state,
				panels: state.panels.map((p) =>
					p.taskId === action.taskId
						? { ...p, outputLines: appendLine(p.outputLines, action.line) }
						: p,
				),
			};
		}

		case "TASK_STATUS": {
			return {
				...state,
				tasks: state.tasks.map((t) =>
					t.taskId === action.taskId ? { ...t, status: action.status } : t,
				),
				panels: state.panels.map((p) =>
					p.taskId === action.taskId ? { ...p, status: action.status } : p,
				),
			};
		}

		case "TASK_COMPLETED":
		case "TASK_FAILED": {
			const task = action.task;
			const taskExists = state.tasks.some((t) => t.taskId === task.taskId);
			return {
				...state,
				tasks: taskExists
					? state.tasks.map((t) => (t.taskId === task.taskId ? task : t))
					: [...state.tasks, task],
				panels: state.panels.map((p) =>
					p.taskId === task.taskId ? { ...p, status: task.status } : p,
				),
			};
		}

		case "COST_UPDATE":
			return {
				...state,
				totalCostUsd: action.totalUsd,
				costByAgent: action.byAgent,
			};

		case "GOAL_COMPLETED":
			return {
				...state,
				viewState: "post-run",
				report: action.report,
				goalStatus: action.report.status,
			};

		case "GOAL_CANCELLED":
			return {
				...state,
				viewState: "post-run",
				goalStatus: "cancelled",
			};

		case "REHYDRATE":
			return {
				...state,
				tasks: action.tasks,
				panels: action.tasks.map((t) => ({
					adapterId: t.adapterId,
					taskId: t.taskId,
					taskDescription: t.description,
					status: t.status,
					outputLines: [],
				})),
			};

		case "RESET":
			return { ...initialState };

		default:
			return state;
	}
}

// --- Hook ---

export function useGoalRun() {
	const [state, dispatch] = useReducer(reducer, initialState);
	const wsRef = useRef<WebSocket | null>(null);
	const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
	const mountedRef = useRef(true);

	const connectWs = useCallback(() => {
		if (!mountedRef.current) return;
		if (wsRef.current?.readyState === WebSocket.OPEN) return;

		const protocol = typeof window !== "undefined" && window.location.protocol === "https:" ? "wss:" : "ws:";
		const host = typeof window !== "undefined" ? window.location.host : "localhost";
		const ws = new WebSocket(`${protocol}//${host}/api/ws/mission-control`);
		wsRef.current = ws;

		ws.onopen = () => {
			if (!mountedRef.current) return;
			// Subscribe to mission_control channel
			ws.send(JSON.stringify({ type: "subscribe", channel: "mission_control" }));
		};

		ws.onmessage = (event: MessageEvent) => {
			if (!mountedRef.current) return;
			try {
				const msg = JSON.parse(event.data as string) as MCServerEvent & { goalId?: string };
				handleServerEvent(msg);
			} catch {
				// ignore malformed frames
			}
		};

		ws.onclose = () => {
			if (!mountedRef.current) return;
			// Reconnect after delay
			reconnectTimerRef.current = setTimeout(() => {
				if (mountedRef.current) connectWs();
			}, RECONNECT_DELAY_MS);
		};

		ws.onerror = () => {
			ws.close();
		};
	}, []); // eslint-disable-line react-hooks/exhaustive-deps

	function handleServerEvent(event: MCServerEvent) {
		switch (event.type) {
			case "task:dispatched":
				dispatch({
					type: "TASK_DISPATCHED",
					taskId: event.taskId,
					adapterId: event.adapterId,
					routingReason: event.routingReason,
					description: event.routingReason,
				});
				break;
			case "task:output":
				dispatch({
					type: "TASK_OUTPUT",
					taskId: event.taskId,
					line: { text: event.text, timestamp: event.timestamp, type: "stdout" },
				});
				break;
			case "task:status":
				dispatch({ type: "TASK_STATUS", taskId: event.taskId, status: event.status });
				break;
			case "task:completed":
				dispatch({ type: "TASK_COMPLETED", task: event.task });
				break;
			case "task:failed":
				dispatch({ type: "TASK_FAILED", task: event.task });
				break;
			case "cost:update":
				dispatch({ type: "COST_UPDATE", totalUsd: event.totalUsd, byAgent: event.byAgent });
				break;
			case "goal:completed":
				dispatch({ type: "GOAL_COMPLETED", report: event.report });
				break;
			case "goal:cancelled":
				dispatch({ type: "GOAL_CANCELLED" });
				break;
		}
	}

	// Rehydrate from API on reconnect when goal is active
	const rehydrate = useCallback(async (goalId: string) => {
		try {
			const res = await fetch(`/api/mission-control/goal/${goalId}`);
			if (!res.ok) return;
			const data = await res.json();
			if (data.tasks) {
				dispatch({ type: "REHYDRATE", tasks: data.tasks });
			}
		} catch {
			// best-effort
		}
	}, []);

	useEffect(() => {
		mountedRef.current = true;
		connectWs();
		return () => {
			mountedRef.current = false;
			if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
			wsRef.current?.close();
		};
	}, [connectWs]);

	// Rehydrate when WS reconnects and goal is active
	useEffect(() => {
		if (state.goalId && state.viewState === "during-run") {
			rehydrate(state.goalId);
		}
	}, [state.goalId, state.viewState, rehydrate]);

	const submitGoal = useCallback(
		(description: string, options: GoalOptions) => {
			dispatch({ type: "SUBMIT_START", description });
			const event: MCClientEvent = { type: "goal:submit", description, options };
			if (wsRef.current?.readyState === WebSocket.OPEN) {
				wsRef.current.send(JSON.stringify(event));
				// Simulate SUBMIT_DONE with a generated goalId (server will confirm via goal:status)
				dispatch({ type: "SUBMIT_DONE", goalId: `goal-${Date.now()}` });
			} else {
				dispatch({ type: "SUBMIT_ERROR", error: "Not connected" });
			}
		},
		[],
	);

	const cancelGoal = useCallback(() => {
		if (!state.goalId) return;
		const event: MCClientEvent = { type: "goal:cancel", goalId: state.goalId };
		wsRef.current?.send(JSON.stringify(event));
	}, [state.goalId]);

	const resetToPreRun = useCallback(() => {
		dispatch({ type: "RESET" });
	}, []);

	return {
		state,
		submitGoal,
		cancelGoal,
		resetToPreRun,
	};
}
