import { useCallback, useEffect, useRef, useState } from "react";

import { useClient } from "../client-context";
import { createReconnectingEventSource } from "../event-source";

export type PendingPermission = {
  requestId: string;
  sessionId: string;
  message: string;
};

export function usePermissions() {
  const { auth, client } = useClient();
  const [data, setData] = useState<PendingPermission[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const esRef = useRef<ReturnType<typeof createReconnectingEventSource> | null>(null);

  const refresh = useCallback(async () => {
    if (!client) return;
    try {
      setIsLoading(true);
      const sessions = await client.listSessions();
      const permissionQueue: PendingPermission[] = [];

      for (const session of sessions) {
        const transcript = await client.getSessionTranscript(session.id);
        const resolved = new Set(
          transcript
            .filter((entry) => entry.eventType === "permission.resolved")
            .map((entry) => String(entry.payload.requestId ?? "")),
        );

        for (const entry of transcript.filter((c) => c.eventType === "permission.requested")) {
          const requestId = String(entry.payload.requestId ?? "");
          if (!requestId || resolved.has(requestId)) continue;
          permissionQueue.push({
            requestId,
            sessionId: session.id,
            message: String(entry.payload.message ?? entry.payload.toolName ?? "Permission requested"),
          });
        }
      }

      setData(permissionQueue);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load permissions");
    } finally {
      setIsLoading(false);
    }
  }, [client]);

  useEffect(() => {
    if (!client || !auth) {
      setData([]);
      setIsLoading(false);
      return;
    }

    void refresh();

    esRef.current = createReconnectingEventSource(
      client.globalEventsUrl(auth.accessToken),
      {
        eventNames: ["permission.requested", "permission.resolved"],
        onEvent: (eventName, payload: any) => {
          if (eventName === "permission.requested") {
            const requestId = String(payload?.payload?.requestId ?? "");
            if (!requestId) return;
            setData((prev) =>
              prev.some((e) => e.requestId === requestId)
                ? prev
                : [
                    ...prev,
                    {
                      requestId,
                      sessionId: payload.sessionId,
                      message: String(
                        payload.payload?.message ?? payload.payload?.toolName ?? "Permission requested",
                      ),
                    },
                  ],
            );
          } else if (eventName === "permission.resolved") {
            const requestId = String(payload?.payload?.requestId ?? "");
            setData((prev) => prev.filter((e) => e.requestId !== requestId));
          }
        },
      },
    );

    return () => {
      esRef.current?.close();
    };
  }, [auth, client, refresh]);

  const resolvePermission = useCallback(
    async (sessionId: string, requestId: string, decision: "approve" | "deny") => {
      if (!client) return;
      try {
        await client.resolveRemotePermission(sessionId, { requestId, decision });
        setData((prev) => prev.filter((e) => e.requestId !== requestId));
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to resolve permission");
      }
    },
    [client],
  );

  return { data, error, isLoading, refresh, resolvePermission };
}
