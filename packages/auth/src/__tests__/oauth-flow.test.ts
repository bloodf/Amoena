import { describe, it, expect, beforeEach, mock } from 'bun:test';
import { OAuthFlow } from '../oauth/oauth-flow';
import type { OAuthConfig, OAuthTokens } from '../oauth/types';
import { TokenStorage } from '../oauth/token-store';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const makeConfig = (overrides: Partial<OAuthConfig> = {}): OAuthConfig => ({
  provider: 'github',
  clientId: 'test-client-id',
  clientSecret: 'test-client-secret',
  authorizationUrl: 'https://auth.example.com/authorize',
  tokenUrl: 'https://auth.example.com/token',
  redirectUri: 'http://localhost:9999/callback',
  scopes: ['read', 'write'],
  ...overrides,
});

const makeTokens = (overrides: Partial<OAuthTokens> = {}): OAuthTokens => ({
  accessToken: 'access-token-123',
  refreshToken: 'refresh-token-456',
  tokenType: 'Bearer',
  scope: 'read write',
  ...overrides,
});

// ---------------------------------------------------------------------------
// OAuthFlow instantiation
// ---------------------------------------------------------------------------

describe('OAuthFlow', () => {
  describe('constructor', () => {
    it('creates an instance with defaults', () => {
      const flow = new OAuthFlow();
      expect(flow).toBeInstanceOf(OAuthFlow);
    });

    it('accepts custom storage', () => {
      const storage = new TokenStorage('/tmp/test-tokens.json');
      const flow = new OAuthFlow({ storage });
      expect(flow).toBeInstanceOf(OAuthFlow);
    });

    it('accepts custom openBrowser function', () => {
      const openBrowser = async (_url: string) => {};
      const flow = new OAuthFlow({ openBrowser });
      expect(flow).toBeInstanceOf(OAuthFlow);
    });
  });

  // ---------------------------------------------------------------------------
  // Token storage delegation
  // ---------------------------------------------------------------------------

  describe('getStoredTokens / clearTokens', () => {
    let tmpPath: string;
    let flow: OAuthFlow;

    beforeEach(() => {
      tmpPath = `/tmp/oauth-test-${Date.now()}-${Math.random().toString(36).slice(2)}.json`;
      const storage = new TokenStorage(tmpPath);
      flow = new OAuthFlow({ storage });
    });

    it('returns null when no tokens stored', () => {
      expect(flow.getStoredTokens('github')).toBeNull();
    });

    it('returns null for unknown provider', () => {
      expect(flow.getStoredTokens('nonexistent')).toBeNull();
    });

    it('clears tokens without error even when nothing stored', () => {
      expect(() => flow.clearTokens('github')).not.toThrow();
    });
  });

  // ---------------------------------------------------------------------------
  // _buildAuthUrl (tested via startFlow's side-effect: the URL passed to openBrowser)
  // ---------------------------------------------------------------------------

  describe('auth URL construction', () => {
    it('builds correct auth URL with all params', async () => {
      let capturedUrl = '';
      const openBrowser = async (url: string) => {
        capturedUrl = url;
      };

      const flow = new OAuthFlow({ openBrowser });
      const config = makeConfig();

      // We can't complete the full flow because the callback server is involved,
      // but we can start it and then inspect the URL. We'll create a race with
      // a short timeout to capture the URL before the flow waits for callback.
      const flowPromise = flow.startFlow(config).catch(() => {});

      // Wait for openBrowser to be called
      await new Promise<void>((resolve) => setTimeout(resolve, 50));

      expect(capturedUrl).toContain('https://auth.example.com/authorize');
      expect(capturedUrl).toContain('client_id=test-client-id');
      expect(capturedUrl).toContain('response_type=code');
      expect(capturedUrl).toContain('scope=read+write');
      // redirectUri will be overridden with actual port, but should have localhost
      expect(capturedUrl).toContain('redirect_uri=http');
    });
  });

  // ---------------------------------------------------------------------------
  // startFlow — full exchange (mock HTTP + callback server)
  // ---------------------------------------------------------------------------

  describe('startFlow', () => {
    it('exchanges code for tokens and stores them', async () => {
      const tmpPath = `/tmp/oauth-flow-test-${Date.now()}.json`;
      const storage = new TokenStorage(tmpPath);
      let capturedUrl = '';

      const openBrowser = async (url: string) => {
        capturedUrl = url;
        // Extract the redirect_uri from the auth URL and call it with a code
        const parsed = new URL(url);
        const redirectUri = parsed.searchParams.get('redirect_uri');
        if (redirectUri) {
          // Simulate the OAuth provider redirecting back with a code
          await new Promise<void>((resolve) => setTimeout(resolve, 20));
          await fetch(`${redirectUri}?code=test-code-xyz&state=s1`).catch(() => {});
        }
      };

      const mockFetchImpl = async (input: string | URL | Request, init?: RequestInit): Promise<Response> => {
        // Mock the token exchange endpoint
        const body = init?.body?.toString() ?? '';
        if (body.includes('grant_type=authorization_code') && body.includes('code=test-code-xyz')) {
          return new Response(
            JSON.stringify({
              access_token: 'at-123',
              refresh_token: 'rt-456',
              token_type: 'Bearer',
              expires_in: 3600,
              scope: 'read write',
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } },
          );
        }
        return new Response('Not Found', { status: 404 });
      };

      const flow = new OAuthFlow({ storage, openBrowser });
      const config = makeConfig();
      const tokens = await flow.startFlow(config, mockFetchImpl as typeof fetch);

      expect(tokens.accessToken).toBe('at-123');
      expect(tokens.refreshToken).toBe('rt-456');
      expect(tokens.tokenType).toBe('Bearer');
      expect(tokens.scope).toBe('read write');
      expect(tokens.expiresAt).toBeGreaterThan(Date.now());

      // Verify tokens were persisted
      const stored = flow.getStoredTokens('github');
      expect(stored).not.toBeNull();
      expect(stored?.accessToken).toBe('at-123');
    });

    it('throws on failed token exchange (non-200 status)', async () => {
      const openBrowser = async (url: string) => {
        const parsed = new URL(url);
        const redirectUri = parsed.searchParams.get('redirect_uri');
        if (redirectUri) {
          await new Promise<void>((resolve) => setTimeout(resolve, 20));
          await fetch(`${redirectUri}?code=bad-code`).catch(() => {});
        }
      };

      const mockFetchImpl = async (): Promise<Response> => {
        return new Response('Unauthorized', { status: 401, statusText: 'Unauthorized' });
      };

      const flow = new OAuthFlow({ openBrowser });
      const config = makeConfig();

      await expect(flow.startFlow(config, mockFetchImpl as typeof fetch)).rejects.toThrow(
        'Token exchange failed: 401 Unauthorized',
      );
    });

    it('handles token response without optional fields', async () => {
      const openBrowser = async (url: string) => {
        const parsed = new URL(url);
        const redirectUri = parsed.searchParams.get('redirect_uri');
        if (redirectUri) {
          await new Promise<void>((resolve) => setTimeout(resolve, 20));
          await fetch(`${redirectUri}?code=minimal-code`).catch(() => {});
        }
      };

      const mockFetchImpl = async (): Promise<Response> => {
        return new Response(
          JSON.stringify({ access_token: 'at-minimal' }),
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        );
      };

      const tmpPath = `/tmp/oauth-flow-minimal-${Date.now()}.json`;
      const flow = new OAuthFlow({ storage: new TokenStorage(tmpPath), openBrowser });
      const tokens = await flow.startFlow(makeConfig(), mockFetchImpl as typeof fetch);

      expect(tokens.accessToken).toBe('at-minimal');
      expect(tokens.refreshToken).toBeUndefined();
      expect(tokens.tokenType).toBe('Bearer'); // defaults to Bearer
      expect(tokens.expiresAt).toBeUndefined();
      expect(tokens.scope).toBeUndefined();
    });
  });
});
