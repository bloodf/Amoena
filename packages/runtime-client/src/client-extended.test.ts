import { describe, expect, test, vi } from 'vitest';

import { createRuntimeClient } from './client';

function createMockFetch(overrides: Partial<Response> = {}) {
  return vi.fn(async () => ({
    ok: true,
    status: 200,
    json: async () => ({}),
    ...overrides,
  })) as unknown as typeof fetch;
}

describe('runtime client error handling', () => {
  test('throws with status on non-ok response', async () => {
    const fetchMock = createMockFetch({
      ok: false,
      status: 404,
      json: async () => ({ error: 'Not found' }),
    });
    const client = createRuntimeClient({
      baseUrl: 'http://localhost:3000',
      fetchImpl: fetchMock,
    });

    try {
      await client.listSessions();
      expect(true).toBe(false);
    } catch (err: any) {
      expect(err.message).toContain('404');
      expect(err.message).toContain('Not found');
      expect(err.status).toBe(404);
    }
  });

  test('throws with message field on non-ok response', async () => {
    const fetchMock = createMockFetch({
      ok: false,
      status: 500,
      json: async () => ({ message: 'Internal error' }),
    });
    const client = createRuntimeClient({
      baseUrl: 'http://localhost:3000',
      fetchImpl: fetchMock,
    });

    try {
      await client.listSessions();
      expect(true).toBe(false);
    } catch (err: any) {
      expect(err.message).toContain('Internal error');
    }
  });

  test('throws with generic message when body is not JSON', async () => {
    const fetchMock = createMockFetch({
      ok: false,
      status: 502,
      json: async () => {
        throw new Error('not json');
      },
    });
    const client = createRuntimeClient({
      baseUrl: 'http://localhost:3000',
      fetchImpl: fetchMock,
    });

    try {
      await client.listSessions();
      expect(true).toBe(false);
    } catch (err: any) {
      expect(err.message).toContain('502');
    }
  });

  test('returns undefined for 204 responses', async () => {
    const fetchMock = createMockFetch({ ok: true, status: 204 });
    const client = createRuntimeClient({
      baseUrl: 'http://localhost:3000',
      fetchImpl: fetchMock,
    });

    const result = await client.deleteSession('session-1');
    expect(result).toBeUndefined();
  });
});

describe('runtime client content type', () => {
  test('sets Content-Type for POST with body', async () => {
    const fetchMock = createMockFetch({
      json: async () => ({ id: 'session-1' }),
    });
    const client = createRuntimeClient({
      baseUrl: 'http://localhost:3000',
      fetchImpl: fetchMock,
    });

    await client.createSession({} as any);

    const callArgs = (fetchMock as any).mock.calls[0];
    const headers = callArgs[1].headers as Headers;
    expect(headers.get('Content-Type')).toBe('application/json');
  });

  test('does not set Content-Type for GET requests', async () => {
    const fetchMock = createMockFetch({
      json: async () => [],
    });
    const client = createRuntimeClient({
      baseUrl: 'http://localhost:3000',
      fetchImpl: fetchMock,
    });

    await client.listSessions();

    const callArgs = (fetchMock as any).mock.calls[0];
    const headers = callArgs[1].headers as Headers;
    expect(headers.get('Content-Type')).toBeNull();
  });
});

describe('runtime client URL building', () => {
  test('sessionEventsUrl includes token', () => {
    const client = createRuntimeClient({
      baseUrl: 'http://localhost:3000',
      authToken: 'my-token',
    });
    const url = client.sessionEventsUrl('s-1');
    expect(url).toBe('http://localhost:3000/api/v1/sessions/s-1/stream?authToken=my-token');
  });

  test('sessionEventsUrl encodes special chars in token', () => {
    const client = createRuntimeClient({
      baseUrl: 'http://localhost:3000',
      authToken: 'token with spaces',
    });
    const url = client.sessionEventsUrl('s-1');
    expect(url).toContain('token%20with%20spaces');
  });

  test('sessionEventsUrl allows custom token override', () => {
    const client = createRuntimeClient({
      baseUrl: 'http://localhost:3000',
      authToken: 'default-token',
    });
    const url = client.sessionEventsUrl('s-1', 'custom-token');
    expect(url).toContain('authToken=custom-token');
  });

  test('globalEventsUrl includes token', () => {
    const client = createRuntimeClient({
      baseUrl: 'http://localhost:3000',
      authToken: 'my-token',
    });
    const url = client.globalEventsUrl();
    expect(url).toBe('http://localhost:3000/api/v1/events?authToken=my-token');
  });

  test('globalEventsUrl uses empty string when no auth token', () => {
    const client = createRuntimeClient({
      baseUrl: 'http://localhost:3000',
    });
    const url = client.globalEventsUrl();
    expect(url).toBe('http://localhost:3000/api/v1/events?authToken=');
  });
});

