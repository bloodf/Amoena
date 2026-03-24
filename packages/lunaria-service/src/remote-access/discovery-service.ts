import { createSocket, type Socket } from 'dgram';

const BROADCAST_PORT = 37778;
const BROADCAST_INTERVAL_MS = 5000;
const BROADCAST_ADDR = '255.255.255.255';

export type DiscoveryAnnouncement = {
  service: string;
  host: string;
  port: number;
  deviceId: string;
  version: string;
};

export type DiscoveredService = DiscoveryAnnouncement & {
  lastSeenAt: number;
};

export type DiscoveryServiceOptions = {
  host: string;
  port: number;
  deviceId: string;
  version?: string;
  broadcastIntervalMs?: number;
};

export class DiscoveryService {
  private broadcastSocket: Socket | null = null;
  private listenSocket: Socket | null = null;
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private readonly discovered: Map<string, DiscoveredService> = new Map();
  private readonly options: Required<DiscoveryServiceOptions>;

  constructor(options: DiscoveryServiceOptions) {
    this.options = {
      version: '1.0.0',
      broadcastIntervalMs: BROADCAST_INTERVAL_MS,
      ...options,
    };
  }

  startBroadcasting(): void {
    if (this.broadcastSocket) return;

    this.broadcastSocket = createSocket('udp4');
    this.broadcastSocket.bind(() => {
      this.broadcastSocket?.setBroadcast(true);
      this._sendAnnouncement();
    });

    this.intervalId = setInterval(() => {
      this._sendAnnouncement();
    }, this.options.broadcastIntervalMs);
  }

  startListening(onDiscovered?: (service: DiscoveredService) => void): void {
    if (this.listenSocket) return;

    this.listenSocket = createSocket('udp4');
    this.listenSocket.bind(BROADCAST_PORT, () => {
      this.listenSocket?.setBroadcast(true);
    });

    this.listenSocket.on('message', (msg: Buffer) => {
      try {
        const announcement = JSON.parse(msg.toString()) as DiscoveryAnnouncement;
        if (announcement.service !== 'lunaria') return;

        const entry: DiscoveredService = { ...announcement, lastSeenAt: Date.now() };
        this.discovered.set(announcement.deviceId, entry);
        onDiscovered?.(entry);
      } catch {
        // Ignore malformed packets
      }
    });
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    if (this.broadcastSocket) {
      this.broadcastSocket.close();
      this.broadcastSocket = null;
    }
    if (this.listenSocket) {
      this.listenSocket.close();
      this.listenSocket = null;
    }
  }

  getDiscovered(): DiscoveredService[] {
    return Array.from(this.discovered.values());
  }

  private _sendAnnouncement(): void {
    const announcement: DiscoveryAnnouncement = {
      service: 'lunaria',
      host: this.options.host,
      port: this.options.port,
      deviceId: this.options.deviceId,
      version: this.options.version,
    };
    const msg = Buffer.from(JSON.stringify(announcement));
    this.broadcastSocket?.send(msg, BROADCAST_PORT, BROADCAST_ADDR);
  }
}
