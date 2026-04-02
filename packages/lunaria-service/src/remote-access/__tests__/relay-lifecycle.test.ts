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
});
