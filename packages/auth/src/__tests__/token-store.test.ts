import { describe, expect, test, beforeEach, afterEach } from 'bun:test';
import { mkdirSync, rmSync, existsSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { TokenStorage } from '../oauth/token-store';
import type { OAuthTokens } from '../oauth/types';

const TEST_DIR = join(tmpdir(), `lunaria-token-test-${process.pid}`);
const TEST_FILE = join(TEST_DIR, 'tokens.json');

describe('TokenStorage', () => {
  let storage: TokenStorage;

  beforeEach(() => {
    mkdirSync(TEST_DIR, { recursive: true });
    storage = new TokenStorage(TEST_FILE);
  });

  afterEach(() => {
    if (existsSync(TEST_DIR)) {
      rmSync(TEST_DIR, { recursive: true, force: true });
    }
  });

  const sampleTokens: OAuthTokens = {
    accessToken: 'access-abc',
    refreshToken: 'refresh-xyz',
    tokenType: 'Bearer',
    expiresAt: Date.now() + 3600 * 1000,
    scope: 'read write',
  };

  test('saves and loads tokens for a provider', () => {
    storage.save('github', sampleTokens);
    const loaded = storage.load('github');
    expect(loaded).not.toBeNull();
    expect(loaded?.accessToken).toBe('access-abc');
    expect(loaded?.refreshToken).toBe('refresh-xyz');
  });

  test('returns null for unknown provider', () => {
    const loaded = storage.load('nonexistent');
    expect(loaded).toBeNull();
  });

  test('saves multiple providers independently', () => {
    const googleTokens: OAuthTokens = { accessToken: 'g-token', tokenType: 'Bearer' };
    storage.save('github', sampleTokens);
    storage.save('google', googleTokens);

    expect(storage.load('github')?.accessToken).toBe('access-abc');
    expect(storage.load('google')?.accessToken).toBe('g-token');
  });

  test("deletes a provider's tokens", () => {
    storage.save('github', sampleTokens);
    storage.delete('github');
    expect(storage.load('github')).toBeNull();
  });

  test('delete is idempotent', () => {
    storage.delete('never-existed');
    expect(storage.load('never-existed')).toBeNull();
  });

  test('overwrites existing tokens on save', () => {
    storage.save('github', sampleTokens);
    const updated: OAuthTokens = { ...sampleTokens, accessToken: 'new-token' };
    storage.save('github', updated);
    expect(storage.load('github')?.accessToken).toBe('new-token');
  });

  describe('isExpired', () => {
    test('returns false when no expiresAt', () => {
      const tokens: OAuthTokens = { accessToken: 'tok', tokenType: 'Bearer' };
      expect(storage.isExpired(tokens)).toBe(false);
    });

    test('returns false when not yet expired', () => {
      const tokens: OAuthTokens = {
        accessToken: 'tok',
        tokenType: 'Bearer',
        expiresAt: Date.now() + 10_000,
      };
      expect(storage.isExpired(tokens)).toBe(false);
    });

    test('returns true when expired', () => {
      const tokens: OAuthTokens = {
        accessToken: 'tok',
        tokenType: 'Bearer',
        expiresAt: Date.now() - 1,
      };
      expect(storage.isExpired(tokens)).toBe(true);
    });
  });
});
