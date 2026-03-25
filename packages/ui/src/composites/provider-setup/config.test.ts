import { describe, expect, test } from 'bun:test';

import { initialProviders } from './config';

describe('initialProviders', () => {
  test('has multiple providers', () => {
    expect(initialProviders.length).toBeGreaterThan(3);
  });

  test('each provider has name, color, and status', () => {
    for (const provider of initialProviders) {
      expect(provider.name).toBeTruthy();
      expect(provider.color).toBeTruthy();
      expect(['connected', 'disconnected', 'error']).toContain(provider.status);
    }
  });

  test('each provider has at least one model', () => {
    for (const provider of initialProviders) {
      expect(provider.models.length).toBeGreaterThan(0);
    }
  });

  test('each model has name, ctx, and tier', () => {
    for (const provider of initialProviders) {
      for (const model of provider.models) {
        expect(model.name).toBeTruthy();
        expect(model.ctx).toBeTruthy();
        expect(model.tier).toBeTruthy();
        expect(typeof model.reasoning).toBe('boolean');
      }
    }
  });

  test('includes Anthropic provider', () => {
    const anthropic = initialProviders.find((p) => p.name === 'Anthropic');
    expect(anthropic).toBeDefined();
    expect(anthropic!.status).toBe('connected');
  });

  test('includes multiple statuses', () => {
    const statuses = new Set(initialProviders.map((p) => p.status));
    expect(statuses.size).toBeGreaterThan(1);
  });

  test('includes providers with reasoning models', () => {
    const withReasoning = initialProviders.filter((p) => p.models.some((m) => m.reasoning));
    expect(withReasoning.length).toBeGreaterThan(0);
  });

  test('model reasoning modes are valid', () => {
    for (const provider of initialProviders) {
      for (const model of provider.models) {
        expect(['auto', 'on', 'off']).toContain(model.reasoningMode);
      }
    }
  });
});
