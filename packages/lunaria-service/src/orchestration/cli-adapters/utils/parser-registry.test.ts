import { describe, it, expect, vi, afterEach } from "vitest";
import {
  ParserRegistry,
  detectVersionFromLine,
  rawOutputParser,
  parserRegistry,
} from "./parser-registry.js";

// ---------------------------------------------------------------------------
// detectVersionFromLine
// ---------------------------------------------------------------------------

describe("detectVersionFromLine", () => {
  it("detects a plain semver", () => {
    expect(detectVersionFromLine("Claude Code 1.2.3")).toBe("1.2.3");
  });

  it("detects a version with v prefix word-boundary", () => {
    expect(detectVersionFromLine("Codex CLI v0.4.1")).toBe("0.4.1");
  });

  it("detects a pre-release version", () => {
    expect(detectVersionFromLine("Gemini CLI 2.0.0-beta")).toBe("2.0.0-beta");
  });

  it("returns null when no semver present", () => {
    expect(detectVersionFromLine("Loading configuration...")).toBeNull();
  });

  it("returns null for an empty string", () => {
    expect(detectVersionFromLine("")).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// rawOutputParser
// ---------------------------------------------------------------------------

describe("rawOutputParser", () => {
  it("returns an empty ParsedOutput for any input", () => {
    expect(rawOutputParser("some line")).toEqual({});
    expect(rawOutputParser("")).toEqual({});
    expect(rawOutputParser('{"type":"result"}')).toEqual({});
  });
});

// ---------------------------------------------------------------------------
// ParserRegistry
// ---------------------------------------------------------------------------

describe("ParserRegistry", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("resolves a registered parser by version", () => {
    const registry = new ParserRegistry();
    const mockParser = vi.fn(() => ({ isCompletion: true }));

    registry.register("my-agent", {
      matches: (v) => v === "1.0.0",
      parser: mockParser,
    });

    const parser = registry.resolve("my-agent", "1.0.0");
    expect(parser).toBe(mockParser);
  });

  it("uses first matching entry when multiple are registered", () => {
    const registry = new ParserRegistry();
    const parserA = vi.fn(() => ({}));
    const parserB = vi.fn(() => ({}));

    registry.register("agent", { matches: (v) => v.startsWith("1."), parser: parserA });
    registry.register("agent", { matches: () => true, parser: parserB });

    const resolved = registry.resolve("agent", "1.5.0");
    expect(resolved).toBe(parserA);
  });

  it("falls back to rawOutputParser for unknown agent", () => {
    const stderrSpy = vi.spyOn(process.stderr, "write").mockImplementation(() => true);
    const registry = new ParserRegistry();

    const parser = registry.resolve("unknown-agent", "9.9.9");
    expect(parser).toBe(rawOutputParser);
    expect(stderrSpy).toHaveBeenCalledWith(expect.stringContaining("WARNING"));
  });

  it("falls back to rawOutputParser when version is null", () => {
    const stderrSpy = vi.spyOn(process.stderr, "write").mockImplementation(() => true);
    const registry = new ParserRegistry();
    const mockParser = vi.fn(() => ({}));

    registry.register("agent-x", {
      matches: () => true,
      parser: mockParser,
    });

    const parser = registry.resolve("agent-x", null);
    expect(parser).toBe(rawOutputParser);
    expect(stderrSpy).toHaveBeenCalledWith(expect.stringContaining("<unknown>"));
  });

  it("falls back to rawOutputParser when version doesn't match any entry", () => {
    const stderrSpy = vi.spyOn(process.stderr, "write").mockImplementation(() => true);
    const registry = new ParserRegistry();

    registry.register("strict-agent", {
      matches: (v) => v === "2.0.0",
      parser: () => ({}),
    });

    const parser = registry.resolve("strict-agent", "3.0.0");
    expect(parser).toBe(rawOutputParser);
    expect(stderrSpy).toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// Global parserRegistry (built-in parsers)
// ---------------------------------------------------------------------------

describe("parserRegistry built-in parsers", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("claude-code parser", () => {
    it("resolves for any semver version", () => {
      const parser = parserRegistry.resolve("claude-code", "1.2.3");
      expect(parser).not.toBe(rawOutputParser);
    });

    it("extracts isCompletion from result lines", () => {
      const parser = parserRegistry.resolve("claude-code", "1.0.0");
      const result = parser('{"type":"result","cost_usd":0.001}');
      expect(result.isCompletion).toBe(true);
      expect(result.costHint).toMatch(/^\$/);
    });

    it("extracts token usage", () => {
      const parser = parserRegistry.resolve("claude-code", "1.0.0");
      const result = parser(
        '{"type":"result","usage":{"input_tokens":100,"output_tokens":50}}',
      );
      expect(result.tokenUsage?.inputTokens).toBe(100);
      expect(result.tokenUsage?.outputTokens).toBe(50);
      expect(result.tokenUsage?.totalTokens).toBe(150);
    });

    it("returns empty object for non-JSON lines", () => {
      const parser = parserRegistry.resolve("claude-code", "1.0.0");
      expect(parser("plain text line")).toEqual({});
    });
  });

  describe("codex parser", () => {
    it("resolves for any semver version", () => {
      const parser = parserRegistry.resolve("codex", "0.4.1");
      expect(parser).not.toBe(rawOutputParser);
    });

    it("extracts token usage from prompt_tokens", () => {
      const parser = parserRegistry.resolve("codex", "0.4.1");
      const result = parser(
        '{"usage":{"prompt_tokens":80,"completion_tokens":40},"done":true}',
      );
      expect(result.tokenUsage?.inputTokens).toBe(80);
      expect(result.tokenUsage?.outputTokens).toBe(40);
      expect(result.isCompletion).toBe(true);
    });
  });

  describe("gemini parser", () => {
    it("resolves for any semver version", () => {
      const parser = parserRegistry.resolve("gemini", "2.0.0");
      expect(parser).not.toBe(rawOutputParser);
    });

    it("extracts token usage from usageMetadata", () => {
      const parser = parserRegistry.resolve("gemini", "2.0.0");
      const result = parser(
        '{"done":true,"usageMetadata":{"promptTokenCount":60,"candidatesTokenCount":30}}',
      );
      expect(result.tokenUsage?.inputTokens).toBe(60);
      expect(result.tokenUsage?.outputTokens).toBe(30);
      expect(result.isCompletion).toBe(true);
    });
  });
});
