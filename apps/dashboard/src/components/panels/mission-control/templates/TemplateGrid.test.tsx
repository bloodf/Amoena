// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TemplateGrid } from "./TemplateGrid";

vi.mock("./TemplateCard", () => ({
	TemplateCard: ({ template, onSelect }: any) => (
		<div data-testid={`card-${template.id}`} onClick={() => onSelect(template.id)}>
			{template.name}
		</div>
	),
}));

afterEach(() => cleanup());

const templates = [
	{
		id: "t1",
		name: "Build API",
		description: "Build a REST API",
		category: "built-in" as const,
		goalTemplate: "Build an API for {service}",
		variables: [],
		defaultOptions: {},
	},
	{
		id: "t2",
		name: "Write Tests",
		description: "Write unit tests",
		category: "custom" as const,
		goalTemplate: "Write tests for {module}",
		variables: [],
		defaultOptions: {},
	},
];

describe("TemplateGrid", () => {
	it("renders all template cards", () => {
		render(<TemplateGrid templates={templates} onSelect={() => {}} />);
		expect(screen.getByText("Build API")).toBeDefined();
		expect(screen.getByText("Write Tests")).toBeDefined();
	});

	it("shows empty message when no templates", () => {
		render(<TemplateGrid templates={[]} onSelect={() => {}} />);
		expect(screen.getByText("No templates found.")).toBeDefined();
	});

	it("passes onSelect to template cards", () => {
		const onSelect = vi.fn();
		render(<TemplateGrid templates={templates} onSelect={onSelect} />);
		fireEvent.click(screen.getByTestId("card-t1"));
		expect(onSelect).toHaveBeenCalledWith("t1");
	});
});
