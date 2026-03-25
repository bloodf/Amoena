import { describe, expect, it } from "bun:test";
import {
	isElectronRuntime,
	readDevLaunchContext,
	authenticateLaunchContext,
	type LaunchContext,
} from "./runtime-bootstrap";

describe("runtime-bootstrap", () => {
	describe("isElectronRuntime", () => {
		it("returns false in test environment", () => {
			expect(isElectronRuntime()).toBe(false);
		});
	});

	describe("readDevLaunchContext", () => {
		it("returns null when no env vars set", () => {
			expect(readDevLaunchContext({})).toBeNull();
		});

		it("returns null when only API base URL is set", () => {
			expect(
				readDevLaunchContext({ VITE_AMOENA_API_BASE_URL: "http://localhost" }),
			).toBeNull();
		});

		it("returns null when only token is set", () => {
			expect(
				readDevLaunchContext({ VITE_AMOENA_BOOTSTRAP_TOKEN: "tok" }),
			).toBeNull();
		});

		it("returns context with defaults when both required vars present", () => {
			const ctx = readDevLaunchContext({
				VITE_AMOENA_API_BASE_URL: "http://localhost:3000",
				VITE_AMOENA_BOOTSTRAP_TOKEN: "my-token",
			});
			expect(ctx).not.toBeNull();
			expect(ctx!.apiBaseUrl).toBe("http://localhost:3000");
			expect(ctx!.bootstrapToken).toBe("my-token");
			expect(ctx!.bootstrapPath).toBe("/api/v1/bootstrap/auth");
			expect(ctx!.instanceId).toBe("dev-browser");
			expect(ctx!.expiresAtUnixMs).toBe(0);
		});

		it("uses custom bootstrap path when specified", () => {
			const ctx = readDevLaunchContext({
				VITE_AMOENA_API_BASE_URL: "http://localhost",
				VITE_AMOENA_BOOTSTRAP_TOKEN: "tok",
				VITE_AMOENA_BOOTSTRAP_PATH: "/custom/path",
			});
			expect(ctx!.bootstrapPath).toBe("/custom/path");
		});

		it("parses expiry as number", () => {
			const ctx = readDevLaunchContext({
				VITE_AMOENA_API_BASE_URL: "http://localhost",
				VITE_AMOENA_BOOTSTRAP_TOKEN: "tok",
				VITE_AMOENA_BOOTSTRAP_EXPIRES_AT: "1234567890",
			});
			expect(ctx!.expiresAtUnixMs).toBe(1234567890);
		});

		it("uses custom instance ID", () => {
			const ctx = readDevLaunchContext({
				VITE_AMOENA_API_BASE_URL: "http://localhost",
				VITE_AMOENA_BOOTSTRAP_TOKEN: "tok",
				VITE_AMOENA_INSTANCE_ID: "my-instance",
			});
			expect(ctx!.instanceId).toBe("my-instance");
		});
	});

	describe("authenticateLaunchContext", () => {
		it("sends POST to bootstrap endpoint", async () => {
			const launchContext: LaunchContext = {
				apiBaseUrl: "http://localhost:3000",
				bootstrapPath: "/api/v1/bootstrap/auth",
				bootstrapToken: "test-token",
				expiresAtUnixMs: 0,
				instanceId: "test",
			};

			const mockFetch = async (url: string, init?: RequestInit) => {
				expect(url).toBe("http://localhost:3000/api/v1/bootstrap/auth");
				expect(init?.method).toBe("POST");
				const body = JSON.parse(init?.body as string);
				expect(body.token).toBe("test-token");
				return new Response(
					JSON.stringify({
						apiBaseUrl: "http://localhost",
						authToken: "auth-tok",
						instanceId: "test",
						sseBaseUrl: "http://localhost/sse",
						tokenType: "bearer",
					}),
					{ status: 200 },
				);
			};

			const session = await authenticateLaunchContext(
				launchContext,
				mockFetch as typeof fetch,
			);
			expect(session.authToken).toBe("auth-tok");
			expect(session.tokenType).toBe("bearer");
		});

		it("throws on non-ok response", async () => {
			const launchContext: LaunchContext = {
				apiBaseUrl: "http://localhost",
				bootstrapPath: "/auth",
				bootstrapToken: "bad",
				expiresAtUnixMs: 0,
				instanceId: "test",
			};

			const mockFetch = async () =>
				new Response("Unauthorized", { status: 401 });

			await expect(
				authenticateLaunchContext(launchContext, mockFetch as typeof fetch),
			).rejects.toThrow("Bootstrap auth failed with status 401");
		});
	});
});
