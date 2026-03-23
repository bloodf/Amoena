// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { ParsedTemplate } from "../../../../../lib/template-queries";
import { TemplateCard } from "../TemplateCard";

afterEach(cleanup);

vi.mock("next-intl", () => ({
	useTranslations: () => (key: string, params?: Record<string, unknown>) => {
		if (key === "usedCount") return `Used ${params?.count} times`;
		return key;
	},
}));

const baseTemplate: ParsedTemplate = {
	id: "test-1",
	name: "Test Template",
	description: "A description for testing",
	goalText: "Do {something}",
	category: "custom",
	tags: ["testing", "demo"],
	taskHints: [],
	options: {},
	useCount: 5,
	lastUsedAt: null,
	createdAt: 0,
};

describe("TemplateCard", () => {
	it("renders template name and description", () => {
		render(<TemplateCard template={baseTemplate} onSelect={vi.fn()} />);
		expect(screen.getByText("Test Template")).toBeTruthy();
		expect(screen.getByText("A description for testing")).toBeTruthy();
	});

	it("shows use count", () => {
		render(<TemplateCard template={baseTemplate} onSelect={vi.fn()} />);
		expect(screen.getByText("Used 5 times")).toBeTruthy();
	});

	it("shows neverUsed when useCount is 0", () => {
		render(<TemplateCard template={{ ...baseTemplate, useCount: 0 }} onSelect={vi.fn()} />);
		expect(screen.getByText("neverUsed")).toBeTruthy();
	});

	it("click calls onSelect", () => {
		const onSelect = vi.fn();
		render(<TemplateCard template={baseTemplate} onSelect={onSelect} />);
		fireEvent.click(screen.getByRole("button"));
		expect(onSelect).toHaveBeenCalledWith("test-1");
	});
});
