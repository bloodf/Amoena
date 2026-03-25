// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { UpdateBanner } from "./update-banner";

vi.mock("next-intl", () => ({
	useTranslations: () => (key: string, params?: Record<string, unknown>) => {
		if (params?.version) return `${key} ${params.version}`;
		return key;
	},
}));

const mockDismissUpdate = vi.fn();

vi.mock("@/store", () => ({
	useAmoena: () => ({
		updateAvailable: {
			latestVersion: "2.0.0",
			releaseUrl: "https://example.com/release",
		},
		updateDismissedVersion: null,
		dismissUpdate: mockDismissUpdate,
	}),
}));

afterEach(() => {
	cleanup();
	vi.clearAllMocks();
});

describe("UpdateBanner", () => {
	it("renders when update is available", () => {
		render(<UpdateBanner />);
		expect(screen.getByText(/updateAvailable/)).toBeDefined();
	});

	it("renders update now button", () => {
		render(<UpdateBanner />);
		expect(screen.getByText("updateNow")).toBeDefined();
	});

	it("renders view release link", () => {
		render(<UpdateBanner />);
		const link = screen.getByText("viewRelease");
		expect(link.tagName).toBe("A");
		expect(link.getAttribute("href")).toBe("https://example.com/release");
	});

	it("calls dismissUpdate on dismiss click", () => {
		render(<UpdateBanner />);
		const dismissBtn = screen.getByTitle("dismiss");
		fireEvent.click(dismissBtn);
		expect(mockDismissUpdate).toHaveBeenCalledWith("2.0.0");
	});
});
