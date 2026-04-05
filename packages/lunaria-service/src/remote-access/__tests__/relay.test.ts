import { describe, it, expect, afterEach, vi } from 'vitest';
import type { Device } from '../types.js';
import {
  createRelayRoom,
  sendToMobile,
  sendToHost,
  onHostMessage,
  onMobileMessage,
  onRoomClose,
  closeRelayRoom,
  getActiveRelayRooms,
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

describe('relay', () => {
  // Track rooms to clean up after each test
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

  describe('createRelayRoom', () => {
    it('creates a room with unique ID', () => {
      const room = createTrackedRoom();
      expect(room.id).toBeDefined();
      expect(typeof room.id).toBe('string');
    });

    it('stores host and mobile device info', () => {
      const room = createTrackedRoom();
      expect(room.host.id).toBe('host-1');
      expect(room.mobile.id).toBe('mobile-1');
    });

    it('sets createdAt and lastActivity timestamps', () => {
      const room = createTrackedRoom();
      expect(room.createdAt).toBeInstanceOf(Date);
      expect(room.lastActivity).toBeInstanceOf(Date);
    });

    it('room appears in active rooms list', () => {
      const room = createTrackedRoom();
      const active = getActiveRelayRooms();
      expect(active.some((r) => r.id === room.id)).toBe(true);
    });

    it('creates multiple independent rooms', () => {
      const r1 = createTrackedRoom();
      const r2 = createRelayRoom(makeDevice('host-2'), makeDevice('mobile-2'));
      roomIds.push(r2.id);
      expect(r1.id).not.toBe(r2.id);
      expect(getActiveRelayRooms().length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('message routing', () => {
    it('sendToMobile forwards message to mobile listener', () => {
      const room = createTrackedRoom();
      const received: string[] = [];
      onMobileMessage(room.id, (data) => received.push(data));

      const ok = sendToMobile(room.id, 'hello mobile');
      expect(ok).toBe(true);
      expect(received).toEqual(['hello mobile']);
    });

    it('sendToHost forwards message to host listener', () => {
      const room = createTrackedRoom();
      const received: string[] = [];
      onHostMessage(room.id, (data) => received.push(data));

      const ok = sendToHost(room.id, 'hello host');
      expect(ok).toBe(true);
      expect(received).toEqual(['hello host']);
    });

    it('returns false for nonexistent room', () => {
      expect(sendToMobile('nonexistent', 'data')).toBe(false);
      expect(sendToHost('nonexistent', 'data')).toBe(false);
    });

    it('messages work without registered listeners', () => {
      const room = createTrackedRoom();
      // Should not throw even without listeners
      expect(sendToMobile(room.id, 'unheard')).toBe(true);
      expect(sendToHost(room.id, 'unheard')).toBe(true);
    });
  });

  describe('onRoomClose', () => {
    it('fires close callback when room is explicitly closed', () => {
      const room = createTrackedRoom();
      let closed = false;
      onRoomClose(room.id, (reason) => {
        closed = true;
        expect(reason).toBe('explicit');
      });

      closeRelayRoom(room.id);
      // Remove from tracking since we already closed it
      roomIds.splice(roomIds.indexOf(room.id), 1);

      expect(closed).toBe(true);
    });

    it('does nothing for nonexistent room', () => {
      // Should not throw
      onRoomClose('nonexistent', () => {});
      onHostMessage('nonexistent', () => {});
      onMobileMessage('nonexistent', () => {});
      expect(true).toBe(true);
    });
  });

  describe('closeRelayRoom', () => {
    it('returns true when closing an active room', () => {
      const room = createTrackedRoom();
      const result = closeRelayRoom(room.id);
      roomIds.splice(roomIds.indexOf(room.id), 1);
      expect(result).toBe(true);
    });

    it('returns false when closing a nonexistent room', () => {
      expect(closeRelayRoom('nonexistent')).toBe(false);
    });

    it('removes room from active rooms', () => {
      const room = createTrackedRoom();
      closeRelayRoom(room.id);
      roomIds.splice(roomIds.indexOf(room.id), 1);
      expect(getActiveRelayRooms().some((r) => r.id === room.id)).toBe(false);
    });
  });

  describe('getActiveRelayRooms', () => {
    it('returns snapshots (not references to internal state)', () => {
      const room = createTrackedRoom();
      const active = getActiveRelayRooms();
      const found = active.find((r) => r.id === room.id);
      expect(found).toBeDefined();
      // Modifying the snapshot should not affect internal state
      (found as { id: string }).id = 'tampered';
      const activeAgain = getActiveRelayRooms();
      expect(activeAgain.find((r) => r.id === room.id)).toBeDefined();
    });
  });
});
