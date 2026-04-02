import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/auth', () => ({
  requireRole: vi.fn(),
}));
vi.mock('@/lib/db', () => ({
  getDatabase: vi.fn(),
}));
vi.mock('@/lib/logger', () => ({
  logger: { error: vi.fn(), warn: vi.fn(), info: vi.fn() },
}));
vi.mock('@/lib/rate-limit', () => ({
  readLimiter: vi.fn(() => null),
}));
vi.mock('@/lib/cleanup', () => ({
  getReplayStorageInfo: vi.fn(() =>
    Promise.resolve({ recordingsDir: '/fake/recordings', retentionMs: 2592000000, deleted: 0, kept: 0 }),
  ),
  DEFAULT_RETENTION_MS: 30 * 24 * 60 * 60 * 1000,
  defaultRecordingsDir: vi.fn(() => '/fake/recordings'),
}));

import { requireRole } from '@/lib/auth';
import { getDatabase } from '@/lib/db';
import { GET } from '../route';

function makeRequest(url: string): Request & { nextUrl: URL } {
  const req = new Request(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  }) as Request & { nextUrl: URL };
  req.nextUrl = new URL(url);
  return req;
}

function mockAuth(role = 'viewer') {
  vi.mocked(requireRole).mockReturnValue({
    user: {
      id: 1,
      username: 'admin',
      role,
      workspace_id: 1,
      tenant_id: 1,
      display_name: 'Admin',
    },
  } as any);
}

function mockAuthError() {
  vi.mocked(requireRole).mockReturnValue({
    error: 'Unauthorized',
    status: 401,
  } as any);
}

function createMockDb() {
  const mockStmt = {
    all: vi.fn(() => []),
    get: vi.fn(() => null),
    run: vi.fn(() => ({ lastInsertRowid: 1, changes: 1 })),
  };
  const db = {
    prepare: vi.fn(() => mockStmt),
    exec: vi.fn(),
  };
  vi.mocked(getDatabase).mockReturnValue(db as any);
  return { db, mockStmt };
}

// Import readLimiter to mock it
import { readLimiter } from '@/lib/rate-limit';

describe('GET /api/replay', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset rate limiter to not rate limit by default
    vi.mocked(readLimiter).mockReturnValue(null);
  });

  it('returns 401 when unauthenticated', async () => {
    mockAuthError();
    const res = await GET(makeRequest('http://localhost/api/replay') as any);
    expect(res.status).toBe(401);
  });

  it('returns recordings list on success', async () => {
    mockAuth();
    const { mockStmt } = createMockDb();
    mockStmt.all.mockReturnValue([]);
    const res = await GET(makeRequest('http://localhost/api/replay') as any);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty('recordings');
    expect(body).toHaveProperty('storage');
    expect(body.storage).toHaveProperty('recordingsDir');
    expect(body.storage).toHaveProperty('retentionMs');
    expect(body.storage).toHaveProperty('deleted');
    expect(body.storage).toHaveProperty('kept');
  });

  it('returns recording by id', async () => {
    mockAuth();
    const { mockStmt } = createMockDb();
    mockStmt.get.mockReturnValue({
      id: 'rec-1',
      agent_name: 'test-agent',
      model: 'claude-3',
      duration_seconds: 120,
      cost_usd: 0.5,
      started_at: 1700000000,
      events: '[]',
      annotations: '[]',
    });
    const res = await GET(makeRequest('http://localhost/api/replay?id=rec-1') as any);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty('recording');
    // storage should not be present when fetching by id
    expect(body.storage).toBeUndefined();
  });

  it('returns 404 when recording not found', async () => {
    mockAuth();
    const { mockStmt } = createMockDb();
    mockStmt.get.mockReturnValue(undefined);
    const res = await GET(makeRequest('http://localhost/api/replay?id=nonexistent') as any);
    expect(res.status).toBe(404);
  });

  it('returns 429 when rate limited', async () => {
    mockAuth();
    vi.mocked(readLimiter).mockReturnValue(
      new Response(JSON.stringify({ error: 'Rate limited' }), { status: 429 }),
    );
    const res = await GET(makeRequest('http://localhost/api/replay') as any);
    expect(res.status).toBe(429);
  });

  it('returns 500 on internal error', async () => {
    mockAuth();
    vi.mocked(getDatabase).mockImplementation(() => {
      throw new Error('DB error');
    });
    const res = await GET(makeRequest('http://localhost/api/replay') as any);
    expect(res.status).toBe(500);
  });
});
