/**
 * Shared types for the remote-access module.
 */

/** A Lunaria instance discovered on the local network. */
export interface Device {
  /** Stable unique identifier for this device. */
  readonly id: string;
  /** Human-readable device name. */
  readonly name: string;
  /** IP address on the LAN. */
  readonly ip: string;
  /** HTTP/WS port the instance is listening on. */
  readonly port: number;
  /** Timestamp of the last observed broadcast from this device. */
  readonly lastSeen: Date;
  /** Whether this device has been paired with the local instance. */
  readonly paired: boolean;
}

/** An E2E-encrypted payload transmitted between devices. */
export interface EncryptedPayload {
  /** AES-256-GCM nonce encoded as base64. */
  readonly nonce: string;
  /** Ciphertext encoded as base64. */
  readonly ciphertext: string;
}

/** Result of a pairing code verification attempt. */
export interface PairingResult {
  readonly success: boolean;
  /** Short-lived session token issued on successful pairing. */
  readonly sessionToken?: string;
  /** Human-readable error description on failure. */
  readonly error?: string;
}

/** A relay room bridging a host device and a mobile device. */
export interface RelayRoom {
  /** Unique identifier for this relay room. */
  readonly id: string;
  /** The Lunaria desktop/host device. */
  readonly host: Device;
  /** The connected mobile device. */
  readonly mobile: Device;
  /** Timestamp when the room was created. */
  readonly createdAt: Date;
  /** Timestamp of the last forwarded message. */
  readonly lastActivity: Date;
}

/** Raw discovery broadcast packet sent over UDP. */
export interface DiscoveryPacket {
  readonly deviceId: string;
  readonly deviceName: string;
  readonly port: number;
  readonly timestamp: number;
}
