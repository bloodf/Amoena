/**
 * AI behavior profiles (personas).
 *
 * A `Persona` bundles model selection, sampling parameters, and constraints
 * that shape how an agent behaves.  `applyPersona` projects a persona onto
 * an `AgentConfig` producing a new config — original is never mutated.
 */

import { AgentConfig } from "../orchestration/types.js";

export type { AgentConfig };

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/**
 * A named behavior profile for an AI agent.
 */
export interface Persona {
  /** Unique stable identifier (e.g. "cautious"). */
  readonly id: string;
  /** Human-readable display name. */
  readonly name: string;
  /** System prompt fragment appended (or replacing) the agent's own prompt. */
  readonly systemPrompt: string;
  /** Sampling temperature in [0, 2].  Lower = more deterministic. */
  readonly temperature: number;
  /** Nucleus sampling probability in (0, 1]. */
  readonly topP: number;
  /** Model identifier to use when this persona is active. */
  readonly model: string;
  /**
   * Free-form constraint strings surfaced to the orchestrator
   * (e.g. "no_shell_commands", "require_confirmation_before_write").
   */
  readonly constraints: ReadonlyArray<string>;
}

// ---------------------------------------------------------------------------
// Built-in persona definitions
// ---------------------------------------------------------------------------

const BUILTIN_PERSONAS: ReadonlyMap<string, Persona> = new Map([
  [
    "default",
    {
      id: "default",
      name: "Default",
      systemPrompt:
        "You are a helpful AI assistant. Follow instructions carefully and ask for clarification when unsure.",
      temperature: 0.7,
      topP: 0.95,
      model: "claude-sonnet-4-6",
      constraints: [],
    },
  ],
  [
    "cautious",
    {
      id: "cautious",
      name: "Cautious",
      systemPrompt:
        "You are a conservative AI assistant. Prefer safe, reversible actions. " +
        "Always confirm before making destructive changes. Explain trade-offs explicitly.",
      temperature: 0.2,
      topP: 0.8,
      model: "claude-sonnet-4-6",
      constraints: ["require_confirmation_before_write", "no_destructive_commands"],
    },
  ],
  [
    "creative",
    {
      id: "creative",
      name: "Creative",
      systemPrompt:
        "You are an inventive AI assistant. Explore unconventional solutions and generate " +
        "diverse alternatives before settling on an approach.",
      temperature: 1.2,
      topP: 0.98,
      model: "claude-sonnet-4-6",
      constraints: [],
    },
  ],
  [
    "fast",
    {
      id: "fast",
      name: "Fast",
      systemPrompt:
        "You are a concise AI assistant optimized for speed. Deliver direct answers with " +
        "minimal explanation. Skip preamble and post-amble.",
      temperature: 0.3,
      topP: 0.85,
      model: "claude-haiku-4-5",
      constraints: ["brief_responses"],
    },
  ],
]);

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/** Error raised when a persona ID cannot be resolved. */
export class PersonaNotFoundError extends Error {
  constructor(id: string) {
    super(
      `Persona "${id}" not found. Available personas: ${[...BUILTIN_PERSONAS.keys()].join(", ")}.`,
    );
    this.name = "PersonaNotFoundError";
  }
}

/**
 * Returns the built-in persona for the given ID.
 *
 * Custom personas can be registered via `registerPersona`.
 *
 * @param id - Persona identifier (e.g. "cautious").
 * @returns The matching `Persona`.
 * @throws {PersonaNotFoundError} When no persona with that ID exists.
 *
 * @example
 * ```ts
 * const p = loadPersona("cautious");
 * ```
 */
export function loadPersona(id: string): Persona {
  const persona = BUILTIN_PERSONAS.get(id);
  if (!persona) {
    throw new PersonaNotFoundError(id);
  }
  return persona;
}

/**
 * Returns an array of all registered persona IDs (built-in + custom).
 */
export function listPersonaIds(): ReadonlyArray<string> {
  return [...BUILTIN_PERSONAS.keys()];
}

/**
 * Projects a `Persona` onto an `AgentConfig`, returning a new config.
 *
 * Merging rules:
 * - `model` is replaced by the persona's model.
 * - `systemPrompt` is replaced by the persona's system prompt.
 *   (Callers that want to append rather than replace should do so before
 *   calling this function.)
 * - All other fields on the original config are preserved unchanged.
 *
 * The original `agentConfig` is **never mutated**.
 *
 * @param persona - The persona to apply.
 * @param agentConfig - The base agent configuration.
 * @returns A new `AgentConfig` with persona settings applied.
 *
 * @example
 * ```ts
 * const cautious = loadPersona("cautious");
 * const effectiveConfig = applyPersona(cautious, baseConfig);
 * ```
 */
export function applyPersona(persona: Persona, agentConfig: AgentConfig): AgentConfig {
  return {
    ...agentConfig,
    model: persona.model,
    systemPrompt: persona.systemPrompt,
  };
}
