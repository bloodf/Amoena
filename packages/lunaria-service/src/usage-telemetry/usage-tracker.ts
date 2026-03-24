import { randomUUID } from 'crypto';
import { calculateCost } from './pricing';
import type {
  ApiUsage,
  BudgetAlert,
  BudgetAlertResult,
  ModelUsage,
  ProviderUsage,
  UsageSummary,
} from './types';

type RecordUsageInput = {
  provider: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  source: string;
  costUsd?: number;
};

function startOfDayMs(date: Date): number {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function startOfWeekMs(date: Date): number {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - d.getDay());
  return d.getTime();
}

function startOfMonthMs(date: Date): number {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(1);
  return d.getTime();
}

function buildSummary(records: ApiUsage[]): UsageSummary {
  const byProvider: Record<string, ProviderUsage> = {};
  const byModel: Record<string, ModelUsage> = {};

  let totalInputTokens = 0;
  let totalOutputTokens = 0;
  let totalCostUsd = 0;

  for (const r of records) {
    totalInputTokens += r.inputTokens;
    totalOutputTokens += r.outputTokens;
    totalCostUsd += r.costUsd;

    const provKey = r.provider;
    const existing = byProvider[provKey];
    if (existing) {
      byProvider[provKey] = {
        ...existing,
        inputTokens: existing.inputTokens + r.inputTokens,
        outputTokens: existing.outputTokens + r.outputTokens,
        costUsd: existing.costUsd + r.costUsd,
        requestCount: existing.requestCount + 1,
      };
    } else {
      byProvider[provKey] = {
        provider: r.provider,
        inputTokens: r.inputTokens,
        outputTokens: r.outputTokens,
        costUsd: r.costUsd,
        requestCount: 1,
      };
    }

    const modelKey = `${r.provider}/${r.model}`;
    const existingModel = byModel[modelKey];
    if (existingModel) {
      byModel[modelKey] = {
        ...existingModel,
        inputTokens: existingModel.inputTokens + r.inputTokens,
        outputTokens: existingModel.outputTokens + r.outputTokens,
        costUsd: existingModel.costUsd + r.costUsd,
        requestCount: existingModel.requestCount + 1,
      };
    } else {
      byModel[modelKey] = {
        model: r.model,
        provider: r.provider,
        inputTokens: r.inputTokens,
        outputTokens: r.outputTokens,
        costUsd: r.costUsd,
        requestCount: 1,
      };
    }
  }

  return {
    totalInputTokens,
    totalOutputTokens,
    totalCostUsd,
    requestCount: records.length,
    byProvider,
    byModel,
  };
}

export class UsageTracker {
  private readonly records: ApiUsage[] = [];

  record(input: RecordUsageInput): ApiUsage {
    const costUsd =
      input.costUsd ?? calculateCost(input.model, input.inputTokens, input.outputTokens);

    const usage: ApiUsage = {
      id: randomUUID(),
      provider: input.provider,
      model: input.model,
      inputTokens: input.inputTokens,
      outputTokens: input.outputTokens,
      costUsd,
      source: input.source,
      createdAt: Date.now(),
    };

    this.records.push(usage);
    return usage;
  }

  getDailySummary(date = new Date()): UsageSummary {
    const start = startOfDayMs(date);
    const end = start + 24 * 60 * 60 * 1000;
    const filtered = this.records.filter((r) => r.createdAt >= start && r.createdAt < end);
    return buildSummary(filtered);
  }

  getWeeklySummary(date = new Date()): UsageSummary {
    const start = startOfWeekMs(date);
    const end = start + 7 * 24 * 60 * 60 * 1000;
    const filtered = this.records.filter((r) => r.createdAt >= start && r.createdAt < end);
    return buildSummary(filtered);
  }

  getMonthlySummary(date = new Date()): UsageSummary {
    const start = startOfMonthMs(date);
    const next = new Date(date);
    next.setMonth(next.getMonth() + 1);
    next.setDate(1);
    next.setHours(0, 0, 0, 0);
    const filtered = this.records.filter(
      (r) => r.createdAt >= start && r.createdAt < next.getTime(),
    );
    return buildSummary(filtered);
  }

  getByProvider(provider: string): ApiUsage[] {
    return this.records.filter((r) => r.provider === provider);
  }

  getByModel(model: string): ApiUsage[] {
    return this.records.filter((r) => r.model === model);
  }

  checkBudget(alert: BudgetAlert): BudgetAlertResult[] {
    const results: BudgetAlertResult[] = [];
    const now = new Date();

    const filterRecords = (records: ApiUsage[]) => {
      if (alert.provider) return records.filter((r) => r.provider === alert.provider);
      if (alert.model) return records.filter((r) => r.model === alert.model);
      return records;
    };

    if (alert.dailyLimitUsd !== undefined) {
      const summary = buildSummary(
        filterRecords(
          this.getDailySummary(now).requestCount >= 0
            ? this._getRecordsInRange(startOfDayMs(now), startOfDayMs(now) + 86400000)
            : [],
        ),
      );
      results.push({
        triggered: summary.totalCostUsd >= alert.dailyLimitUsd,
        period: 'daily',
        limitUsd: alert.dailyLimitUsd,
        actualUsd: summary.totalCostUsd,
        provider: alert.provider,
        model: alert.model,
      });
    }

    if (alert.weeklyLimitUsd !== undefined) {
      const start = startOfWeekMs(now);
      const summary = buildSummary(
        filterRecords(this._getRecordsInRange(start, start + 7 * 86400000)),
      );
      results.push({
        triggered: summary.totalCostUsd >= alert.weeklyLimitUsd,
        period: 'weekly',
        limitUsd: alert.weeklyLimitUsd,
        actualUsd: summary.totalCostUsd,
        provider: alert.provider,
        model: alert.model,
      });
    }

    if (alert.monthlyLimitUsd !== undefined) {
      const start = startOfMonthMs(now);
      const nextMonth = new Date(now);
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      nextMonth.setDate(1);
      nextMonth.setHours(0, 0, 0, 0);
      const summary = buildSummary(
        filterRecords(this._getRecordsInRange(start, nextMonth.getTime())),
      );
      results.push({
        triggered: summary.totalCostUsd >= alert.monthlyLimitUsd,
        period: 'monthly',
        limitUsd: alert.monthlyLimitUsd,
        actualUsd: summary.totalCostUsd,
        provider: alert.provider,
        model: alert.model,
      });
    }

    return results;
  }

  private _getRecordsInRange(startMs: number, endMs: number): ApiUsage[] {
    return this.records.filter((r) => r.createdAt >= startMs && r.createdAt < endMs);
  }
}
