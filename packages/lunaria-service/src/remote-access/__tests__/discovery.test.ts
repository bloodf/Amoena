import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock dgram, os, crypto before importing
vi.mock("node:dgram", () => {
  const handlers: Record<string, Array<(...args: unknown[]) => void>> = {};
  const mockSocket = {
    bind: vi.fn((...args: unknown[]) => {
      const cb = args.find((a) => typeof a === "function") as (() => void) | undefined;
      if (cb) setTimeout(cb, 0);
    }),
    setBroadcast: vi.fn(),
    send: vi.fn(),
    close: vi.fn(),
    on: vi.fn((event: string, handler: (...args: unknown[]) => void) => {
      if (!handlers[event]) handlers[event] = [];
      handlers[event]!.push(handler);
    }),
    // Helper to simulate incoming messages in tests
    __simulateMessage: (msg: Buffer, rinfo: { address: string }) => {
      for (const h of handlers["message"] ?? []) {
        h(msg, rinfo);
      }
    },
    __resetHandlers: () => {
      for (const key of Object.keys(handlers)) {
        delete handlers[key];
      }
    },
  };
  return {
    createSocket: vi.fn(() => mockSocket),
    __mockSocket: mockSocket,
  };
});

vi.mock("node:os", () => ({
  hostname: vi.fn(() => "test-host"),
  networkInterfaces: vi.fn(() => ({
    eth0: [
      { family: "IPv4", address: "192.168.1.50", internal: false },
    ],
  })),
}));

import * as dgram from "node:dgram";
import { DISCOVERY_PORT, broadcastPresence, listenForDevices, advertiseSelf } from "../discovery.js";

type MockSocket = ReturnType<typeof dgram.createSocket> & {
  __simulateMessage: (msg: Buffer, rinfo: { address: string }) => void;
  __resetHandlers: () => void;
};

const mockSocket = (dgram as unknown as { __mockSocket: MockSocket }).__mockSocket;

describe("discovery", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSocket.__resetHandlers();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("DISCOVERY_PORT", () => {
    it("is 37780", () => {
      expect(DISCOVERY_PORT).toBe(37780);
    });
  });

  describe("broadcastPresence", () => {
    it("sends a JSON packet to the broadcast address on DISCOVERY_PORT", () => {
      const socket = dgram.createSocket({ type: "udp4" });
      broadcastPresence(socket, 9000);

      expect(socket.send).toHaveBeenCalledTimes(1);
      const args = (socket.send as ReturnType<typeof vi.fn>).mock.calls[0]!;
      const buf = args[0] as Buffer;
      const packet = JSON.parse(buf.toString());

      expect(packet.deviceName).toBe("test-host");
      expect(packet.port).toBe(9000);
      expect(typeof packet.deviceId).toBe("string");
      expect(typeof packet.timestamp).toBe("number");

      // Sent to broadcast address
      expect(args[3]).toBe(DISCOVERY_PORT);
      expect(args[4]).toBe("255.255.255.255");
    });
  });

  describe("advertiseSelf", () => {
    it("returns a cleanup function that stops the interval and closes the socket", async () => {
      const stop = advertiseSelf(8080);

      // Let bind callback fire
      await vi.advanceTimersByTimeAsync(0);

      expect(mockSocket.setBroadcast).toHaveBeenCalledWith(true);
      // Initial broadcast
      expect(mockSocket.send).toHaveBeenCalled();

      stop();
      expect(mockSocket.close).toHaveBeenCalled();
    });
  });

  describe("listenForDevices", () => {
    it("calls onDevice when a valid discovery packet is received", async () => {
      const devices: unknown[] = [];
      const stop = listenForDevices((d) => devices.push(d));

      // Let bind fire
      await vi.advanceTimersByTimeAsync(0);

      // Simulate a different device broadcasting
      const packet = JSON.stringify({
        deviceId: "remote-device-id",
        deviceName: "Remote",
        port: 7777,
        timestamp: Date.now(),
      });
      mockSocket.__simulateMessage(Buffer.from(packet), { address: "192.168.1.100" });

      expect(devices.length).toBe(1);
      expect((devices[0] as { id: string }).id).toBe("remote-device-id");
      expect((devices[0] as { ip: string }).ip).toBe("192.168.1.100");

      stop();
    });

    it("ignores invalid JSON messages", async () => {
      const devices: unknown[] = [];
      const stop = listenForDevices((d) => devices.push(d));
      await vi.advanceTimersByTimeAsync(0);

      mockSocket.__simulateMessage(Buffer.from("not json"), { address: "1.2.3.4" });
      expect(devices.length).toBe(0);

      stop();
    });

    it("ignores packets missing required fields", async () => {
      const devices: unknown[] = [];
      const stop = listenForDevices((d) => devices.push(d));
      await vi.advanceTimersByTimeAsync(0);

      const incomplete = JSON.stringify({ deviceId: "x" }); // missing fields
      mockSocket.__simulateMessage(Buffer.from(incomplete), { address: "1.2.3.4" });
      expect(devices.length).toBe(0);

      stop();
    });
  });
});
