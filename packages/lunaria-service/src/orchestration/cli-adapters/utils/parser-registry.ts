/**
 * CLI output parser registry with version detection.
 *
 * Each CLI agent (Claude Code, Codex, Gemini) prints its version to stderr on
 * startup.  This module maps detected version strings to the appropriate output
 * parser function.  When a version is unknown the registry falls back to raw
 * output mode and emits a warning so the user knows parsing may be incomplete.
 */

import type { ParsedOutput } from "../types.js";

/** A function that parses a single output line from a CLI agent. */
export type OutputParser = (line: string) => ParsedOutput;

/**
 * Entry in the parser registry that associates a version range with a parser.
 */
export interface ParserEntry {
  /**
   * A predicate that returns true when the detected version string matches
   * this entry.  Checked in insertion order; first match wins.
   */
  matches: (version: string) => boolean;
  /** The parser function to use when this entry matches. */
  parser: OutputParser;
}

/**
 * Registry that maps agent ID → ordered list of version-keyed parser entries.
 */
export class ParserRegistry {
  private readonly _entries = new Map<string, ParserEntry[]>();

  /**
   * Registers a versioned parser for an agent.
   *
   * Entries are checked in the order they are registered; the first matching
   * entry wins.  Register more-specific versions before catch-all entries.
   *
   * @param agentId  - Stable agent identifier (e.g. `"claude-code"`).
   * @param entry    - The version predicate + parser to register.
   */
  register(agentId: string, entry: ParserEntry): void {
    const list = this._entries.get(agentId) ?? [];
    this._entries.set(agentId, [...list, entry]);
  }

  /**
   * Resolves the parser for an agent at a given version.
   *
   * When no matching entry is found a warning is written to stderr and a
   * raw-output fallback parser is returned.
   *
   * @param agentId - Stable agent identifier.
   * @param version - Version string detected from agent startup output.
   *                  Pass `null` when version detection failed.
   * @returns The best-matching `OutputParser`.
   */
  resolve(agentId: string, version: string | null): OutputParser {
    const list = this._entries.get(agentId);

    if (list !== undefined && version !== null) {
      for (const entry of list) {
        if (entry.matches(version)) {
          return entry.parser;
        }
      }
    }

    // Unknown or missing version — fall back to raw mode.
    process.stderr.write(
      `[parser-registry] WARNING: no parser found for agent="${agentId}" ` +
        `version=${version === null ? "<unknown>" : JSON.stringify(version)}. ` +
        `Falling back to raw output mode.\n`,
    );
    return rawOutputParser;
  }
}

/**
 * Detects the version string from a line of agent startup output.
 *
 * Agents typically print a line like:
 *   - Claude Code 1.2.3
 *   - Codex CLI v0.4.1
 *   - Gemini CLI 2.0.0-beta
 *
 * @param line - A single line of stderr/stdout from the CLI agent.
 * @returns The detected semver string, or `null` if not found.
 */
export function detectVersionFromLine(line: string): string | null {
  // Match semver-like strings: optional v/V prefix, then MAJOR.MINOR.PATCH
  // with optional pre-release tag (e.g. 1.2.3, v0.4.1, 2.0.0-beta)
  const match = line.match(/\bv?(\d+\.\d+\.\d+(?:[-.]\w+)*)\b/);
  return match ? (match[1] ?? null) : null;
}

/**
 * Fallback parser used when no versioned parser matches.
 * Returns an empty `ParsedOutput` for every line (no metadata extracted).
 */
export const rawOutputParser: OutputParser = (_line: string): ParsedOutput => {
  return {};
};

// ---------------------------------------------------------------------------
// Singleton registry pre-populated with built-in agent parsers
// ---------------------------------------------------------------------------

/**
 * The global parser registry.
 *
 * Built-in parsers for claude-code, codex, and gemini are registered below.
 * Additional parsers can be registered at runtime via `parserRegistry.register`.
 */
export const parserRegistry = new ParserRegistry();

