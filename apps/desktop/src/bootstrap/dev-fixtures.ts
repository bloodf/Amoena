import type { BootstrapSession, HealthResponse, LaunchContext } from './runtime-bootstrap';
import type { SessionSummary } from '@lunaria/runtime-client';

export type DevFixtures = {
  launchContext: LaunchContext;
  session: BootstrapSession;
  health: HealthResponse;
  sessions: SessionSummary[];
  providers: Array<{
    id: string;
    name: string;
    authStatus: string;
    modelCount: number;
    providerType: string;
  }>;
};

export function createDevFixtures(): DevFixtures {
  return {
    launchContext: {
      apiBaseUrl: 'http://127.0.0.1:41237',
      bootstrapPath: '/api/v1/bootstrap/auth',
      bootstrapToken: 'dev-mock-token',
      expiresAtUnixMs: Date.now() + 86_400_000,
      instanceId: 'dev-browser',
    },
    session: {
      apiBaseUrl: 'http://127.0.0.1:41237',
      authToken: 'dev-mock-auth-token',
      instanceId: 'dev-browser',
      sseBaseUrl: 'http://127.0.0.1:41237',
      tokenType: 'Bearer',
    },
    health: {
      appName: 'Lunaria Desktop',
      appVersion: '0.1.0-dev',
      instanceId: 'dev-browser',
      status: 'healthy',
    },
    sessions: [
      {
        id: 'session-1',
        sessionMode: 'chat',
        tuiType: 'claude',
        workingDir: '/Users/dev/projects/lunaria',
        status: 'active',
        createdAt: new Date(Date.now() - 3_600_000).toISOString(),
        updatedAt: new Date().toISOString(),
        metadata: { title: 'Refactor auth module' },
      },
      {
        id: 'session-2',
        sessionMode: 'task',
        tuiType: 'claude',
        workingDir: '/Users/dev/projects/lunaria',
        status: 'idle',
        createdAt: new Date(Date.now() - 7_200_000).toISOString(),
        updatedAt: new Date(Date.now() - 1_800_000).toISOString(),
        metadata: { title: 'Fix CI pipeline' },
      },
    ],
    providers: [
      {
        id: 'anthropic',
        name: 'Anthropic',
        authStatus: 'authenticated',
        modelCount: 5,
        providerType: 'claude',
      },
      {
        id: 'openai',
        name: 'OpenAI',
        authStatus: 'authenticated',
        modelCount: 4,
        providerType: 'codex',
      },
      {
        id: 'google',
        name: 'Google',
        authStatus: 'not_configured',
        modelCount: 3,
        providerType: 'gemini',
      },
    ],
  };
}
