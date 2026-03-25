// @vitest-environment jsdom
import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("next-themes", () => ({
	useTheme: () => ({ theme: "void" }),
}));

afterEach(() => cleanup());

describe("ThemeBackground", () => {
	it("module is importable", async () => {
		const mod = await import("./theme-background");
		expect(mod).toBeDefined();
	});
});
