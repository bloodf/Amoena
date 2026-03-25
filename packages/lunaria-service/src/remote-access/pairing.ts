/**
 * PIN / QR code pairing for remote device authentication.
 *
 * Flow:
 *   1. Host calls `generatePairingCode()` → receives a 6-digit PIN and a QR
 *      data URL to display.
 *   2. Remote device submits the PIN via `verifyPairingCode(pin, deviceId)`.
 *   3. On success a short-lived session token is issued and the device is
 *      stored in the paired-devices map.
 *
 * PINs expire after {@link PIN_TTL_MS} milliseconds (default 5 minutes).
 */

import * as crypto from "node:crypto";
import type { PairingResult } from "./types.js";

/** Lifetime of a pairing PIN in milliseconds. */
const PIN_TTL_MS = 5 * 60 * 1_000;

/** Length of the generated session token in bytes (hex-encoded → 64 chars). */
const SESSION_TOKEN_BYTES = 32;

interface PendingPin {
  readonly pin: string;
  readonly expiresAt: number;
}

/** In-memory store: pin → metadata. */
const pendingPins = new Map<string, PendingPin>();

/** In-memory store: deviceId → sessionToken for paired devices. */
const pairedDevices = new Map<string, string>();

/**
 * Generates a 6-digit pairing PIN and a QR data URL containing the PIN.
 *
 * The QR `data:` URL encodes the plain PIN string as a minimal SVG-based
 * representation. In production you would use a QR library; here we embed
 * the PIN as human-readable text so the module has zero extra dependencies.
 *
 * @returns An object with the numeric `pin` string and a `qr` data URL.
 */
export function generatePairingCode(): { pin: string; qr: string } {
  // Remove any expired pins before adding a new one.
  pruneExpiredPins();

  const pin = generatePin();
  const expiresAt = Date.now() + PIN_TTL_MS;
  pendingPins.set(pin, { pin, expiresAt });

  const qr = buildQrDataUrl(pin);
  return { pin, qr };
}

/**
 * Verifies a submitted PIN and, on success, registers the device as paired.
 *
 * @param pin      - The 6-digit PIN submitted by the remote device.
 * @param deviceId - Stable identifier of the device attempting to pair.
 * @returns `PairingResult` with success flag and optional session token.
 */
export function verifyPairingCode(pin: string, deviceId: string): PairingResult {
  pruneExpiredPins();

  const entry = pendingPins.get(pin);
  if (entry === undefined) {
    return { success: false, error: "Invalid or expired pairing code." };
  }

  if (Date.now() > entry.expiresAt) {
    pendingPins.delete(pin);
    return { success: false, error: "Pairing code has expired." };
  }

  // Consume the PIN so it cannot be reused.
  pendingPins.delete(pin);

  const sessionToken = crypto.randomBytes(SESSION_TOKEN_BYTES).toString("hex");
  pairedDevices.set(deviceId, sessionToken);

  return { success: true, sessionToken };
}

/**
 * Returns all currently paired device IDs.
 */
export function getPairedDeviceIds(): ReadonlyArray<string> {
  return Array.from(pairedDevices.keys());
}

/**
 * Revokes pairing for a device, invalidating its session token.
 *
 * @param deviceId - The device to unpair.
 * @returns `true` if the device was paired and has been removed.
 */
export function revokeDevice(deviceId: string): boolean {
  return pairedDevices.delete(deviceId);
}

/**
 * Validates a session token for a given device.
 *
 * @param deviceId     - Device presenting the token.
 * @param sessionToken - Token to validate.
 * @returns `true` if the token matches the stored value.
 */
export function validateSessionToken(deviceId: string, sessionToken: string): boolean {
  const stored = pairedDevices.get(deviceId);
  if (stored === undefined) return false;
  // Constant-time comparison to prevent timing attacks.
  return crypto.timingSafeEqual(Buffer.from(stored), Buffer.from(sessionToken));
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/** Generates a cryptographically random 6-digit PIN string. */
function generatePin(): string {
  // Use rejection sampling to stay within [000000, 999999].
  while (true) {
    const value = crypto.randomInt(0, 1_000_000);
    return value.toString().padStart(6, "0");
  }
}

/** Removes all expired PINs from the pending map. */
function pruneExpiredPins(): void {
  const now = Date.now();
  for (const [pin, entry] of pendingPins.entries()) {
    if (now > entry.expiresAt) {
      pendingPins.delete(pin);
    }
  }
}

/**
 * Builds a minimal SVG-based data URL that displays the PIN as large text.
 * This acts as a placeholder for a real QR code library.
 */
function buildQrDataUrl(pin: string): string {
  const svg = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200">`,
    `  <rect width="200" height="200" fill="#fff"/>`,
    `  <text x="100" y="110" font-size="48" text-anchor="middle" font-family="monospace" fill="#000">${pin}</text>`,
    `  <text x="100" y="150" font-size="14" text-anchor="middle" font-family="sans-serif" fill="#555">Amoena pairing code</text>`,
    `</svg>`,
  ].join("\n");
  const encoded = Buffer.from(svg).toString("base64");
  return `data:image/svg+xml;base64,${encoded}`;
}
