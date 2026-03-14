import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  authenticateLaunchContext,
  isTauriRuntime,
  readDevLaunchContext,
  resolveLaunchContext,
  type BootstrapSession,
  type HealthResponse,
  type LaunchContext,
} from "../bootstrap/runtime-bootstrap";
import { createDevFixtures } from "../bootstrap/dev-fixtures";
import type { SessionSummary as RuntimeClientSessionSummary } from "@lunaria/runtime-client";

export type RuntimePhase = "connecting" | "connected" | "failed";

export type SessionSummary = RuntimeClientSessionSummary;
export type RuntimeLaunchContext = LaunchContext;
export type RuntimeSessionSummary = BootstrapSession;

export type ProviderSummary = {
  id: string;
  name: string;
  authStatus: string;
  modelCount: number;
  providerType: string;
};

type RuntimeContextValue = {
  phase: RuntimePhase;
  error?: string;
  health?: HealthResponse;
  launchContext?: LaunchContext;
  session?: BootstrapSession;
  sessions: SessionSummary[];
  providers: ProviderSummary[];
  refreshSessions: () => Promise<void>;
};

const RuntimeContext = createContext<RuntimeContextValue | null>(null);

async function fetchJson<T>(url: string, authToken: string) {
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return (await response.json()) as T;
}

export function RuntimeProvider({ children }: { children: ReactNode }) {
  const [phase, setPhase] = useState<RuntimePhase>("connecting");
  const [error, setError] = useState<string>();
  const [health, setHealth] = useState<HealthResponse>();
  const [launchContext, setLaunchContext] = useState<LaunchContext>();
  const [session, setSession] = useState<BootstrapSession>();
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [providers, setProviders] = useState<ProviderSummary[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function hydrate() {
      try {
        // In browser dev mode without Tauri or env vars, use mock fixtures
        const isDevBrowser =
          import.meta.env.DEV &&
          import.meta.env.MODE !== "test" &&
          !isTauriRuntime() &&
          !readDevLaunchContext();

        if (isDevBrowser) {
          const fixtures = createDevFixtures();

          if (cancelled) return;

          setLaunchContext(fixtures.launchContext);
          setSession(fixtures.session);
          setHealth(fixtures.health);
          setSessions(fixtures.sessions);
          setProviders(fixtures.providers);
          setError(undefined);
          setPhase("connected");
          return;
        }

        const nextLaunchContext = await resolveLaunchContext();
        const nextSession = await authenticateLaunchContext(nextLaunchContext);
        const [nextHealth, nextSessions, nextProviders] = await Promise.all([
          fetchJson<HealthResponse>(`${nextLaunchContext.apiBaseUrl}/api/v1/health`, nextSession.authToken),
          fetchJson<SessionSummary[]>(`${nextLaunchContext.apiBaseUrl}/api/v1/sessions`, nextSession.authToken),
          fetchJson<ProviderSummary[]>(`${nextLaunchContext.apiBaseUrl}/api/v1/providers`, nextSession.authToken),
        ]);

        if (cancelled) {
          return;
        }

        setLaunchContext(nextLaunchContext);
        setSession(nextSession);
        setHealth(nextHealth);
        setSessions(nextSessions);
        setProviders(nextProviders);
        setError(undefined);
        setPhase("connected");
      } catch (caughtError) {
        if (cancelled) {
          return;
        }

        setPhase("failed");
        setError(caughtError instanceof Error ? caughtError.message : String(caughtError));
      }
    }

    void hydrate();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (phase !== "connected" || !session || !launchContext) {
      return;
    }

    const eventSource = new EventSource(
      `${launchContext.apiBaseUrl}/api/v1/events?authToken=${encodeURIComponent(session.authToken)}`,
    );

    const refreshSessions = async () => {
      try {
        const nextSessions = await fetchJson<SessionSummary[]>(
          `${launchContext.apiBaseUrl}/api/v1/sessions`,
          session.authToken,
        );
        setSessions(nextSessions);
      } catch {
        // Keep the current view model if background refresh fails.
      }
    };

    const onSessionChanged = () => {
      void refreshSessions();
    };

    eventSource.addEventListener("session.created", onSessionChanged as EventListener);
    eventSource.addEventListener("session.updated", onSessionChanged as EventListener);
    eventSource.addEventListener("session.deleted", onSessionChanged as EventListener);

    return () => {
      eventSource.removeEventListener("session.created", onSessionChanged as EventListener);
      eventSource.removeEventListener("session.updated", onSessionChanged as EventListener);
      eventSource.removeEventListener("session.deleted", onSessionChanged as EventListener);
      eventSource.close();
    };
  }, [phase, session, launchContext]);

  const value = useMemo<RuntimeContextValue>(
    () => ({
      phase,
      error,
      health,
      launchContext,
      session,
      sessions,
      providers,
      refreshSessions: async () => {
        if (!launchContext || !session) {
          return;
        }

        const nextSessions = await fetchJson<SessionSummary[]>(
          `${launchContext.apiBaseUrl}/api/v1/sessions`,
          session.authToken,
        );
        setSessions(nextSessions);
      },
    }),
    [error, health, launchContext, phase, providers, session, sessions],
  );

  return <RuntimeContext.Provider value={value}>{children}</RuntimeContext.Provider>;
}

export function useRuntimeContext() {
  const value = useContext(RuntimeContext);

  if (!value) {
    throw new Error("useRuntimeContext must be used inside RuntimeProvider");
  }

  return value;
}
