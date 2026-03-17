import { useEffect } from 'react';

import type { AutopilotPipelinePhase } from '@/composites/autopilot/types';

import { toManagedAgents } from './transforms';
import type {
  AgentRecord,
  MessageRecord,
  RuntimeFileNode,
  SessionMemoryResponse,
  SessionWorkspaceStateSetters,
  TranscriptEvent,
} from './types';
import type { SessionSummary } from '../runtime-context';

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

    const { id: sessionId, workingDir } = activeSession;
    const autopilotEnabled = Boolean(activeSession.metadata?.autopilot);
    let cancelled = false;

    async function hydrate() {
      const VALID_PHASES: AutopilotPipelinePhase[] = [
        'goal_analysis',
        'story_decomposition',
        'agent_assignment',
        'execution',
        'verification',
        'report',
      ];

      const results = await Promise.allSettled([
        request<MessageRecord[]>(`/api/v1/sessions/${sessionId}/messages`),
        request<AgentRecord[]>(`/api/v1/sessions/${sessionId}/agents/list`),
        request<RuntimeFileNode[]>(`/api/v1/files/tree?root=${encodeURIComponent(workingDir)}`),
        request<SessionMemoryResponse>(`/api/v1/sessions/${sessionId}/memory`),
        request<TranscriptEvent[]>(`/api/v1/sessions/${sessionId}/transcript`),
        request<{ phase?: string; enabled?: boolean }>(`/api/v1/sessions/${sessionId}/autopilot`),
      ]);

      const nextMessages = results[0].status === 'fulfilled' ? results[0].value : [];
      const nextAgents = results[1].status === 'fulfilled' ? results[1].value : [];
      const nextTree = results[2].status === 'fulfilled' ? results[2].value : [];
      const nextMemory = results[3].status === 'fulfilled' ? results[3].value : null;
      const nextTranscript = results[4].status === 'fulfilled' ? results[4].value : [];
      const autopilotData = results[5].status === 'fulfilled' ? results[5].value : null;

      if (!cancelled) {
        setMessages(nextMessages);
        setStreamingMessage('');
        setAgents(toManagedAgents(nextAgents));
        setFileTree(nextTree);
        setMemory(nextMemory);
        setTranscriptEvents(nextTranscript);
        setSelectedFile(null);
        // Prefer live autopilot data from the dedicated endpoint; fall back to session metadata
        const rawPhase =
          autopilotData?.phase ?? (activeSession?.metadata?.currentPhase as string | undefined);
        const isAutopilotActive = autopilotData?.enabled ?? autopilotEnabled;
        const validatedPhase: AutopilotPipelinePhase =
          rawPhase && VALID_PHASES.includes(rawPhase as AutopilotPipelinePhase)
            ? (rawPhase as AutopilotPipelinePhase)
            : 'goal_analysis';
        setAutopilotPhase(isAutopilotActive ? validatedPhase : null);
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
