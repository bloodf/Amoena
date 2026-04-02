import type { AgentSession, AgentSessionOptions, CliAdapter } from './types';
import { BaseAgentSession } from './utils/base-session';
import { spawnProcess } from './utils/spawn';

class ClaudeAgentSession extends BaseAgentSession implements AgentSession {}

export const claudeAdapter: CliAdapter = {
  provider: 'claude',

  isAvailable(): boolean {
    return Boolean(process.env['ANTHROPIC_API_KEY'] || process.env['CLAUDE_API_KEY']);
  },

  createSession(options: AgentSessionOptions): AgentSession {
    const spawn = spawnProcess('claude', ['-p', options.task], {
      env: options.env ? ({ ...process.env, ...options.env } as NodeJS.ProcessEnv) : undefined,
    });
    return new ClaudeAgentSession(spawn, 'claude-code', options.timeout);
  },
};
