/**
 * Parser for the .luna extension format.
 *
 * Binary layout:
 *   [0..3]   Magic bytes: 0x4C 0x55 0x4E 0x41  ("LUNA")
 *   [4]      Version (u8)
 *   [5..8]   Manifest length in bytes (u32, big-endian)
 *   [9..]    Manifest JSON (UTF-8, manifest_length bytes)
 *   [9+manifest_length..] Asset data (format defined by manifest)
 */

import { z } from "zod";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MAGIC = Buffer.from([0x4c, 0x55, 0x4e, 0x41]); // "LUNA"
const MAGIC_LENGTH = 4;
const VERSION_OFFSET = 4;
const MANIFEST_LENGTH_OFFSET = 5;
const MANIFEST_LENGTH_SIZE = 4; // u32
const HEADER_SIZE = MAGIC_LENGTH + 1 + MANIFEST_LENGTH_SIZE; // 9 bytes

// ---------------------------------------------------------------------------
// Zod schemas
// ---------------------------------------------------------------------------

const HookSchema = z.object({
  /** Lifecycle event name (e.g. "onActivate", "onMessage"). */
  event: z.string().min(1),
  /** Handler entry-point within the extension's asset bundle. */
  handler: z.string().min(1),
});

const LunaManifestSchema = z.object({
  name: z.string().min(1),
  version: z.string().min(1),
  description: z.string(),
  author: z.string().min(1),
  /** Declared permission scopes (e.g. ["read:files", "network"]). */
  permissions: z.array(z.string()),
  /** Lifecycle hooks registered by the extension. */
  hooks: z.array(HookSchema),
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Validated manifest extracted from a .luna file. */
export type LunaManifest = z.infer<typeof LunaManifestSchema>;

/** A fully parsed .luna extension. */
export interface LunaExtension {
  /** File format version byte. */
  readonly version: number;
  /** Validated manifest. */
  readonly manifest: LunaManifest;
  /**
   * Named asset blobs that follow the manifest in the file.
   * Keys are asset names declared in the manifest; values are raw buffers.
   * The parser preserves the raw blob for callers to interpret.
   */
  readonly assets: ReadonlyMap<string, Buffer>;
}

/** Outcome of a manifest validation check. */
export type ValidationResult =
  | { readonly valid: true }
  | { readonly valid: false; readonly errors: ReadonlyArray<string> };

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function readMagic(buffer: Buffer): void {
  if (buffer.length < HEADER_SIZE) {
    throw new Error(
      `Buffer too short: expected at least ${HEADER_SIZE} bytes, got ${buffer.length}.`,
    );
  }
  for (let i = 0; i < MAGIC.length; i++) {
    if (buffer[i] !== MAGIC[i]) {
      throw new Error(
        `Invalid magic bytes: expected "LUNA" (0x4C55 4E41), got 0x${buffer
          .subarray(0, 4)
          .toString("hex")
          .toUpperCase()}.`,
      );
    }
  }
}

function readVersion(buffer: Buffer): number {
  return buffer.readUInt8(VERSION_OFFSET);
}

function readManifestLength(buffer: Buffer): number {
  return buffer.readUInt32BE(MANIFEST_LENGTH_OFFSET);
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Parses a raw buffer in the .luna format and returns a `LunaExtension`.
 *
 * The manifest JSON is validated with Zod; any schema violation causes an
 * error to be thrown.  Assets are exposed as a map keyed by index
 * (`"asset_0"`, `"asset_1"`, …) since the binary format does not embed
 * asset names in the header — callers should cross-reference the manifest's
 * `hooks` or a dedicated asset table if present.
 *
 * @param buffer - Raw .luna file content.
 * @returns Parsed and validated `LunaExtension`.
 * @throws When magic bytes are missing, the buffer is truncated, or the
 *   manifest fails validation.
 *
 * @example
 * ```ts
 * import { readFileSync } from "fs";
 * const ext = parseLunaFile(readFileSync("my-extension.luna"));
 * console.log(ext.manifest.name, ext.version);
 * ```
 */
export function parseLunaFile(buffer: Buffer): LunaExtension {
  readMagic(buffer);

  const version = readVersion(buffer);
  const manifestLength = readManifestLength(buffer);

  const manifestEnd = HEADER_SIZE + manifestLength;
  if (buffer.length < manifestEnd) {
    throw new Error(
      `Buffer truncated: manifest_length claims ${manifestLength} bytes but only ${
        buffer.length - HEADER_SIZE
      } bytes remain after the header.`,
    );
  }

  const manifestJson = buffer.subarray(HEADER_SIZE, manifestEnd).toString("utf8");

  let rawManifest: unknown;
  try {
    rawManifest = JSON.parse(manifestJson);
  } catch (err) {
    throw new Error(`Failed to parse manifest JSON: ${(err as Error).message}`);
  }

  const parsed = LunaManifestSchema.safeParse(rawManifest);
  if (!parsed.success) {
    const messages = parsed.error.issues.map((e) => `${e.path.join(".")}: ${e.message}`);
    throw new Error(`Manifest validation failed:\n  ${messages.join("\n  ")}`);
  }

  // Treat remaining bytes as a single opaque asset blob for now.
  const assetBlob = buffer.subarray(manifestEnd);
  const assets = new Map<string, Buffer>();
  if (assetBlob.length > 0) {
    assets.set("asset_0", assetBlob);
  }

  return {
    version,
    manifest: parsed.data,
    assets,
  };
}

/**
 * Validates a plain object against the `LunaManifest` schema without parsing
 * a full .luna binary.  Useful when constructing manifests programmatically.
 *
 * @param manifest - Object to validate.
 * @returns `{ valid: true }` or `{ valid: false, errors }`.
 *
 * @example
 * ```ts
 * const result = validateManifest({ name: "", version: "1.0.0", ... });
 * if (!result.valid) console.error(result.errors);
 * ```
 */
export function validateManifest(manifest: unknown): ValidationResult {
  const result = LunaManifestSchema.safeParse(manifest);
  if (result.success) {
    return { valid: true };
  }
  const errors = result.error.issues.map(
    (e) => `${e.path.join(".") || "(root)"}: ${e.message}`,
  );
  return { valid: false, errors };
}
