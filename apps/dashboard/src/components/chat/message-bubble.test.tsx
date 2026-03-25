// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MessageBubble } from "./message-bubble";

vi.mock("next/image", () => ({
	default: (props: any) => <img {...props} />,
}));

vi.mock("@/lib/chat-utils", () => ({
	detectTextDirection: () => "ltr",
}));

afterEach(() => cleanup());

const baseMessage = {
	id: 1,
	conversation_id: "conv-1",
	from_agent: "coordinator",
	to_agent: null as string | null,
	content: "Hello there",
	message_type: "text" as const,
	created_at: Math.floor(Date.now() / 1000),
};

describe("MessageBubble", () => {
	it("renders text message content", () => {
		render(
			<MessageBubble message={baseMessage} isHuman={false} isGrouped={false} />,
		);
		expect(screen.getByText("Hello there")).toBeDefined();
	});

	it("renders system message centered", () => {
		const msg = { ...baseMessage, message_type: "system" as const, content: "System notice" };
		const { container } = render(
			<MessageBubble message={msg} isHuman={false} isGrouped={false} />,
		);
		expect(screen.getByText("System notice")).toBeDefined();
		expect(container.querySelector(".justify-center")).not.toBeNull();
	});

	it("renders handoff message with arrow", () => {
		const msg = {
			...baseMessage,
			message_type: "handoff" as const,
			from_agent: "coordinator",
			to_agent: "research",
			content: "",
		};
		render(
			<MessageBubble message={msg} isHuman={false} isGrouped={false} />,
		);
		expect(screen.getByText(/coordinator/)).toBeDefined();
		expect(screen.getByText(/research/)).toBeDefined();
	});

	it("renders command messages in mono font", () => {
		const msg = { ...baseMessage, message_type: "command" as const, content: "npm install" };
		const { container } = render(
			<MessageBubble message={msg} isHuman={false} isGrouped={false} />,
		);
		const pre = container.querySelector("pre");
		expect(pre).not.toBeNull();
		expect(pre!.textContent).toBe("npm install");
	});

	it("renders tool_call with expandable details", () => {
		const msg = {
			...baseMessage,
			message_type: "tool_call" as const,
			metadata: { toolName: "Read", toolArgs: "file.ts", toolStatus: "success", durationMs: 42 },
		};
		render(
			<MessageBubble message={msg} isHuman={false} isGrouped={false} />,
		);
		expect(screen.getByText("Read")).toBeDefined();
		expect(screen.getByText("42ms")).toBeDefined();
	});

	it("shows avatar when not grouped", () => {
		const { container } = render(
			<MessageBubble message={baseMessage} isHuman={false} isGrouped={false} />,
		);
		const avatar = container.querySelector(".rounded-full");
		expect(avatar).not.toBeNull();
		expect(avatar!.textContent).toBe("C");
	});

	it("hides avatar when grouped", () => {
		const { container } = render(
			<MessageBubble message={baseMessage} isHuman={false} isGrouped={true} />,
		);
		// Should have a spacer div but no text-content avatar
		const avatars = container.querySelectorAll(".rounded-full");
		expect(avatars.length).toBe(0);
	});

	it("renders bold markdown in text", () => {
		const msg = { ...baseMessage, content: "**bold text**" };
		const { container } = render(
			<MessageBubble message={msg} isHuman={false} isGrouped={false} />,
		);
		const strong = container.querySelector("strong");
		expect(strong).not.toBeNull();
		expect(strong!.textContent).toBe("bold text");
	});
});
