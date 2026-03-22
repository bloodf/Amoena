/**
 * Smart Cost Advisor — suggests cheaper models based on task complexity.
 * Analyzes task description and historical cost data to recommend the most
 * cost-effective model without significant quality loss.
 */

export interface ModelPricing {
	readonly id: string;
	readonly name: string;
	readonly inputCostPer1M: number;
	readonly outputCostPer1M: number;
	readonly qualityScore: number; // 0-100, relative capability
	readonly speedFactor: number; // 1.0 = baseline, 2.0 = 2x faster
}

export const MODEL_CATALOG: readonly ModelPricing[] = [
	{ id: "claude-opus-4-6", name: "Claude Opus 4.6", inputCostPer1M: 15, outputCostPer1M: 75, qualityScore: 100, speedFactor: 0.7 },
	{ id: "claude-sonnet-4-6", name: "Claude Sonnet 4.6", inputCostPer1M: 3, outputCostPer1M: 15, qualityScore: 92, speedFactor: 1.0 },
	{ id: "claude-haiku-4-5", name: "Claude Haiku 4.5", inputCostPer1M: 0.8, outputCostPer1M: 4, qualityScore: 82, speedFactor: 2.5 },
	{ id: "gpt-4o", name: "GPT-4o", inputCostPer1M: 2.5, outputCostPer1M: 10, qualityScore: 88, speedFactor: 1.2 },
	{ id: "gpt-4o-mini", name: "GPT-4o Mini", inputCostPer1M: 0.15, outputCostPer1M: 0.6, qualityScore: 75, speedFactor: 3.0 },
	{ id: "gemini-2.5-pro", name: "Gemini 2.5 Pro", inputCostPer1M: 1.25, outputCostPer1M: 10, qualityScore: 90, speedFactor: 1.1 },
	{ id: "gemini-2.5-flash", name: "Gemini 2.5 Flash", inputCostPer1M: 0.15, outputCostPer1M: 0.6, qualityScore: 78, speedFactor: 3.0 },
] as const;

export type TaskComplexity = "trivial" | "simple" | "moderate" | "complex" | "expert";

export interface CostSuggestion {
	readonly currentModel: string;
	readonly suggestedModel: string;
	readonly estimatedSavings: number; // percentage
	readonly qualityDelta: number; // percentage drop in quality
	readonly reasoning: string;
	readonly confidence: number; // 0-1
}

/** Estimate task complexity from description keywords */
export function estimateComplexity(taskDescription: string): TaskComplexity {
	const lower = taskDescription.toLowerCase();
	const complexSignals = ["architect", "design system", "security audit", "migration", "refactor entire", "consensus"];
	const moderateSignals = ["implement", "feature", "integration", "debug", "refactor"];
	const simpleSignals = ["fix typo", "rename", "update dependency", "add test", "documentation", "format"];
	const trivialSignals = ["lint", "spell check", "version bump"];

	if (trivialSignals.some((s) => lower.includes(s))) return "trivial";
	if (simpleSignals.some((s) => lower.includes(s))) return "simple";
	if (complexSignals.some((s) => lower.includes(s))) return "expert";
	if (moderateSignals.some((s) => lower.includes(s))) return "moderate";
	return "moderate";
}

/** Minimum quality score required per complexity level */
const QUALITY_THRESHOLDS: Record<TaskComplexity, number> = {
	trivial: 70,
	simple: 75,
	moderate: 85,
	complex: 90,
	expert: 95,
};

/** Suggest a more cost-effective model for a given task */
export function suggestModel(
	currentModelId: string,
	taskDescription: string,
): CostSuggestion | null {
	const currentModel = MODEL_CATALOG.find((m) => m.id === currentModelId);
	if (!currentModel) return null;

	const complexity = estimateComplexity(taskDescription);
	const minQuality = QUALITY_THRESHOLDS[complexity];

	// Find the cheapest model that meets the quality threshold
	const candidates = MODEL_CATALOG
		.filter((m) => m.qualityScore >= minQuality)
		.sort((a, b) => a.inputCostPer1M - b.inputCostPer1M);

	const cheapest = candidates[0];
	if (!cheapest || cheapest.id === currentModelId) return null;

	const currentCost = currentModel.inputCostPer1M + currentModel.outputCostPer1M;
	const suggestedCost = cheapest.inputCostPer1M + cheapest.outputCostPer1M;
	const savings = Math.round(((currentCost - suggestedCost) / currentCost) * 100);
	const qualityDelta = currentModel.qualityScore - cheapest.qualityScore;

	if (savings < 10) return null; // Not worth suggesting for <10% savings

	return {
		currentModel: currentModel.name,
		suggestedModel: cheapest.name,
		estimatedSavings: savings,
		qualityDelta,
		reasoning: `Task complexity: ${complexity}. ${cheapest.name} meets the quality threshold (${cheapest.qualityScore}/${minQuality} required) at ${savings}% lower cost.`,
		confidence: qualityDelta <= 5 ? 0.9 : qualityDelta <= 10 ? 0.7 : 0.5,
	};
}
