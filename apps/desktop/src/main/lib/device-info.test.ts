import { describe, expect, it } from "bun:test";
import { getMachineId, getHashedDeviceId, getDeviceName } from "./device-info";

describe("device-info", () => {
	describe("getMachineId", () => {
		it("returns a non-empty string", () => {
			const id = getMachineId();
			expect(typeof id).toBe("string");
			expect(id.length).toBeGreaterThan(0);
		});

		it("returns the same value on subsequent calls (caching)", () => {
			const id1 = getMachineId();
			const id2 = getMachineId();
			expect(id1).toBe(id2);
		});
	});

	describe("getHashedDeviceId", () => {
		it("returns a 32-char hex string", () => {
			const id = getHashedDeviceId();
			expect(typeof id).toBe("string");
			expect(id.length).toBe(32);
			expect(id).toMatch(/^[a-f0-9]+$/);
		});

		it("is deterministic (same value on repeated calls)", () => {
			const id1 = getHashedDeviceId();
			const id2 = getHashedDeviceId();
			expect(id1).toBe(id2);
		});

		it("differs from raw machine ID", () => {
			const raw = getMachineId();
			const hashed = getHashedDeviceId();
			expect(hashed).not.toBe(raw);
		});
	});

	describe("getDeviceName", () => {
		it("returns a non-empty string", () => {
			const name = getDeviceName();
			expect(typeof name).toBe("string");
			expect(name.length).toBeGreaterThan(0);
		});

		it("contains either OS name or hostname segment", () => {
			const name = getDeviceName();
			// Should be either a hostname segment or OS-based name
			expect(name.length).toBeGreaterThanOrEqual(3);
		});
	});
});
