import { createServer, type Server } from 'http';
import { URL } from 'url';

const CALLBACK_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes

export type OAuthCallbackResult = {
  code: string;
  state?: string;
};

export type OAuthServerOptions = {
  port?: number;
  timeoutMs?: number;
};

export class OAuthCallbackServer {
  private server: Server | null = null;
  private readonly port: number;
  private readonly timeoutMs: number;

  constructor(options: OAuthServerOptions = {}) {
    this.port = options.port ?? 0; // 0 = OS-assigned port
    this.timeoutMs = options.timeoutMs ?? CALLBACK_TIMEOUT_MS;
  }

  waitForCallback(): Promise<OAuthCallbackResult> {
    return new Promise<OAuthCallbackResult>((resolve, reject) => {
      const timer = setTimeout(() => {
        this._shutdown();
        reject(new Error('OAuth callback timeout: no response within 5 minutes'));
      }, this.timeoutMs);

      this.server = createServer((req, res) => {
        if (!req.url) {
          res.writeHead(400);
          res.end('Bad request');
          return;
        }

        const url = new URL(req.url, `http://localhost:${this.port}`);
        const code = url.searchParams.get('code');
        const error = url.searchParams.get('error');

        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(
          '<html><body><h2>Authorization complete. You may close this tab.</h2></body></html>',
        );

        clearTimeout(timer);
        this._shutdown();

        if (error) {
          reject(new Error(`OAuth error: ${error}`));
        } else if (code) {
          resolve({ code, state: url.searchParams.get('state') ?? undefined });
        } else {
          reject(new Error('OAuth callback missing code parameter'));
        }
      });

      this.server.listen(this.port);
    });
  }

  getPort(): number {
    const addr = this.server?.address();
    if (!addr || typeof addr === 'string') return this.port;
    return addr.port;
  }

  private _shutdown(): void {
    if (this.server) {
      this.server.close();
      this.server = null;
    }
  }
}
