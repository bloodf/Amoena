import { describe, expect, test } from 'bun:test';
import { OAuthCallbackServer } from '../oauth/oauth-server';

describe('OAuthCallbackServer', () => {
  test('resolves with code from callback request', async () => {
    const server = new OAuthCallbackServer({ timeoutMs: 5000 });
    const callbackPromise = server.waitForCallback();

    // Give server time to bind
    await new Promise<void>((resolve) => setTimeout(resolve, 20));
    const port = server.getPort();
    expect(port).toBeGreaterThan(0);

    // Simulate OAuth provider redirecting back with code
    const response = await fetch(`http://localhost:${port}/callback?code=auth-code-123&state=xyz`);
    expect(response.ok).toBe(true);

    const result = await callbackPromise;
    expect(result.code).toBe('auth-code-123');
    expect(result.state).toBe('xyz');
  });

  test('rejects when error param is present', async () => {
    const server = new OAuthCallbackServer({ timeoutMs: 5000 });
    // Attach .catch before making the request to prevent unhandled rejection
    let caught: Error | null = null;
    const callbackPromise = server.waitForCallback().catch((err: Error) => {
      caught = err;
    });

    await new Promise<void>((resolve) => setTimeout(resolve, 20));
    const port = server.getPort();

    await fetch(`http://localhost:${port}/callback?error=access_denied`).catch(() => {});
    await callbackPromise;

    expect(caught).not.toBeNull();
    expect(caught?.message).toContain('OAuth error: access_denied');
  });

  test('rejects when callback has no code or error', async () => {
    const server = new OAuthCallbackServer({ timeoutMs: 5000 });
    let caught: Error | null = null;
    const callbackPromise = server.waitForCallback().catch((err: Error) => {
      caught = err;
    });

    await new Promise<void>((resolve) => setTimeout(resolve, 20));
    const port = server.getPort();

    await fetch(`http://localhost:${port}/callback`).catch(() => {});
    await callbackPromise;

    expect(caught).not.toBeNull();
    expect(caught?.message).toContain('missing code parameter');
  });
});
