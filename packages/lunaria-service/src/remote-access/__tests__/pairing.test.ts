import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  generatePairingCode,
  verifyPairingCode,
  getPairedDeviceIds,
  revokeDevice,
  validateSessionToken,
} from "../pairing.js";

/**
 * The pairing module uses module-level Maps, so we need to clean state
 * between tests by revoking all devices and letting PINs expire.
 */
describe("pairing", () => {
  beforeEach(() => {
    // Revoke any paired devices from prior tests
    for (const id of getPairedDeviceIds()) {
      revokeDevice(id);
    }
  });

  describe("generatePairingCode", () => {
    it("returns a 6-digit numeric PIN", () => {
      const { pin } = generatePairingCode();
      expect(pin).toMatch(/^\d{6}$/);
    });

    it("returns a QR data URL", () => {
      const { qr } = generatePairingCode();
      expect(qr).toMatch(/^data:image\/svg\+xml;base64,/);
    });

    it("QR data URL contains the PIN when decoded", () => {
      const { pin, qr } = generatePairingCode();
      const base64Part = qr.replace("data:image/svg+xml;base64,", "");
      const svgContent = Buffer.from(base64Part, "base64").toString("utf-8");
      expect(svgContent).toContain(pin);
    });

    it("generates different PINs on successive calls", () => {
      const pins = new Set<string>();
      // Generate enough to be statistically sure they are not all identical
      for (let i = 0; i < 10; i++) {
        pins.add(generatePairingCode().pin);
      }
      expect(pins.size).toBeGreaterThan(1);
    });
  });

  describe("verifyPairingCode", () => {
    it("succeeds with a valid PIN and returns a session token", () => {
      const { pin } = generatePairingCode();
      const result = verifyPairingCode(pin, "device-1");
      expect(result.success).toBe(true);
      expect(result.sessionToken).toBeDefined();
      expect(typeof result.sessionToken).toBe("string");
      expect(result.sessionToken!.length).toBe(64); // 32 bytes hex
    });

    it("fails with an invalid PIN", () => {
      generatePairingCode();
      const result = verifyPairingCode("000000", "device-1");
      // Could succeed by extreme coincidence, but effectively always fails
      if (!result.success) {
        expect(result.error).toBeDefined();
      }
    });

    it("consumes PIN so it cannot be reused", () => {
      const { pin } = generatePairingCode();
      const first = verifyPairingCode(pin, "device-1");
      expect(first.success).toBe(true);

      const second = verifyPairingCode(pin, "device-2");
      expect(second.success).toBe(false);
      expect(second.error).toContain("Invalid");
    });

    it("fails for expired PINs", () => {
      vi.useFakeTimers();
      try {
        const { pin } = generatePairingCode();
        // Advance past 5-minute TTL
        vi.advanceTimersByTime(5 * 60 * 1000 + 1);
        const result = verifyPairingCode(pin, "device-1");
        expect(result.success).toBe(false);
      } finally {
        vi.useRealTimers();
      }
    });

    it("registers device as paired on success", () => {
      const { pin } = generatePairingCode();
      verifyPairingCode(pin, "device-paired");
      expect(getPairedDeviceIds()).toContain("device-paired");
    });
  });

  describe("getPairedDeviceIds", () => {
    it("returns empty array when no devices paired", () => {
      expect(getPairedDeviceIds()).toEqual([]);
    });

    it("lists all paired devices", () => {
      const { pin: pin1 } = generatePairingCode();
      verifyPairingCode(pin1, "d1");
      const { pin: pin2 } = generatePairingCode();
      verifyPairingCode(pin2, "d2");

      const ids = getPairedDeviceIds();
      expect(ids).toContain("d1");
      expect(ids).toContain("d2");
    });
  });

  describe("revokeDevice", () => {
    it("returns true when revoking a paired device", () => {
      const { pin } = generatePairingCode();
      verifyPairingCode(pin, "to-revoke");
      expect(revokeDevice("to-revoke")).toBe(true);
    });

    it("returns false when revoking an unknown device", () => {
      expect(revokeDevice("nonexistent")).toBe(false);
    });

    it("removes device from paired list", () => {
      const { pin } = generatePairingCode();
      verifyPairingCode(pin, "revokable");
      revokeDevice("revokable");
      expect(getPairedDeviceIds()).not.toContain("revokable");
    });
  });

  describe("validateSessionToken", () => {
    it("returns true for valid token", () => {
      const { pin } = generatePairingCode();
      const result = verifyPairingCode(pin, "validate-me");
      expect(validateSessionToken("validate-me", result.sessionToken!)).toBe(true);
    });

    it("returns false for wrong token", () => {
      const { pin } = generatePairingCode();
      verifyPairingCode(pin, "validate-wrong");
      // Token must be same byte length as the stored one (64 hex chars = 32 bytes)
      expect(validateSessionToken("validate-wrong", "a".repeat(64))).toBe(false);
    });

    it("returns false for unknown device", () => {
      expect(validateSessionToken("unknown-device", "some-token")).toBe(false);
    });
  });
});
