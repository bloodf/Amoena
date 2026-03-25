import { describe, expect, it } from 'vitest';

import { CLI_WRAPPER_IDS, CLI_WRAPPER_PROVIDERS, NATIVE_PROVIDERS } from './constants';

describe('CLI_WRAPPER_PROVIDERS', () => {
  it('has multiple providers', () => {
    expect(CLI_WRAPPER_PROVIDERS.length).toBeGreaterThan(2);
  });

  it('each provider has id, label, desc, models, and color', () => {
    for (const provider of CLI_WRAPPER_PROVIDERS) {
      expect(provider.id).toBeTruthy();
      expect(provider.label).toBeTruthy();
      expect(provider.desc).toBeTruthy();
      expect(provider.models.length).toBeGreaterThan(0);
      expect(provider.color).toBeTruthy();
      expect(typeof provider.featured).toBe('boolean');
    }
  });

  it('provider ids are unique', () => {
    const ids = CLI_WRAPPER_PROVIDERS.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('includes claude, opencode, codex, and gemini', () => {
    const ids = CLI_WRAPPER_PROVIDERS.map((p) => p.id);
    expect(ids).toContain('claude');
    expect(ids).toContain('opencode');
    expect(ids).toContain('codex');
    expect(ids).toContain('gemini');
  });
});

describe('CLI_WRAPPER_IDS', () => {
  it('has an entry for each provider in CLI_WRAPPER_PROVIDERS', () => {
    for (const provider of CLI_WRAPPER_PROVIDERS) {
      expect(CLI_WRAPPER_IDS[provider.id]).toBeDefined();
    }
  });

  it('each entry has tuiType and executable', () => {
    for (const [, value] of Object.entries(CLI_WRAPPER_IDS)) {
      expect(value.tuiType).toBeTruthy();
      expect(value.executable).toBeTruthy();
    }
  });

  it('claude maps to claude executable', () => {
    expect(CLI_WRAPPER_IDS.claude!.executable).toBe('claude');
    expect(CLI_WRAPPER_IDS.claude!.tuiType).toBe('claude-code');
  });
});

describe('NATIVE_PROVIDERS', () => {
  it('includes anthropic, openai, and google', () => {
    expect(NATIVE_PROVIDERS.has('anthropic')).toBe(true);
    expect(NATIVE_PROVIDERS.has('openai')).toBe(true);
    expect(NATIVE_PROVIDERS.has('google')).toBe(true);
  });

  it('does not include CLI wrapper ids', () => {
    expect(NATIVE_PROVIDERS.has('claude')).toBe(false);
    expect(NATIVE_PROVIDERS.has('codex')).toBe(false);
    expect(NATIVE_PROVIDERS.has('gemini')).toBe(false);
  });

  it('has exactly 3 entries', () => {
    expect(NATIVE_PROVIDERS.size).toBe(3);
  });
});
