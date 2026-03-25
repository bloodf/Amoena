import { describe, it, expect } from "vitest";
import { generateKeyPair, deriveSharedSecret, encrypt, decrypt } from "../encryption.js";

describe("encryption", () => {
  describe("generateKeyPair", () => {
    it("returns publicKey and privateKey as Uint8Array", () => {
      const pair = generateKeyPair();
      expect(pair.publicKey).toBeInstanceOf(Uint8Array);
      expect(pair.privateKey).toBeInstanceOf(Uint8Array);
    });

    it("generates unique key pairs on each call", () => {
      const a = generateKeyPair();
      const b = generateKeyPair();
      expect(Buffer.from(a.publicKey).equals(Buffer.from(b.publicKey))).toBe(false);
      expect(Buffer.from(a.privateKey).equals(Buffer.from(b.privateKey))).toBe(false);
    });

    it("public and private keys have non-zero length", () => {
      const pair = generateKeyPair();
      expect(pair.publicKey.length).toBeGreaterThan(0);
      expect(pair.privateKey.length).toBeGreaterThan(0);
    });
  });

  describe("deriveSharedSecret", () => {
    it("produces a 32-byte shared secret", () => {
      const alice = generateKeyPair();
      const bob = generateKeyPair();
      const secret = deriveSharedSecret(alice.privateKey, bob.publicKey);
      expect(secret).toBeInstanceOf(Uint8Array);
      expect(secret.length).toBe(32);
    });

    it("both peers derive the same shared secret", () => {
      const alice = generateKeyPair();
      const bob = generateKeyPair();
      const secretAlice = deriveSharedSecret(alice.privateKey, bob.publicKey);
      const secretBob = deriveSharedSecret(bob.privateKey, alice.publicKey);
      expect(Buffer.from(secretAlice).equals(Buffer.from(secretBob))).toBe(true);
    });

    it("different peer pairs produce different secrets", () => {
      const alice = generateKeyPair();
      const bob = generateKeyPair();
      const charlie = generateKeyPair();
      const secretAB = deriveSharedSecret(alice.privateKey, bob.publicKey);
      const secretAC = deriveSharedSecret(alice.privateKey, charlie.publicKey);
      expect(Buffer.from(secretAB).equals(Buffer.from(secretAC))).toBe(false);
    });
  });

  describe("encrypt / decrypt round-trip", () => {
    it("encrypts and decrypts a string correctly", () => {
      const alice = generateKeyPair();
      const bob = generateKeyPair();
      const secret = deriveSharedSecret(alice.privateKey, bob.publicKey);

      const plaintext = "Hello, Amoena!";
      const payload = encrypt(plaintext, secret);
      const decrypted = decrypt(payload, secret);
      expect(decrypted).toBe(plaintext);
    });

    it("encrypts and decrypts empty string", () => {
      const alice = generateKeyPair();
      const bob = generateKeyPair();
      const secret = deriveSharedSecret(alice.privateKey, bob.publicKey);

      const payload = encrypt("", secret);
      const decrypted = decrypt(payload, secret);
      expect(decrypted).toBe("");
    });

    it("encrypts and decrypts unicode content", () => {
      const alice = generateKeyPair();
      const bob = generateKeyPair();
      const secret = deriveSharedSecret(alice.privateKey, bob.publicKey);

      const plaintext = "Olá mundo! 日本語テスト 🌍";
      const payload = encrypt(plaintext, secret);
      const decrypted = decrypt(payload, secret);
      expect(decrypted).toBe(plaintext);
    });

    it("produces different ciphertexts for same plaintext (unique nonce)", () => {
      const alice = generateKeyPair();
      const bob = generateKeyPair();
      const secret = deriveSharedSecret(alice.privateKey, bob.publicKey);

      const p1 = encrypt("same", secret);
      const p2 = encrypt("same", secret);
      expect(p1.ciphertext).not.toBe(p2.ciphertext);
      expect(p1.nonce).not.toBe(p2.nonce);
    });

    it("payload contains base64-encoded nonce and ciphertext", () => {
      const alice = generateKeyPair();
      const bob = generateKeyPair();
      const secret = deriveSharedSecret(alice.privateKey, bob.publicKey);

      const payload = encrypt("test", secret);
      expect(typeof payload.nonce).toBe("string");
      expect(typeof payload.ciphertext).toBe("string");
      // Validate base64: should not throw
      expect(() => Buffer.from(payload.nonce, "base64")).not.toThrow();
      expect(() => Buffer.from(payload.ciphertext, "base64")).not.toThrow();
    });
  });

  describe("encrypt validation", () => {
    it("throws RangeError when secret is wrong length", () => {
      const shortSecret = new Uint8Array(16);
      expect(() => encrypt("test", shortSecret)).toThrow(RangeError);
    });
  });

  describe("decrypt validation", () => {
    it("throws RangeError when secret is wrong length", () => {
      const payload = { nonce: "AAAA", ciphertext: "AAAAAAAAAAAAAAAAAAAAAA==" };
      const shortSecret = new Uint8Array(16);
      expect(() => decrypt(payload, shortSecret)).toThrow(RangeError);
    });

    it("throws when ciphertext is too short for auth tag", () => {
      const secret = new Uint8Array(32);
      const payload = { nonce: Buffer.alloc(12).toString("base64"), ciphertext: Buffer.alloc(5).toString("base64") };
      expect(() => decrypt(payload, secret)).toThrow("too short");
    });

    it("throws on tampered ciphertext", () => {
      const alice = generateKeyPair();
      const bob = generateKeyPair();
      const secret = deriveSharedSecret(alice.privateKey, bob.publicKey);

      const payload = encrypt("test data", secret);
      const tampered = Buffer.from(payload.ciphertext, "base64");
      tampered[0] = (tampered[0]! ^ 0xff);
      const tamperedPayload = { ...payload, ciphertext: tampered.toString("base64") };

      expect(() => decrypt(tamperedPayload, secret)).toThrow();
    });

    it("throws with wrong key", () => {
      const alice = generateKeyPair();
      const bob = generateKeyPair();
      const charlie = generateKeyPair();
      const secretAB = deriveSharedSecret(alice.privateKey, bob.publicKey);
      const secretAC = deriveSharedSecret(alice.privateKey, charlie.publicKey);

      const payload = encrypt("secret message", secretAB);
      expect(() => decrypt(payload, secretAC)).toThrow();
    });
  });
});
