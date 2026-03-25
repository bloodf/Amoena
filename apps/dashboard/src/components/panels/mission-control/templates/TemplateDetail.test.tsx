// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TemplateDetail } from "./TemplateDetail";

vi.mock("next-intl", () => ({
	useTranslations: () => (key: string) => key,
}));

vi.mock("./TemplateLauncher", () => ({
	TemplateLauncher: ({ template, onLaunch, onCancel }: any) => (
		<div data-testid="launcher">{template.name}</div>
	),
}));

afterEach(() => cleanup());

const customTemplate = {
	id: "t1",
	name: "Custom Template",
	description: "A custom template",
	category: "custom" as const,
	goalTemplate: "Do {thing}",
	variables: [],
	defaultOptions: {},
};

const builtInTemplate = {
	...customTemplate,
	id: "t2",
	name: "Built-in Template",
	category: "built-in" as const,
};

describe("TemplateDetail", () => {
	it("renders back button", () => {
		render(
			<TemplateDetail
				template={customTemplate}
				onLaunch={() => {}}
				onEdit={() => {}}
				onDelete={() => {}}
				onBack={() => {}}
			/>,
		);
		expect(screen.getByText(/Back/)).toBeDefined();
	});

	it("calls onBack when back button clicked", () => {
		const onBack = vi.fn();
		render(
			<TemplateDetail
				template={customTemplate}
				onLaunch={() => {}}
				onEdit={() => {}}
				onDelete={() => {}}
				onBack={onBack}
			/>,
		);
		fireEvent.click(screen.getByText(/Back/));
		expect(onBack).toHaveBeenCalled();
	});

	it("renders edit and delete buttons for custom templates", () => {
		render(
			<TemplateDetail
				template={customTemplate}
				onLaunch={() => {}}
				onEdit={() => {}}
				onDelete={() => {}}
				onBack={() => {}}
			/>,
		);
		expect(screen.getByText("editTemplate")).toBeDefined();
		expect(screen.getByText("deleteTemplate")).toBeDefined();
	});

	it("calls onEdit with template on edit click", () => {
		const onEdit = vi.fn();
		render(
			<TemplateDetail
				template={customTemplate}
				onLaunch={() => {}}
				onEdit={onEdit}
				onDelete={() => {}}
				onBack={() => {}}
			/>,
		);
		fireEvent.click(screen.getByText("editTemplate"));
		expect(onEdit).toHaveBeenCalledWith(customTemplate);
	});

	it("calls onDelete with id on delete click", () => {
		const onDelete = vi.fn();
		render(
			<TemplateDetail
				template={customTemplate}
				onLaunch={() => {}}
				onEdit={() => {}}
				onDelete={onDelete}
				onBack={() => {}}
			/>,
		);
		fireEvent.click(screen.getByText("deleteTemplate"));
		expect(onDelete).toHaveBeenCalledWith("t1");
	});

	it("shows cannot-edit message for built-in templates", () => {
		render(
			<TemplateDetail
				template={builtInTemplate}
				onLaunch={() => {}}
				onEdit={() => {}}
				onDelete={() => {}}
				onBack={() => {}}
			/>,
		);
		expect(screen.getByText("cannotEditBuiltIn")).toBeDefined();
	});

	it("does not show edit/delete for built-in templates", () => {
		render(
			<TemplateDetail
				template={builtInTemplate}
				onLaunch={() => {}}
				onEdit={() => {}}
				onDelete={() => {}}
				onBack={() => {}}
			/>,
		);
		expect(screen.queryByText("editTemplate")).toBeNull();
		expect(screen.queryByText("deleteTemplate")).toBeNull();
	});
});
