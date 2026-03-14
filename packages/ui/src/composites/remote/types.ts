export type RelayStatus = "lan" | "relay" | "offline" | "waiting";

export interface RemoteDevice {
  name: string;
  ip: string;
  connectedSince: string;
  trusted: boolean;
  lastSeen: string;
  relay: RelayStatus;
  permissions: string[];
}
