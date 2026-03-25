// @vitest-environment jsdom
import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("next-intl", () => ({
	useTranslations: () => (key: string) => key,
}));

vi.mock("@/store", () => ({
	useAmoena: () => ({
		liveFeed: [],
		connection: { isConnected: false, sseConnected: false },
	}),
}));

afterEach(() => cleanup());

describe("LiveFeed", () => {
	it("module is importable", async () => {
		const mod = await import("./live-feed");
		expect(mod).toBeDefined();
	});
});
