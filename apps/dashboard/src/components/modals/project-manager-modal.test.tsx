// @vitest-environment jsdom
import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("next-intl", () => ({
	useTranslations: () => (key: string) => key,
}));

vi.mock("@/store", () => ({
	useAmoena: () => ({
		projects: [],
		activeProject: null,
	}),
}));

afterEach(() => cleanup());

describe("ProjectManagerModal", () => {
	it("module is importable", async () => {
		const mod = await import("./project-manager-modal");
		expect(mod).toBeDefined();
	});
});
