/**
 * AsyncStorage wrapper for pairing tokens, preferences, and cached run history.
 *
 * Uses expo-secure-store for sensitive data (pairing tokens) and a simple
 * JSON-based in-memory cache with persistence for non-sensitive preferences.
 */

import * as SecureStore from "expo-secure-store";

// ─── Keys ────────────────────────────────────────────────────────────────────

const KEYS = {
  pairingToken: "amoena.mobile.pairingToken",
  preferences: "amoena.mobile.preferences",
  cachedRuns: "amoena.mobile.cachedRuns",
  pairedDevices: "amoena.mobile.pairedDevices",
} as const;

// ─── Types ───────────────────────────────────────────────────────────────────

export type PairedDevice = {
  readonly deviceId: string;
  readonly deviceName: string;
  readonly baseUrl: string;
  readonly lastSeen: string;
  readonly pairedAt: string;
};

export type AppPreferences = {
  readonly notificationsEnabled: boolean;
  readonly darkMode: boolean;
  readonly costAlertThreshold: number;
};

export type CachedRunSummary = {
  readonly goalId: string;
  readonly description: string;
  readonly status: string;
  readonly startedAt: number;
  readonly completedAt?: number;
  readonly totalCostUsd?: number;
  readonly taskCount?: number;
};

// ─── Defaults ────────────────────────────────────────────────────────────────

const DEFAULT_PREFERENCES: AppPreferences = {
  notificationsEnabled: true,
  darkMode: true,
  costAlertThreshold: 1.0,
};

// ─── Secure storage (pairing tokens) ────────────────────────────────────────

export async function savePairingToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(KEYS.pairingToken, token);
}

export async function loadPairingToken(): Promise<string | null> {
  return SecureStore.getItemAsync(KEYS.pairingToken);
}

export async function clearPairingToken(): Promise<void> {
  await SecureStore.deleteItemAsync(KEYS.pairingToken);
}

// ─── Preferences ─────────────────────────────────────────────────────────────

export async function loadPreferences(): Promise<AppPreferences> {
  const raw = await SecureStore.getItemAsync(KEYS.preferences);
  if (!raw) return DEFAULT_PREFERENCES;
  try {
    return { ...DEFAULT_PREFERENCES, ...JSON.parse(raw) } as AppPreferences;
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

export async function savePreferences(
  preferences: AppPreferences,
): Promise<void> {
  await SecureStore.setItemAsync(KEYS.preferences, JSON.stringify(preferences));
}

// ─── Paired devices ──────────────────────────────────────────────────────────

export async function loadPairedDevices(): Promise<readonly PairedDevice[]> {
  const raw = await SecureStore.getItemAsync(KEYS.pairedDevices);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as PairedDevice[];
  } catch {
    return [];
  }
}

export async function savePairedDevices(
  devices: readonly PairedDevice[],
): Promise<void> {
  await SecureStore.setItemAsync(KEYS.pairedDevices, JSON.stringify(devices));
}

export async function addPairedDevice(device: PairedDevice): Promise<void> {
  const existing = await loadPairedDevices();
  const filtered = existing.filter((d) => d.deviceId !== device.deviceId);
  await savePairedDevices([...filtered, device]);
}

export async function removePairedDevice(deviceId: string): Promise<void> {
  const existing = await loadPairedDevices();
  await savePairedDevices(existing.filter((d) => d.deviceId !== deviceId));
}

// ─── Cached run history ──────────────────────────────────────────────────────

const MAX_CACHED_RUNS = 100;

export async function loadCachedRuns(): Promise<readonly CachedRunSummary[]> {
  const raw = await SecureStore.getItemAsync(KEYS.cachedRuns);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as CachedRunSummary[];
  } catch {
    return [];
  }
}

export async function saveCachedRuns(
  runs: readonly CachedRunSummary[],
): Promise<void> {
  const trimmed = runs.slice(0, MAX_CACHED_RUNS);
  await SecureStore.setItemAsync(KEYS.cachedRuns, JSON.stringify(trimmed));
}

export async function appendCachedRun(
  run: CachedRunSummary,
): Promise<void> {
  const existing = await loadCachedRuns();
  const filtered = existing.filter((r) => r.goalId !== run.goalId);
  await saveCachedRuns([run, ...filtered]);
}

export async function clearCachedRuns(): Promise<void> {
  await SecureStore.deleteItemAsync(KEYS.cachedRuns);
}
