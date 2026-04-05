/**
 * In-memory WebSocket relay for bridging host and mobile devices.
 *
 * A relay room is created when a mobile device connects to an existing host.
 * Messages from either side are forwarded to the other side unchanged (they
 * are expected to be already encrypted by the caller).
 *
 * Heartbeat: every 30 seconds each side must send a ping.  After 3 missed
 * pings the room is closed and cleaned up.
 */

import * as crypto from 'node:crypto';
import type { Device, RelayRoom } from './types.js';

/** Interval between heartbeat checks in milliseconds. */
const HEARTBEAT_INTERVAL_MS = 30_000;

/** Number of missed pings before a room is closed. */
const MAX_MISSED_PINGS = 3;

interface MutableRelayRoom extends RelayRoom {
  lastActivity: Date;
}

/** Reason a relay room was closed. */
export type RoomCloseReason = 'explicit' | 'timeout' | 'error';

/** Callback invoked when a room is closed with its close reason. */
export type RoomCloseCallback = (roomId: string, reason: RoomCloseReason) => void;

interface RoomState {
  readonly room: MutableRelayRoom;
  missedPings: number;
  readonly intervalId: ReturnType<typeof setInterval>;
  /** Callback to invoke when a message arrives for the host. */
  onHostMessage: ((data: string) => void) | null;
  /** Callback to invoke when a message arrives for the mobile. */
  onMobileMessage: ((data: string) => void) | null;
  /** Callback invoked when the room is closed. */
  onClose: ((reason: RoomCloseReason) => void) | null;
}

/** Global disconnect handlers registered by desktop UI. */
const disconnectHandlers = new Set<RoomCloseCallback>();

/**
 * Registers a handler to be notified when any relay room is closed.
 * Useful for desktop UI to surface disconnect state.
 *
 * @param handler - Callback invoked with roomId and close reason.
 * @returns Unsubscribe function.
 */
export function onRelayDisconnect(handler: RoomCloseCallback): () => void {
  disconnectHandlers.add(handler);
  return () => disconnectHandlers.delete(handler);
}

/** Notifies all registered disconnect handlers. */
function notifyDisconnect(roomId: string, reason: RoomCloseReason): void {
  for (const handler of disconnectHandlers) {
    try {
      handler(roomId, reason);
    } catch {
      // Ignore handler errors
    }
  }
}

/** Active relay rooms keyed by room ID. */
const rooms = new Map<string, RoomState>();

/**
 * Creates a new relay room bridging a host and mobile device.
 *
 * @param hostDevice   - The desktop/host Amoena instance.
 * @param mobileDevice - The mobile device connecting to the host.
 * @returns The newly created `RelayRoom`.
 */
export function createRelayRoom(hostDevice: Device, mobileDevice: Device): RelayRoom {
  const id = crypto.randomUUID();
  const now = new Date();

  const room: MutableRelayRoom = {
    id,
    host: hostDevice,
    mobile: mobileDevice,
    createdAt: now,
    lastActivity: now,
  };

  const intervalId = setInterval(() => tickHeartbeat(id), HEARTBEAT_INTERVAL_MS);

  const state: RoomState = {
    room,
    missedPings: 0,
    intervalId,
    onHostMessage: null,
    onMobileMessage: null,
    onClose: null,
  };

  rooms.set(id, state);
  return { ...room };
}

/**
 * Forwards an encrypted message from the host to the mobile device.
 *
 * @param roomId - Identifier of the relay room.
 * @param data   - Encrypted message string.
 * @returns `true` if the message was forwarded; `false` if the room is gone.
 */
export function sendToMobile(roomId: string, data: string): boolean {
  const state = rooms.get(roomId);
  if (state === undefined) return false;

  state.room.lastActivity = new Date();
  state.missedPings = 0;
  state.onMobileMessage?.(data);
  return true;
}

/**
 * Forwards an encrypted message from the mobile to the host device.
 *
 * @param roomId - Identifier of the relay room.
 * @param data   - Encrypted message string.
 * @returns `true` if the message was forwarded; `false` if the room is gone.
 */
export function sendToHost(roomId: string, data: string): boolean {
  const state = rooms.get(roomId);
  if (state === undefined) return false;

  state.room.lastActivity = new Date();
  state.missedPings = 0;
  state.onHostMessage?.(data);
  return true;
}

/**
 * Registers a listener for messages directed at the host in a relay room.
 *
 * @param roomId    - Target relay room.
 * @param callback  - Invoked with each forwarded message.
 */
export function onHostMessage(roomId: string, callback: (data: string) => void): void {
  const state = rooms.get(roomId);
  if (state !== undefined) {
    rooms.set(roomId, { ...state, onHostMessage: callback });
  }
}

/**
 * Registers a listener for messages directed at the mobile in a relay room.
 *
 * @param roomId   - Target relay room.
 * @param callback - Invoked with each forwarded message.
 */
export function onMobileMessage(roomId: string, callback: (data: string) => void): void {
  const state = rooms.get(roomId);
  if (state !== undefined) {
    rooms.set(roomId, { ...state, onMobileMessage: callback });
  }
}

/**
 * Registers a callback invoked when a relay room is closed.
 *
 * @param roomId   - Target relay room.
 * @param callback - Invoked with close reason when the room closes.
 */
export function onRoomClose(roomId: string, callback: (reason: RoomCloseReason) => void): void {
  const state = rooms.get(roomId);
  if (state !== undefined) {
    rooms.set(roomId, { ...state, onClose: callback });
  }
}

/**
 * Explicitly closes a relay room, stopping its heartbeat timer.
 *
 * @param roomId - The room to close.
 * @returns `true` if the room existed and was closed.
 */
export function closeRelayRoom(roomId: string): boolean {
  return closeRelayRoomWithReason(roomId, 'explicit');
}

/** Internal close with reason for tracking disconnect source. */
function closeRelayRoomWithReason(roomId: string, reason: RoomCloseReason): boolean {
  const state = rooms.get(roomId);
  if (state === undefined) return false;

  clearInterval(state.intervalId);
  state.onClose?.(reason);
  notifyDisconnect(roomId, reason);
  rooms.delete(roomId);
  return true;
}

/**
 * Returns a snapshot of all currently active relay rooms.
 */
export function getActiveRelayRooms(): ReadonlyArray<RelayRoom> {
  return Array.from(rooms.values()).map((s) => ({ ...s.room }));
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/** Called on each heartbeat tick for a room. */
export function tickHeartbeat(roomId: string): void {
  const state = rooms.get(roomId);
  if (state === undefined) return;

  state.missedPings += 1;

  if (state.missedPings >= MAX_MISSED_PINGS) {
    closeRelayRoomWithReason(roomId, 'timeout');
  } else {
    rooms.set(roomId, { ...state });
  }
}

/**
 * Called when a ping is received from a mobile client.
 * Resets the missed pings counter, preventing orphan cleanup.
 *
 * @param roomId - The relay room that received the ping.
 */
export function handlePing(roomId: string): void {
  const state = rooms.get(roomId);
  if (state === undefined) return;

  state.room.lastActivity = new Date();
  state.missedPings = 0;
  rooms.set(roomId, { ...state });
}
