// @vitest-environment jsdom
import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => cleanup());

describe("AgentCoreNode", () => {
	it("module is importable", async () => {
		const mod = await import("./agent-core-node");
		expect(mod).toBeDefined();
	});
});
