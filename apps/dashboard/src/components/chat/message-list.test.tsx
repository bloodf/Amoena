// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("next/image", () => ({
	default: (props: any) => <img {...props} />,
}));

vi.mock("@/lib/chat-utils", () => ({
	detectTextDirection: () => "ltr",
}));

vi.mock("@/store", () => ({
	useAmoena: () => ({
		chatMessages: [],
		activeConversation: null,
		isSendingMessage: false,
		updatePendingMessage: vi.fn(),
		removePendingMessage: vi.fn(),
		addChatMessage: vi.fn(),
	}),
}));

afterEach(() => cleanup());

describe("MessageList", () => {
	it("shows select conversation when no active conversation", async () => {
		const { MessageList } = await import("./message-list");
		render(<MessageList />);
		expect(screen.getByText("Select a conversation")).toBeDefined();
	});
});
