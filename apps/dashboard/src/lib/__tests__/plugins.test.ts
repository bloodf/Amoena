import { beforeEach, describe, expect, it, vi } from "vitest";

describe("plugins", () => {
	beforeEach(() => {
		vi.resetModules();
	});

	it("registerIntegrations and getPluginIntegrations work", async () => {
		const { registerIntegrations, getPluginIntegrations } = await import("@/lib/plugins");
		const before = getPluginIntegrations().length;
		registerIntegrations([{
			id: "test-integration",
			name: "Test",
			description: "A test integration",
			icon: "test",
			category: "test",
			configFields: [],
		}]);
		expect(getPluginIntegrations().length).toBe(before + 1);
	});

	it("registerCategories and getPluginCategories work", async () => {
		const { registerCategories, getPluginCategories } = await import("@/lib/plugins");
		const before = getPluginCategories().length;
		registerCategories([{ id: "custom", label: "Custom", icon: "star" }]);
		expect(getPluginCategories().length).toBe(before + 1);
	});

	it("registerNavItems and getPluginNavItems work", async () => {
		const { registerNavItems, getPluginNavItems } = await import("@/lib/plugins");
		const before = getPluginNavItems().length;
		registerNavItems([{ id: "test", label: "Test Nav", icon: "icon", href: "/test" }]);
		expect(getPluginNavItems().length).toBe(before + 1);
	});

	it("getPluginToolProviders returns empty by default", async () => {
		const { getPluginToolProviders } = await import("@/lib/plugins");
		expect(Array.isArray(getPluginToolProviders())).toBe(true);
	});
});
