/**
 * End-to-end encryption primitives for the remote-access module.
 *
 * Key exchange : X25519 ECDH  (Node.js `crypto.generateKeyPairSync`)
 * Encryption   : AES-256-GCM  (authenticated, nonce per message)
 *
 * Workflow:
 *   1. Each peer calls `generateKeyPair()`.
 *   2. Peers exchange their public keys out-of-band (e.g. during pairing).
 *   3. Each peer calls `deriveSharedSecret(myPrivate, theirPublic)`.
 *   4. Encrypt with `encrypt(plaintext, sharedSecret)`.
 *   5. Decrypt with `decrypt(payload, sharedSecret)`.
 */

import * as crypto from "node:crypto";
import type { EncryptedPayload } from "./types.js";

/** AES-GCM key length in bytes (256-bit). */
const KEY_LENGTH = 32;

/** AES-GCM nonce (IV) length in bytes. */
const NONCE_LENGTH = 12;

/** AES-GCM authentication tag length in bytes. */
const TAG_LENGTH = 16;

/**
 * Generates an X25519 key pair for ECDH key exchange.
 *
 * @returns An object containing the raw `publicKey` and `privateKey` bytes.
 */
export function generateKeyPair(): { publicKey: Uint8Array; privateKey: Uint8Array } {
  const { publicKey, privateKey } = crypto.generateKeyPairSync("x25519", {
    publicKeyEncoding: { type: "spki", format: "der" },
    privateKeyEncoding: { type: "pkcs8", format: "der" },
  });
  return { publicKey: new Uint8Array(publicKey), privateKey: new Uint8Array(privateKey) };
}

/**
 * Derives a 32-byte shared secret from an X25519 key pair using ECDH.
 *
 * @param myPrivate   - Raw DER-encoded PKCS8 private key bytes.
 * @param theirPublic - Raw DER-encoded SPKI public key bytes.
 * @returns A 32-byte shared secret suitable for use with AES-256-GCM.
 */
export function deriveSharedSecret(
  myPrivate: Uint8Array,
  theirPublic: Uint8Array,
): Uint8Array {
  const privateKey = crypto.createPrivateKey({
    key: Buffer.from(myPrivate),
    format: "der",
    type: "pkcs8",
  });
  const publicKey = crypto.createPublicKey({
    key: Buffer.from(theirPublic),
    format: "der",
    type: "spki",
  });

  const rawSecret = crypto.diffieHellman({ privateKey, publicKey });

  // Derive a fixed-length key via HKDF so the output is always KEY_LENGTH bytes.
  const derived = crypto.hkdfSync(
    "sha256",
    rawSecret,
    Buffer.alloc(0),
    Buffer.from("lunaria-remote-access-v1"),
    KEY_LENGTH,
  );

  return new Uint8Array(derived);
}

/**
 * Encrypts a UTF-8 string using AES-256-GCM.
 *
 * A fresh random nonce is generated for every call.
 *
 * @param data   - Plaintext string to encrypt.
 * @param secret - 32-byte shared secret from `deriveSharedSecret`.
 * @returns `EncryptedPayload` with base64-encoded nonce and ciphertext.
 *          The GCM auth tag is appended to the ciphertext before encoding.
 */
export function encrypt(data: string, secret: Uint8Array): EncryptedPayload {
  if (secret.length !== KEY_LENGTH) {
    throw new RangeError(`Secret must be ${KEY_LENGTH} bytes; got ${secret.length}.`);
  }

  const nonce = crypto.randomBytes(NONCE_LENGTH);
  const cipher = crypto.createCipheriv("aes-256-gcm", secret, nonce, {
    authTagLength: TAG_LENGTH,
  });

  const encrypted = Buffer.concat([
    cipher.update(data, "utf8"),
    cipher.final(),
    cipher.getAuthTag(),
  ]);

  return {
    nonce: nonce.toString("base64"),
    ciphertext: encrypted.toString("base64"),
  };
}

/**
 * Decrypts an `EncryptedPayload` using AES-256-GCM.
 *
 * Throws if authentication fails (tampered ciphertext or wrong key).
 *
 * @param payload - The encrypted payload produced by `encrypt`.
 * @param secret  - 32-byte shared secret from `deriveSharedSecret`.
 * @returns The original plaintext string.
 */
export function decrypt(payload: EncryptedPayload, secret: Uint8Array): string {
  if (secret.length !== KEY_LENGTH) {
    throw new RangeError(`Secret must be ${KEY_LENGTH} bytes; got ${secret.length}.`);
  }

  const nonce = Buffer.from(payload.nonce, "base64");
  const ciphertextWithTag = Buffer.from(payload.ciphertext, "base64");

  if (ciphertextWithTag.length < TAG_LENGTH) {
    throw new Error("Ciphertext is too short to contain an authentication tag.");
  }

  const tag = ciphertextWithTag.subarray(ciphertextWithTag.length - TAG_LENGTH);
  const ciphertext = ciphertextWithTag.subarray(0, ciphertextWithTag.length - TAG_LENGTH);

  const decipher = crypto.createDecipheriv("aes-256-gcm", secret, nonce, {
    authTagLength: TAG_LENGTH,
  });
  decipher.setAuthTag(tag);

  const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  return decrypted.toString("utf8");
}
