import { useEffect, useState } from "react";

import type { TerminalCreated, TerminalEvent } from "./types";
import type { SessionSummary } from "../runtime-context";

type RuntimeRequest = <T>(path: string, init?: RequestInit) => Promise<T>;

export function useTerminalSession({
  activeSession,
  request,
}: {
  activeSession: SessionSummary | null;
  request: RuntimeRequest;
}) {
  const [terminalSessionId, setTerminalSessionId] = useState<string | null>(null);
  const [terminalOutput, setTerminalOutput] = useState<TerminalEvent[]>([]);

  useEffect(() => {
    if (!activeSession) {
      return;
    }

    const workingDir = activeSession.workingDir;
    let cancelled = false;
    setTerminalOutput([]);
    setTerminalSessionId(null);

    async function openTerminal() {
      const created = await request<TerminalCreated>("/api/v1/terminal/sessions", {
        method: "POST",
        body: JSON.stringify({
          shell: "/bin/cat",
          cwd: workingDir,
          cols: 80,
          rows: 20,
        }),
      });
      if (!cancelled) {
        setTerminalSessionId(created.terminalSessionId);
      }
    }

    void openTerminal();
    return () => {
      cancelled = true;
    };
  }, [activeSession, request]);

  useEffect(() => {
    if (!terminalSessionId) {
      return;
    }

    const interval = setInterval(async () => {
      const lastEventId = terminalOutput.at(-1)?.eventId ?? 0;
      const next = await request<TerminalEvent[]>(
        `/api/v1/terminal/sessions/${terminalSessionId}/events?lastEventId=${lastEventId}`,
      );
      if (next.length > 0) {
        setTerminalOutput((previous) => [...previous, ...next]);
      }
    }, 500);

    return () => clearInterval(interval);
  }, [request, terminalOutput, terminalSessionId]);

  return {
    terminalSessionId,
    terminalOutput,
  };
}
