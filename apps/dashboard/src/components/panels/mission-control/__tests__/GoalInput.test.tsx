// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { GoalInput } from "../components/GoalInput";

vi.mock("next-intl", () => ({
	useTranslations: () => (key: string, _params?: Record<string, unknown>) => key,
}));

afterEach(() => cleanup());

const noop = vi.fn();

describe("GoalInput", () => {
	it("renders textarea and launch button", () => {
		render(<GoalInput onSubmit={noop} isSubmitting={false} />);
		expect(screen.getByRole("textbox")).toBeDefined();
		expect(screen.getByText("launch")).toBeDefined();
	});

	it("submit button disabled when input < 10 chars", () => {
		render(<GoalInput onSubmit={noop} isSubmitting={false} />);
		const textarea = screen.getByRole("textbox");
		fireEvent.change(textarea, { target: { value: "short" } });
		const btn = screen.getByText("launch").closest("button") as HTMLButtonElement;
		expect(btn.disabled).toBe(true);
	});

	it("submit button enabled when input >= 10 chars", () => {
		render(<GoalInput onSubmit={noop} isSubmitting={false} />);
		const textarea = screen.getByRole("textbox");
		fireEvent.change(textarea, { target: { value: "long enough description" } });
		const btn = screen.getByText("launch").closest("button") as HTMLButtonElement;
		expect(btn.disabled).toBe(false);
	});

	it("onSubmit called with description on button click", () => {
		const onSubmit = vi.fn();
		render(<GoalInput onSubmit={onSubmit} isSubmitting={false} />);
		const textarea = screen.getByRole("textbox");
		fireEvent.change(textarea, { target: { value: "a valid goal description" } });
		const btn = screen.getByText("launch").closest("button") as HTMLButtonElement;
		fireEvent.click(btn);
		expect(onSubmit).toHaveBeenCalledWith(
			"a valid goal description",
			expect.objectContaining({ maxConcurrency: 3 }),
		);
	});

	it("onSubmit called on Cmd+Enter", () => {
		const onSubmit = vi.fn();
		render(<GoalInput onSubmit={onSubmit} isSubmitting={false} />);
		const textarea = screen.getByRole("textbox");
		fireEvent.change(textarea, { target: { value: "a valid goal description" } });
		fireEvent.keyDown(textarea, { key: "Enter", metaKey: true });
		expect(onSubmit).toHaveBeenCalled();
	});

	it("shows char count when > 1800 chars", () => {
		render(<GoalInput onSubmit={noop} isSubmitting={false} />);
		const textarea = screen.getByRole("textbox");
		const longText = "a".repeat(1850);
		fireEvent.change(textarea, { target: { value: longText } });
		expect(screen.getByText(/charsRemaining/)).toBeDefined();
	});
});
