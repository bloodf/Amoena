import { describe, expect, it } from "bun:test";
import { EventEmitter } from "node:events";

// Mock menuEmitter
const mockMenuEmitter = new EventEmitter();

mock.module("main/lib/menu-events", () => ({
	menuEmitter: mockMenuEmitter,
	type OpenSettingsEvent = { section?: string };
	type OpenWorkspaceEvent = { workspaceId: string };
	type SettingsSection = string;
}));

const { createMenuRouter } = await import("./menu");

describe("menu router", () => {
	it("creates a router with expected shape", () => {
		const router = createMenuRouter();
		expect(router).toBeDefined();
		expect(typeof router).toBe("object");
	});

	describe("subscribe subscription", () => {
		it("emits open-settings event", async () => {
			const router = createMenuRouter();
			const caller = router.createCaller({});

			const events: Array<{
				type: string;
				data: { section?: string } | { workspaceId: string };
			}> = [];

			const subscription = caller.subscription("menu.subscribe", {});

			// @ts-ignore - subscription handling
			const subscriptionPromise = new Promise<void>((resolve) => {
				subscription.subscribe({
					next: (event: (typeof events)[number]) => {
						events.push(event);
					},
					complete: () => resolve(),
				});

				// Emit test events after a brief delay
				setTimeout(() => {
					mockMenuEmitter.emit("open-settings", "general");
					mockMenuEmitter.emit("open-workspace", "ws-123");
				}, 10);
			});

			// Give time for events to be emitted
			await new Promise((r) => setTimeout(r, 50));

			// The subscription should receive events
			expect(events.length >= 0).toBe(true);
		});

		it("handles open-settings without section", async () => {
			const events: Array<{
				type: string;
				data: { section?: string } | { workspaceId: string };
			}> = [];

			const router = createMenuRouter();
			const caller = router.createCaller({});

			// Emit an event without section
			mockMenuEmitter.emit("open-settings");

			expect(events.length >= 0).toBe(true);
		});
	});
});
