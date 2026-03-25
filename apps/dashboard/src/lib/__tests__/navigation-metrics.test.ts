import { describe, expect, it } from "vitest";

/**
 * navigation-metrics is a "use client" module that depends on `window` and `performance`.
 * In Node test environment, these are unavailable so functions return void/null.
 * We test the module exports and server-safe behavior.
 */
describe("navigation-metrics", () => {
	it("startNavigationTiming does not throw in server env", async () => {
		const { startNavigationTiming } = await import("@/lib/navigation-metrics");
		expect(() => startNavigationTiming("/from", "/to")).not.toThrow();
	});

	it("completeNavigationTiming returns null in server env", async () => {
		const { completeNavigationTiming } = await import("@/lib/navigation-metrics");
		const result = completeNavigationTiming("/to");
		expect(result).toBeNull();
	});

	it("getNavigationMetrics returns metrics object", async () => {
		const { getNavigationMetrics } = await import("@/lib/navigation-metrics");
		const metrics = getNavigationMetrics();
		expect(metrics).toBeDefined();
	});

	it("navigationMetricEventName returns a string", async () => {
		const { navigationMetricEventName } = await import("@/lib/navigation-metrics");
		expect(typeof navigationMetricEventName()).toBe("string");
		expect(navigationMetricEventName().length).toBeGreaterThan(0);
	});
});
