import { describe, expect, it } from 'bun:test';

import { LunaParseError, parseLunaBundle } from '../extensions/luna-parser.js';

function writeLunaBundle(manifest: object, assets: Array<[string, Buffer]> = []): Buffer {
  const parts: Buffer[] = [];

  // Magic
  parts.push(Buffer.from('LUNA'));

  // Version = 1
  const version = Buffer.allocUnsafe(4);
  version.writeUInt32LE(1, 0);
  parts.push(version);

  // Manifest
  const manifestJson = Buffer.from(JSON.stringify(manifest), 'utf8');
  const manifestLen = Buffer.allocUnsafe(4);
  manifestLen.writeUInt32LE(manifestJson.length, 0);
  parts.push(manifestLen);
  parts.push(manifestJson);

  // Asset count
  const assetCount = Buffer.allocUnsafe(4);
  assetCount.writeUInt32LE(assets.length, 0);
  parts.push(assetCount);

  for (const [name, data] of assets) {
    const nameBuf = Buffer.from(name, 'utf8');
    const nameLen = Buffer.allocUnsafe(4);
    nameLen.writeUInt32LE(nameBuf.length, 0);
    parts.push(nameLen);
    parts.push(nameBuf);

    const dataLen = Buffer.allocUnsafe(4);
    dataLen.writeUInt32LE(data.length, 0);
    parts.push(dataLen);
    parts.push(data);
  }

  return Buffer.concat(parts);
}

const validManifest = {
  id: 'test-ext',
  name: 'Test Extension',
  version: '1.0.0',
  description: 'A test extension',
  permissions: ['sessions.read'],
  activationEvents: ['onSession'],
};

describe('parseLunaBundle', () => {
  it('parses a valid bundle with no assets', () => {
    const data = writeLunaBundle(validManifest);
    const bundle = parseLunaBundle(data);

    expect(bundle.manifest.id).toBe('test-ext');
    expect(bundle.manifest.name).toBe('Test Extension');
    expect(bundle.manifest.version).toBe('1.0.0');
    expect(bundle.manifest.permissions).toEqual(['sessions.read']);
    expect(bundle.assets.size).toBe(0);
  });

  it('parses a bundle with assets', () => {
    const assetContent = Buffer.from('<h1>Panel</h1>', 'utf8');
    const data = writeLunaBundle(validManifest, [['ui/panel.html', assetContent]]);
    const bundle = parseLunaBundle(data);

    expect(bundle.assets.size).toBe(1);
    const asset = bundle.assets.get('ui/panel.html');
    expect(asset).toBeDefined();
    expect(asset!.toString('utf8')).toBe('<h1>Panel</h1>');
  });

  it('throws LunaParseError on bad magic bytes', () => {
    const data = Buffer.from('BADS\x01\x00\x00\x00bad data');
    expect(() => parseLunaBundle(data)).toThrow(LunaParseError);
    expect(() => parseLunaBundle(data)).toThrow('bad magic bytes');
  });

  it('throws LunaParseError on unsupported version', () => {
    const data = writeLunaBundle(validManifest);
    // Overwrite version bytes at offset 4 with version 99
    data.writeUInt32LE(99, 4);
    expect(() => parseLunaBundle(data)).toThrow(LunaParseError);
    expect(() => parseLunaBundle(data)).toThrow('unsupported');
  });

  it('throws LunaParseError on truncated data', () => {
    const data = writeLunaBundle(validManifest).subarray(0, 6);
    expect(() => parseLunaBundle(data)).toThrow(LunaParseError);
  });

  it('throws LunaParseError when manifest is not valid JSON', () => {
    const parts: Buffer[] = [Buffer.from('LUNA')];
    const version = Buffer.allocUnsafe(4);
    version.writeUInt32LE(1, 0);
    parts.push(version);

    const badManifest = Buffer.from('{not valid json}', 'utf8');
    const len = Buffer.allocUnsafe(4);
    len.writeUInt32LE(badManifest.length, 0);
    parts.push(len);
    parts.push(badManifest);

    expect(() => parseLunaBundle(Buffer.concat(parts))).toThrow(LunaParseError);
  });

  it('throws LunaParseError when manifest is missing required fields', () => {
    const badManifest = { id: 'ok', name: 'ok' }; // missing version, description, permissions
    const data = writeLunaBundle(badManifest);
    expect(() => parseLunaBundle(data)).toThrow(LunaParseError);
  });
});
