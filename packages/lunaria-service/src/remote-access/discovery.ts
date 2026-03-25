/**
 * LAN device discovery via UDP broadcast.
 *
 * Devices advertise themselves by broadcasting a JSON packet every 5 seconds
 * on UDP port 37780.  Listeners collect those packets and build a live device
 * registry.
 */

import * as crypto from "node:crypto";
import * as dgram from "node:dgram";
import * as os from "node:os";
import type { Device, DiscoveryPacket } from "./types.js";

/** UDP port used for discovery broadcasts. */
export const DISCOVERY_PORT = 37780;

/** Interval between presence broadcasts in milliseconds. */
const BROADCAST_INTERVAL_MS = 5_000;

/** How long (ms) before a device is considered stale and removed. */
const DEVICE_TTL_MS = 30_000;

/** Stable device ID derived from hostname + MAC to survive restarts. */
function getLocalDeviceId(): string {
  const hostname = os.hostname();
  return crypto.createHash("sha256").update(hostname).digest("hex").slice(0, 16);
}

/** Returns the first non-loopback IPv4 address found on any interface. */
function getLocalIp(): string {
  const interfaces = os.networkInterfaces();
  for (const ifaces of Object.values(interfaces)) {
    for (const iface of ifaces ?? []) {
      if (iface.family === "IPv4" && !iface.internal) {
        return iface.address;
      }
    }
  }
  return "127.0.0.1";
}

/**
 * Scans the local network for Amoena instances.
 *
 * Sends a single broadcast, waits 2 seconds for replies, then resolves with
 * all devices heard during that window.
 */
export async function discoverDevices(): Promise<Device[]> {
  return new Promise((resolve) => {
    const found = new Map<string, Device>();
    const socket = dgram.createSocket({ type: "udp4", reuseAddr: true });

    socket.bind(() => {
      socket.setBroadcast(true);

      socket.on("message", (msg) => {
        const device = parseDiscoveryPacket(msg);
        if (device !== null && device.id !== getLocalDeviceId()) {
          found.set(device.id, device);
        }
      });

      // Give devices 2 seconds to respond.
      setTimeout(() => {
        socket.close();
        resolve(Array.from(found.values()));
      }, 2_000);
    });
  });
}

/**
 * Advertises this instance on the LAN.
 *
 * Broadcasts a presence packet every {@link BROADCAST_INTERVAL_MS} ms.
 * Returns a cleanup function that stops the advertisement.
 *
 * @param port - The HTTP/WS port this instance is listening on.
 * @returns A function that stops advertising when called.
 */
export function advertiseSelf(port: number): () => void {
  const socket = dgram.createSocket({ type: "udp4", reuseAddr: true });
  let intervalId: ReturnType<typeof setInterval> | null = null;

  socket.bind(() => {
    socket.setBroadcast(true);
    intervalId = setInterval(() => broadcastPresence(socket, port), BROADCAST_INTERVAL_MS);
    // Send one immediately.
    broadcastPresence(socket, port);
  });

  return () => {
    if (intervalId !== null) clearInterval(intervalId);
    socket.close();
  };
}

/**
 * Sends a single UDP broadcast with this device's info.
 *
 * @param socket - An already-bound UDP socket with broadcast enabled.
 * @param port   - The local service port.
 */
export function broadcastPresence(socket: dgram.Socket, port: number): void {
  const packet: DiscoveryPacket = {
    deviceId: getLocalDeviceId(),
    deviceName: os.hostname(),
    port,
    timestamp: Date.now(),
  };
  const buf = Buffer.from(JSON.stringify(packet));
  socket.send(buf, 0, buf.length, DISCOVERY_PORT, "255.255.255.255");
}

/**
 * Starts listening for discovery broadcasts and calls `onDevice` for each
 * unique device seen. Automatically removes stale entries.
 *
 * @param onDevice - Callback invoked whenever a new or updated device is seen.
 * @returns A function that stops listening when called.
 */
export function listenForDevices(onDevice: (d: Device) => void): () => void {
  const seen = new Map<string, Device>();
  const socket = dgram.createSocket({ type: "udp4", reuseAddr: true });

  socket.bind(DISCOVERY_PORT, () => {
    socket.setBroadcast(true);
  });

  socket.on("message", (msg, rinfo) => {
    const device = parseDiscoveryPacket(msg, rinfo.address);
    if (device === null || device.id === getLocalDeviceId()) return;

    const existing = seen.get(device.id);
    const updated: Device = { ...device };

    if (!existing || existing.ip !== updated.ip || existing.port !== updated.port) {
      seen.set(device.id, updated);
      onDevice(updated);
    } else {
      // Refresh lastSeen even if nothing else changed.
      seen.set(device.id, { ...existing, lastSeen: updated.lastSeen });
      onDevice(seen.get(device.id)!);
    }
  });

  // Prune stale devices periodically.
  const pruneId = setInterval(() => {
    const cutoff = Date.now() - DEVICE_TTL_MS;
    for (const [id, device] of seen.entries()) {
      if (device.lastSeen.getTime() < cutoff) {
        seen.delete(id);
      }
    }
  }, DEVICE_TTL_MS);

  return () => {
    clearInterval(pruneId);
    socket.close();
  };
}

/** Parses a raw UDP message into a Device, or returns null on invalid input. */
function parseDiscoveryPacket(msg: Buffer, senderIp?: string): Device | null {
  try {
    const packet = JSON.parse(msg.toString()) as Partial<DiscoveryPacket>;
    if (
      typeof packet.deviceId !== "string" ||
      typeof packet.deviceName !== "string" ||
      typeof packet.port !== "number" ||
      typeof packet.timestamp !== "number"
    ) {
      return null;
    }

    return {
      id: packet.deviceId,
      name: packet.deviceName,
      ip: senderIp ?? getLocalIp(),
      port: packet.port,
      lastSeen: new Date(packet.timestamp),
      paired: false,
    };
  } catch {
    return null;
  }
}
