import { describe, expect, it } from "vitest";
import { decrypt, encrypt } from "./crypto-storage";

describe("crypto-storage", () => {
	describe("encrypt / decrypt round-trip", () => {
		it("encrypts and decrypts a simple string", () => {
			const plaintext = "hello world";
			const encrypted = encrypt(plaintext);
			expect(decrypt(encrypted)).toBe(plaintext);
		});

		it("encrypts and decrypts a short string", () => {
			const plaintext = "x";
			const encrypted = encrypt(plaintext);
			expect(decrypt(encrypted)).toBe(plaintext);
		});

		it("encrypts and decrypts JSON data", () => {
			const json = JSON.stringify({ token: "abc123", expiresAt: "2025-01-01" });
			const encrypted = encrypt(json);
			expect(decrypt(encrypted)).toBe(json);
		});

		it("encrypts and decrypts unicode content", () => {
			const plaintext = "Hello, \u4e16\u754c! \ud83c\udf0d";
			const encrypted = encrypt(plaintext);
			expect(decrypt(encrypted)).toBe(plaintext);
		});

		it("produces different ciphertext for the same plaintext (random IV/salt)", () => {
			const plaintext = "determinism test";
			const a = encrypt(plaintext);
			const b = encrypt(plaintext);
			expect(a.equals(b)).toBe(false);
		});
	});

	describe("decrypt validation", () => {
		it("throws on data that is too short", () => {
			const tooShort = Buffer.alloc(10);
			expect(() => decrypt(tooShort)).toThrow("Encrypted data too short");
		});

		it("throws on tampered ciphertext", () => {
			const encrypted = encrypt("secret data");
			// Flip a byte in the ciphertext region (after salt+iv+authTag = 44 bytes)
			if (encrypted.length > 45) {
				encrypted[45] = encrypted[45] ^ 0xff;
			}
			expect(() => decrypt(encrypted)).toThrow();
		});

		it("throws on tampered auth tag", () => {
			const encrypted = encrypt("secret data");
			// Auth tag starts at offset 28 (salt=16 + iv=12)
			encrypted[28] = encrypted[28] ^ 0xff;
			expect(() => decrypt(encrypted)).toThrow();
		});
	});

	describe("encrypt output format", () => {
		it("returns a Buffer", () => {
			const result = encrypt("test");
			expect(Buffer.isBuffer(result)).toBe(true);
		});

		it("output is longer than salt+iv+authTag minimum (45 bytes)", () => {
			const result = encrypt("x");
			// salt(16) + iv(12) + authTag(16) + at least 1 byte ciphertext
			expect(result.length).toBeGreaterThanOrEqual(45);
		});
	});
});