describe('runtime client API methods', () => {
  test('listSessionMessages calls correct URL', async () => {
    const fetchMock = createMockFetch({ json: async () => [] });
    const client = createRuntimeClient({
      baseUrl: 'http://localhost:3000',
      authToken: 't',
      fetchImpl: fetchMock,
    });

    await client.listSessionMessages('s-1');
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3000/api/v1/sessions/s-1/messages',
      expect.anything(),
    );
  });

  test('createSessionMessage sends POST with body', async () => {
    const fetchMock = createMockFetch({
      json: async () => ({ id: 'm-1' }),
    });
    const client = createRuntimeClient({
      baseUrl: 'http://localhost:3000',
      authToken: 't',
      fetchImpl: fetchMock,
    });

    await client.createSessionMessage('s-1', { content: 'hello' } as any);
    const callArgs = (fetchMock as any).mock.calls[0];
    expect(callArgs[1].method).toBe('POST');
    expect(JSON.parse(callArgs[1].body)).toEqual({ content: 'hello' });
  });

  test('interruptSession sends POST', async () => {
    const fetchMock = createMockFetch({ status: 204 });
    const client = createRuntimeClient({
      baseUrl: 'http://localhost:3000',
      authToken: 't',
      fetchImpl: fetchMock,
    });

    await client.interruptSession('s-1');
    const callArgs = (fetchMock as any).mock.calls[0];
    expect(callArgs[0]).toContain('/sessions/s-1/interrupt');
    expect(callArgs[1].method).toBe('POST');
  });

  test('listUsage builds query params correctly', async () => {
    const fetchMock = createMockFetch({ json: async () => [] });
    const client = createRuntimeClient({
      baseUrl: 'http://localhost:3000',
      authToken: 't',
      fetchImpl: fetchMock,
    });

    await client.listUsage({ limit: 10, offset: 5, range: 7 });
    const url = (fetchMock as any).mock.calls[0][0];
    expect(url).toContain('limit=10');
    expect(url).toContain('offset=5');
    expect(url).toContain('range=7');
  });

  test('listUsage omits empty params', async () => {
    const fetchMock = createMockFetch({ json: async () => [] });
    const client = createRuntimeClient({
      baseUrl: 'http://localhost:3000',
      authToken: 't',
      fetchImpl: fetchMock,
    });

    await client.listUsage();
    const url = (fetchMock as any).mock.calls[0][0];
    expect(url).toBe('http://localhost:3000/api/v1/usage');
  });

  test('listUsageDaily appends range', async () => {
    const fetchMock = createMockFetch({ json: async () => [] });
    const client = createRuntimeClient({
      baseUrl: 'http://localhost:3000',
      authToken: 't',
      fetchImpl: fetchMock,
    });

    await client.listUsageDaily(14);
    const url = (fetchMock as any).mock.calls[0][0];
    expect(url).toContain('range=14');
  });

  test('getUsageSummary appends range', async () => {
    const fetchMock = createMockFetch({ json: async () => [] });
    const client = createRuntimeClient({
      baseUrl: 'http://localhost:3000',
      authToken: 't',
      fetchImpl: fetchMock,
    });

    await client.getUsageSummary(30);
    const url = (fetchMock as any).mock.calls[0][0];
    expect(url).toContain('range=30');
  });

  test('searchMemory encodes query', async () => {
    const fetchMock = createMockFetch({ json: async () => [] });
    const client = createRuntimeClient({
      baseUrl: 'http://localhost:3000',
      authToken: 't',
      fetchImpl: fetchMock,
    });

    await client.searchMemory('hello world');
    const url = (fetchMock as any).mock.calls[0][0];
    expect(url).toContain('q=hello%20world');
  });

  test('getFileContent encodes path', async () => {
    const fetchMock = createMockFetch({
      json: async () => ({ path: '/a', content: '' }),
    });
    const client = createRuntimeClient({
      baseUrl: 'http://localhost:3000',
      authToken: 't',
      fetchImpl: fetchMock,
    });

    await client.getFileContent('/path/to file.ts');
    const url = (fetchMock as any).mock.calls[0][0];
    expect(url).toContain('path=%2Fpath%2Fto%20file.ts');
  });

  test('toggleExtension sends POST with enabled flag', async () => {
    const fetchMock = createMockFetch();
    const client = createRuntimeClient({
      baseUrl: 'http://localhost:3000',
      authToken: 't',
      fetchImpl: fetchMock,
    });

    await client.toggleExtension('ext-1', true);
    const callArgs = (fetchMock as any).mock.calls[0];
    expect(callArgs[0]).toContain('/extensions/ext-1/toggle');
    expect(JSON.parse(callArgs[1].body)).toEqual({ enabled: true });
  });

  test('installExtension sends FormData without Content-Type', async () => {
    const fetchMock = createMockFetch({
      json: async () => ({ id: 'ext-1' }),
    });
    const client = createRuntimeClient({
      baseUrl: 'http://localhost:3000',
      authToken: 't',
      fetchImpl: fetchMock,
    });

    const formData = new FormData();
    await client.installExtension(formData);
    const callArgs = (fetchMock as any).mock.calls[0];
    expect(callArgs[1].method).toBe('POST');
    // Content-Type should NOT be set for FormData
    const headers = callArgs[1].headers as Headers;
    expect(headers.get('Content-Type')).toBeNull();
  });

  test('completePairing skips auth', async () => {
    const fetchMock = createMockFetch({
      json: async () => ({ token: 't' }),
    });
    const client = createRuntimeClient({
      baseUrl: 'http://localhost:3000',
      authToken: 'secret',
      fetchImpl: fetchMock,
    });

    await client.completePairing({ pin: '1234' } as any);
    const headers = (fetchMock as any).mock.calls[0][1].headers as Headers;
    expect(headers.get('Authorization')).toBeNull();
  });

  test('refreshRemoteAuth skips auth', async () => {
    const fetchMock = createMockFetch({
      json: async () => ({ token: 't' }),
    });
    const client = createRuntimeClient({
      baseUrl: 'http://localhost:3000',
      authToken: 'secret',
      fetchImpl: fetchMock,
    });

    await client.refreshRemoteAuth('refresh-tok');
    const headers = (fetchMock as any).mock.calls[0][1].headers as Headers;
    expect(headers.get('Authorization')).toBeNull();
  });

  test('fireHook sends event name and payload', async () => {
    const fetchMock = createMockFetch({ json: async () => [] });
    const client = createRuntimeClient({
      baseUrl: 'http://localhost:3000',
      authToken: 't',
      fetchImpl: fetchMock,
    });

    await client.fireHook('on_save', { file: 'main.ts' });
    const body = JSON.parse((fetchMock as any).mock.calls[0][1].body);
    expect(body.eventName).toBe('on_save');
    expect(body.payload).toEqual({ file: 'main.ts' });
  });

  test('fireHook defaults payload to empty object', async () => {
    const fetchMock = createMockFetch({ json: async () => [] });
    const client = createRuntimeClient({
      baseUrl: 'http://localhost:3000',
      authToken: 't',
      fetchImpl: fetchMock,
    });

    await client.fireHook('on_start');
    const body = JSON.parse((fetchMock as any).mock.calls[0][1].body);
    expect(body.payload).toEqual({});
  });

  test('reorderQueue sends ordered ids', async () => {
    const fetchMock = createMockFetch({ status: 204 });
    const client = createRuntimeClient({
      baseUrl: 'http://localhost:3000',
      authToken: 't',
      fetchImpl: fetchMock,
    });

    await client.reorderQueue('s-1', ['q-3', 'q-1', 'q-2']);
    const body = JSON.parse((fetchMock as any).mock.calls[0][1].body);
    expect(body.orderedIds).toEqual(['q-3', 'q-1', 'q-2']);
  });

  test('postTeamMailbox sends message fields', async () => {
    const fetchMock = createMockFetch({
      json: async () => ({ id: 'msg-1' }),
    });
    const client = createRuntimeClient({
      baseUrl: 'http://localhost:3000',
      authToken: 't',
      fetchImpl: fetchMock,
    });

    await client.postTeamMailbox('team-1', {
      content: 'hello',
      fromAgentId: 'a1',
      toAgentId: 'a2',
    });
    const body = JSON.parse((fetchMock as any).mock.calls[0][1].body);
    expect(body.content).toBe('hello');
    expect(body.fromAgentId).toBe('a1');
    expect(body.toAgentId).toBe('a2');
  });
});
