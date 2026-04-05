import { describe, it, expect, afterEach, vi } from 'vitest';
import type { Device } from '../types.js';
import {
  createRelayRoom,
  sendToMobile,
  sendToHost,
  onRoomClose,
  closeRelayRoom,
  getActiveRelayRooms,
  tickHeartbeat,
  onRelayDisconnect,
} from '../relay.js';

function makeDevice(id: string): Device {
  return {
    id,
    name: `Device ${id}`,
    ip: '192.168.1.1',
    port: 8080,
    lastSeen: new Date(),
    paired: true,
  };
}

describe('relay lifecycle', () => {
  const roomIds: string[] = [];

  afterEach(() => {
    for (const id of roomIds) {
      closeRelayRoom(id);
    }
    roomIds.length = 0;
    vi.restoreAllMocks();
  });

  function createTrackedRoom() {
    const room = createRelayRoom(makeDevice('host-1'), makeDevice('mobile-1'));
    roomIds.push(room.id);
    return room;
  }

  describe('orphan cleanup', () => {
    it('closes orphaned room after 3 missed pings', () => {
      const room = createTrackedRoom();
      let closedCount = 0;
      onRoomClose(room.id, () => {
        closedCount++;
      });

      // Simulate 3 missed heartbeat ticks with no activity
      tickHeartbeat(room.id);
      tickHeartbeat(room.id);
      tickHeartbeat(room.id);

      expect(closedCount).toBe(1);
      expect(getActiveRelayRooms().some((r) => r.id === room.id)).toBe(false);
    });

    it('does not close room with fewer than 3 missed pings', () => {
      const room = createTrackedRoom();
      let closedCount = 0;
      onRoomClose(room.id, () => {
        closedCount++;
      });

      tickHeartbeat(room.id);
      tickHeartbeat(room.id);

      expect(closedCount).toBe(0);
      expect(getActiveRelayRooms().some((r) => r.id === room.id)).toBe(true);
    });

    it('propagates timeout reason when room closes due to missed pings', () => {
      const room = createTrackedRoom();
      let closeReason: string | undefined;
      onRoomClose(room.id, (reason) => {
        closeReason = reason;
      });

      tickHeartbeat(room.id);
      tickHeartbeat(room.id);
      tickHeartbeat(room.id);

      expect(closeReason).toBe('timeout');
    });
  });

  describe('repeated disconnects', () => {
    it('does not create duplicate room state on repeated connect/disconnect', () => {
      // First connection
      const room1 = createTrackedRoom();
      const id1 = room1.id;

      // Close first room
      closeRelayRoom(id1);
      roomIds.splice(roomIds.indexOf(id1), 1);

      // Second connection with same device pair
      const room2 = createRelayRoom(makeDevice('host-1'), makeDevice('mobile-1'));
      roomIds.push(room2.id);

      // Only one room should exist for this device pair
      const activeForPair = getActiveRelayRooms().filter(
        (r) => r.host.id === 'host-1' && r.mobile.id === 'mobile-1',
      );
      expect(activeForPair.length).toBe(1);
      expect(room2.id).not.toBe(id1);
    });
  });

  describe('activity resets missed pings', () => {
    it('sendToMobile resets missed pings counter', () => {
      const room = createTrackedRoom();

      // Miss some heartbeats
      tickHeartbeat(room.id);
      tickHeartbeat(room.id);

      // Activity should reset counter
      sendToMobile(room.id, 'test');

      // One more missed ping should not close the room
      tickHeartbeat(room.id);
      expect(getActiveRelayRooms().some((r) => r.id === room.id)).toBe(true);
    });

    it('sendToHost resets missed pings counter', () => {
      const room = createTrackedRoom();

      tickHeartbeat(room.id);
      tickHeartbeat(room.id);

      sendToHost(room.id, 'test');

      tickHeartbeat(room.id);
      expect(getActiveRelayRooms().some((r) => r.id === room.id)).toBe(true);
    });
  });

  describe('onRelayDisconnect global handler', () => {
    it('notifies global handler with timeout reason when room times out', () => {
      const room = createTrackedRoom();
      const disconnectEvents: Array<{ roomId: string; reason: string }> = [];
      const unsubscribe = onRelayDisconnect((roomId, reason) => {
        disconnectEvents.push({ roomId, reason });
      });

      tickHeartbeat(room.id);
      tickHeartbeat(room.id);
      tickHeartbeat(room.id);

      expect(disconnectEvents).toHaveLength(1);
      expect(disconnectEvents[0].roomId).toBe(room.id);
      expect(disconnectEvents[0].reason).toBe('timeout');

      unsubscribe();
    });

    it('notifies global handler with explicit reason on explicit close', () => {
      const room = createTrackedRoom();
      const disconnectEvents: Array<{ roomId: string; reason: string }> = [];
      const unsubscribe = onRelayDisconnect((roomId, reason) => {
        disconnectEvents.push({ roomId, reason });
      });

      closeRelayRoom(room.id);
      roomIds.splice(roomIds.indexOf(room.id), 1);

      expect(disconnectEvents).toHaveLength(1);
      expect(disconnectEvents[0].roomId).toBe(room.id);
      expect(disconnectEvents[0].reason).toBe('explicit');

      unsubscribe();
    });

    it('allows multiple global handlers to be registered', () => {
      const room = createTrackedRoom();
      const handler1Events: string[] = [];
      const handler2Events: string[] = [];
      const unsub1 = onRelayDisconnect((roomId) => handler1Events.push(roomId));
      const unsub2 = onRelayDisconnect((roomId) => handler2Events.push(roomId));

      closeRelayRoom(room.id);
      roomIds.splice(roomIds.indexOf(room.id), 1);

      expect(handler1Events).toHaveLength(1);
      expect(handler2Events).toHaveLength(1);

      unsub1();
      unsub2();
    });

    it('unsubscribe removes handler from notifications', () => {
      const room = createTrackedRoom();
      const events: string[] = [];
      const unsubscribe = onRelayDisconnect((roomId) => events.push(roomId));

      unsubscribe();
      closeRelayRoom(room.id);
      roomIds.splice(roomIds.indexOf(room.id), 1);

      expect(events).toHaveLength(0);
    });
  });
});
