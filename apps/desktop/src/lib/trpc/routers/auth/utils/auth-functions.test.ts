import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import fs from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const TEST_DIR = join(tmpdir(), `auth-functions-test-${process.pid}-${Date.now()}`);

vi.mock('main/lib/app-environment', () => ({
  AMOENA_HOME_DIR: TEST_DIR,
}));

vi.mock('shared/constants', () => ({
  PROTOCOL_SCHEME: 'amoena',
}));

// Import after mocks
const {
  loadToken,
  saveToken,
  handleAuthCallback,
  parseAuthDeepLink,
  stateStore,
  authEvents,
  TOKEN_FILE,
} = await import('./auth-functions');

describe('auth-functions', () => {
  beforeEach(async () => {
    await fs.mkdir(TEST_DIR, { recursive: true });
    stateStore.clear();
  });

  afterEach(async () => {
    await fs.rm(TEST_DIR, { recursive: true, force: true });
  });

  describe('loadToken', () => {
    it('returns nulls when no token file exists', async () => {
      const result = await loadToken();
      expect(result).toEqual({ token: null, expiresAt: null });
    });
  });

  describe('saveToken + loadToken round-trip', () => {
    it('saves and loads a token', async () => {
      await saveToken({ token: 'my-token', expiresAt: '2025-12-31' });
      const result = await loadToken();
      expect(result.token).toBe('my-token');
      expect(result.expiresAt).toBe('2025-12-31');
    });

    it('emits token-saved event', async () => {
      let emitted: unknown = null;
      authEvents.once('token-saved', (data: unknown) => {
        emitted = data;
      });
      await saveToken({ token: 't', expiresAt: 'e' });
      expect(emitted).toEqual({ token: 't', expiresAt: 'e' });
    });
  });

  describe('handleAuthCallback', () => {
    it('fails with invalid state', async () => {
      const result = await handleAuthCallback({
        token: 'tok',
        expiresAt: 'exp',
        state: 'unknown-state',
      });
      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid or expired');
    });

    it('succeeds with valid state and saves token', async () => {
      stateStore.set('valid-state', Date.now());
      const result = await handleAuthCallback({
        token: 'my-token',
        expiresAt: '2025-12-31',
        state: 'valid-state',
      });
      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();

      // State should be consumed (deleted)
      expect(stateStore.has('valid-state')).toBe(false);

      // Token should be saved
      const loaded = await loadToken();
      expect(loaded.token).toBe('my-token');
    });
  });

  describe('parseAuthDeepLink', () => {
    it('returns null for invalid URLs', () => {
      expect(parseAuthDeepLink('not-a-url')).toBeNull();
    });

    it('returns null for wrong protocol', () => {
      expect(parseAuthDeepLink('https://auth/callback?token=t&expiresAt=e&state=s')).toBeNull();
    });

    it('returns null for wrong host', () => {
      expect(
        parseAuthDeepLink('amoena://settings/callback?token=t&expiresAt=e&state=s'),
      ).toBeNull();
    });

    it('returns null for wrong path', () => {
      expect(parseAuthDeepLink('amoena://auth/login?token=t&expiresAt=e&state=s')).toBeNull();
    });

    it('returns null when missing required params', () => {
      expect(parseAuthDeepLink('amoena://auth/callback?token=t&expiresAt=e')).toBeNull();
      expect(parseAuthDeepLink('amoena://auth/callback?token=t&state=s')).toBeNull();
      expect(parseAuthDeepLink('amoena://auth/callback?expiresAt=e&state=s')).toBeNull();
    });

    it('parses a valid deep link', () => {
      const result = parseAuthDeepLink(
        'amoena://auth/callback?token=my-token&expiresAt=2025-12-31&state=abc',
      );
      expect(result).toEqual({
        token: 'my-token',
        expiresAt: '2025-12-31',
        state: 'abc',
      });
    });
  });
});
