export type ApiUsage = {
  id: string;
  provider: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  costUsd: number;
  source: string;
  createdAt: number;
};

export type UsageSummary = {
  totalInputTokens: number;
  totalOutputTokens: number;
  totalCostUsd: number;
  requestCount: number;
  byProvider: Record<string, ProviderUsage>;
  byModel: Record<string, ModelUsage>;
};

export type ProviderUsage = {
  provider: string;
  inputTokens: number;
  outputTokens: number;
  costUsd: number;
  requestCount: number;
};

export type ModelUsage = {
  model: string;
  provider: string;
  inputTokens: number;
  outputTokens: number;
  costUsd: number;
  requestCount: number;
};

export type BudgetAlert = {
  provider?: string;
  model?: string;
  dailyLimitUsd?: number;
  weeklyLimitUsd?: number;
  monthlyLimitUsd?: number;
};

export type BudgetAlertResult = {
  triggered: boolean;
  period: 'daily' | 'weekly' | 'monthly';
  limitUsd: number;
  actualUsd: number;
  provider?: string;
  model?: string;
};
