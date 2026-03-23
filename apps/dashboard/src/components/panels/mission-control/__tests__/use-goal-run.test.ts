// @vitest-environment jsdom
import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useGoalRun } from "../hooks/use-goal-run";
import type { MCServerEvent, RunReport } from "../types";

// --- WebSocket mock ---

type WsListener = (event: MessageEvent) => void;

class MockWebSocket {
	static instance: MockWebSocket | null = null;
	static OPEN = 1;
	readyState = MockWebSocket.OPEN;
	onopen: (() => void) | null = null;
	onmessage: WsListener | null = null;
	onclose: (() => void) | null = null;
	onerror: (() => void) | null = null;
	sent: string[] = [];

	constructor() {
		MockWebSocket.instance = this;
	}

	send(data: string) {
		this.sent.push(data);
	}

	close() {
		this.readyState = 3; // CLOSED
		this.onclose?.();
	}

	// Helper: simulate incoming server event
	receive(event: MCServerEvent) {
		this.onmessage?.({ data: JSON.stringify(event) } as MessageEvent);
	}
}

function simulateOpen() {
	MockWebSocket.instance?.onopen?.();
}

function simulateEvent(event: MCServerEvent) {
	MockWebSocket.instance?.receive(event);
}

beforeEach(() => {
	vi.stubGlobal("WebSocket", MockWebSocket);
	// Mock fetch for rehydration
	vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false }));
	MockWebSocket.instance = null;
});

afterEach(() => {
	vi.unstubAllGlobals();
});

describe("useGoalRun", () => {
	it("subscribes to mission_control WebSocket channel on mount", async () => {
		const { result } = renderHook(() => useGoalRun());
		// Let React effects run
		await act(async () => {
			simulateOpen();
		});
		expect(MockWebSocket.instance).toBeTruthy();
		const subscribeMsg = MockWebSocket.instance?.sent.find((s) =>
			s.includes("mission_control"),
		);
		expect(subscribeMsg).toBeTruthy();
	});

	it("task:output event appends to correct panel's output", async () => {
		const { result } = renderHook(() => useGoalRun());

		await act(async () => {
			simulateOpen();
			// First dispatch a task
			simulateEvent({
				type: "task:dispatched",
				taskId: "t1",
				adapterId: "claude-code",
				routingReason: "best fit",
			});
			simulateEvent({
				type: "task:output",
				taskId: "t1",
				adapterId: "claude-code",
				text: "hello world",
				timestamp: Date.now(),
			});
		});

		const panel = result.current.state.panels.find((p) => p.taskId === "t1");
		expect(panel).toBeTruthy();
		expect(panel?.outputLines.some((l) => l.text === "hello world")).toBe(true);
	});

	it("goal:completed event transitions to post-run state", async () => {
		const { result } = renderHook(() => useGoalRun());
		const report: RunReport = {
			goalId: "g1",
			description: "test goal",
			status: "completed",
			startedAt: Date.now(),
			tasks: [],
			agents: [],
			routing: [],
		};

		await act(async () => {
			simulateOpen();
			simulateEvent({ type: "goal:completed", report });
		});

		expect(result.current.state.viewState).toBe("post-run");
		expect(result.current.state.report).toEqual(report);
	});

	it("goal:cancelled event transitions to post-run state", async () => {
		const { result } = renderHook(() => useGoalRun());

		await act(async () => {
			simulateOpen();
			simulateEvent({ type: "goal:cancelled", goalId: "g1" });
		});

		expect(result.current.state.viewState).toBe("post-run");
		expect(result.current.state.goalStatus).toBe("cancelled");
	});
});
