import { describe, expect, it, vi } from 'vitest';

import {
  authenticateLaunchContext,
  readDevLaunchContext,
  type BootstrapSession,
  type LaunchContext,
} from './runtime-bootstrap';

describe('readDevLaunchContext', () => {
  it('returns null when required env is missing', () => {
    expect(readDevLaunchContext({})).toBeNull();
  });

  it('maps dev env into the launch contract', () => {
    expect(
      readDevLaunchContext({
        VITE_LUNARIA_API_BASE_URL: 'http://127.0.0.1:41237',
        VITE_LUNARIA_BOOTSTRAP_TOKEN: 'launch-token',
        VITE_LUNARIA_BOOTSTRAP_PATH: '/api/v1/bootstrap/auth',
        VITE_LUNARIA_BOOTSTRAP_EXPIRES_AT: '42',
        VITE_LUNARIA_INSTANCE_ID: 'instance-123',
      }),
    ).toEqual({
      apiBaseUrl: 'http://127.0.0.1:41237',
      bootstrapPath: '/api/v1/bootstrap/auth',
      bootstrapToken: 'launch-token',
      expiresAtUnixMs: 42,
      instanceId: 'instance-123',
    });
  });
});

describe('authenticateLaunchContext', () => {
  it('posts the bootstrap token and returns the session payload', async () => {
    const launchContext: LaunchContext = {
      apiBaseUrl: 'http://127.0.0.1:41237',
      bootstrapPath: '/api/v1/bootstrap/auth',
      bootstrapToken: 'launch-token',
      expiresAtUnixMs: 42,
      instanceId: 'instance-123',
    };
    const session: BootstrapSession = {
      apiBaseUrl: launchContext.apiBaseUrl,
      authToken: 'session-token',
      instanceId: launchContext.instanceId,
      sseBaseUrl: `${launchContext.apiBaseUrl}/events`,
      tokenType: 'Bearer',
    };
    const fetchMock = vi.fn(async () => ({
      ok: true,
      json: async () => session,
    })) as unknown as typeof fetch;

    const result = await authenticateLaunchContext(launchContext, fetchMock);

    expect(fetchMock).toHaveBeenCalledWith(
      'http://127.0.0.1:41237/api/v1/bootstrap/auth',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: 'launch-token' }),
      }),
    );
    expect(result).toEqual(session);
  });
});
