import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { Platform } from "react-native";

import {
  createRuntimeClient,
  type RemotePairingCompleteRequest,
  type SessionAgent,
  type SessionMessage,
  type SessionSummary,
} from "@lunaria/runtime-client";

import {
  secureRuntimeSessionStorage,
  type RuntimeSessionStorage,
  type StoredRemoteSession,
} from "./storage";

export type PendingPermission = {
  requestId: string;
  sessionId: string;
  message: string;
};

type RuntimeContextValue = {
  auth: StoredRemoteSession | null;
  error: string | null;
  isHydrated: boolean;
  pendingPermissions: PendingPermission[];
  sessions: SessionSummary[];
  clearPairing: () => Promise<void>;
  pairWithDesktop: (input: {
    baseUrl: string;
    pairingToken: string;
    pin: string;
    deviceName: string;
  }) => Promise<void>;
  refreshSessions: () => Promise<void>;
  resolvePermission: (sessionId: string, requestId: string, decision: "approve" | "deny") => Promise<void>;
  sendMessage: (sessionId: string, content: string) => Promise<void>;
};

const RuntimeContext = createContext<RuntimeContextValue | null>(null);

export function RuntimeProvider({
  children,
  storage = secureRuntimeSessionStorage,
}: {
  children: ReactNode;
  storage?: RuntimeSessionStorage;
}) {
  const [auth, setAuth] = useState<StoredRemoteSession | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [pendingPermissions, setPendingPermissions] = useState<PendingPermission[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function hydrate() {
      const saved = await storage.load();
      if (!cancelled) {
        setAuth(saved);
        setIsHydrated(true);
      }
    }

    void hydrate();
    return () => {
      cancelled = true;
    };
  }, [storage]);

  const client = useMemo(
    () =>
      auth
        ? createRuntimeClient({
            baseUrl: auth.baseUrl,
            authToken: auth.accessToken,
          })
        : null,
    [auth],
  );

  useEffect(() => {
    if (!client || !auth) {
      return;
    }

    const activeClient = client!;
    let cancelled = false;
    const eventSource =
      typeof EventSource !== "undefined"
        ? new EventSource(activeClient.globalEventsUrl(auth.accessToken))
        : null;

    async function loadSessions() {
      try {
        const next = await activeClient.listSessions();
        if (!cancelled) {
          setSessions(next);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load sessions");
        }
      }
    }

    async function pollPendingPermissions() {
      const nextSessions = await activeClient.listSessions();
      const permissionQueue: PendingPermission[] = [];

      for (const session of nextSessions) {
        const transcript = await activeClient.getSessionTranscript(session.id);
        const resolved = new Set(
          transcript
            .filter((entry) => entry.eventType === "permission.resolved")
            .map((entry) => String(entry.payload.requestId ?? "")),
        );

        for (const entry of transcript.filter((candidate) => candidate.eventType === "permission.requested")) {
          const requestId = String(entry.payload.requestId ?? "");
          if (!requestId || resolved.has(requestId)) {
            continue;
          }
          permissionQueue.push({
            requestId,
            sessionId: session.id,
            message: String(entry.payload.message ?? entry.payload.toolName ?? "Permission requested"),
          });
        }
      }

      if (!cancelled) {
        setSessions(nextSessions);
        setPendingPermissions(permissionQueue);
      }
    }

    void loadSessions();
    if (!eventSource) {
      void pollPendingPermissions();
    }

    const onSessionChanged = () => {
      void loadSessions();
    };

    const onPermissionRequested = (event: Event) => {
      const payload = JSON.parse((event as MessageEvent<string>).data) as {
        eventType: string;
        sessionId: string;
        payload: { requestId?: string; message?: string; toolName?: string };
      };

      const requestId = String(payload.payload.requestId ?? "");
      if (!requestId) {
        return;
      }

      setPendingPermissions((previous) =>
        previous.some((entry) => entry.requestId === requestId)
          ? previous
          : [
              ...previous,
              {
                requestId,
                sessionId: payload.sessionId,
                message: String(payload.payload.message ?? payload.payload.toolName ?? "Permission requested"),
              },
            ],
      );
    };

    const onPermissionResolved = (event: Event) => {
      const payload = JSON.parse((event as MessageEvent<string>).data) as {
        payload: { requestId?: string };
      };
      const requestId = String(payload.payload.requestId ?? "");
      setPendingPermissions((previous) => previous.filter((entry) => entry.requestId !== requestId));
    };

    eventSource?.addEventListener("session.created", onSessionChanged as EventListener);
    eventSource?.addEventListener("session.updated", onSessionChanged as EventListener);
    eventSource?.addEventListener("permission.requested", onPermissionRequested as EventListener);
    eventSource?.addEventListener("permission.resolved", onPermissionResolved as EventListener);

    const pollInterval = eventSource
      ? null
      : setInterval(() => {
          void pollPendingPermissions();
        }, 2500);

    return () => {
      cancelled = true;
      if (pollInterval) {
        clearInterval(pollInterval);
      }
      eventSource?.removeEventListener("session.created", onSessionChanged as EventListener);
      eventSource?.removeEventListener("session.updated", onSessionChanged as EventListener);
      eventSource?.removeEventListener("permission.requested", onPermissionRequested as EventListener);
      eventSource?.removeEventListener("permission.resolved", onPermissionResolved as EventListener);
      eventSource?.close();
    };
  }, [auth, client]);

  return (
    <RuntimeContext.Provider
      value={{
        auth,
        error,
        isHydrated,
        pendingPermissions,
        sessions,
        clearPairing: async () => {
          await storage.clear();
          setAuth(null);
          setSessions([]);
          setPendingPermissions([]);
          setError(null);
        },
        pairWithDesktop: async (input) => {
          try {
            const pairClient = createRuntimeClient({ baseUrl: input.baseUrl });
            const body: RemotePairingCompleteRequest = {
              pairingToken: input.pairingToken,
              pin: input.pin,
              deviceName: input.deviceName,
              deviceType: "mobile",
              platform: Platform.OS,
            };
            const paired = await pairClient.completePairing(body);
            const stored = {
              ...paired,
              pairedAt: new Date().toISOString(),
            } satisfies StoredRemoteSession;
            await storage.save(stored);
            setAuth(stored);
            setSessions(await createRuntimeClient({
              baseUrl: stored.baseUrl,
              authToken: stored.accessToken,
            }).listSessions());
            setError(null);
          } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to pair with desktop");
          }
        },
        refreshSessions: async () => {
          if (!client) return;
          try {
            setSessions(await client.listSessions());
            setError(null);
          } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to refresh sessions");
          }
        },
        resolvePermission: async (sessionId, requestId, decision) => {
          if (!client) return;
          try {
            await client.resolveRemotePermission(sessionId, { requestId, decision });
            setPendingPermissions((previous) => previous.filter((entry) => entry.requestId !== requestId));
            setError(null);
          } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to resolve permission");
          }
        },
        sendMessage: async (sessionId, content) => {
          if (!client) return;
          try {
            await client.createSessionMessage(sessionId, {
              content,
              taskType: "default",
            });
            setError(null);
          } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to send message");
          }
        },
      }}
    >
      {children}
    </RuntimeContext.Provider>
  );
}

