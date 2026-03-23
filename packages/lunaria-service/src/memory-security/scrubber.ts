/**
 * Secret Scrubber — removes sensitive data from agent output before
 * storing in the memory system. Prevents API keys, passwords, and
 * tokens from being persisted in searchable memory.
 */

const REDACTED = "[REDACTED]";

/** Pattern definitions: regex + description for each secret type */
const SECRET_PATTERNS: ReadonlyArray<{
	readonly pattern: RegExp;
	readonly label: string;
}> = [
	// Anthropic API keys
	{ pattern: /sk-ant-[a-zA-Z0-9\-_]{20,}/g, label: "Anthropic API key" },
	// OpenAI API keys
	{ pattern: /sk-[a-zA-Z0-9\-_]{20,}/g, label: "OpenAI API key" },
	// GitHub tokens
	{ pattern: /ghp_[a-zA-Z0-9]{36,}/g, label: "GitHub PAT" },
	{ pattern: /gho_[a-zA-Z0-9]{36,}/g, label: "GitHub OAuth" },
	{ pattern: /ghs_[a-zA-Z0-9]{36,}/g, label: "GitHub App token" },
	{ pattern: /github_pat_[a-zA-Z0-9_]{20,}/g, label: "GitHub fine-grained PAT" },
	// Google API keys
	{ pattern: /AIza[a-zA-Z0-9\-_]{35}/g, label: "Google API key" },
	// AWS keys
	{ pattern: /AKIA[A-Z0-9]{16}/g, label: "AWS access key" },
	// Bearer tokens
	{ pattern: /Bearer\s+[a-zA-Z0-9\-_\.]{20,}/g, label: "Bearer token" },
	// Generic password patterns
	{ pattern: /password\s*[=:]\s*["']?[^\s"']{8,}["']?/gi, label: "Password assignment" },
	{ pattern: /passwd\s*[=:]\s*["']?[^\s"']{8,}["']?/gi, label: "Password assignment" },
	// Connection strings with credentials
	{ pattern: /(?:mysql|postgres|mongodb|redis):\/\/[^:]+:[^@]+@[^\s]+/g, label: "Connection string" },
	// Private keys
	{ pattern: /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----[\s\S]*?-----END (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/g, label: "Private key" },
	// Stripe keys
	{ pattern: /sk_(?:live|test)_[a-zA-Z0-9]{20,}/g, label: "Stripe secret key" },
	{ pattern: /pk_(?:live|test)_[a-zA-Z0-9]{20,}/g, label: "Stripe publishable key" },
	// Slack tokens
	{ pattern: /xox[bpras]-[a-zA-Z0-9\-]{10,}/g, label: "Slack token" },
	// Generic hex secrets (32+ chars, likely tokens)
	{ pattern: /(?:secret|token|key|api_key|apikey)\s*[=:]\s*["']?[a-f0-9]{32,}["']?/gi, label: "Generic secret" },
];

export interface ScrubResult {
	/** The scrubbed text with secrets replaced */
	readonly text: string;
	/** Number of secrets found and redacted */
	readonly redactedCount: number;
	/** Types of secrets found */
	readonly redactedTypes: readonly string[];
}

/**
 * Scrub secrets from text, replacing them with [REDACTED].
 * Returns the scrubbed text and metadata about what was found.
 */
export function scrubSecrets(text: string): ScrubResult {
	let result = text;
	let redactedCount = 0;
	const redactedTypes: string[] = [];

	for (const { pattern, label } of SECRET_PATTERNS) {
		// Reset regex state (global flag)
		const regex = new RegExp(pattern.source, pattern.flags);
		const matches = result.match(regex);
		if (matches && matches.length > 0) {
			redactedCount += matches.length;
			if (!redactedTypes.includes(label)) {
				redactedTypes.push(label);
			}
			result = result.replace(regex, REDACTED);
		}
	}

	return { text: result, redactedCount, redactedTypes };
}

/**
 * Check if text contains any secrets without modifying it.
 * Faster than scrubSecrets when you only need detection.
 */
export function containsSecrets(text: string): boolean {
	for (const { pattern } of SECRET_PATTERNS) {
		const regex = new RegExp(pattern.source, pattern.flags);
		if (regex.test(text)) return true;
	}
	return false;
}
