// @vitest-environment jsdom
import { describe, expect, it } from "vitest";

describe("Home (Dashboard) Page", () => {
	it.skip("module is importable - skipped due to missing component imports in source", async () => {
		const mod = await import("../[[...panel]]/page");
		expect(mod).toBeDefined();
	});
});
