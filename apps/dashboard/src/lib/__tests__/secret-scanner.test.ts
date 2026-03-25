import { describe, expect, it } from "vitest";

describe("secret-scanner", () => {
	it("scanForSecrets detects AWS keys", async () => {
		const { scanForSecrets } = await import("@/lib/secret-scanner");
		const matches = scanForSecrets("AKIAIOSFODNN7EXAMPLE");
		expect(matches.length).toBeGreaterThan(0);
		expect(matches.some((m) => m.type.toLowerCase().includes("aws"))).toBe(true);
	});

	it("scanForSecrets detects generic API keys", async () => {
		const { scanForSecrets } = await import("@/lib/secret-scanner");
		const matches = scanForSecrets('api_key = "sk_live_1234567890abcdef"');
		expect(matches.length).toBeGreaterThan(0);
	});

	it("scanForSecrets returns empty for clean text", async () => {
		const { scanForSecrets } = await import("@/lib/secret-scanner");
		const matches = scanForSecrets("This is a normal sentence without secrets.");
		expect(matches).toEqual([]);
	});

	it("redactSecrets masks detected secrets", async () => {
		const { redactSecrets } = await import("@/lib/secret-scanner");
		const original = "key=AKIAIOSFODNN7EXAMPLE rest";
		const redacted = redactSecrets(original);
		expect(redacted).not.toContain("AKIAIOSFODNN7EXAMPLE");
	});

	it("redactSecrets returns input unchanged when clean", async () => {
		const { redactSecrets } = await import("@/lib/secret-scanner");
		const text = "No secrets here";
		expect(redactSecrets(text)).toBe(text);
	});
});
