// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("next-intl", () => ({
	useTranslations: () => (key: string, params?: Record<string, unknown>) => {
		if (params) {
			const parts = Object.entries(params).map(([k, v]) => `${k}=${v}`);
			return `${key}(${parts.join(",")})`;
		}
		return key;
	},
}));

afterEach(() => cleanup());

describe("StatusBar", () => {
	it("module is importable", async () => {
		const mod = await import("./StatusBar");
		expect(mod.StatusBar).toBeDefined();
	});
});