// --- claude-code -----------------------------------------------------------

/** Parser for Claude Code ≥ 1.0.0 (stream-json format). */
function parseClaudeCodeLine(line: string): ParsedOutput {
  const trimmed = line.trim();
  if (!trimmed.startsWith("{")) return {};
  try {
    const json = JSON.parse(trimmed) as Record<string, unknown>;
    if (json["type"] === "result") {
      const parsed: ParsedOutput = { isCompletion: true };
      const usage = json["usage"] as Record<string, unknown> | undefined;
      if (usage) {
        const input =
          typeof usage["input_tokens"] === "number"
            ? usage["input_tokens"]
            : undefined;
        const output =
          typeof usage["output_tokens"] === "number"
            ? usage["output_tokens"]
            : undefined;
        parsed.tokenUsage = {
          inputTokens: input,
          outputTokens: output,
          totalTokens:
            input !== undefined && output !== undefined
              ? input + output
              : undefined,
        };
      }
      if (typeof json["cost_usd"] === "number") {
        parsed.costHint = `$${(json["cost_usd"] as number).toFixed(6)}`;
      }
      return parsed;
    }
    if (json["type"] === "assistant") return {};
  } catch {
    // Not JSON — plain text
  }
  return {};
}

parserRegistry.register("claude-code", {
  matches: (v) => /^\d+\.\d+\.\d+/.test(v), // any semver
  parser: parseClaudeCodeLine,
});

// --- codex -----------------------------------------------------------------

/** Parser for Codex CLI ≥ 0.1.0. */
function parseCodexLine(line: string): ParsedOutput {
  const trimmed = line.trim();
  if (!trimmed.startsWith("{")) return {};
  try {
    const json = JSON.parse(trimmed) as Record<string, unknown>;
    const parsed: ParsedOutput = {};
    if (typeof json["usage"] === "object" && json["usage"] !== null) {
      const usage = json["usage"] as Record<string, unknown>;
      const input =
        typeof usage["prompt_tokens"] === "number"
          ? usage["prompt_tokens"]
          : typeof usage["input_tokens"] === "number"
            ? usage["input_tokens"]
            : undefined;
      const output =
        typeof usage["completion_tokens"] === "number"
          ? usage["completion_tokens"]
          : typeof usage["output_tokens"] === "number"
            ? usage["output_tokens"]
            : undefined;
      parsed.tokenUsage = { inputTokens: input, outputTokens: output };
    }
    if (json["done"] === true || json["finish_reason"] !== undefined) {
      parsed.isCompletion = true;
    }
    return parsed;
  } catch {
    return {};
  }
}

parserRegistry.register("codex", {
  matches: (v) => /^\d+\.\d+\.\d+/.test(v),
  parser: parseCodexLine,
});

// --- gemini ----------------------------------------------------------------

/** Parser for Gemini CLI ≥ 1.0.0. */
function parseGeminiLine(line: string): ParsedOutput {
  const trimmed = line.trim();
  if (!trimmed.startsWith("{")) return {};
  try {
    const json = JSON.parse(trimmed) as Record<string, unknown>;
    const parsed: ParsedOutput = {};
    if (
      json["done"] === true ||
      json["type"] === "completion" ||
      json["finishReason"] !== undefined
    ) {
      parsed.isCompletion = true;
    }
    const meta = json["usageMetadata"] as Record<string, unknown> | undefined;
    if (meta) {
      const input =
        typeof meta["promptTokenCount"] === "number"
          ? meta["promptTokenCount"]
          : undefined;
      const output =
        typeof meta["candidatesTokenCount"] === "number"
          ? meta["candidatesTokenCount"]
          : undefined;
      parsed.tokenUsage = { inputTokens: input, outputTokens: output };
    }
    return parsed;
  } catch {
    return {};
  }
}

parserRegistry.register("gemini", {
  matches: (v) => /^\d+\.\d+\.\d+/.test(v),
  parser: parseGeminiLine,
});
