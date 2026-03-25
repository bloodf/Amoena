// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ThemeSelector } from "./theme-selector";

const mockSetTheme = vi.fn();

vi.mock("next-themes", () => ({
	useTheme: () => ({
		theme: "void",
		setTheme: mockSetTheme,
	}),
}));

vi.mock("@/lib/themes", () => ({
	THEMES: [
		{ id: "void", label: "Void", swatch: "#000", group: "dark" },
		{ id: "midnight", label: "Midnight", swatch: "#111", group: "dark" },
		{ id: "daylight", label: "Daylight", swatch: "#fff", group: "light" },
	],
}));

afterEach(() => {
	cleanup();
	vi.clearAllMocks();
});

describe("ThemeSelector", () => {
	it("renders trigger button", () => {
		render(<ThemeSelector />);
		expect(screen.getByTitle("Change theme")).toBeDefined();
	});

	it("opens dropdown on click", () => {
		render(<ThemeSelector />);
		fireEvent.click(screen.getByTitle("Change theme"));
		expect(screen.getByText("Void")).toBeDefined();
		expect(screen.getByText("Midnight")).toBeDefined();
		expect(screen.getByText("Daylight")).toBeDefined();
	});

	it("shows Dark and Light group headers", () => {
		render(<ThemeSelector />);
		fireEvent.click(screen.getByTitle("Change theme"));
		expect(screen.getByText("Dark")).toBeDefined();
		expect(screen.getByText("Light")).toBeDefined();
	});

	it("calls setTheme and closes on theme selection", () => {
		render(<ThemeSelector />);
		fireEvent.click(screen.getByTitle("Change theme"));
		fireEvent.click(screen.getByText("Midnight"));
		expect(mockSetTheme).toHaveBeenCalledWith("midnight");
	});

	it("shows checkmark for active theme", () => {
		render(<ThemeSelector />);
		fireEvent.click(screen.getByTitle("Change theme"));
		// Void is the active theme, should have bg-primary/10 class
		const voidButton = screen.getByText("Void").closest("button");
		expect(voidButton?.className).toContain("bg-primary/10");
	});
});
