// @vitest-environment jsdom
import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("next-intl", () => ({
	useTranslations: () => (key: string) => key,
}));

vi.mock("@/store", () => ({
	useAmoena: () => ({
		dashboardMode: "local",
		sessions: [],
		agents: [],
	}),
}));

vi.mock("@/lib/navigation", () => ({
	useNavigateToPanel: () => vi.fn(),
}));

afterEach(() => cleanup());

describe("Sidebar", () => {
	it("module is importable", async () => {
		const mod = await import("./sidebar");
		expect(mod).toBeDefined();
	});
});
