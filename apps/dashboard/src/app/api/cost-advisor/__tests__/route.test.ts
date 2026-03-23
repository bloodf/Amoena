import { describe, expect, it } from "vitest";
import { POST } from "../route";

function makeRequest(body: unknown): Request {
	return new Request("http://localhost/api/cost-advisor", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(body),
	});
}

describe("POST /api/cost-advisor", () => {
	it("returns 400 when currentModel is missing", async () => {
		const response = await POST(
			makeRequest({ taskDescription: "fix a typo" }),
		);
		expect(response.status).toBe(400);
		const body = await response.json();
		expect(body.error).toBeDefined();
	});

	it("returns 400 when taskDescription is missing", async () => {
		const response = await POST(
			makeRequest({ currentModel: "claude-opus-4-6" }),
		);
		expect(response.status).toBe(400);
		const body = await response.json();
		expect(body.error).toBeDefined();
	});

	it("returns 400 when both fields are missing", async () => {
		const response = await POST(makeRequest({}));
		expect(response.status).toBe(400);
	});

	it("returns 400 for malformed JSON body", async () => {
		const request = new Request("http://localhost/api/cost-advisor", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: "{ not valid json",
		});
		const response = await POST(request);
		expect(response.status).toBe(400);
	});

	it("returns null suggestion for unknown model", async () => {
		const response = await POST(
			makeRequest({
				currentModel: "unknown-model-xyz",
				taskDescription: "implement a feature",
			}),
		);
		expect(response.status).toBe(200);
		const body = await response.json();
		expect(body.suggestion).toBeNull();
	});

	it("suggests a cheaper model for simple task using an expensive model", async () => {
		const response = await POST(
			makeRequest({
				currentModel: "claude-opus-4-6",
				taskDescription: "fix typo in README",
			}),
		);
		expect(response.status).toBe(200);
		const body = await response.json();
		// opus is expensive; a cheaper model should be suggested for simple work
		expect(body.suggestion).not.toBeNull();
		expect(body.suggestion.suggestedModelId).not.toBe("claude-opus-4-6");
	});

	it("suggestion includes required fields when a cheaper model is found", async () => {
		const response = await POST(
			makeRequest({
				currentModel: "claude-opus-4-6",
				taskDescription: "fix typo in README",
			}),
		);
		const body = await response.json();
		if (body.suggestion !== null) {
			expect(body.suggestion).toHaveProperty("currentModel");
			expect(body.suggestion).toHaveProperty("suggestedModel");
			expect(body.suggestion).toHaveProperty("suggestedModelId");
			expect(body.suggestion).toHaveProperty("estimatedSavings");
			expect(body.suggestion).toHaveProperty("complexity");
			expect(body.suggestion).toHaveProperty("reasoning");
		}
	});

	it("returns null suggestion when already using the cheapest viable model", async () => {
		// haiku is the cheapest; for a simple task it should be the cheapest viable option
		const response = await POST(
			makeRequest({
				currentModel: "claude-haiku-4-5",
				taskDescription: "fix typo in README",
			}),
		);
		expect(response.status).toBe(200);
		const body = await response.json();
		expect(body.suggestion).toBeNull();
	});

	it("estimatedSavings is a positive number when suggestion is returned", async () => {
		const response = await POST(
			makeRequest({
				currentModel: "claude-opus-4-6",
				taskDescription: "add test for utility function",
			}),
		);
		const body = await response.json();
		if (body.suggestion !== null) {
			expect(typeof body.suggestion.estimatedSavings).toBe("number");
			expect(body.suggestion.estimatedSavings).toBeGreaterThan(0);
		}
	});
});
