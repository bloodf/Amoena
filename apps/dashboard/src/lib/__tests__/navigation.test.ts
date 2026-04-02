import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
	useRouter: vi.fn(() => ({
		push: vi.fn(),
		prefetch: vi.fn(),
	})),
	usePathname: vi.fn(() => "/current/path"),
}));

vi.mock("@/lib/navigation-metrics", () => ({
	startNavigationTiming: vi.fn(),
}));

vi.mock("@/store", () => ({
	useAmoena: vi.fn(() => ({
		setActiveTab: vi.fn(),
		setChatPanelOpen: vi.fn(),
	})),
}));

describe("navigation", () => {
	describe("panelHref", () => {
		it("returns / for overview panel", async () => {
			const { panelHref } = await import("../navigation");
			expect(panelHref("overview")).toBe("/");
		});

		it("returns /panel for other panels", async () => {
			const { panelHref } = await import("../navigation");
			expect(panelHref("chat")).toBe("/chat");
			expect(panelHref("tasks")).toBe("/tasks");
		});
	});
});
