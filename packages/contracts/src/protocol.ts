/**
 * WebSocket protocol helpers for Mission Control.
 */

/** Default port on which the amoena-service MC WebSocket listens. */
export const MC_WS_DEFAULT_PORT = 7779;

/**
 * Constructs the Mission Control WebSocket URL.
 *
 * @param host - Hostname or IP address. Defaults to `"localhost"`.
 * @param port - Port number. Defaults to {@link MC_WS_DEFAULT_PORT}.
 * @returns Full `ws://` URL string.
 *
 * @example
 * ```ts
 * buildMcWsUrl(); // "ws://localhost:7779/mc"
 * buildMcWsUrl("192.168.1.5", 8080); // "ws://192.168.1.5:8080/mc"
 * ```
 */
export function buildMcWsUrl(
  host = "localhost",
  port = MC_WS_DEFAULT_PORT,
): string {
  return `ws://${host}:${port}/mc`;
}

/**
 * The handshake message the client sends immediately after the WebSocket
 * connection is established, to identify itself and its capabilities.
 */
export interface SubscribeHandshake {
  /** Protocol version. Currently `"1"`. */
  version: "1";
  /** Optional goalId to subscribe to a specific run's events. */
  goalId?: string;
}
