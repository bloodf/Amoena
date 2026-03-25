import { describe, expect, it } from "vitest";

describe("templates-data", () => {
	it("BUILT_IN_TEMPLATES is a non-empty array", async () => {
		const { BUILT_IN_TEMPLATES } = await import("@/lib/templates-data");
		expect(BUILT_IN_TEMPLATES.length).toBeGreaterThan(0);
	});

	it("each template has required fields", async () => {
		const { BUILT_IN_TEMPLATES } = await import("@/lib/templates-data");
		for (const tpl of BUILT_IN_TEMPLATES) {
			expect(tpl.id).toBeTruthy();
			expect(tpl.name).toBeTruthy();
			expect(tpl.description).toBeTruthy();
			expect(tpl.goalText).toBeTruthy();
			expect(tpl.category).toBe("built-in");
			expect(Array.isArray(tpl.tags)).toBe(true);
			expect(Array.isArray(tpl.taskHints)).toBe(true);
		}
	});

	it("template IDs are unique", async () => {
		const { BUILT_IN_TEMPLATES } = await import("@/lib/templates-data");
		const ids = BUILT_IN_TEMPLATES.map((t) => t.id);
		expect(new Set(ids).size).toBe(ids.length);
	});

	it("each taskHint has required fields", async () => {
		const { BUILT_IN_TEMPLATES } = await import("@/lib/templates-data");
		for (const tpl of BUILT_IN_TEMPLATES) {
			for (const hint of tpl.taskHints) {
				expect(hint.description).toBeTruthy();
				expect(hint.taskType).toBeTruthy();
				expect(hint.complexity).toBeTruthy();
			}
		}
	});
});
