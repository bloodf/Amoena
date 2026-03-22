import { NextResponse } from "next/server";

// Inline recipe data to avoid cross-package import issues in Next.js API routes
const BUILT_IN_RECIPES = [
	{ id: "pr-review", name: "PR Review", description: "Review a pull request for code quality, security, and correctness", icon: "git-pull-request", category: "review", defaultModel: "claude-sonnet-4-6", estimatedDuration: "2-5 min" },
	{ id: "bug-fix", name: "Bug Fix", description: "Diagnose and fix a bug with a regression test", icon: "bug", category: "development", defaultModel: "claude-sonnet-4-6", estimatedDuration: "5-15 min" },
	{ id: "feature-impl", name: "Feature Implementation", description: "Implement a new feature with tests and documentation", icon: "sparkles", category: "development", defaultModel: "claude-sonnet-4-6", estimatedDuration: "10-30 min" },
	{ id: "refactor", name: "Refactor", description: "Refactor code to improve structure without changing behavior", icon: "wrench", category: "maintenance", defaultModel: "claude-sonnet-4-6", estimatedDuration: "5-20 min" },
	{ id: "test-coverage", name: "Test Coverage", description: "Add tests to improve coverage for a module or file", icon: "shield-check", category: "maintenance", defaultModel: "claude-haiku-4-5", estimatedDuration: "5-15 min" },
	{ id: "documentation", name: "Documentation", description: "Generate or update documentation for a module", icon: "book-open", category: "maintenance", defaultModel: "claude-haiku-4-5", estimatedDuration: "3-10 min" },
];

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	const category = searchParams.get("category");

	const recipes = category
		? BUILT_IN_RECIPES.filter((r) => r.category === category)
		: BUILT_IN_RECIPES;

	return NextResponse.json({ recipes });
}
