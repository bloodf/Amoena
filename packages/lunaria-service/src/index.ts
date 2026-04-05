export * from './orchestration/cli-adapters/index.js';
export * from './usage-telemetry/index.js';
export * from './remote-access/index.js';
export * from './session-replay/cleanup.js';

import type { SettingsStore } from './settings/settings-store.js';
import { getReplayRetentionMs, runReplayCleanup } from './session-replay/cleanup.js';

/**
 * Initialize replay cleanup with settings store.
 * Call this after the service is fully initialized with a database.
 * Runs cleanup once with the configured retention period.
 */
export function initReplayCleanup(store: SettingsStore): void {
  const retentionMs = getReplayRetentionMs(store);
  runReplayCleanup({ retentionMs, verbose: false }).catch((err: unknown) => {
    process.stderr.write(`[session-replay] startup cleanup failed: ${err}\n`);
  });
}

// Run cleanup once at startup (non-blocking) with default retention
// When initReplayCleanup is called later, it will use the configured retention
runReplayCleanup({ verbose: false }).catch((err: unknown) => {
  process.stderr.write(`[session-replay] startup cleanup failed: ${err}\n`);
});
