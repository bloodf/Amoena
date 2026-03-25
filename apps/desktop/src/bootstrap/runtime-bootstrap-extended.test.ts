import { describe, expect, it, vi } from 'vitest';

import {
  authenticateLaunchContext,
  isTauriRuntime,
  readDevLaunchContext,
  resolveLaunchContext,
  type LaunchContext,
} from './runtime-bootstrap';

describe('isTauriRuntime', () => {
  it('returns false in test environment (no __TAURI_INTERNALS__)', () => {
    expect(isTauriRuntime()).toBe(false);
  });
});

describe('readDevLaunchContext', () => {
  it('returns null when only base URL is set', () => {
    expect(readDevLaunchContext({ VITE_LUNARIA_API_BASE_URL: 'http://localhost' })).toBeNull();
  });

  it('returns null when only token is set', () => {
    expect(readDevLaunchContext({ VITE_LUNARIA_BOOTSTRAP_TOKEN: 'tok' })).toBeNull();
  });

  it('uses default bootstrap path when not specified', () => {
    const ctx = readDevLaunchContext({
      VITE_LUNARIA_API_BASE_URL: 'http://localhost',
      VITE_LUNARIA_BOOTSTRAP_TOKEN: 'tok',
    });
    expect(ctx!.bootstrapPath).toBe('/api/v1/bootstrap/auth');
  });

  it('uses default instance id when not specified', () => {
    const ctx = readDevLaunchContext({
      VITE_LUNARIA_API_BASE_URL: 'http://localhost',
      VITE_LUNARIA_BOOTSTRAP_TOKEN: 'tok',
    });
    expect(ctx!.instanceId).toBe('dev-browser');
  });

  it('defaults expiry to 0 when not specified', () => {
    const ctx = readDevLaunchContext({
      VITE_LUNARIA_API_BASE_URL: 'http://localhost',
      VITE_LUNARIA_BOOTSTRAP_TOKEN: 'tok',
    });
    expect(ctx!.expiresAtUnixMs).toBe(0);
  });

  it('parses expiry as number', () => {
    const ctx = readDevLaunchContext({
      VITE_LUNARIA_API_BASE_URL: 'http://localhost',
      VITE_LUNARIA_BOOTSTRAP_TOKEN: 'tok',
      VITE_LUNARIA_BOOTSTRAP_EXPIRES_AT: '1234567890',
    });
    expect(ctx!.expiresAtUnixMs).toBe(1234567890);
  });
});

describe('resolveLaunchContext', () => {
  it('throws when not Tauri and no dev env', async () => {
    await expect(resolveLaunchContext(vi.fn() as any, {})).rejects.toThrow(
      'Missing Lunaria launch context',
    );
  });

  it('returns dev launch context when env vars are set', async () => {
    const env = {
      VITE_LUNARIA_API_BASE_URL: 'http://localhost:3000',
      VITE_LUNARIA_BOOTSTRAP_TOKEN: 'my-token',
    };
    const result = await resolveLaunchContext(vi.fn() as any, env);
    expect(result.apiBaseUrl).toBe('http://localhost:3000');
    expect(result.bootstrapToken).toBe('my-token');
  });
});

describe('authenticateLaunchContext error handling', () => {
  const launchContext: LaunchContext = {
    apiBaseUrl: 'http://localhost:3000',
    bootstrapPath: '/api/v1/bootstrap/auth',
    bootstrapToken: 'tok',
    expiresAtUnixMs: 0,
    instanceId: 'test',
  };

  it('throws on non-ok response with status', async () => {
    const fetchMock = vi.fn(async () => ({
      ok: false,
      status: 401,
    })) as unknown as typeof fetch;

    await expect(authenticateLaunchContext(launchContext, fetchMock)).rejects.toThrow('401');
  });

  it('throws on network error', async () => {
    const fetchMock = vi.fn(async () => {
      throw new Error('Network failure');
    }) as unknown as typeof fetch;

    await expect(authenticateLaunchContext(launchContext, fetchMock)).rejects.toThrow(
      'Network failure',
    );
  });

  it('throws specific message on abort', async () => {
    const fetchMock = vi.fn(async () => {
      const err = new DOMException('signal timed out', 'AbortError');
      throw err;
    }) as unknown as typeof fetch;

    await expect(authenticateLaunchContext(launchContext, fetchMock)).rejects.toThrow(
      'Backend not responding',
    );
  });

  it('sends correct request body', async () => {
    const fetchMock = vi.fn(async () => ({
      ok: true,
      json: async () => ({
        apiBaseUrl: 'http://localhost',
        authToken: 'auth',
        instanceId: 'inst',
        sseBaseUrl: '/sse',
        tokenType: 'Bearer',
      }),
    })) as unknown as typeof fetch;

    await authenticateLaunchContext(launchContext, fetchMock);

    const [url, opts] = (fetchMock as any).mock.calls[0];
    expect(url).toBe('http://localhost:3000/api/v1/bootstrap/auth');
    expect(opts.method).toBe('POST');
    expect(JSON.parse(opts.body)).toEqual({ token: 'tok' });
    expect(opts.headers['Content-Type']).toBe('application/json');
  });
});
