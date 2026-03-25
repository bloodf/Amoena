import { describe, expect, it } from "vitest";

describe("event-bus", () => {
	it("exports an eventBus singleton", async () => {
		const { eventBus } = await import("@/lib/event-bus");
		expect(eventBus).toBeDefined();
		expect(typeof eventBus.broadcast).toBe("function");
		expect(typeof eventBus.on).toBe("function");
		expect(typeof eventBus.emit).toBe("function");
	});

	it("broadcast emits server-event with correct shape", async () => {
		const { eventBus } = await import("@/lib/event-bus");
		const events: any[] = [];
		eventBus.on("server-event", (e: any) => events.push(e));

		const result = eventBus.broadcast("task.created", { id: 1 });
		expect(result.type).toBe("task.created");
		expect(result.data).toEqual({ id: 1 });
		expect(result.timestamp).toBeGreaterThan(0);
		expect(events.length).toBeGreaterThan(0);
	});

	it("returns same instance on repeated import (singleton)", async () => {
		const { eventBus: a } = await import("@/lib/event-bus");
		const { eventBus: b } = await import("@/lib/event-bus");
		expect(a).toBe(b);
	});
});
