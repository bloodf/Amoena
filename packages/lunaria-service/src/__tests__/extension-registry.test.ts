import { describe, expect, it, beforeEach, afterEach } from 'bun:test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { ExtensionRegistry } from '../extensions/extension-registry.js';
import type { InstalledExtension } from '../extensions/types.js';

function writeLunaBundle(filePath: string, id: string, version = '1.0.0'): void {
  const manifest = {
    id,
    name: `${id} Extension`,
    version,
    description: 'test extension',
    permissions: ['sessions.read'],
    activationEvents: ['onSession'],
  };

  const parts: Buffer[] = [];
  parts.push(Buffer.from('LUNA'));
  const ver = Buffer.allocUnsafe(4);
  ver.writeUInt32LE(1, 0);
  parts.push(ver);

  const manifestJson = Buffer.from(JSON.stringify(manifest), 'utf8');
  const mLen = Buffer.allocUnsafe(4);
  mLen.writeUInt32LE(manifestJson.length, 0);
  parts.push(mLen);
  parts.push(manifestJson);

  const assetCount = Buffer.allocUnsafe(4);
  assetCount.writeUInt32LE(0, 0);
  parts.push(assetCount);

  fs.writeFileSync(filePath, Buffer.concat(parts));
}

function makeInstalled(
  id: string,
  version: string,
  permissions: string[] = [],
): InstalledExtension {
  return {
    id,
    name: id,
    version,
    author: 'test',
    description: 'test',
    permissions,
    hooks: [],
    enabled: true,
    installedAt: Date.now(),
    assetsPath: `/tmp/${id}.luna`,
  };
}

describe('ExtensionRegistry', () => {
  let tmpDir: string;
  const registry = new ExtensionRegistry();

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'amoena-registry-test-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  describe('scan', () => {
    it('returns empty array for an empty directory', () => {
      expect(registry.scan(tmpDir)).toEqual([]);
    });

    it('returns empty array for a non-existent directory', () => {
      expect(registry.scan('/tmp/does-not-exist-amoena-test')).toEqual([]);
    });

    it('discovers .luna files in directory', () => {
      writeLunaBundle(path.join(tmpDir, 'ext-a.luna'), 'ext-a');
      writeLunaBundle(path.join(tmpDir, 'ext-b.luna'), 'ext-b');

      const discovered = registry.scan(tmpDir);
      const ids = discovered.map((d) => d.manifest.id);
      expect(ids).toContain('ext-a');
      expect(ids).toContain('ext-b');
    });

    it('skips non-.luna files', () => {
      fs.writeFileSync(path.join(tmpDir, 'readme.txt'), 'not a luna file');
      writeLunaBundle(path.join(tmpDir, 'real.luna'), 'real-ext');

      const discovered = registry.scan(tmpDir);
      expect(discovered).toHaveLength(1);
    });

    it('skips unreadable or invalid .luna files without throwing', () => {
      fs.writeFileSync(path.join(tmpDir, 'bad.luna'), 'BADS invalid content');
      writeLunaBundle(path.join(tmpDir, 'good.luna'), 'good-ext');

      const discovered = registry.scan(tmpDir);
      expect(discovered).toHaveLength(1);
      expect(discovered[0]!.manifest.id).toBe('good-ext');
    });
  });

  describe('resolveConflicts', () => {
    it('reports no conflicts for unique extensions', () => {
      const extensions = [
        makeInstalled('ext-a', '1.0.0', ['sessions.read']),
        makeInstalled('ext-b', '2.0.0', ['memory.read']),
      ];
      const report = registry.resolveConflicts(extensions);
      expect(report.hasConflicts).toBe(false);
      expect(report.duplicateIds).toHaveLength(0);
    });

    it('detects duplicate IDs', () => {
      const extensions = [makeInstalled('ext-a', '1.0.0'), makeInstalled('ext-a', '1.0.0')];
      const report = registry.resolveConflicts(extensions);
      expect(report.hasConflicts).toBe(true);
      expect(report.duplicateIds).toContain('ext-a');
    });

    it('detects permission overlaps', () => {
      const extensions = [
        makeInstalled('ext-a', '1.0.0', ['ui.panel']),
        makeInstalled('ext-b', '1.0.0', ['ui.panel']),
      ];
      const report = registry.resolveConflicts(extensions);
      expect(report.hasConflicts).toBe(true);
      const overlap = report.permissionOverlaps.find((p) => p.permission === 'ui.panel');
      expect(overlap).toBeDefined();
      expect(overlap!.extensionIds).toContain('ext-a');
      expect(overlap!.extensionIds).toContain('ext-b');
    });

    it('handles empty extension list', () => {
      const report = registry.resolveConflicts([]);
      expect(report.hasConflicts).toBe(false);
    });
  });
});
