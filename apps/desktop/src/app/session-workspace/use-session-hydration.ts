import { useEffect } from "react";

import type { AutopilotPipelinePhase } from "@/composites/autopilot/types";
import type { ManagedAgent } from "@/composites/agents/types";

import { toManagedAgents } from "./transforms";
import type {
  AgentRecord,
  MessageRecord,
  RuntimeFileNode,
  SessionMemoryResponse,
  SessionWorkspaceStateSetters,
  TranscriptEvent,
} from "./types";
import type { SessionSummary } from "../runtime-context";

type RuntimeRequest = <T>(path: string, init?: RequestInit) => Promise<T>;

export function useSessionHydration({
  activeSession,
  request,
  setMessages,
  setStreamingMessage,
  setAgents,
  setFileTree,
  setSelectedFile,
  setMemory,
  setTranscriptEvents,
  setAutopilotPhase,
}: {
  activeSession: SessionSummary | null;
  request: RuntimeRequest;
} & SessionWorkspaceStateSetters) {
  useEffect(() => {
    if (!activeSession) {
      return;
    }

    const sessionId = activeSession.id;
    const workingDir = activeSession.workingDir;
    const autopilotEnabled = Boolean(activeSession.metadata?.autopilot);
    let cancelled = false;

    async function hydrate() {
      const [nextMessages, nextAgents, nextTree, nextMemory, nextTranscript] =
        await Promise.all([
          request<MessageRecord[]>(`/api/v1/sessions/${sessionId}/messages`),
          request<AgentRecord[]>(`/api/v1/sessions/${sessionId}/agents/list`),
          request<RuntimeFileNode[]>(
            `/api/v1/files/tree?root=${encodeURIComponent(workingDir)}`,
          ),
          request<SessionMemoryResponse>(`/api/v1/sessions/${sessionId}/memory`),
          request<TranscriptEvent[]>(`/api/v1/sessions/${sessionId}/transcript`),
        ]);

      if (!cancelled) {
        setMessages(nextMessages);
        setStreamingMessage("");
        setAgents(toManagedAgents(nextAgents));
        setFileTree(nextTree);
        setMemory(nextMemory);
        setTranscriptEvents(nextTranscript);
        setSelectedFile(null);
        setAutopilotPhase(
          autopilotEnabled
            ? ("goal_analysis" as AutopilotPipelinePhase)
            : null,
        );
      }
    }

    void hydrate();
    return () => {
      cancelled = true;
    };
  }, [
    activeSession,
    request,
    setAgents,
    setAutopilotPhase,
    setFileTree,
    setMemory,
    setMessages,
    setSelectedFile,
    setStreamingMessage,
    setTranscriptEvents,
  ]);
}
