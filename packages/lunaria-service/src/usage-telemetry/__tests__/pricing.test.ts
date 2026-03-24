import { describe, expect, test } from 'bun:test';
import { calculateCost, getPricing } from '../pricing';

describe('calculateCost', () => {
  test('calculates cost for known model', () => {
    // gpt-4o: $2.5/1M input, $10/1M output
    const cost = calculateCost('gpt-4o', 1_000_000, 1_000_000);
    expect(cost).toBeCloseTo(12.5, 5);
  });

  test('calculates cost for claude model', () => {
    // claude-sonnet-4: $3/1M input, $15/1M output
    const cost = calculateCost('claude-sonnet-4', 500_000, 250_000);
    expect(cost).toBeCloseTo(1.5 + 3.75, 5);
  });

  test('uses fallback pricing for unknown model', () => {
    // fallback: $1/1M input, $4/1M output
    const cost = calculateCost('unknown-model-xyz', 1_000_000, 1_000_000);
    expect(cost).toBeCloseTo(5.0, 5);
  });

  test('returns zero cost for zero tokens', () => {
    const cost = calculateCost('gpt-4o', 0, 0);
    expect(cost).toBe(0);
  });

  test('handles only input tokens', () => {
    const cost = calculateCost('gpt-4o-mini', 1_000_000, 0);
    expect(cost).toBeCloseTo(0.15, 5);
  });
});

describe('getPricing', () => {
  test('returns known model pricing', () => {
    const pricing = getPricing('gpt-4o');
    expect(pricing.inputPer1M).toBe(2.5);
    expect(pricing.outputPer1M).toBe(10.0);
  });

  test('returns fallback for unknown model', () => {
    const pricing = getPricing('no-such-model');
    expect(pricing.inputPer1M).toBeGreaterThan(0);
    expect(pricing.outputPer1M).toBeGreaterThan(0);
  });
});
