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

export function isElectronRuntime(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof (window as unknown as { amoena?: unknown }).amoena !== 'undefined'
  );
}

export function readDevLaunchContext(env: BootstrapEnv = defaultEnv): LaunchContext | null {
  const apiBaseUrl = env.VITE_AMOENA_API_BASE_URL;
  const bootstrapToken = env.VITE_AMOENA_BOOTSTRAP_TOKEN;

  if (!apiBaseUrl || !bootstrapToken) {
    return null;
  }

  return {
    apiBaseUrl,
    bootstrapPath: env.VITE_AMOENA_BOOTSTRAP_PATH ?? '/api/v1/bootstrap/auth',
    bootstrapToken,
    expiresAtUnixMs: Number(env.VITE_AMOENA_BOOTSTRAP_EXPIRES_AT ?? '0'),
    instanceId: env.VITE_AMOENA_INSTANCE_ID ?? 'dev-browser',
  };
}

type ElectronBridge = {
  getLaunchContext: () => Promise<LaunchContext>;
};

function getElectronBridge(): ElectronBridge | null {
  const win = window as unknown as { amoena?: ElectronBridge };
  return win.amoena ?? null;
}

export async function resolveLaunchContext(env: BootstrapEnv = defaultEnv): Promise<LaunchContext> {
  const bridge = getElectronBridge();
  if (bridge !== null) {
    return bridge.getLaunchContext();
  }

  const devLaunchContext = readDevLaunchContext(env);

  if (!devLaunchContext) {
    throw new Error(
      'Missing Amoena launch context. Run through Electron or set VITE_AMOENA_API_BASE_URL and VITE_AMOENA_BOOTSTRAP_TOKEN.',
    );
  }

  return devLaunchContext;
}

export async function authenticateLaunchContext(
  launchContext: LaunchContext,
  fetchImpl: typeof fetch = fetch,
): Promise<BootstrapSession> {
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
