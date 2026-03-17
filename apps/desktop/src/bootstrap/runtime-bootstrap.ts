import { invoke } from '@tauri-apps/api/core';

export type LaunchContext = {
  apiBaseUrl: string;
  bootstrapPath: string;
  bootstrapToken: string;
  expiresAtUnixMs: number;
  instanceId: string;
};

export type BootstrapSession = {
  apiBaseUrl: string;
  authToken: string;
  instanceId: string;
  sseBaseUrl: string;
  tokenType: string;
};

export type HealthResponse = {
  appName: string;
  appVersion: string;
  instanceId: string;
  status: string;
};

type BootstrapEnv = Record<string, string | undefined>;

const defaultEnv: BootstrapEnv = import.meta.env;

export function isTauriRuntime() {
  return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
}

export function readDevLaunchContext(env: BootstrapEnv = defaultEnv): LaunchContext | null {
  const apiBaseUrl = env.VITE_LUNARIA_API_BASE_URL;
  const bootstrapToken = env.VITE_LUNARIA_BOOTSTRAP_TOKEN;

  if (!apiBaseUrl || !bootstrapToken) {
    return null;
  }

  return {
    apiBaseUrl,
    bootstrapPath: env.VITE_LUNARIA_BOOTSTRAP_PATH ?? '/api/v1/bootstrap/auth',
    bootstrapToken,
    expiresAtUnixMs: Number(env.VITE_LUNARIA_BOOTSTRAP_EXPIRES_AT ?? '0'),
    instanceId: env.VITE_LUNARIA_INSTANCE_ID ?? 'dev-browser',
  };
}

export async function resolveLaunchContext(
  invokeCommand: typeof invoke = invoke,
  env: BootstrapEnv = defaultEnv,
) {
  if (isTauriRuntime()) {
    return invokeCommand<LaunchContext>('desktop_launch_context');
  }

  const devLaunchContext = readDevLaunchContext(env);

  if (!devLaunchContext) {
    throw new Error(
      'Missing Lunaria launch context. Run through Tauri or set VITE_LUNARIA_API_BASE_URL and VITE_LUNARIA_BOOTSTRAP_TOKEN.',
    );
  }

  return devLaunchContext;
}

export async function authenticateLaunchContext(
  launchContext: LaunchContext,
  fetchImpl: typeof fetch = fetch,
) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10_000);

  let response: Response;
  try {
    response = await fetchImpl(`${launchContext.apiBaseUrl}${launchContext.bootstrapPath}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token: launchContext.bootstrapToken,
      }),
      signal: controller.signal,
    });
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new Error('Backend not responding. The runtime took too long to reply.');
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }

  if (!response.ok) {
    throw new Error(`Bootstrap auth failed with status ${response.status}`);
  }

  return (await response.json()) as BootstrapSession;
}
