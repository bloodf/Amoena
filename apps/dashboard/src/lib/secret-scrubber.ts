import type { RunReport } from "./run-reporter";

export type SecretType =
	| "api_key"
	| "bearer_token"
	| "password"
	| "private_key"
	| "connection_string"
	| "aws_key"
	| "github_token"
	| "generic_secret";

export interface ScrubResult {
	/** The scrubbed text */
	text: string;
	/** Number of secrets found and redacted */
	redactedCount: number;
	/** Types of secrets found (for reporting) */
	redactedTypes: SecretType[];
}

export interface ScrubOptions {
	/** Replacement text (default: "[REDACTED]") */
	replacement?: string;
	/** Additional custom patterns to scrub */
	customPatterns?: RegExp[];
	/** Preserve length hint (show "[REDACTED:32chars]" instead of "[REDACTED]") */
	showLengthHint?: boolean;
}

interface SecretPattern {
	type: SecretType;
	pattern: RegExp;
}

const SECRET_PATTERNS: SecretPattern[] = [
	// Anthropic API key
	{ type: "api_key", pattern: /\bsk-ant-[A-Za-z0-9_-]{20,}\b/g },

	// OpenAI API key
	{ type: "api_key", pattern: /\bsk-[A-Za-z0-9]{20,}\b/g },

	// GitHub tokens
	{ type: "github_token", pattern: /\b(ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9]{36,}\b/g },

	// AWS keys
	{ type: "aws_key", pattern: /\b(AKIA|ASIA)[A-Z0-9]{16}\b/g },

	// Google API key
	{ type: "api_key", pattern: /\bAIza[A-Za-z0-9_-]{35}\b/g },

	// Bearer tokens
	{ type: "bearer_token", pattern: /\bBearer\s+[A-Za-z0-9._~+/=-]{20,}\b/g },

	// Private keys (PEM)
	{
		type: "private_key",
		pattern: /-----BEGIN\s+(RSA\s+)?PRIVATE\s+KEY-----[\s\S]*?-----END\s+(RSA\s+)?PRIVATE\s+KEY-----/g,
	},

	// Connection strings
	{
		type: "connection_string",
		pattern: /\b(postgres|mysql|mongodb|redis):\/\/[^\s'"]+/g,
	},

	// Generic secrets (key=value patterns)
	{
		type: "generic_secret",
		pattern: /(?:password|secret|token|api[_-]?key|auth)\s*[=:]\s*['"]?[A-Za-z0-9._~+/=-]{8,}['"]?/gi,
	},

	// API Keys (generic long tokens)
	{
		type: "api_key",
		pattern: /\b[A-Za-z0-9_-]{20,}(?:key|api|token|secret)[A-Za-z0-9_-]*\b/gi,
	},

	// Base64 encoded strings that look like secrets (>40 chars, high entropy)
	{ type: "generic_secret", pattern: /\b[A-Za-z0-9+/]{40,}={0,2}\b/g },
];

/** Scrub all secrets from a string */
export function scrubSecrets(text: string, options?: ScrubOptions): ScrubResult {
	const replacement = options?.replacement ?? "[REDACTED]";
	const showLength = options?.showLengthHint ?? false;

	// Collect all match intervals with their types
	const intervals: Array<{ start: number; end: number; type: SecretType }> = [];

	const allPatterns: SecretPattern[] = [
		...SECRET_PATTERNS,
		...(options?.customPatterns?.map((p) => ({ type: "generic_secret" as SecretType, pattern: p })) ?? []),
	];

	for (const { type, pattern } of allPatterns) {
		const cloned = new RegExp(pattern.source, pattern.flags);
		let match: RegExpExecArray | null;
		while ((match = cloned.exec(text)) !== null) {
			intervals.push({ start: match.index, end: match.index + match[0].length, type });
		}
	}

	if (intervals.length === 0) {
		return { text, redactedCount: 0, redactedTypes: [] };
	}

	// Merge overlapping intervals (take longest)
	intervals.sort((a, b) => a.start - b.start || b.end - a.end);
	const merged: Array<{ start: number; end: number; type: SecretType }> = [];
	for (const interval of intervals) {
		const last = merged[merged.length - 1];
		if (last && interval.start < last.end) {
			// Overlapping — extend if longer
			if (interval.end > last.end) {
				last.end = interval.end;
			}
		} else {
			merged.push({ ...interval });
		}
	}

	// Build scrubbed text
	const parts: string[] = [];
	let cursor = 0;
	for (const { start, end, type: _type } of merged) {
		parts.push(text.slice(cursor, start));
		const original = text.slice(start, end);
		if (showLength) {
			parts.push(`[REDACTED:${original.length}chars]`);
		} else {
			parts.push(replacement);
		}
		cursor = end;
	}
	parts.push(text.slice(cursor));

	const redactedTypes = [...new Set(merged.map((m) => m.type))];

	return {
		text: parts.join(""),
		redactedCount: merged.length,
		redactedTypes,
	};
}

/** Check if a string contains potential secrets (without scrubbing) */
export function containsSecrets(text: string): boolean {
	for (const { pattern } of SECRET_PATTERNS) {
		const cloned = new RegExp(pattern.source, pattern.flags);
		if (cloned.test(text)) return true;
	}
	return false;
}

/** Scrub all string fields in a RunReport recursively */
export function scrubReport(
	report: RunReport,
	options?: ScrubOptions,
): { report: RunReport; totalRedacted: number; types: SecretType[] } {
	let totalRedacted = 0;
	const allTypes = new Set<SecretType>();

	function scrub(text: string): string {
		const result = scrubSecrets(text, options);
		totalRedacted += result.redactedCount;
		for (const t of result.redactedTypes) allTypes.add(t);
		return result.text;
	}

	const scrubbedReport: RunReport = {
		...report,
		goalDescription: scrub(report.goalDescription),
		taskBreakdown: report.taskBreakdown.map((task) => ({
			...task,
			description: scrub(task.description),
			routingReason: scrub(task.routingReason),
			whyThisAgent: scrub(task.whyThisAgent),
			errorMessage: task.errorMessage != null ? scrub(task.errorMessage) : null,
		})),
		routingInsights: report.routingInsights.map((insight) => ({
			...insight,
			explanation: scrub(insight.explanation),
			improvementHint: scrub(insight.improvementHint),
		})),
		issues: report.issues.map((issue) => ({
			...issue,
			message: scrub(issue.message),
		})),
		mergeInfo: report.mergeInfo
			? {
					...report.mergeInfo,
					conflictedTasks: report.mergeInfo.conflictedTasks.map(scrub),
				}
			: null,
	};

	return {
		report: scrubbedReport,
		totalRedacted,
		types: [...allTypes],
	};
}
