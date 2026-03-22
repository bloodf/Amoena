import { describe, it, expect } from "vitest";
import { parseLunaFile, validateManifest, type LunaManifest } from "./luna-parser.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const MAGIC = Buffer.from([0x4c, 0x55, 0x4e, 0x41]); // "LUNA"
const HEADER_SIZE = 9; // magic(4) + version(1) + manifest_length(4)

const MINIMAL_MANIFEST: LunaManifest = {
  name: "test-ext",
  version: "1.0.0",
  description: "A test extension",
  author: "Tester",
  permissions: [],
  hooks: [],
};

/**
 * Builds a valid .luna buffer from a manifest object and an optional asset
 * payload.
 */
function buildLunaBuffer(
  manifest: unknown = MINIMAL_MANIFEST,
  version = 1,
  assetPayload: Buffer = Buffer.alloc(0),
): Buffer {
  const manifestJson = JSON.stringify(manifest);
  const manifestBytes = Buffer.from(manifestJson, "utf8");

  const header = Buffer.alloc(HEADER_SIZE);
  MAGIC.copy(header, 0);
  header.writeUInt8(version, 4);
  header.writeUInt32BE(manifestBytes.length, 5);

  return Buffer.concat([header, manifestBytes, assetPayload]);
}

// ---------------------------------------------------------------------------
// Parsing valid files
// ---------------------------------------------------------------------------

describe("parseLunaFile — valid input", () => {
  it("parses a minimal valid .luna buffer without assets", () => {
    const buf = buildLunaBuffer();
    const ext = parseLunaFile(buf);
    expect(ext.version).toBe(1);
    expect(ext.manifest.name).toBe("test-ext");
    expect(ext.manifest.version).toBe("1.0.0");
    expect(ext.manifest.author).toBe("Tester");
    expect(ext.assets.size).toBe(0);
  });

  it("exposes asset bytes as asset_0 when payload follows the manifest", () => {
    const payload = Buffer.from("console.log('hello')", "utf8");
    const buf = buildLunaBuffer(MINIMAL_MANIFEST, 1, payload);
    const ext = parseLunaFile(buf);
    expect(ext.assets.has("asset_0")).toBe(true);
    expect(ext.assets.get("asset_0")).toEqual(payload);
  });

  it("preserves the version byte from the header", () => {
    const buf = buildLunaBuffer(MINIMAL_MANIFEST, 42);
    const ext = parseLunaFile(buf);
    expect(ext.version).toBe(42);
  });

  it("parses hooks declared in the manifest", () => {
    const manifest: LunaManifest = {
      ...MINIMAL_MANIFEST,
      hooks: [{ event: "onActivate", handler: "index.onActivate" }],
    };
    const buf = buildLunaBuffer(manifest);
    const ext = parseLunaFile(buf);
    expect(ext.manifest.hooks).toHaveLength(1);
    expect(ext.manifest.hooks[0].event).toBe("onActivate");
  });
});

// ---------------------------------------------------------------------------
// Invalid magic bytes
// ---------------------------------------------------------------------------

describe("parseLunaFile — invalid magic bytes", () => {
  it("throws when magic bytes do not spell LUNA", () => {
    const buf = buildLunaBuffer();
    // Overwrite the first byte
    buf.writeUInt8(0x00, 0);
    expect(() => parseLunaFile(buf)).toThrow(/Invalid magic bytes/);
  });

  it("throws when magic bytes are partially correct", () => {
    const buf = buildLunaBuffer();
    buf.writeUInt8(0x4c, 0); // L
    buf.writeUInt8(0x55, 1); // U
    buf.writeUInt8(0x00, 2); // wrong third byte
    expect(() => parseLunaFile(buf)).toThrow(/Invalid magic bytes/);
  });
});

// ---------------------------------------------------------------------------
// Truncated file
// ---------------------------------------------------------------------------

describe("parseLunaFile — truncated input", () => {
  it("throws when the buffer is shorter than the minimum header size", () => {
    const truncated = Buffer.from([0x4c, 0x55, 0x4e]); // only 3 bytes
    expect(() => parseLunaFile(truncated)).toThrow(/Buffer too short/);
  });

  it("throws when manifest_length claims more bytes than the buffer contains", () => {
    const buf = buildLunaBuffer();
    // Inflate the manifest_length field to an impossibly large value
    buf.writeUInt32BE(9999, 5);
    expect(() => parseLunaFile(buf)).toThrow(/Buffer truncated/);
  });
});

// ---------------------------------------------------------------------------
// Manifest validation (validateManifest)
// ---------------------------------------------------------------------------

describe("validateManifest", () => {
  it("returns valid: true for a well-formed manifest object", () => {
    const result = validateManifest(MINIMAL_MANIFEST);
    expect(result.valid).toBe(true);
  });

  it("returns valid: false with errors when name is missing", () => {
    const { name: _name, ...without } = MINIMAL_MANIFEST;
    const result = validateManifest(without);
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.errors.some((e) => /name/i.test(e))).toBe(true);
    }
  });

  it("returns valid: false with errors when author is an empty string", () => {
    const result = validateManifest({ ...MINIMAL_MANIFEST, author: "" });
    expect(result.valid).toBe(false);
  });

  it("returns valid: false when hooks contain an entry with empty event", () => {
    const result = validateManifest({
      ...MINIMAL_MANIFEST,
      hooks: [{ event: "", handler: "index.fn" }],
    });
    expect(result.valid).toBe(false);
  });

  it("returns valid: false when permissions is not an array", () => {
    const result = validateManifest({
      ...MINIMAL_MANIFEST,
      permissions: "read:files",
    });
    expect(result.valid).toBe(false);
  });
});
