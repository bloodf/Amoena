// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { ParsedTemplate } from "../../../../../lib/template-queries";
import { TemplateEditor } from "../TemplateEditor";

afterEach(cleanup);

vi.mock("next-intl", () => ({
	useTranslations: () => (key: string) => key,
}));

const existingTemplate: ParsedTemplate = {
	id: "t1",
	name: "My Template",
	description: "An existing template",
	goalText: "Do {something} well",
	category: "custom",
	tags: ["tag1"],
	taskHints: [],
	options: {},
	useCount: 2,
	lastUsedAt: null,
	createdAt: 0,
};

describe("TemplateEditor", () => {
	it("renders form fields", () => {
		render(<TemplateEditor onSave={vi.fn()} onCancel={vi.fn()} />);
		expect(screen.getByText("name")).toBeTruthy();
		expect(screen.getByText("description")).toBeTruthy();
		expect(screen.getByText("goalText")).toBeTruthy();
		expect(screen.getByText("tags")).toBeTruthy();
	});

	it("save button disabled when name is empty", () => {
		render(<TemplateEditor onSave={vi.fn()} onCancel={vi.fn()} />);
		// find the save button by role=button with text "save"
		const buttons = screen.getAllByRole("button");
		const saveBtn = buttons.find(
			(btn) => btn.textContent === "save",
		) as HTMLButtonElement;
		expect(saveBtn).toBeTruthy();
		expect(saveBtn.disabled).toBe(true);
	});

	it("edit mode pre-fills fields", () => {
		render(<TemplateEditor existing={existingTemplate} onSave={vi.fn()} onCancel={vi.fn()} />);
		expect(screen.getByDisplayValue("My Template")).toBeTruthy();
		expect(screen.getByDisplayValue("Do {something} well")).toBeTruthy();
	});

	it("save button enabled with valid name and goal", () => {
		render(<TemplateEditor onSave={vi.fn()} onCancel={vi.fn()} />);
		const inputs = screen.getAllByRole("textbox");
		// name input is first
		fireEvent.change(inputs[0], { target: { value: "Valid Name" } });
		// goal text (textarea) is index 2
		fireEvent.change(inputs[2], {
			target: { value: "A goal that is long enough to be valid and has enough chars" },
		});
		const buttons = screen.getAllByRole("button");
		const saveBtn = buttons.find(
			(btn) => btn.textContent === "save",
		) as HTMLButtonElement;
		expect(saveBtn.disabled).toBe(false);
	});
});
