/** Default relay server URL for WebSocket connections. */
export const DEFAULT_RELAY_URL = "wss://relay.amoena.dev";

/** Reconnection backoff configuration. */
export const RECONNECT_CONFIG = {
  /** Initial delay before first reconnection attempt (ms). */
  baseDelayMs: 1_000,
  /** Maximum delay between reconnection attempts (ms). */
  maxDelayMs: 30_000,
  /** Multiplier applied per retry. */
  backoffFactor: 2,
  /** Maximum number of reconnection attempts before giving up. */
  maxRetries: 10,
  /** Random jitter ceiling added to each delay (ms). */
  jitterMs: 1_000,
} as const;

/** Heartbeat / keep-alive interval (ms). */
export const HEARTBEAT_INTERVAL_MS = 25_000;

/** How long to wait for a pong before treating the connection as dead (ms). */
export const HEARTBEAT_TIMEOUT_MS = 10_000;

/** Maximum number of cached run summaries stored on device. */
export const MAX_CACHED_RUNS = 50;

/** Maximum age for a cached run before it is evicted (ms). */
export const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1_000; // 7 days

/** Color tokens for agent/task status indicators. */
export const STATUS_COLORS = {
  active: "#22C55E",
  paused: "#F59E0B",
  completed: "#38BDF8",
  errored: "#EF4444",
  queued: "#8B5CF6",
  idle: "#64748B",
} as const;

/** Badge background colors for cost tiers. */
export const COST_TIER_COLORS = {
  low: "#166534",
  medium: "#92400E",
  high: "#991B1B",
} as const;

/** Cost tier thresholds in USD. */
export const COST_THRESHOLDS = {
  /** Below this value is "low". */
  lowMax: 0.5,
  /** Below this value is "medium"; above is "high". */
  mediumMax: 5.0,
} as const;
