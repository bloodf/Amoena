export const usageDailyUsage = [
  { date: "Mar 1", claude: 12400, openai: 3200, gemini: 1800, codex: 900 },
  { date: "Mar 2", claude: 18600, openai: 5100, gemini: 2200, codex: 1200 },
  { date: "Mar 3", claude: 9200, openai: 4800, gemini: 3100, codex: 600 },
  { date: "Mar 4", claude: 22100, openai: 6200, gemini: 1500, codex: 2100 },
  { date: "Mar 5", claude: 15800, openai: 3900, gemini: 4200, codex: 800 },
  { date: "Mar 6", claude: 31200, openai: 8100, gemini: 2800, codex: 1500 },
  { date: "Mar 7", claude: 24600, openai: 5600, gemini: 3400, codex: 2200 },
  { date: "Mar 8", claude: 19800, openai: 7200, gemini: 1900, codex: 1100 },
  { date: "Mar 9", claude: 28400, openai: 4500, gemini: 5100, codex: 1800 },
  { date: "Mar 10", claude: 16200, openai: 6800, gemini: 2600, codex: 900 },
];

export const usageDailyCost = [
  { date: "Mar 1", cost: 2.14 },
  { date: "Mar 2", cost: 3.82 },
  { date: "Mar 3", cost: 2.51 },
  { date: "Mar 4", cost: 4.28 },
  { date: "Mar 5", cost: 3.15 },
  { date: "Mar 6", cost: 5.94 },
  { date: "Mar 7", cost: 4.71 },
  { date: "Mar 8", cost: 3.89 },
  { date: "Mar 9", cost: 5.22 },
  { date: "Mar 10", cost: 3.41 },
];

export const usageSessionBreakdown = [
  { session: "JWT Auth Refactor", tokens: 42800, cost: 6.42, model: "Claude 4 Sonnet", provider: "Anthropic", requests: 34 },
  { session: "Rate Limiter Design", tokens: 28400, cost: 4.26, model: "Gemini 2.5 Pro", provider: "Google", requests: 22 },
  { session: "API Routes", tokens: 18200, cost: 3.64, model: "GPT-5.4", provider: "OpenAI", requests: 15 },
  { session: "Config Migration", tokens: 8600, cost: 1.29, model: "Gemini CLI", provider: "Google", requests: 8 },
  { session: "DB Schema Optimization", tokens: 31200, cost: 4.68, model: "Claude 4 Sonnet", provider: "Anthropic", requests: 28 },
  { session: "WebSocket Handler", tokens: 22400, cost: 3.36, model: "GPT-5.4", provider: "OpenAI", requests: 19 },
];

export const usageProviderQuotas = [
  { name: "Anthropic", color: "var(--tui-claude)", used: 142, limit: 1000, costPerK: 0.015, totalSpent: 14.82, resetsIn: "47m" },
  { name: "OpenAI", color: "var(--tui-opencode)", used: 38, limit: 500, costPerK: 0.02, totalSpent: 8.64, resetsIn: "2h 12m" },
  { name: "Google", color: "var(--tui-gemini)", used: 7, limit: 300, costPerK: 0.01, totalSpent: 5.55, resetsIn: "4h 31m" },
  { name: "Codex", color: "var(--tui-codex)", used: 22, limit: 200, costPerK: 0.012, totalSpent: 3.18, resetsIn: "1h 05m" },
];

export const usageApiRequestLog = [
  { time: "10:42 AM", model: "Claude 4 Sonnet", provider: "Anthropic", inputTokens: 2400, outputTokens: 1800, latency: "1.2s", cost: 0.063, session: "JWT Auth Refactor" },
  { time: "10:38 AM", model: "Claude 4 Sonnet", provider: "Anthropic", inputTokens: 1600, outputTokens: 2200, latency: "1.8s", cost: 0.057, session: "JWT Auth Refactor" },
  { time: "10:31 AM", model: "GPT-5.4", provider: "OpenAI", inputTokens: 3100, outputTokens: 900, latency: "0.9s", cost: 0.08, session: "API Routes" },
  { time: "10:22 AM", model: "Gemini 2.5 Pro", provider: "Google", inputTokens: 1200, outputTokens: 1500, latency: "0.7s", cost: 0.027, session: "Rate Limiter Design" },
  { time: "10:15 AM", model: "Claude 4 Sonnet", provider: "Anthropic", inputTokens: 4200, outputTokens: 3100, latency: "2.1s", cost: 0.11, session: "DB Schema Optimization" },
  { time: "10:08 AM", model: "Codex CLI", provider: "Codex", inputTokens: 800, outputTokens: 600, latency: "0.5s", cost: 0.017, session: "Config Migration" },
  { time: "09:55 AM", model: "GPT-5.4", provider: "OpenAI", inputTokens: 2800, outputTokens: 1400, latency: "1.1s", cost: 0.084, session: "WebSocket Handler" },
  { time: "09:42 AM", model: "Gemini 2.5 Pro", provider: "Google", inputTokens: 1900, outputTokens: 2100, latency: "0.8s", cost: 0.04, session: "Rate Limiter Design" },
];

export const usagePlatformBreakdown = [
  { name: "Anthropic", value: 45.8, color: "hsl(var(--tui-claude))" },
  { name: "OpenAI", value: 26.7, color: "hsl(var(--tui-opencode))" },
  { name: "Google", value: 17.2, color: "hsl(var(--tui-gemini))" },
  { name: "Codex", value: 10.3, color: "hsl(var(--tui-codex))" },
];

export type UsageTabId = "overview" | "sessions" | "api-log" | "platforms";
export type UsageTimeRange = "today" | "7d" | "30d" | "all";

export const usageTabs: { id: UsageTabId; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "sessions", label: "By Session" },
  { id: "api-log", label: "API Request Log" },
  { id: "platforms", label: "By Platform" },
];

export const usageTimeRanges: { id: UsageTimeRange; label: string }[] = [
  { id: "today", label: "Today" },
  { id: "7d", label: "7 days" },
  { id: "30d", label: "30 days" },
  { id: "all", label: "All time" },
];
