import { exec } from 'child_process';
import { promisify } from 'util';
import { OAuthCallbackServer } from './oauth-server';
import { TokenStorage } from './token-store';
import type { OAuthConfig, OAuthTokens } from './types';

const execAsync = promisify(exec);

export type OAuthFlowOptions = {
  storage?: TokenStorage;
  openBrowser?: (url: string) => Promise<void>;
};

async function defaultOpenBrowser(url: string): Promise<void> {
  const { platform } = process;
  if (platform === 'darwin') {
    await execAsync(`open "${url}"`);
  } else if (platform === 'win32') {
    await execAsync(`start "" "${url}"`);
  } else {
    await execAsync(`xdg-open "${url}"`);
  }
}

async function exchangeCodeForTokens(
  config: OAuthConfig,
  code: string,
  fetchImpl: typeof fetch = fetch,
): Promise<OAuthTokens> {
  const params = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: config.redirectUri,
    client_id: config.clientId,
    client_secret: config.clientSecret,
  });

  const response = await fetchImpl(config.tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' },
    body: params.toString(),
  });

  if (!response.ok) {
    throw new Error(`Token exchange failed: ${response.status} ${response.statusText}`);
  }

  const data = (await response.json()) as {
    access_token: string;
    refresh_token?: string;
    token_type?: string;
    expires_in?: number;
    scope?: string;
  };

  const tokens: OAuthTokens = {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    tokenType: data.token_type ?? 'Bearer',
    scope: data.scope,
    expiresAt: data.expires_in ? Date.now() + data.expires_in * 1000 : undefined,
  };

  return tokens;
}

export class OAuthFlow {
  private readonly storage: TokenStorage;
  private readonly openBrowser: (url: string) => Promise<void>;

  constructor(options: OAuthFlowOptions = {}) {
    this.storage = options.storage ?? new TokenStorage();
    this.openBrowser = options.openBrowser ?? defaultOpenBrowser;
  }

  async startFlow(config: OAuthConfig, fetchImpl: typeof fetch = fetch): Promise<OAuthTokens> {
    const callbackServer = new OAuthCallbackServer();
    const callbackPromise = callbackServer.waitForCallback();

    // Wait for server to start and get actual port
    await new Promise<void>((resolve) => setTimeout(resolve, 10));
    const port = callbackServer.getPort();

    const redirectUri = `http://localhost:${port}/callback`;
    const configWithRedirect: OAuthConfig = { ...config, redirectUri };

    const authUrl = this._buildAuthUrl(configWithRedirect);
    await this.openBrowser(authUrl);

    const { code } = await callbackPromise;
    const tokens = await exchangeCodeForTokens(configWithRedirect, code, fetchImpl);
    this.storage.save(config.provider, tokens);
    return tokens;
  }

  getStoredTokens(provider: string): OAuthTokens | null {
    return this.storage.load(provider);
  }

  clearTokens(provider: string): void {
    this.storage.delete(provider);
  }

  private _buildAuthUrl(config: OAuthConfig): string {
    const params = new URLSearchParams({
      client_id: config.clientId,
      redirect_uri: config.redirectUri,
      response_type: 'code',
      scope: config.scopes.join(' '),
    });
    return `${config.authorizationUrl}?${params.toString()}`;
  }
}
