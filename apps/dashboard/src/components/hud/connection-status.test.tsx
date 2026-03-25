// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ConnectionStatus } from "./connection-status";

vi.mock("@/store", () => ({
	useAmoena: () => ({
		connection: {
			url: "ws://localhost:3001",
			reconnectAttempts: 0,
			latency: null,
			lastConnected: null,
		},
	}),
}));

afterEach(() => cleanup());

describe("ConnectionStatus", () => {
	it("shows Connected when isConnected is true", () => {
		render(
			<ConnectionStatus
				isConnected={true}
				onConnect={() => {}}
				onDisconnect={() => {}}
			/>,
		);
		expect(screen.getByText("Connected")).toBeDefined();
	});

	it("shows Disconnected when not connected", () => {
		render(
			<ConnectionStatus
				isConnected={false}
				onConnect={() => {}}
				onDisconnect={() => {}}
			/>,
		);
		expect(screen.getByText("Disconnected")).toBeDefined();
	});

	it("shows Disconnect button when connected", () => {
		render(
			<ConnectionStatus
				isConnected={true}
				onConnect={() => {}}
				onDisconnect={() => {}}
			/>,
		);
		expect(screen.getByText("Disconnect")).toBeDefined();
	});

	it("shows Connect button when disconnected", () => {
		render(
			<ConnectionStatus
				isConnected={false}
				onConnect={() => {}}
				onDisconnect={() => {}}
			/>,
		);
		expect(screen.getByText("Connect")).toBeDefined();
	});

	it("calls onDisconnect when Disconnect clicked", () => {
		const onDisconnect = vi.fn();
		render(
			<ConnectionStatus
				isConnected={true}
				onConnect={() => {}}
				onDisconnect={onDisconnect}
			/>,
		);
		fireEvent.click(screen.getByText("Disconnect"));
		expect(onDisconnect).toHaveBeenCalled();
	});

	it("calls onConnect when Connect clicked", () => {
		const onConnect = vi.fn();
		render(
			<ConnectionStatus
				isConnected={false}
				onConnect={onConnect}
				onDisconnect={() => {}}
			/>,
		);
		fireEvent.click(screen.getByText("Connect"));
		expect(onConnect).toHaveBeenCalled();
	});

	it("shows Reconnect button when provided and disconnected", () => {
		const onReconnect = vi.fn();
		render(
			<ConnectionStatus
				isConnected={false}
				onConnect={() => {}}
				onDisconnect={() => {}}
				onReconnect={onReconnect}
			/>,
		);
		expect(screen.getByText("Reconnect")).toBeDefined();
	});

	it("displays WebSocket URL", () => {
		render(
			<ConnectionStatus
				isConnected={false}
				onConnect={() => {}}
				onDisconnect={() => {}}
			/>,
		);
		expect(screen.getByText("ws://localhost:3001")).toBeDefined();
	});
});
