import fs from 'node:fs';
import path from 'node:path';

import { parseLunaBundle } from './luna-parser.js';
import type { ConflictReport, DiscoveredExtension, InstalledExtension } from './types.js';

export class ExtensionRegistry {
  scan(directory: string): DiscoveredExtension[] {
    if (!fs.existsSync(directory)) {
      return [];
    }

    const entries = fs.readdirSync(directory, { withFileTypes: true });
    const discovered: DiscoveredExtension[] = [];

    for (const entry of entries) {
      if (!entry.isFile() || !entry.name.endsWith('.luna')) {
        continue;
      }

      const filePath = path.join(directory, entry.name);
      try {
        const data = fs.readFileSync(filePath);
        const bundle = parseLunaBundle(data);
        discovered.push({ filePath, manifest: bundle.manifest });
      } catch {
        // skip unreadable or invalid .luna files
      }
    }

    return discovered;
  }

  resolveConflicts(extensions: readonly InstalledExtension[]): ConflictReport {
    const idCounts = new Map<string, number>();
    const versionsByid = new Map<string, Set<string>>();
    const permissionToIds = new Map<string, string[]>();

    for (const ext of extensions) {
      idCounts.set(ext.id, (idCounts.get(ext.id) ?? 0) + 1);

      const versions = versionsByid.get(ext.id) ?? new Set<string>();
      versions.add(ext.version);
      versionsByid.set(ext.id, versions);

      for (const perm of ext.permissions) {
        const ids = permissionToIds.get(perm) ?? [];
        ids.push(ext.id);
        permissionToIds.set(perm, ids);
      }
    }

    const duplicateIds = Array.from(idCounts.entries())
      .filter(([, count]) => count > 1)
      .map(([id]) => id);

    const versionConflicts = Array.from(versionsByid.entries())
      .filter(([id, versions]) => versions.size > 1 && !duplicateIds.includes(id))
      .map(([id, versions]) => ({ id, versions: Array.from(versions) }));

    const permissionOverlaps = Array.from(permissionToIds.entries())
      .filter(([, ids]) => ids.length > 1)
      .map(([permission, extensionIds]) => ({ permission, extensionIds }));

    const hasConflicts =
      duplicateIds.length > 0 || versionConflicts.length > 0 || permissionOverlaps.length > 0;

    return { duplicateIds, versionConflicts, permissionOverlaps, hasConflicts };
  }
}
