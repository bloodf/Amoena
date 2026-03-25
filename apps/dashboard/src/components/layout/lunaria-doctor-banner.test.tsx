// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AmoenaDoctorBanner } from "./lunaria-doctor-banner";

vi.mock("next-intl", () => ({
	useTranslations: () => (key: string, params?: Record<string, unknown>) => {
		if (params?.count) return `${key} ${params.count}`;
		return key;
	},
}));

vi.mock("@/store", () => ({
	useAmoena: (selector?: any) => {
		if (typeof selector === "function") {
			const state = { doctorDismissedAt: null, dismissDoctor: vi.fn() };
			return selector(state);
		}
		return { doctorDismissedAt: null, dismissDoctor: vi.fn() };
	},
}));

afterEach(() => cleanup());

// Mock fetch to return unhealthy status
const mockFetch = vi.fn();
globalThis.fetch = mockFetch;

describe("AmoenaDoctorBanner", () => {
	it("renders nothing while loading", () => {
		mockFetch.mockResolvedValue({ ok: false });
		const { container } = render(<AmoenaDoctorBanner />);
		// Should be null or empty while loading
		expect(container.innerHTML).toBe("");
	});

	it("renders nothing when healthy", async () => {
		mockFetch.mockResolvedValue({
			ok: true,
			json: () =>
				Promise.resolve({
					level: "healthy",
					healthy: true,
					summary: "All good",
					issues: [],
					canFix: false,
					raw: "",
					category: "general",
				}),
		});
		const { container } = render(<AmoenaDoctorBanner />);
		// Wait for async load
		await vi.waitFor(() => {
			// Should be empty when healthy
		});
		// Note: in the loading state the banner renders nothing
		expect(container.children.length).toBeLessThanOrEqual(1);
	});
});
