import { describe, expect, it } from "vitest";

describe("version", () => {
	it("APP_VERSION is a non-empty string", async () => {
		const { APP_VERSION } = await import("@/lib/version");
		expect(typeof APP_VERSION).toBe("string");
		expect(APP_VERSION.length).toBeGreaterThan(0);
	});
});
