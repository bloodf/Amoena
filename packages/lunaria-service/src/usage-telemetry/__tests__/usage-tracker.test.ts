import { describe, expect, test, beforeEach } from 'bun:test';
import { UsageTracker } from '../usage-tracker';

describe('UsageTracker', () => {
  let tracker: UsageTracker;

  beforeEach(() => {
    tracker = new UsageTracker();
  });

  describe('record', () => {
    test('records usage and returns entry with id', () => {
      const usage = tracker.record({
        provider: 'anthropic',
        model: 'claude-sonnet-4',
        inputTokens: 1000,
        outputTokens: 500,
        source: 'test',
      });

      expect(usage.id).toBeDefined();
      expect(usage.provider).toBe('anthropic');
      expect(usage.model).toBe('claude-sonnet-4');
      expect(usage.inputTokens).toBe(1000);
      expect(usage.outputTokens).toBe(500);
      expect(usage.costUsd).toBeGreaterThan(0);
      expect(usage.source).toBe('test');
      expect(usage.createdAt).toBeGreaterThan(0);
    });

    test('uses provided costUsd when given', () => {
      const usage = tracker.record({
        provider: 'openai',
        model: 'gpt-4o',
        inputTokens: 100,
        outputTokens: 50,
        source: 'manual',
        costUsd: 0.42,
      });
      expect(usage.costUsd).toBe(0.42);
    });

    test('multiple records are stored independently', () => {
      tracker.record({
        provider: 'a',
        model: 'm1',
        inputTokens: 100,
        outputTokens: 50,
        source: 's',
      });
      tracker.record({
        provider: 'b',
        model: 'm2',
        inputTokens: 200,
        outputTokens: 100,
        source: 's',
      });
      expect(tracker.getByProvider('a')).toHaveLength(1);
      expect(tracker.getByProvider('b')).toHaveLength(1);
    });
  });

  describe('getDailySummary', () => {
    test('sums today records only', () => {
      tracker.record({
        provider: 'anthropic',
        model: 'claude-haiku-4',
        inputTokens: 1000,
        outputTokens: 500,
        source: 'chat',
      });
      tracker.record({
        provider: 'openai',
        model: 'gpt-4o',
        inputTokens: 2000,
        outputTokens: 1000,
        source: 'chat',
      });

      const summary = tracker.getDailySummary();
      expect(summary.requestCount).toBe(2);
      expect(summary.totalInputTokens).toBe(3000);
      expect(summary.totalOutputTokens).toBe(1500);
      expect(summary.totalCostUsd).toBeGreaterThan(0);
    });

    test('breaks down by provider', () => {
      tracker.record({
        provider: 'anthropic',
        model: 'claude-haiku-4',
        inputTokens: 100,
        outputTokens: 50,
        source: 's',
      });
      const summary = tracker.getDailySummary();
      expect(summary.byProvider['anthropic']).toBeDefined();
      expect(summary.byProvider['anthropic']?.requestCount).toBe(1);
    });

    test('breaks down by model', () => {
      tracker.record({
        provider: 'openai',
        model: 'gpt-4o',
        inputTokens: 100,
        outputTokens: 50,
        source: 's',
      });
      const summary = tracker.getDailySummary();
      const modelKey = 'openai/gpt-4o';
      expect(summary.byModel[modelKey]).toBeDefined();
    });

    test('returns zero summary when no records', () => {
      const summary = tracker.getDailySummary();
      expect(summary.requestCount).toBe(0);
      expect(summary.totalCostUsd).toBe(0);
    });
  });

  describe('getByProvider / getByModel', () => {
    test('filters by provider', () => {
      tracker.record({
        provider: 'anthropic',
        model: 'claude-sonnet-4',
        inputTokens: 100,
        outputTokens: 50,
        source: 's',
      });
      tracker.record({
        provider: 'openai',
        model: 'gpt-4o',
        inputTokens: 200,
        outputTokens: 100,
        source: 's',
      });

      expect(tracker.getByProvider('anthropic')).toHaveLength(1);
      expect(tracker.getByProvider('openai')).toHaveLength(1);
      expect(tracker.getByProvider('google')).toHaveLength(0);
    });

    test('filters by model', () => {
      tracker.record({
        provider: 'anthropic',
        model: 'claude-sonnet-4',
        inputTokens: 100,
        outputTokens: 50,
        source: 's',
      });
      tracker.record({
        provider: 'anthropic',
        model: 'claude-haiku-4',
        inputTokens: 200,
        outputTokens: 100,
        source: 's',
      });

      expect(tracker.getByModel('claude-sonnet-4')).toHaveLength(1);
      expect(tracker.getByModel('claude-haiku-4')).toHaveLength(1);
      expect(tracker.getByModel('gpt-4o')).toHaveLength(0);
    });
  });

  describe('checkBudget', () => {
    test('triggers daily alert when cost exceeds limit', () => {
      tracker.record({
        provider: 'openai',
        model: 'gpt-4o',
        inputTokens: 10_000_000,
        outputTokens: 5_000_000,
        source: 's',
      });

      const results = tracker.checkBudget({ dailyLimitUsd: 0.01 });
      const daily = results.find((r) => r.period === 'daily');
      expect(daily?.triggered).toBe(true);
    });

    test('does not trigger when cost is below limit', () => {
      tracker.record({
        provider: 'openai',
        model: 'gpt-4o-mini',
        inputTokens: 100,
        outputTokens: 50,
        source: 's',
      });

      const results = tracker.checkBudget({ dailyLimitUsd: 1000 });
      const daily = results.find((r) => r.period === 'daily');
      expect(daily?.triggered).toBe(false);
    });

    test('checks multiple periods', () => {
      const results = tracker.checkBudget({
        dailyLimitUsd: 10,
        weeklyLimitUsd: 50,
        monthlyLimitUsd: 200,
      });
      expect(results).toHaveLength(3);
      expect(results.map((r) => r.period).sort()).toEqual(['daily', 'monthly', 'weekly']);
    });

    test('returns empty array when no limits configured', () => {
      const results = tracker.checkBudget({});
      expect(results).toHaveLength(0);
    });
  });
});
