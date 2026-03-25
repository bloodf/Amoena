import { describe, expect, it } from "bun:test";
import { EventEmitter } from "node:events";
import type { OpenSettingsEvent, OpenWorkspaceEvent, SettingsSection } from "./menu-events";
import { menuEmitter } from "./menu-events";

describe("menu-events", () => {
	it("exports a singleton EventEmitter", () => {
		expect(menuEmitter).toBeInstanceOf(EventEmitter);
	});

	it("emits open-settings payloads", () => {
		const received: OpenSettingsEvent[] = [];
		menuEmitter.once("open-settings", (event: OpenSettingsEvent) => {
			received.push(event);
		});

		const section: SettingsSection = "keyboard";
		menuEmitter.emit("open-settings", { section });

		expect(received).toEqual([{ section: "keyboard" }]);
	});

	it("emits open-workspace payloads", () => {
		const received: OpenWorkspaceEvent[] = [];
		menuEmitter.once("open-workspace", (event: OpenWorkspaceEvent) => {
			received.push(event);
		});

		menuEmitter.emit("open-workspace", { workspaceId: "workspace-123" });

		expect(received).toEqual([{ workspaceId: "workspace-123" }]);
	});

	it("allows listeners to be removed cleanly", () => {
		const handler = () => {};
		menuEmitter.on("open-settings", handler);
		expect(menuEmitter.listenerCount("open-settings")).toBeGreaterThan(0);
		menuEmitter.off("open-settings", handler);
		expect(menuEmitter.listenerCount("open-settings")).toBe(0);
	});
});
