import { NextResponse } from "next/server";

const MODEL_CATALOG = [
	{ id: "claude-opus-4-6", name: "Claude Opus 4.6", inputCost: 15, outputCost: 75, quality: 100 },
	{ id: "claude-sonnet-4-6", name: "Claude Sonnet 4.6", inputCost: 3, outputCost: 15, quality: 92 },
	{ id: "claude-haiku-4-5", name: "Claude Haiku 4.5", inputCost: 0.8, outputCost: 4, quality: 82 },
	{ id: "gpt-4o", name: "GPT-4o", inputCost: 2.5, outputCost: 10, quality: 88 },
	{ id: "gpt-4o-mini", name: "GPT-4o Mini", inputCost: 0.15, outputCost: 0.6, quality: 75 },
	{ id: "gemini-2.5-pro", name: "Gemini 2.5 Pro", inputCost: 1.25, outputCost: 10, quality: 90 },
	{ id: "gemini-2.5-flash", name: "Gemini 2.5 Flash", inputCost: 0.15, outputCost: 0.6, quality: 78 },
];

const QUALITY_THRESHOLDS: Record<string, number> = {
	trivial: 70, simple: 75, moderate: 85, complex: 90, expert: 95,
};

function estimateComplexity(desc: string): string {
	const lower = desc.toLowerCase();
	if (["lint", "spell check", "version bump"].some((s) => lower.includes(s))) return "trivial";
	if (["fix typo", "rename", "update dependency", "add test", "documentation"].some((s) => lower.includes(s))) return "simple";
	if (["architect", "security audit", "migration", "consensus"].some((s) => lower.includes(s))) return "expert";
	if (["implement", "feature", "integration", "debug", "refactor"].some((s) => lower.includes(s))) return "moderate";
	return "moderate";
}

export async function POST(request: Request) {
	try {
		const { currentModel, taskDescription } = await request.json();

		if (!currentModel || !taskDescription) {
			return NextResponse.json({ error: "currentModel and taskDescription required" }, { status: 400 });
		}

		const current = MODEL_CATALOG.find((m) => m.id === currentModel);
		if (!current) return NextResponse.json({ suggestion: null });

		const complexity = estimateComplexity(taskDescription);
		const minQuality = QUALITY_THRESHOLDS[complexity] ?? 85;

		const candidates = MODEL_CATALOG
			.filter((m) => m.quality >= minQuality)
			.sort((a, b) => a.inputCost - b.inputCost);

		const cheapest = candidates[0];
		if (!cheapest || cheapest.id === currentModel) {
			return NextResponse.json({ suggestion: null });
		}

		const currentCost = current.inputCost + current.outputCost;
		const suggestedCost = cheapest.inputCost + cheapest.outputCost;
		const savings = Math.round(((currentCost - suggestedCost) / currentCost) * 100);

		if (savings < 10) return NextResponse.json({ suggestion: null });

		return NextResponse.json({
			suggestion: {
				currentModel: current.name,
				suggestedModel: cheapest.name,
				suggestedModelId: cheapest.id,
				estimatedSavings: savings,
				qualityDelta: current.quality - cheapest.quality,
				complexity,
				reasoning: `${cheapest.name} meets quality threshold (${cheapest.quality}/${minQuality}) at ${savings}% lower cost.`,
			},
		});
	} catch {
		return NextResponse.json({ error: "Invalid request" }, { status: 400 });
	}
}
