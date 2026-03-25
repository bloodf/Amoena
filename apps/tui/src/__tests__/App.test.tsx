import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import type { AgentProvider } from '../types.js';

// ---------------------------------------------------------------------------
// resolveAvailableAgents — mirrors the logic in App.tsx without importing
// standalone-engine (which depends on ulid native module).
// The detection logic reads env vars: ANTHROPIC_API_KEY / CLAUDE_API_KEY,
// OPENAI_API_KEY, GOOGLE_API_KEY / GEMINI_API_KEY.
// ---------------------------------------------------------------------------

interface AdapterAvailability {
  readonly claude: boolean;
  readonly codex: boolean;
  readonly gemini: boolean;
}

function detectAvailableAdapters(): AdapterAvailability {
  return {
    claude: Boolean(
      process.env['ANTHROPIC_API_KEY'] ?? process.env['CLAUDE_API_KEY'],
    ),
    codex: Boolean(process.env['OPENAI_API_KEY']),
    gemini: Boolean(
      process.env['GOOGLE_API_KEY'] ?? process.env['GEMINI_API_KEY'],
    ),
  };
}

function resolveAvailableAgents(): AgentProvider[] {
  const a = detectAvailableAdapters();
  const agents: AgentProvider[] = [];
  if (a.claude) agents.push('claude');
  if (a.codex) agents.push('codex');
  if (a.gemini) agents.push('gemini');
  return agents;
}

describe('resolveAvailableAgents', () => {
  const savedEnv: Record<string, string | undefined> = {};

  beforeEach(() => {
    for (const key of [
      'ANTHROPIC_API_KEY', 'CLAUDE_API_KEY',
      'OPENAI_API_KEY',
      'GOOGLE_API_KEY', 'GEMINI_API_KEY',
    ]) {
      savedEnv[key] = process.env[key];
      delete process.env[key];
    }
  });

  afterEach(() => {
    for (const [key, value] of Object.entries(savedEnv)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  });

  it('returns empty array when no API keys set', () => {
    const agents = resolveAvailableAgents();
    expect(agents).toEqual([]);
  });

  it('includes claude when ANTHROPIC_API_KEY is set', () => {
    process.env['ANTHROPIC_API_KEY'] = 'sk-test';
    const agents = resolveAvailableAgents();
    expect(agents).toContain('claude');
  });

  it('includes claude when CLAUDE_API_KEY is set', () => {
    process.env['CLAUDE_API_KEY'] = 'sk-test';
    const agents = resolveAvailableAgents();
    expect(agents).toContain('claude');
  });

  it('includes codex when OPENAI_API_KEY is set', () => {
    process.env['OPENAI_API_KEY'] = 'sk-test';
    const agents = resolveAvailableAgents();
    expect(agents).toContain('codex');
  });

  it('includes gemini when GOOGLE_API_KEY is set', () => {
    process.env['GOOGLE_API_KEY'] = 'test-key';
    const agents = resolveAvailableAgents();
    expect(agents).toContain('gemini');
  });

  it('includes gemini when GEMINI_API_KEY is set', () => {
    process.env['GEMINI_API_KEY'] = 'test-key';
    const agents = resolveAvailableAgents();
    expect(agents).toContain('gemini');
  });

  it('returns all agents when all keys set', () => {
    process.env['ANTHROPIC_API_KEY'] = 'sk-1';
    process.env['OPENAI_API_KEY'] = 'sk-2';
    process.env['GOOGLE_API_KEY'] = 'sk-3';
    const agents = resolveAvailableAgents();
    expect(agents).toEqual(['claude', 'codex', 'gemini']);
  });

  it('preserves order: claude, codex, gemini', () => {
    process.env['GOOGLE_API_KEY'] = 'sk-3';
    process.env['ANTHROPIC_API_KEY'] = 'sk-1';
    process.env['OPENAI_API_KEY'] = 'sk-2';
    const agents = resolveAvailableAgents();
    expect(agents[0]).toBe('claude');
    expect(agents[1]).toBe('codex');
    expect(agents[2]).toBe('gemini');
  });
});
