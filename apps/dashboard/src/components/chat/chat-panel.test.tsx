// @vitest-environment jsdom
import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("next-intl", () => ({
	useTranslations: () => (key: string) => key,
}));

vi.mock("next/image", () => ({
	default: (props: any) => <img {...props} />,
}));

vi.mock("@/store", () => ({
	useAmoena: () => ({
		activeConversation: null,
		chatMessages: [],
		conversations: [],
		chatInput: "",
		setChatInput: vi.fn(),
		isSendingMessage: false,
		connection: { isConnected: false, url: "", reconnectAttempts: 0 },
	}),
}));

vi.mock("@/lib/client-logger", () => ({
	createClientLogger: () => ({
		error: vi.fn(),
		info: vi.fn(),
		warn: vi.fn(),
		debug: vi.fn(),
	}),
}));

vi.mock("@/lib/websocket", () => ({
	useWebSocket: () => ({
		sendMessage: vi.fn(),
		isConnected: false,
	}),
}));

vi.mock("@/lib/use-smart-poll", () => ({
	useSmartPoll: vi.fn(),
}));

afterEach(() => cleanup());

describe("ChatPanel", () => {
	it("module exists and is importable", async () => {
		const mod = await import("./chat-panel");
		expect(mod).toBeDefined();
	});
});
