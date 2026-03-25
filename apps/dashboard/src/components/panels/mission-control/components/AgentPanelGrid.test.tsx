// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("next-intl", () => ({
	useTranslations: () => (key: string) => key,
}));

afterEach(() => cleanup());

describe("AgentPanelGrid", () => {
	it("module is importable", async () => {
		const mod = await import("./AgentPanelGrid");
		expect(mod.AgentPanelGrid).toBeDefined();
	});
});
