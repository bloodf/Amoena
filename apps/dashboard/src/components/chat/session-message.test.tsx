// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import {
	SessionMessage,
	shouldShowTimestamp,
	type SessionTranscriptMessage,
} from "./session-message";

afterEach(() => cleanup());

const makeMessage = (
	overrides: Partial<SessionTranscriptMessage> = {},
): SessionTranscriptMessage => ({
	role: "assistant",
	parts: [{ type: "text", text: "Hello world" }],
	timestamp: "2025-06-15T10:00:00Z",
	...overrides,
});

describe("SessionMessage", () => {
	it("renders text content", () => {
		render(<SessionMessage message={makeMessage()} showTimestamp={true} />);
		expect(screen.getByText("Hello world")).toBeDefined();
	});

	it("renders user indicator for user messages", () => {
		const msg = makeMessage({ role: "user" });
		const { container } = render(
			<SessionMessage message={msg} showTimestamp={false} />,
		);
		expect(container.textContent).toContain("$");
	});

	it("renders thinking part as collapsible", () => {
		const msg = makeMessage({
			parts: [{ type: "thinking", thinking: "deep thought..." }],
		});
		const { container } = render(
			<SessionMessage message={msg} showTimestamp={false} />,
		);
		const details = container.querySelector("details");
		expect(details).not.toBeNull();
	});

	it("renders tool_use part with name", () => {
		const msg = makeMessage({
			parts: [{ type: "tool_use", id: "t1", name: "read_file", input: "{}" }],
		});
		render(<SessionMessage message={msg} showTimestamp={false} />);
		expect(screen.getByText(/read_file/)).toBeDefined();
	});

	it("renders tool_result part", () => {
		const msg = makeMessage({
			parts: [
				{
					type: "tool_result",
					toolUseId: "t1",
					content: "file contents here",
					isError: false,
				},
			],
		});
		const { container } = render(
			<SessionMessage message={msg} showTimestamp={false} />,
		);
		const details = container.querySelector("details");
		expect(details).not.toBeNull();
	});

	it("renders error tool_result with error styling", () => {
		const msg = makeMessage({
			parts: [
				{
					type: "tool_result",
					toolUseId: "t1",
					content: "Error occurred",
					isError: true,
				},
			],
		});
		const { container } = render(
			<SessionMessage message={msg} showTimestamp={false} />,
		);
		expect(container.textContent).toContain("error");
	});

	it("renders code blocks in text", () => {
		const msg = makeMessage({
			parts: [{ type: "text", text: "here is `inline code`" }],
		});
		const { container } = render(
			<SessionMessage message={msg} showTimestamp={false} />,
		);
		const code = container.querySelector("code");
		expect(code).not.toBeNull();
		expect(code!.textContent).toBe("inline code");
	});
});

describe("shouldShowTimestamp", () => {
	it("returns false when current has no timestamp", () => {
		expect(
			shouldShowTimestamp(
				{ role: "user", parts: [] },
				{ role: "user", parts: [], timestamp: "2025-06-15T10:00:00Z" },
			),
		).toBe(false);
	});

	it("returns true when previous is undefined", () => {
		expect(
			shouldShowTimestamp(
				{ role: "user", parts: [], timestamp: "2025-06-15T10:00:00Z" },
				undefined,
			),
		).toBe(true);
	});

	it("returns true when gap > 30 seconds", () => {
		expect(
			shouldShowTimestamp(
				{ role: "user", parts: [], timestamp: "2025-06-15T10:01:00Z" },
				{ role: "user", parts: [], timestamp: "2025-06-15T10:00:00Z" },
			),
		).toBe(true);
	});

	it("returns false when gap <= 30 seconds", () => {
		expect(
			shouldShowTimestamp(
				{ role: "user", parts: [], timestamp: "2025-06-15T10:00:10Z" },
				{ role: "user", parts: [], timestamp: "2025-06-15T10:00:00Z" },
			),
		).toBe(false);
	});
});
