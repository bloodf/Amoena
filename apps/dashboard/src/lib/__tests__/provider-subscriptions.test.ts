import { describe, expect, it } from "vitest";

describe("provider-subscriptions", () => {
	it("detectProviderSubscriptions returns an object", async () => {
		const { detectProviderSubscriptions } = await import("@/lib/provider-subscriptions");
		const result = detectProviderSubscriptions();
		expect(typeof result).toBe("object");
	});

	it("getProviderSubscriptionFlags returns flags object", async () => {
		const { getProviderSubscriptionFlags } = await import("@/lib/provider-subscriptions");
		const flags = getProviderSubscriptionFlags();
		expect(typeof flags).toBe("object");
	});

	it("getProviderFromModel extracts provider name", async () => {
		const { getProviderFromModel } = await import("@/lib/provider-subscriptions");
		expect(getProviderFromModel("anthropic/claude-sonnet-4")).toBe("anthropic");
		expect(getProviderFromModel("openai/gpt-4")).toBe("openai");
	});

	it("getProviderFromModel handles model without slash", async () => {
		const { getProviderFromModel } = await import("@/lib/provider-subscriptions");
		const result = getProviderFromModel("gpt-4");
		expect(typeof result).toBe("string");
	});
});
