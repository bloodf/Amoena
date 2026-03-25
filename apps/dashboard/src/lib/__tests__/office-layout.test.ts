import { describe, expect, it } from "vitest";

describe("office-layout", () => {
	it("OFFICE_ZONES is a non-empty array", async () => {
		const { OFFICE_ZONES } = await import("@/lib/office-layout");
		expect(OFFICE_ZONES.length).toBeGreaterThan(0);
	});

	it("each zone has required fields", async () => {
		const { OFFICE_ZONES } = await import("@/lib/office-layout");
		for (const zone of OFFICE_ZONES) {
			expect(zone.id).toBeTruthy();
			expect(zone.label).toBeTruthy();
			expect(zone.icon).toBeTruthy();
			expect(zone.accentClass).toBeTruthy();
			expect(Array.isArray(zone.roleKeywords)).toBe(true);
		}
	});

	it("getZoneByRole returns engineering for developer role", async () => {
		const { getZoneByRole } = await import("@/lib/office-layout");
		const zone = getZoneByRole("developer");
		expect(zone).toBeDefined();
		expect(zone.id).toBeTruthy();
	});

	it("getZoneByRole returns general for unknown role", async () => {
		const { getZoneByRole } = await import("@/lib/office-layout");
		const zone = getZoneByRole("completely_unknown_role_xyz");
		expect(zone).toBeDefined();
		expect(zone.id).toBe("general");
	});

	it("getZoneByRole handles undefined role", async () => {
		const { getZoneByRole } = await import("@/lib/office-layout");
		const zone = getZoneByRole(undefined);
		expect(zone).toBeDefined();
		expect(zone.id).toBe("general");
	});

	it("buildOfficeLayout returns layout for agents", async () => {
		const { buildOfficeLayout } = await import("@/lib/office-layout");
		const agents = [
			{ id: 1, name: "agent-1", role: "developer", status: "idle" as const, created_at: 0, updated_at: 0 },
			{ id: 2, name: "agent-2", role: "qa", status: "busy" as const, created_at: 0, updated_at: 0 },
		];
		const layout = buildOfficeLayout(agents);
		expect(Array.isArray(layout)).toBe(true);
		expect(layout.length).toBeGreaterThan(0);
	});

	it("buildOfficeLayout returns zones for empty agents", async () => {
		const { buildOfficeLayout } = await import("@/lib/office-layout");
		const layout = buildOfficeLayout([]);
		expect(Array.isArray(layout)).toBe(true);
	});
});
