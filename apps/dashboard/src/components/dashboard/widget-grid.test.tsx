// @vitest-environment jsdom
import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("next-intl", () => ({
	useTranslations: () => (key: string) => key,
}));

vi.mock("@/store", () => ({
	useAmoena: () => ({
		dashboardMode: "local",
	}),
}));

vi.mock("@/lib/navigation", () => ({
	useNavigateToPanel: () => vi.fn(),
}));

afterEach(() => cleanup());

describe("WidgetGrid", () => {
	it("module is importable", async () => {
		const mod = await import("./widget-grid");
		expect(mod).toBeDefined();
	});
});
