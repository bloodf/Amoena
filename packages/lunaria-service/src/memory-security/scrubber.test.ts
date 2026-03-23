import { describe, expect, it } from "vitest";
import { containsSecrets, scrubSecrets } from "./scrubber";

describe("scrubSecrets", () => {
	it("redacts Anthropic API keys", () => {
		const input = "Using key sk-ant-api03-abcdefghijklmnopqrst";
		const { text, redactedCount } = scrubSecrets(input);
		expect(text).toBe("Using key [REDACTED]");
		expect(redactedCount).toBe(1);
	});

	it("redacts OpenAI API keys", () => {
		const { text } = scrubSecrets("key: sk-proj-abcdefghijklmnopqrstuvwxyz1234567890");
		expect(text).not.toContain("sk-proj");
		expect(text).toContain("[REDACTED]");
	});

	it("redacts GitHub PATs", () => {
		const { text } = scrubSecrets("token=ghp_ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghij");
		expect(text).not.toContain("ghp_");
	});

	it("redacts Bearer tokens", () => {
		const { text } = scrubSecrets("Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.payload.sig");
		expect(text).toContain("[REDACTED]");
		expect(text).not.toContain("eyJ");
	});

	it("redacts password assignments", () => {
		const { text } = scrubSecrets('password = "super_secret_123"');
		expect(text).toContain("[REDACTED]");
		expect(text).not.toContain("super_secret");
	});

	it("redacts connection strings", () => {
		const { text } = scrubSecrets("postgres://admin:s3cret@db.host.com:5432/mydb");
		expect(text).toContain("[REDACTED]");
		expect(text).not.toContain("s3cret");
	});

	it("redacts AWS access keys", () => {
		const { text } = scrubSecrets("AWS_KEY=AKIAIOSFODNN7EXAMPLE");
		expect(text).toContain("[REDACTED]");
		expect(text).not.toContain("AKIAIOSFODNN");
	});

	it("redacts Stripe keys", () => {
		const { text } = scrubSecrets("rk_test_NOTREAL000000000000000000");
		expect(text).toContain("[REDACTED]");
	});

	it("handles multiple secrets in one string", () => {
		const input = "key1=sk-ant-api03-abcdefghijklmnopqrst and key2=ghp_ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghij";
		const { redactedCount } = scrubSecrets(input);
		expect(redactedCount).toBe(2);
	});

	it("returns zero count when no secrets", () => {
		const { text, redactedCount } = scrubSecrets("Hello, this is normal text.");
		expect(text).toBe("Hello, this is normal text.");
		expect(redactedCount).toBe(0);
	});

	it("tracks redacted types", () => {
		const { redactedTypes } = scrubSecrets("sk-ant-api03-abcdefghijklmnopqrst");
		expect(redactedTypes).toContain("Anthropic API key");
	});

	it("preserves surrounding text", () => {
		const { text } = scrubSecrets("before sk-ant-api03-abcdefghijklmnopqrst after");
		expect(text).toBe("before [REDACTED] after");
	});
});

describe("containsSecrets", () => {
	it("returns true when secrets present", () => {
		expect(containsSecrets("sk-ant-api03-abcdefghijklmnopqrst")).toBe(true);
	});

	it("returns false when no secrets", () => {
		expect(containsSecrets("just normal code here")).toBe(false);
	});

	it("detects password patterns", () => {
		expect(containsSecrets('password="mysecretpass"')).toBe(true);
	});
});
