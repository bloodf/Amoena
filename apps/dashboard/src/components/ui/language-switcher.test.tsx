// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { LanguageSwitcher, LanguageSwitcherSelect } from "./language-switcher";

vi.mock("next-intl", () => ({
	useLocale: () => "en",
}));

vi.mock("@/i18n/config", () => ({
	locales: ["en", "es", "pt"],
	localeNames: { en: "English", es: "Espanol", pt: "Portugues" },
}));

afterEach(() => cleanup());

describe("LanguageSwitcher", () => {
	it("renders trigger button with Language title", () => {
		render(<LanguageSwitcher />);
		expect(screen.getByTitle("Language")).toBeDefined();
	});

	it("opens dropdown on click", () => {
		render(<LanguageSwitcher />);
		fireEvent.click(screen.getByTitle("Language"));
		expect(screen.getByText("English")).toBeDefined();
		expect(screen.getByText("Espanol")).toBeDefined();
		expect(screen.getByText("Portugues")).toBeDefined();
	});

	it("shows checkmark for active locale", () => {
		render(<LanguageSwitcher />);
		fireEvent.click(screen.getByTitle("Language"));
		const englishBtn = screen.getByText("English").closest("button");
		expect(englishBtn?.className).toContain("bg-primary/10");
	});

	it("has aria-label Language", () => {
		render(<LanguageSwitcher />);
		expect(screen.getByLabelText("Language")).toBeDefined();
	});
});

describe("LanguageSwitcherSelect", () => {
	it("renders select element", () => {
		render(<LanguageSwitcherSelect />);
		const select = screen.getByLabelText("Language") as HTMLSelectElement;
		expect(select.tagName).toBe("SELECT");
	});

	it("has correct value for current locale", () => {
		render(<LanguageSwitcherSelect />);
		const select = screen.getByLabelText("Language") as HTMLSelectElement;
		expect(select.value).toBe("en");
	});

	it("renders all locale options", () => {
		render(<LanguageSwitcherSelect />);
		const options = screen.getAllByRole("option");
		expect(options.length).toBe(3);
	});
});
