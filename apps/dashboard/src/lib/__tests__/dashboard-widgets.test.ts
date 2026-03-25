import { describe, expect, it } from "vitest";

describe("dashboard-widgets", () => {
	it("WIDGET_CATALOG is a non-empty array", async () => {
		const { WIDGET_CATALOG } = await import("@/lib/dashboard-widgets");
		expect(WIDGET_CATALOG.length).toBeGreaterThan(0);
	});

	it("each widget has required fields", async () => {
		const { WIDGET_CATALOG } = await import("@/lib/dashboard-widgets");
		for (const w of WIDGET_CATALOG) {
			expect(w.id).toBeTruthy();
			expect(w.label).toBeTruthy();
			expect(w.description).toBeTruthy();
			expect(w.category).toBeTruthy();
			expect(w.modes.length).toBeGreaterThan(0);
			expect(["sm", "md", "lg", "full"]).toContain(w.defaultSize);
			expect(w.component).toBeTruthy();
		}
	});

	it("widget IDs are unique", async () => {
		const { WIDGET_CATALOG } = await import("@/lib/dashboard-widgets");
		const ids = WIDGET_CATALOG.map((w) => w.id);
		expect(new Set(ids).size).toBe(ids.length);
	});

	it("getDefaultLayout returns widget IDs for local mode", async () => {
		const { getDefaultLayout, LOCAL_DEFAULT_LAYOUT } = await import("@/lib/dashboard-widgets");
		const layout = getDefaultLayout("local");
		expect(layout).toEqual(LOCAL_DEFAULT_LAYOUT);
		expect(layout.length).toBeGreaterThan(0);
	});

	it("getDefaultLayout returns widget IDs for full mode", async () => {
		const { getDefaultLayout, GATEWAY_DEFAULT_LAYOUT } = await import("@/lib/dashboard-widgets");
		const layout = getDefaultLayout("full");
		expect(layout).toEqual(GATEWAY_DEFAULT_LAYOUT);
	});

	it("getWidgetById finds a widget", async () => {
		const { getWidgetById } = await import("@/lib/dashboard-widgets");
		const widget = getWidgetById("metric-cards");
		expect(widget).toBeDefined();
		expect(widget?.id).toBe("metric-cards");
	});

	it("getWidgetById returns undefined for unknown", async () => {
		const { getWidgetById } = await import("@/lib/dashboard-widgets");
		expect(getWidgetById("nonexistent")).toBeUndefined();
	});

	it("getAvailableWidgets filters by mode", async () => {
		const { getAvailableWidgets } = await import("@/lib/dashboard-widgets");
		const local = getAvailableWidgets("local");
		const full = getAvailableWidgets("full");
		expect(local.every((w) => w.modes.includes("local"))).toBe(true);
		expect(full.every((w) => w.modes.includes("full"))).toBe(true);
	});
});
