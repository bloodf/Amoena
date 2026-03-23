import { describe, expect, it } from "vitest";
import { GET } from "../route";

function makeRequest(search: string = ""): Request {
	return new Request(`http://localhost/api/recipes${search}`);
}

describe("GET /api/recipes", () => {
	it("returns all 6 recipes when no filter is provided", async () => {
		const response = await GET(makeRequest());
		expect(response.status).toBe(200);
		const body = await response.json();
		expect(body.recipes).toHaveLength(6);
	});

	it("returns recipes as an array under the recipes key", async () => {
		const response = await GET(makeRequest());
		const body = await response.json();
		expect(Array.isArray(body.recipes)).toBe(true);
	});

	it("each recipe has required fields: id, name, description, icon", async () => {
		const response = await GET(makeRequest());
		const body = await response.json();
		for (const recipe of body.recipes) {
			expect(recipe).toHaveProperty("id");
			expect(recipe).toHaveProperty("name");
			expect(recipe).toHaveProperty("description");
			expect(recipe).toHaveProperty("icon");
		}
	});

	it("returns 2 recipes when filtered by category=development", async () => {
		const response = await GET(makeRequest("?category=development"));
		expect(response.status).toBe(200);
		const body = await response.json();
		expect(body.recipes).toHaveLength(2);
	});

	it("all development recipes have category development", async () => {
		const response = await GET(makeRequest("?category=development"));
		const body = await response.json();
		for (const recipe of body.recipes) {
			expect(recipe.category).toBe("development");
		}
	});

	it("returns 1 recipe when filtered by category=review", async () => {
		const response = await GET(makeRequest("?category=review"));
		expect(response.status).toBe(200);
		const body = await response.json();
		expect(body.recipes).toHaveLength(1);
	});

	it("the review category recipe has id pr-review", async () => {
		const response = await GET(makeRequest("?category=review"));
		const body = await response.json();
		expect(body.recipes[0].id).toBe("pr-review");
	});

	it("returns empty array for unknown category", async () => {
		const response = await GET(makeRequest("?category=nonexistent"));
		expect(response.status).toBe(200);
		const body = await response.json();
		expect(body.recipes).toHaveLength(0);
	});

	it("returns 3 maintenance recipes when filtered by category=maintenance", async () => {
		const response = await GET(makeRequest("?category=maintenance"));
		const body = await response.json();
		expect(body.recipes).toHaveLength(3);
	});
});
