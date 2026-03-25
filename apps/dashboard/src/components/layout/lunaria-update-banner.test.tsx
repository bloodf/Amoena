// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AmoenaUpdateBanner } from "./lunaria-update-banner";

vi.mock("next-intl", () => ({
	useTranslations: () => (key: string, params?: Record<string, unknown>) => {
		if (params?.version) return `${key} ${params.version}`;
		return key;
	},
}));

const mockDismissAmoenaUpdate = vi.fn();
const mockSetAmoenaUpdate = vi.fn();

vi.mock("@/store", () => ({
	useAmoena: () => ({
		amoenaUpdate: {
			latest: "3.0.0",
			installed: "2.5.0",
			updateCommand: "npm update amoena",
			releaseUrl: "https://example.com/amoena-release",
			releaseNotes: "Bug fixes and improvements",
		},
		amoenaUpdateDismissedVersion: null,
		dismissAmoenaUpdate: mockDismissAmoenaUpdate,
		setAmoenaUpdate: mockSetAmoenaUpdate,
	}),
}));

afterEach(() => {
	cleanup();
	vi.clearAllMocks();
});

describe("AmoenaUpdateBanner", () => {
	it("renders when update is available", () => {
		render(<AmoenaUpdateBanner />);
		expect(screen.getByText(/amoenaUpdateAvailable/)).toBeDefined();
	});

	it("shows installed version", () => {
		render(<AmoenaUpdateBanner />);
		expect(screen.getByText(/installed/)).toBeDefined();
	});

	it("renders update now button", () => {
		render(<AmoenaUpdateBanner />);
		expect(screen.getByText("updateNow")).toBeDefined();
	});

	it("renders changelog toggle button", () => {
		render(<AmoenaUpdateBanner />);
		expect(screen.getByText(/changelog/)).toBeDefined();
	});

	it("renders copy command button", () => {
		render(<AmoenaUpdateBanner />);
		expect(screen.getByText("copyCommand")).toBeDefined();
	});

	it("renders view release link", () => {
		render(<AmoenaUpdateBanner />);
		const link = screen.getByText("viewRelease");
		expect(link.tagName).toBe("A");
	});

	it("calls dismiss with version on dismiss click", () => {
		render(<AmoenaUpdateBanner />);
		const dismissBtn = screen.getByTitle("dismiss");
		fireEvent.click(dismissBtn);
		expect(mockDismissAmoenaUpdate).toHaveBeenCalledWith("3.0.0");
	});

	it("toggles changelog visibility", () => {
		render(<AmoenaUpdateBanner />);
		const changelogBtn = screen.getByText(/changelog/);
		fireEvent.click(changelogBtn);
		expect(screen.getByText("Bug fixes and improvements")).toBeDefined();
	});
});
