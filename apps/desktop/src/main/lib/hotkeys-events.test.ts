import { describe, expect, it } from "vitest";
import { EventEmitter } from "node:events";
import type { HotkeysStateChangedEvent } from "./hotkeys-events";
import { hotkeysEmitter } from "./hotkeys-events";

describe("hotkeys-events", () => {
	it("exports a singleton EventEmitter", () => {
		expect(hotkeysEmitter).toBeInstanceOf(EventEmitter);
	});

	it("emits hotkeys-state-changed payloads", () => {
		const events: HotkeysStateChangedEvent[] = [];
		hotkeysEmitter.once("hotkeys-state-changed", (event: HotkeysStateChangedEvent) => {
			events.push(event);
		});

		const event: HotkeysStateChangedEvent = {
			version: 2,
			updatedAt: "2026-03-25T12:00:00.000Z",
		};
		hotkeysEmitter.emit("hotkeys-state-changed", event);

		expect(events).toEqual([event]);
	});

	it("supports multiple listeners for the same event", () => {
		let count = 0;
		const handler = () => {
			count += 1;
		};
		hotkeysEmitter.on("hotkeys-state-changed", handler);
		hotkeysEmitter.on("hotkeys-state-changed", handler);
		hotkeysEmitter.emit("hotkeys-state-changed", {
			version: 1,
			updatedAt: "2026-03-25T12:00:00.000Z",
		});

		expect(count).toBe(2);
		hotkeysEmitter.off("hotkeys-state-changed", handler);
		hotkeysEmitter.off("hotkeys-state-changed", handler);
	});
});