export function useRuntime() {
  const value = useContext(RuntimeContext);
  if (!value) {
    throw new Error("useRuntime must be used inside RuntimeProvider");
  }
  return value;
}

export function useSessionMessages(sessionId: string) {
  const { auth } = useRuntime();
  const [messages, setMessages] = useState<SessionMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      setMessages([]);
      setIsLoading(false);
      return;
    }

    const client = createRuntimeClient({
      baseUrl: auth.baseUrl,
      authToken: auth.accessToken,
    });
    let cancelled = false;

    async function refresh() {
      setIsLoading(true);
      const next = await client.listSessionMessages(sessionId);
      if (!cancelled) {
        setMessages(next);
        setIsLoading(false);
      }
    }

    void refresh();
    const interval = setInterval(() => {
      void refresh();
    }, 1500);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [auth, sessionId]);

  return {
    isLoading,
    messages,
    refresh: async () => {
      if (!auth) return;
      const client = createRuntimeClient({
        baseUrl: auth.baseUrl,
        authToken: auth.accessToken,
      });
      setMessages(await client.listSessionMessages(sessionId));
    },
  };
}

export function useSessionAgents(sessionId: string) {
  const { auth } = useRuntime();
  const [agents, setAgents] = useState<SessionAgent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      setAgents([]);
      setIsLoading(false);
      return;
    }

    const client = createRuntimeClient({
      baseUrl: auth.baseUrl,
      authToken: auth.accessToken,
    });
    let cancelled = false;

    async function refresh() {
      setIsLoading(true);
      const next = await client.listSessionAgents(sessionId);
      if (!cancelled) {
        setAgents(next);
        setIsLoading(false);
      }
    }

    void refresh();
    const interval = setInterval(() => {
      void refresh();
    }, 1500);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [auth, sessionId]);

  return {
    isLoading,
    agents,
  };
}
