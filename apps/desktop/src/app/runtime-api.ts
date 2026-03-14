import { useMemo } from "react";

import { createRuntimeClient } from "@lunaria/runtime-client";

import { useRuntimeContext } from "./runtime-context";

export function useRuntimeApi() {
  const runtime = useRuntimeContext();

  return useMemo(() => {
    if (!runtime.launchContext || !runtime.session) {
      return {
        request: async <T>() => {
          throw new Error("Runtime is not connected");
        },
      };
    }

    return createRuntimeClient({
      baseUrl: runtime.launchContext.apiBaseUrl,
      authToken: runtime.session.authToken,
    });
  }, [runtime.launchContext, runtime.session]);
}
