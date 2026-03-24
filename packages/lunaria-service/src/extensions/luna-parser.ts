import type { LunaManifest } from './types.js';

const MAGIC = Buffer.from('LUNA');
const FORMAT_VERSION = 1;

export interface ParsedLunaBundle {
  readonly manifest: LunaManifest;
  readonly assets: ReadonlyMap<string, Buffer>;
}

export class LunaParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'LunaParseError';
  }
}

export function parseLunaBundle(data: Buffer): ParsedLunaBundle {
  let offset = 0;

  function readBytes(n: number): Buffer {
    if (offset + n > data.length) {
      throw new LunaParseError(`unexpected end of data reading ${n} bytes at offset ${offset}`);
    }
    const slice = data.subarray(offset, offset + n);
    offset += n;
    return Buffer.from(slice);
  }

  function readU32(): number {
    const bytes = readBytes(4);
    return bytes.readUInt32LE(0);
  }

  function readLengthPrefixedBytes(): Buffer {
    const len = readU32();
    return readBytes(len);
  }

  // Magic
  const magic = readBytes(4);
  if (!magic.equals(MAGIC)) {
    throw new LunaParseError('invalid .luna file: bad magic bytes');
  }

  // Version
  const version = readU32();
  if (version !== FORMAT_VERSION) {
    throw new LunaParseError(`unsupported .luna format version: ${version}`);
  }

  // Manifest
  const manifestBytes = readLengthPrefixedBytes();
  let manifest: LunaManifest;
  try {
    manifest = JSON.parse(manifestBytes.toString('utf8')) as LunaManifest;
  } catch {
    throw new LunaParseError('failed to parse extension manifest JSON');
  }

  validateManifestShape(manifest);

  // Assets
  const assetCount = readU32();
  const assets = new Map<string, Buffer>();

  for (let i = 0; i < assetCount; i++) {
    const nameBuf = readLengthPrefixedBytes();
    const name = nameBuf.toString('utf8');
    const assetData = readLengthPrefixedBytes();
    assets.set(name, assetData);
  }

  return { manifest, assets };
}

function validateManifestShape(value: unknown): asserts value is LunaManifest {
  if (typeof value !== 'object' || value === null) {
    throw new LunaParseError('manifest must be a JSON object');
  }

  const obj = value as Record<string, unknown>;

  const requiredStrings = ['id', 'name', 'version', 'description'] as const;
  for (const field of requiredStrings) {
    if (typeof obj[field] !== 'string' || (obj[field] as string).trim() === '') {
      throw new LunaParseError(`manifest missing required string field: ${field}`);
    }
  }

  if (!Array.isArray(obj['permissions'])) {
    throw new LunaParseError('manifest.permissions must be an array');
  }
}
