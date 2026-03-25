/**
 * Auto-updater module for the Lunaria desktop app.
 *
 * Uses @tauri-apps/plugin-updater to check for, download, and install updates.
 * The Tauri updater plugin is already registered on the Rust side (lib.rs).
 * This module provides the frontend integration with IPC-style event handling.
 */

import { check, type Update } from '@tauri-apps/plugin-updater';

/** Interval between automatic update checks (4 hours in milliseconds). */
const CHECK_INTERVAL_MS = 4 * 60 * 60 * 1000;

/** Possible states for the updater lifecycle. */
export type UpdaterStatus =
  | 'idle'
  | 'checking'
  | 'available'
  | 'downloading'
  | 'ready'
  | 'error'
  | 'up-to-date';

/** Snapshot of the current update state, suitable for rendering in the UI. */
export interface UpdateState {
  readonly status: UpdaterStatus;
  readonly currentVersion: string | null;
  readonly availableVersion: string | null;
  readonly changelog: string | null;
  readonly downloadProgress: number;
  readonly error: string | null;
}

/** Callback signature for state-change listeners. */
export type UpdateListener = (state: UpdateState) => void;

const INITIAL_STATE: UpdateState = {
  status: 'idle',
  currentVersion: null,
  availableVersion: null,
  changelog: null,
  downloadProgress: 0,
  error: null,
};

/**
 * Creates an immutable copy of the update state with the given overrides.
 */
function withState(base: UpdateState, overrides: Partial<UpdateState>): UpdateState {
  return { ...base, ...overrides };
}

/**
 * AutoUpdater manages the full update lifecycle:
 *   1. Check for updates on startup and every 4 hours.
 *   2. Notify listeners when an update is available (with changelog).
 *   3. Download the update in the background, reporting progress.
 *   4. Install on user-initiated quit (quitAndInstall).
 *
 * Usage from React:
 *   const updater = createAutoUpdater();
 *   updater.subscribe((state) => setState(state));
 *   updater.start();
 *   // Later: updater.installAndRestart();
 */
export interface AutoUpdater {
  /** Start periodic update checks. Runs an immediate check first. */
  start(): void;

  /** Stop periodic update checks and clean up. */
  stop(): void;

  /** Manually trigger an update check. */
  checkNow(): Promise<void>;

  /** Download the available update. No-op if no update is available. */
  downloadUpdate(): Promise<void>;

  /** Install the downloaded update and restart the app. */
  installAndRestart(): Promise<void>;

  /** Subscribe to state changes. Returns an unsubscribe function. */
  subscribe(listener: UpdateListener): () => void;

  /** Get the current state snapshot (read-only). */
  getState(): UpdateState;
}

/**
 * Factory function that creates an AutoUpdater instance.
 * Follows immutable patterns — every state change produces a new object.
 */
export function createAutoUpdater(): AutoUpdater {
  let state: UpdateState = { ...INITIAL_STATE };
  let intervalId: ReturnType<typeof setInterval> | null = null;
  let pendingUpdate: Update | null = null;
  const listeners = new Set<UpdateListener>();

  function notify(nextState: UpdateState): void {
    state = nextState;
    for (const listener of listeners) {
      try {
        listener(state);
      } catch {
        // Swallow listener errors to avoid breaking the update loop.
      }
    }
  }

  async function performCheck(): Promise<void> {
    notify(withState(state, { status: 'checking', error: null }));

    try {
      const update = await check();

      if (update === null) {
        notify(withState(state, { status: 'up-to-date' }));
        return;
      }

      pendingUpdate = update;
      notify(
        withState(state, {
          status: 'available',
          availableVersion: update.version,
          changelog: update.body ?? null,
        }),
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown update error';
      notify(withState(state, { status: 'error', error: message }));
    }
  }

  async function downloadUpdate(): Promise<void> {
    if (pendingUpdate === null) {
      return;
    }

    notify(withState(state, { status: 'downloading', downloadProgress: 0 }));

    try {
      let totalBytes = 0;
      let downloadedBytes = 0;

      await pendingUpdate.downloadAndInstall((event) => {
        if (event.event === 'Started' && event.data.contentLength) {
          totalBytes = event.data.contentLength;
        } else if (event.event === 'Progress') {
          downloadedBytes += event.data.chunkLength;
          const progress = totalBytes > 0 ? Math.round((downloadedBytes / totalBytes) * 100) : 0;
          notify(withState(state, { downloadProgress: progress }));
        } else if (event.event === 'Finished') {
          notify(
            withState(state, {
              status: 'ready',
              downloadProgress: 100,
            }),
          );
        }
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Download failed';
      notify(withState(state, { status: 'error', error: message }));
    }
  }

  async function installAndRestart(): Promise<void> {
    // Tauri's downloadAndInstall already stages the update.
    // Relaunch the app to apply.
    const { relaunch } = await import('@tauri-apps/plugin-process');
    await relaunch();
  }

  function start(): void {
    // Run an immediate check, then schedule periodic checks.
    void performCheck();
    intervalId = setInterval(() => {
      void performCheck();
    }, CHECK_INTERVAL_MS);
  }

  function stop(): void {
    if (intervalId !== null) {
      clearInterval(intervalId);
      intervalId = null;
    }
  }

  function subscribe(listener: UpdateListener): () => void {
    listeners.add(listener);
    // Immediately send current state to new subscriber.
    listener(state);
    return () => {
      listeners.delete(listener);
    };
  }

  function getState(): UpdateState {
    return state;
  }

  return {
    start,
    stop,
    checkNow: performCheck,
    downloadUpdate,
    installAndRestart,
    subscribe,
    getState,
  };
}
