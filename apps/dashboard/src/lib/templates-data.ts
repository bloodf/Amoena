export interface TaskHint {
	description: string;
	taskType: string;
	complexity: string;
}

export interface TemplateOptions {
	maxConcurrency?: number;
	timeoutMs?: number;
	preferredAgents?: string[];
}

export interface BuiltInTemplate {
	id: string;
	name: string;
	description: string;
	goalText: string;
	category: "built-in";
	tags: string[];
	taskHints: TaskHint[];
	options: TemplateOptions;
}

export const BUILT_IN_TEMPLATES: BuiltInTemplate[] = [
	{
		id: "builtin-add-feature",
		name: "Add a Feature",
		description: "Implement a new feature end-to-end with analysis, implementation, tests, and docs.",
		goalText: "Implement {feature_name}: {feature_description}",
		category: "built-in",
		tags: ["feature", "implementation"],
		taskHints: [
			{ description: "Analyze requirements and existing code", taskType: "analysis", complexity: "medium" },
			{ description: "Implement the feature", taskType: "implementation", complexity: "high" },
			{ description: "Write tests for the feature", taskType: "testing", complexity: "medium" },
			{ description: "Write documentation", taskType: "documentation", complexity: "low" },
		],
		options: { maxConcurrency: 3 },
	},
	{
		id: "builtin-fix-bug",
		name: "Fix a Bug",
		description: "Diagnose and fix a bug with root-cause analysis, implementation, and test verification.",
		goalText: "Fix bug: {bug_description}. Expected: {expected}. Actual: {actual}.",
		category: "built-in",
		tags: ["bug", "fix"],
		taskHints: [
			{ description: "Analyze root cause of the bug", taskType: "analysis", complexity: "medium" },
			{ description: "Implement the fix", taskType: "implementation", complexity: "medium" },
			{ description: "Add regression tests", taskType: "testing", complexity: "low" },
		],
		options: { maxConcurrency: 2 },
	},
	{
		id: "builtin-code-review",
		name: "Code Review",
		description: "Comprehensive code review covering security, performance, and quality concerns.",
		goalText: "Review {scope}: check for security issues, performance problems, and code quality.",
		category: "built-in",
		tags: ["review", "quality"],
		taskHints: [
			{ description: "Review for security vulnerabilities", taskType: "review", complexity: "high" },
			{ description: "Review for performance issues", taskType: "review", complexity: "medium" },
			{ description: "Review code quality and maintainability", taskType: "review", complexity: "medium" },
			{ description: "Document findings", taskType: "documentation", complexity: "low" },
		],
		options: { maxConcurrency: 3 },
	},
	{
		id: "builtin-refactor-module",
		name: "Refactor Module",
		description: "Improve module structure and reduce complexity while preserving existing behavior.",
		goalText: "Refactor {module}: improve structure, reduce complexity, maintain behavior.",
		category: "built-in",
		tags: ["refactoring", "cleanup"],
		taskHints: [
			{ description: "Analyze current structure and dependencies", taskType: "analysis", complexity: "medium" },
			{ description: "Perform the refactoring", taskType: "implementation", complexity: "high" },
			{ description: "Verify behavior is preserved with tests", taskType: "testing", complexity: "medium" },
		],
		options: { maxConcurrency: 2 },
	},
	{
		id: "builtin-write-tests",
		name: "Write Tests",
		description: "Add comprehensive test coverage including unit, integration, and edge-case tests.",
		goalText: "Add comprehensive tests for {module}: unit, integration, edge cases.",
		category: "built-in",
		tags: ["testing", "coverage"],
		taskHints: [
			{ description: "Analyze existing code and identify gaps", taskType: "analysis", complexity: "low" },
			{ description: "Write unit tests", taskType: "testing", complexity: "medium" },
			{ description: "Write integration tests", taskType: "testing", complexity: "medium" },
			{ description: "Write edge-case tests", taskType: "testing", complexity: "medium" },
		],
		options: { maxConcurrency: 3 },
	},
];
