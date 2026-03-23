import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "../route";

function makeRequest(body: unknown): Request {
	return new Request("http://localhost/api/terminal/spawn", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(body),
	});
}

describe("POST /api/terminal/spawn", () => {
	beforeEach(() => {
		vi.stubGlobal("fetch", vi.fn());
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it("returns 400 when command is missing", async () => {
		const response = await POST(makeRequest({ cwd: "/tmp" }));
		expect(response.status).toBe(400);
		const body = await response.json();
		expect(body.error).toBe("command is required");
	});

	it("returns 400 when body is empty object", async () => {
		const response = await POST(makeRequest({}));
		expect(response.status).toBe(400);
	});

	it("forwards command to terminal host and returns its response", async () => {
		const mockData = { id: "term-123", pid: 9999 };
		vi.mocked(fetch).mockResolvedValueOnce(
			new Response(JSON.stringify(mockData), {
				status: 200,
				headers: { "Content-Type": "application/json" },
			}),
		);

		const response = await POST(makeRequest({ command: "ls -la" }));
		expect(response.status).toBe(200);
		const body = await response.json();
		expect(body).toEqual(mockData);
	});

	it("calls fetch with the command in the request body", async () => {
		const mockData = { id: "term-456" };
		vi.mocked(fetch).mockResolvedValueOnce(
			new Response(JSON.stringify(mockData), {
				status: 200,
				headers: { "Content-Type": "application/json" },
			}),
		);

		await POST(makeRequest({ command: "echo hello", cwd: "/home/user" }));

		expect(fetch).toHaveBeenCalledOnce();
		const [url, options] = vi.mocked(fetch).mock.calls[0];
		expect(String(url)).toContain("/trpc/terminal.create");
		const sentBody = JSON.parse(options?.body as string);
		expect(sentBody.json.command).toBe("echo hello");
		expect(sentBody.json.cwd).toBe("/home/user");
	});

	it("passes extra env vars to terminal host", async () => {
		vi.mocked(fetch).mockResolvedValueOnce(
			new Response(JSON.stringify({ id: "term-789" }), {
				status: 200,
				headers: { "Content-Type": "application/json" },
			}),
		);

		await POST(
			makeRequest({
				command: "node index.js",
				env: { NODE_ENV: "production" },
			}),
		);

		const [, options] = vi.mocked(fetch).mock.calls[0];
		const sentBody = JSON.parse(options?.body as string);
		expect(sentBody.json.env).toEqual({ NODE_ENV: "production" });
	});

	it("returns terminal host error status and message when host responds non-ok", async () => {
		vi.mocked(fetch).mockResolvedValueOnce(
			new Response("Service unavailable", { status: 503 }),
		);

		const response = await POST(makeRequest({ command: "ls" }));
		expect(response.status).toBe(503);
		const body = await response.json();
		expect(body.error).toContain("Terminal host error");
	});

	it("returns 500 when fetch throws a network error", async () => {
		vi.mocked(fetch).mockRejectedValueOnce(new Error("ECONNREFUSED"));

		const response = await POST(makeRequest({ command: "ls" }));
		expect(response.status).toBe(500);
		const body = await response.json();
		expect(body.error).toContain("ECONNREFUSED");
	});

	it("returns 400 for malformed JSON body", async () => {
		const request = new Request("http://localhost/api/terminal/spawn", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: "{ broken json",
		});
		const response = await POST(request);
		expect(response.status).toBe(500);
	});
});
