// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("next/image", () => ({
	default: (props: any) => <img {...props} />,
}));

vi.mock("@/lib/client-logger", () => ({
	createClientLogger: () => ({
		error: vi.fn(),
		info: vi.fn(),
		warn: vi.fn(),
		debug: vi.fn(),
	}),
}));

vi.mock("@/lib/use-smart-poll", () => ({
	useSmartPoll: vi.fn(),
}));

const mockSetActiveConversation = vi.fn();
const mockMarkConversationRead = vi.fn();

vi.mock("@/store", () => ({
	useAmoena: () => ({
		conversations: [
			{
				id: "session:gateway:abc",
				name: "Test Session",
				kind: "gateway",
				source: "session",
				session: {
					sessionKind: "gateway",
					active: true,
					prefKey: "gateway:abc",
				},
				participants: [],
				lastMessage: {
					id: 1,
					conversation_id: "session:gateway:abc",
					from_agent: "system",
					to_agent: null,
					content: "Connected",
					message_type: "system",
					created_at: Math.floor(Date.now() / 1000),
				},
				unreadCount: 2,
				updatedAt: Math.floor(Date.now() / 1000),
			},
		],
		setConversations: vi.fn(),
		activeConversation: null,
		setActiveConversation: mockSetActiveConversation,
		markConversationRead: mockMarkConversationRead,
	}),
}));

afterEach(() => {
	cleanup();
	vi.clearAllMocks();
});

// Mock fetch globally
globalThis.fetch = vi.fn().mockResolvedValue({
	ok: true,
	json: () => Promise.resolve({ sessions: [] }),
});

describe("ConversationList", () => {
	it("renders session header", async () => {
		const { ConversationList } = await import("./conversation-list");
		render(<ConversationList onNewConversation={() => {}} />);
		expect(screen.getByText("Sessions")).toBeDefined();
	});

	it("renders search input", async () => {
		const { ConversationList } = await import("./conversation-list");
		render(<ConversationList onNewConversation={() => {}} />);
		expect(screen.getByPlaceholderText("Search...")).toBeDefined();
	});

	it("renders conversation items", async () => {
		const { ConversationList } = await import("./conversation-list");
		render(<ConversationList onNewConversation={() => {}} />);
		expect(screen.getByText("Test Session")).toBeDefined();
	});

	it("shows unread badge", async () => {
		const { ConversationList } = await import("./conversation-list");
		render(<ConversationList onNewConversation={() => {}} />);
		expect(screen.getByText("2")).toBeDefined();
	});

	it("filters conversations on search", async () => {
		const { ConversationList } = await import("./conversation-list");
		render(<ConversationList onNewConversation={() => {}} />);
		const searchInput = screen.getByPlaceholderText("Search...");
		fireEvent.change(searchInput, { target: { value: "nonexistent" } });
		expect(screen.getByText("No conversations yet")).toBeDefined();
	});
});
