import type { RelayStatus, RemoteDevice } from "./types";

export const relayConfig: Record<RelayStatus, { label: string; color: string; iconKey: "wifi" | "radio" | "wifi-off" | "clock" }> = {
  lan: { label: "LAN Direct", color: "text-green", iconKey: "wifi" },
  relay: { label: "Relay Connected", color: "text-warning", iconKey: "radio" },
  offline: { label: "Offline", color: "text-destructive", iconKey: "wifi-off" },
  waiting: { label: "Waiting for Connection", color: "text-muted-foreground", iconKey: "clock" },
};

export const initialRemoteDevices: RemoteDevice[] = [
  {
    name: "Pixel 8 Pro",
    ip: "192.168.1.42",
    connectedSince: "10:15 AM",
    trusted: true,
    lastSeen: "Active now",
    relay: "lan",
    permissions: ["chat", "terminal", "approve"],
  },
];
