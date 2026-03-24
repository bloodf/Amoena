// Cost per 1M tokens in USD
const MODEL_PRICING: Record<string, { inputPer1M: number; outputPer1M: number }> = {
  // Anthropic
  'claude-opus-4-5': { inputPer1M: 15.0, outputPer1M: 75.0 },
  'claude-sonnet-4-5': { inputPer1M: 3.0, outputPer1M: 15.0 },
  'claude-haiku-4-5': { inputPer1M: 0.8, outputPer1M: 4.0 },
  'claude-opus-4': { inputPer1M: 15.0, outputPer1M: 75.0 },
  'claude-sonnet-4': { inputPer1M: 3.0, outputPer1M: 15.0 },
  'claude-haiku-4': { inputPer1M: 0.8, outputPer1M: 4.0 },
  'claude-3-5-sonnet': { inputPer1M: 3.0, outputPer1M: 15.0 },
  'claude-3-5-haiku': { inputPer1M: 0.8, outputPer1M: 4.0 },
  // OpenAI
  'gpt-4o': { inputPer1M: 2.5, outputPer1M: 10.0 },
  'gpt-4o-mini': { inputPer1M: 0.15, outputPer1M: 0.6 },
  'gpt-4-turbo': { inputPer1M: 10.0, outputPer1M: 30.0 },
  'gpt-4': { inputPer1M: 30.0, outputPer1M: 60.0 },
  o1: { inputPer1M: 15.0, outputPer1M: 60.0 },
  'o1-mini': { inputPer1M: 3.0, outputPer1M: 12.0 },
  // Google
  'gemini-2.0-flash': { inputPer1M: 0.1, outputPer1M: 0.4 },
  'gemini-1.5-pro': { inputPer1M: 3.5, outputPer1M: 10.5 },
  'gemini-1.5-flash': { inputPer1M: 0.075, outputPer1M: 0.3 },
};

const FALLBACK_PRICING = { inputPer1M: 1.0, outputPer1M: 4.0 };

export function calculateCost(model: string, inputTokens: number, outputTokens: number): number {
  const pricing = MODEL_PRICING[model] ?? FALLBACK_PRICING;
  const inputCost = (inputTokens / 1_000_000) * pricing.inputPer1M;
  const outputCost = (outputTokens / 1_000_000) * pricing.outputPer1M;
  return inputCost + outputCost;
}

export function getPricing(model: string): { inputPer1M: number; outputPer1M: number } {
  return MODEL_PRICING[model] ?? FALLBACK_PRICING;
}
