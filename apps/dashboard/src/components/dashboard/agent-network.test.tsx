// @vitest-environment jsdom
import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/store", () => ({
	useAmoena: () => ({
		agents: [],
		sessions: [],
	}),
}));

afterEach(() => cleanup());

describe("AgentNetwork", () => {
	it("module is importable", async () => {
		const mod = await import("./agent-network");
		expect(mod).toBeDefined();
	});
});
