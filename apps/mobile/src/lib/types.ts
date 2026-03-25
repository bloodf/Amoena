/** A device paired with the desktop runtime. */
export type PairedDevice = {
  readonly id: string;
  readonly name: string;
  readonly lastSeen: string;
  readonly status: "online" | "offline" | "pairing";
};

/** User preferences for push notifications. */
export type NotificationPreferences = {
  readonly permissionRequests: boolean;
  readonly sessionStarted: boolean;
  readonly sessionCompleted: boolean;
  readonly costAlerts: boolean;
  readonly errorAlerts: boolean;
};

/** Color scheme for the mobile app. */
export type AppTheme = "dark" | "light" | "system";

/** Lightweight run summary cached on device for offline access. */
export type CachedRunSummary = {
  readonly sessionId: string;
  readonly workingDir: string;
  readonly status: "active" | "paused" | "completed" | "errored";
  readonly startedAt: string;
  readonly completedAt: string | null;
  readonly tokenUsage: number;
  readonly costUsd: number;
  readonly agentCount: number;
  readonly cachedAt: string;
};

/** WebSocket relay message envelope. */
export type RelayMessage = {
  readonly type: string;
  readonly payload: unknown;
  readonly timestamp: string;
  readonly sessionId?: string;
};

/** Connection state for the relay client. */
export type RelayConnectionState = "connecting" | "connected" | "disconnected" | "reconnecting";
