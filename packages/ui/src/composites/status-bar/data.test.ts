import { describe, expect, test } from 'bun:test';

import {
  contextUsage,
  getSeverity,
  providerRates,
  runtimeConfig,
  type RuntimeLocation,
} from './data';

describe('getSeverity', () => {
  test('returns Safe for 0%', () => {
    const result = getSeverity(0);
    expect(result.label).toBe('Safe');
    expect(result.className).toContain('green');
  });

  test('returns Safe for 49%', () => {
    expect(getSeverity(49).label).toBe('Safe');
  });

  test('returns Caution for 50%', () => {
    expect(getSeverity(50).label).toBe('Caution');
    expect(getSeverity(50).className).toContain('warning');
  });

  test('returns Caution for 79%', () => {
    expect(getSeverity(79).label).toBe('Caution');
  });

  test('returns Warning for 80%', () => {
    expect(getSeverity(80).label).toBe('Warning');
    expect(getSeverity(80).className).toContain('destructive');
  });

  test('returns Warning for 94%', () => {
    expect(getSeverity(94).label).toBe('Warning');
  });

  test('returns Exhausted for 95%', () => {
    expect(getSeverity(95).label).toBe('Exhausted');
    expect(getSeverity(95).className).toContain('destructive');
  });

  test('returns Exhausted for 100%', () => {
    expect(getSeverity(100).label).toBe('Exhausted');
  });
});

describe('providerRates', () => {
  test('has multiple providers', () => {
    expect(providerRates.length).toBeGreaterThan(0);
  });

  test('each rate has required fields', () => {
    for (const rate of providerRates) {
      expect(rate.name).toBeTruthy();
      expect(rate.color).toBeTruthy();
      expect(typeof rate.used).toBe('number');
      expect(typeof rate.limit).toBe('number');
      expect(rate.model).toBeTruthy();
      expect(rate.resetsIn).toBeTruthy();
    }
  });

  test('used never exceeds limit', () => {
    for (const rate of providerRates) {
      expect(rate.used).toBeLessThanOrEqual(rate.limit);
    }
  });
});

describe('runtimeConfig', () => {
  const locations: RuntimeLocation[] = ['local', 'relay', 'offline', 'degraded'];

  test('every location has icon, label, and className', () => {
    for (const loc of locations) {
      const config = runtimeConfig[loc];
      expect(config).toBeDefined();
      expect(config.label).toBeTruthy();
      expect(config.className).toBeTruthy();
      expect(config.icon).toBeDefined();
    }
  });

  test('local uses green', () => {
    expect(runtimeConfig.local.className).toContain('green');
  });

  test('offline uses destructive', () => {
    expect(runtimeConfig.offline.className).toContain('destructive');
  });
});

describe('contextUsage', () => {
  test('has used and limit values', () => {
    expect(typeof contextUsage.used).toBe('number');
    expect(typeof contextUsage.limit).toBe('number');
    expect(contextUsage.used).toBeLessThanOrEqual(contextUsage.limit);
  });

  test('has icon', () => {
    expect(contextUsage.icon).toBeDefined();
  });
});
