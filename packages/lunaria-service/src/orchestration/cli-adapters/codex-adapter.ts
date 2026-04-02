import type { AgentSession, AgentSessionOptions, CliAdapter } from './types';
import { BaseAgentSession } from './utils/base-session';
import { spawnProcess } from './utils/spawn';

class CodexAgentSession extends BaseAgentSession implements AgentSession {}

export const codexAdapter: CliAdapter = {
  provider: 'codex',

  isAvailable(): boolean {
    return Boolean(process.env['OPENAI_API_KEY']);
  },

  createSession(options: AgentSessionOptions): AgentSession {
    const spawn = spawnProcess('codex', ['-p', options.task], {
      env: options.env ? ({ ...process.env, ...options.env } as NodeJS.ProcessEnv) : undefined,
    });
    return new CodexAgentSession(spawn, 'codex', options.timeout);
  },
};
