import type { SettingsStore } from './settings-store.js';

/**
 * On first launch, seed the store with defaults.
 * Only sets values that don't already exist to preserve user customisations.
 */
export function migrateFromDefaults(store: SettingsStore, defaults: Record<string, unknown>): void {
  for (const [key, value] of Object.entries(defaults)) {
    const existing = store.get(key, 'global');
    if (existing === undefined) {
      store.set(key, value, 'global');
    }
  }
}
