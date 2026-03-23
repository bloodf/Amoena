// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TemplateSearch } from "../TemplateSearch";

afterEach(cleanup);

vi.mock("next-intl", () => ({
	useTranslations: () => (key: string) => key,
}));

describe("TemplateSearch", () => {
	const defaultProps = {
		query: "",
		onQueryChange: vi.fn(),
		category: "all" as const,
		onCategoryChange: vi.fn(),
		sort: "most-used" as const,
		onSortChange: vi.fn(),
	};

	it("filters templates by text input", () => {
		const onQueryChange = vi.fn();
		render(<TemplateSearch {...defaultProps} onQueryChange={onQueryChange} />);
		const input = screen.getByPlaceholderText("searchPlaceholder");
		fireEvent.change(input, { target: { value: "bug" } });
		expect(onQueryChange).toHaveBeenCalledWith("bug");
	});

	it("category tabs filter correctly", () => {
		const onCategoryChange = vi.fn();
		render(<TemplateSearch {...defaultProps} onCategoryChange={onCategoryChange} />);
		// Use getAllByText since "builtIn" might appear in multiple elements, grab the button
		const builtInBtns = screen.getAllByText("builtIn");
		const builtInBtn = builtInBtns.find((el) => el.tagName === "BUTTON") ?? builtInBtns[0];
		fireEvent.click(builtInBtn);
		expect(onCategoryChange).toHaveBeenCalledWith("built-in");

		const customBtns = screen.getAllByText("custom");
		const customBtn = customBtns.find((el) => el.tagName === "BUTTON") ?? customBtns[0];
		fireEvent.click(customBtn);
		expect(onCategoryChange).toHaveBeenCalledWith("custom");

		const allBtns = screen.getAllByText("all");
		const allBtn = allBtns.find((el) => el.tagName === "BUTTON") ?? allBtns[0];
		fireEvent.click(allBtn);
		expect(onCategoryChange).toHaveBeenCalledWith("all");
	});
});
