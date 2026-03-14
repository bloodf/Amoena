import { useState, useEffect, useCallback } from "react";

interface PermissionRequest {
  requestId: string;
  toolName: string;
  input: Record<string, unknown>;
  sessionId: string;
}

export function usePermissionDialog(sessionEventsUrl: string | null) {
  const [pendingRequest, setPendingRequest] = useState<PermissionRequest | null>(null);

  useEffect(() => {
    if (!sessionEventsUrl) return;

    const source = new EventSource(sessionEventsUrl);

    source.addEventListener("message", (event) => {
      try {
        const data = JSON.parse(event.data) as {
          eventType?: string;
          payload?: {
            requestId?: string;
            toolName?: string;
            input?: Record<string, unknown>;
            sessionId?: string;
          };
        };
        if (data.eventType === "permission.request") {
          setPendingRequest({
            requestId: data.payload?.requestId ?? "",
            toolName: data.payload?.toolName ?? "",
            input: data.payload?.input ?? {},
            sessionId: data.payload?.sessionId ?? "",
          });
        }
        if (data.eventType === "permission.resolved") {
          setPendingRequest(null);
        }
      } catch {
        // ignore parse errors
      }
    });

    return () => source.close();
  }, [sessionEventsUrl]);

  const approve = useCallback((requestId: string) => {
    setPendingRequest(null);
    return requestId;
  }, []);

  const deny = useCallback((requestId: string) => {
    setPendingRequest(null);
    return requestId;
  }, []);

  return { pendingRequest, approve, deny };
}
