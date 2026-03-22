/**
 * Built-in agent workflow recipes.
 * Each recipe is a pre-configured agent task template that users can launch with one click.
 */

export interface AgentRecipe {
	readonly id: string;
	readonly name: string;
	readonly description: string;
	readonly icon: string;
	readonly category: "development" | "review" | "maintenance";
	readonly defaultModel: string;
	readonly systemPrompt: string;
	readonly suggestedTools: readonly string[];
	readonly estimatedCostRange: { readonly min: number; readonly max: number };
	readonly estimatedDuration: string;
}

export const BUILT_IN_RECIPES: readonly AgentRecipe[] = [
	{
		id: "pr-review",
		name: "PR Review",
		description: "Review a pull request for code quality, security, and correctness",
		icon: "git-pull-request",
		category: "review",
		defaultModel: "claude-sonnet-4-6",
		systemPrompt: `You are a thorough code reviewer. Review the PR diff for:
1. Logic errors and edge cases
2. Security vulnerabilities (injection, auth bypass, data exposure)
3. Performance concerns (N+1 queries, unnecessary allocations)
4. Code style and naming consistency
5. Missing tests for new codepaths

Be specific — reference file:line for each finding. Rate each issue as CRITICAL, HIGH, MEDIUM, or LOW.`,
		suggestedTools: ["read", "grep", "glob", "bash"],
		estimatedCostRange: { min: 0.05, max: 0.30 },
		estimatedDuration: "2-5 min",
	},
	{
		id: "bug-fix",
		name: "Bug Fix",
		description: "Diagnose and fix a bug with a regression test",
		icon: "bug",
		category: "development",
		defaultModel: "claude-sonnet-4-6",
		systemPrompt: `You are a systematic debugger. When given a bug report:
1. Reproduce the issue by understanding the described behavior
2. Trace the code path to find the root cause
3. Write a failing test that demonstrates the bug
4. Fix the bug with the minimal change needed
5. Verify the test passes
6. Check for similar bugs in related code

Always write the test BEFORE the fix.`,
		suggestedTools: ["read", "edit", "bash", "grep", "glob"],
		estimatedCostRange: { min: 0.10, max: 0.50 },
		estimatedDuration: "5-15 min",
	},
	{
		id: "feature-impl",
		name: "Feature Implementation",
		description: "Implement a new feature with tests and documentation",
		icon: "sparkles",
		category: "development",
		defaultModel: "claude-sonnet-4-6",
		systemPrompt: `You are a senior developer implementing a feature. Follow this workflow:
1. Read the feature description and understand requirements
2. Explore the codebase to understand existing patterns
3. Plan the implementation (files to create/modify)
4. Write tests first (TDD)
5. Implement the feature to pass tests
6. Verify all tests pass
7. Review your own code for edge cases

Prefer small files (<400 lines). Use existing patterns. Don't over-engineer.`,
		suggestedTools: ["read", "write", "edit", "bash", "grep", "glob"],
		estimatedCostRange: { min: 0.20, max: 1.00 },
		estimatedDuration: "10-30 min",
	},
	{
		id: "refactor",
		name: "Refactor",
		description: "Refactor code to improve structure without changing behavior",
		icon: "wrench",
		category: "maintenance",
		defaultModel: "claude-sonnet-4-6",
		systemPrompt: `You are refactoring code. Rules:
1. Run existing tests FIRST to establish a green baseline
2. Make structural changes in small, verifiable steps
3. Run tests after EVERY change — if they fail, revert
4. Never change behavior — only structure
5. Extract when a function exceeds 50 lines
6. Extract when a file exceeds 400 lines
7. Rename for clarity when names don't match behavior

Commit message format: refactor(scope): description`,
		suggestedTools: ["read", "edit", "bash", "grep", "glob"],
		estimatedCostRange: { min: 0.10, max: 0.50 },
		estimatedDuration: "5-20 min",
	},
	{
		id: "test-coverage",
		name: "Test Coverage",
		description: "Add tests to improve coverage for a module or file",
		icon: "shield-check",
		category: "maintenance",
		defaultModel: "claude-haiku-4-5",
		systemPrompt: `You are writing tests. For each function:
1. Read the function and understand all code paths
2. Write a test for the happy path
3. Write tests for each error path
4. Write tests for edge cases (null, empty, boundary values)
5. Write tests for concurrent access if applicable
6. Verify all tests pass

Use the project's existing test framework and patterns. Match naming conventions.`,
		suggestedTools: ["read", "write", "bash", "grep", "glob"],
		estimatedCostRange: { min: 0.05, max: 0.20 },
		estimatedDuration: "5-15 min",
	},
	{
		id: "documentation",
		name: "Documentation",
		description: "Generate or update documentation for a module",
		icon: "book-open",
		category: "maintenance",
		defaultModel: "claude-haiku-4-5",
		systemPrompt: `You are writing documentation. For each module:
1. Read all source files to understand the API surface
2. Write a README with: purpose, installation, quick start, API reference
3. Add JSDoc comments to exported functions missing them
4. Include usage examples for complex APIs
5. Document configuration options
6. Note any gotchas or known limitations

Write for a developer who has never seen this code. Be concise but complete.`,
		suggestedTools: ["read", "write", "grep", "glob"],
		estimatedCostRange: { min: 0.03, max: 0.15 },
		estimatedDuration: "3-10 min",
	},
] as const;

/** Get a recipe by ID */
export function getRecipe(id: string): AgentRecipe | undefined {
	return BUILT_IN_RECIPES.find((r) => r.id === id);
}

/** Get all recipes, optionally filtered by category */
export function listRecipes(category?: AgentRecipe["category"]): readonly AgentRecipe[] {
	if (!category) return BUILT_IN_RECIPES;
	return BUILT_IN_RECIPES.filter((r) => r.category === category);
}
