import type { AgentSession, AgentSessionOptions, CliAdapter } from './types';
import { BaseAgentSession } from './utils/base-session';
import { spawnProcess } from './utils/spawn';

class GeminiAgentSession extends BaseAgentSession implements AgentSession {}

export const geminiAdapter: CliAdapter = {
  provider: 'gemini',

  isAvailable(): boolean {
    return Boolean(process.env['GOOGLE_API_KEY'] || process.env['GEMINI_API_KEY']);
  },

  createSession(options: AgentSessionOptions): AgentSession {
    const spawn = spawnProcess('gemini', ['-p', options.task], {
      env: options.env ? ({ ...process.env, ...options.env } as NodeJS.ProcessEnv) : undefined,
    });
    return new GeminiAgentSession(spawn, 'gemini', options.timeout);
  },
};
