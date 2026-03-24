import { WebSocketServer, WebSocket } from 'ws';
import type { Server } from 'http';

export type RelayMessage = {
  from: string;
  to?: string;
  payload: unknown;
};

export type RelayServerOptions = {
  port?: number;
  server?: Server;
};

export class RelayServer {
  private wss: WebSocketServer | null = null;
  private clients: Map<string, WebSocket> = new Map();
  private readonly port: number;
  private readonly httpServer?: Server;

  constructor(options: RelayServerOptions = {}) {
    this.port = options.port ?? 37777;
    this.httpServer = options.server;
  }

  start(): void {
    if (this.wss) return;

    this.wss = this.httpServer
      ? new WebSocketServer({ server: this.httpServer })
      : new WebSocketServer({ port: this.port });

    this.wss.on('connection', (ws: WebSocket) => {
      const clientId = crypto.randomUUID();
      this.clients.set(clientId, ws);

      ws.on('message', (data: Buffer) => {
        try {
          const msg = JSON.parse(data.toString()) as RelayMessage;
          this._forward({ ...msg, from: clientId });
        } catch {
          // Ignore malformed messages
        }
      });

      ws.on('close', () => {
        this.clients.delete(clientId);
      });

      ws.send(JSON.stringify({ type: 'connected', clientId }));
    });
  }

  stop(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.wss) {
        resolve();
        return;
      }
      for (const ws of this.clients.values()) {
        ws.terminate();
      }
      this.clients.clear();
      this.wss.close((err) => {
        this.wss = null;
        if (err) reject(err);
        else resolve();
      });
    });
  }

  get clientCount(): number {
    return this.clients.size;
  }

  private _forward(msg: RelayMessage): void {
    const serialized = JSON.stringify(msg);
    if (msg.to) {
      const target = this.clients.get(msg.to);
      if (target?.readyState === WebSocket.OPEN) {
        target.send(serialized);
      }
    } else {
      for (const [id, ws] of this.clients) {
        if (id !== msg.from && ws.readyState === WebSocket.OPEN) {
          ws.send(serialized);
        }
      }
    }
  }
}
