// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ChatInput } from "./chat-input";

vi.mock("next/image", () => ({
	default: (props: any) => <img {...props} />,
}));

const mockSetChatInput = vi.fn();

vi.mock("@/store", () => ({
	useAmoena: () => ({
		chatInput: "",
		setChatInput: mockSetChatInput,
		isSendingMessage: false,
	}),
}));

afterEach(() => {
	cleanup();
	vi.clearAllMocks();
});

describe("ChatInput", () => {
	it("renders textarea", () => {
		render(<ChatInput onSend={() => {}} />);
		const textarea = document.querySelector("textarea");
		expect(textarea).not.toBeNull();
	});

	it("renders attach button", () => {
		render(<ChatInput onSend={() => {}} />);
		const btn = screen.getByTitle("Attach file");
		expect(btn).toBeDefined();
	});

	it("renders send button", () => {
		render(<ChatInput onSend={() => {}} />);
		const btn = screen.getByTitle("Send message");
		expect(btn).toBeDefined();
	});

	it("shows placeholder when not disabled", () => {
		render(<ChatInput onSend={() => {}} />);
		const textarea = document.querySelector("textarea");
		expect(textarea!.getAttribute("placeholder")).toContain("Message");
	});

	it("shows disabled placeholder when disabled", () => {
		render(<ChatInput onSend={() => {}} disabled={true} />);
		const textarea = document.querySelector("textarea");
		expect(textarea!.getAttribute("placeholder")).toContain("Select a conversation");
	});

	it("disables textarea when disabled", () => {
		render(<ChatInput onSend={() => {}} disabled={true} />);
		const textarea = document.querySelector("textarea") as HTMLTextAreaElement;
		expect(textarea.disabled).toBe(true);
	});

	it("shows stop button when isGenerating and onAbort provided", () => {
		render(
			<ChatInput
				onSend={() => {}}
				onAbort={() => {}}
				isGenerating={true}
			/>,
		);
		expect(screen.getByTitle("Stop generation")).toBeDefined();
	});

	it("calls onAbort when stop button clicked", () => {
		const onAbort = vi.fn();
		render(
			<ChatInput
				onSend={() => {}}
				onAbort={onAbort}
				isGenerating={true}
			/>,
		);
		fireEvent.click(screen.getByTitle("Stop generation"));
		expect(onAbort).toHaveBeenCalled();
	});

	it("shows drag overlay on dragover", () => {
		const { container } = render(<ChatInput onSend={() => {}} />);
		const wrapper = container.firstElementChild as HTMLElement;
		fireEvent.dragOver(wrapper);
		expect(screen.getByText("Drop files here")).toBeDefined();
	});
});
