// @vitest-environment jsdom
import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("next-intl", () => ({
	useTranslations: () => (key: string) => key,
}));

vi.mock("@/store", () => ({
	useAmoena: () => ({
		dashboardMode: "local",
		connection: { isConnected: false },
	}),
}));

vi.mock("@/lib/navigation", () => ({
	useNavigateToPanel: () => vi.fn(),
	useCurrentPanel: () => "dashboard",
}));

afterEach(() => cleanup());

describe("NavRail", () => {
	it("module is importable", async () => {
		const mod = await import("./nav-rail");
		expect(mod).toBeDefined();
	});
});
