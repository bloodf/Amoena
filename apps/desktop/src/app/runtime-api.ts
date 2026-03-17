import { useMemo } from 'react';

import { createRuntimeClient } from '@lunaria/runtime-client';

import { useRuntimeContext } from './runtime-context';

export type RuntimeApi = ReturnType<typeof createRuntimeClient>;

export function useRuntimeApi(): RuntimeApi {
  const runtime = useRuntimeContext();

  return useMemo(() => {
    if (!runtime.launchContext || !runtime.session) {
      const notConnected = () => {
        throw new Error('Runtime is not connected');
      };
      return new Proxy({} as RuntimeApi, {
        get: (_target, prop) => {
          if (prop === 'request') return notConnected;
          return (..._args: unknown[]) => notConnected();
        },
      });
    }

    return createRuntimeClient({
      baseUrl: runtime.launchContext.apiBaseUrl,
      authToken: runtime.session.authToken,
    });
  }, [runtime.launchContext, runtime.session]);
}
