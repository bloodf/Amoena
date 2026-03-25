import { useEffect } from 'react';

import type { AutopilotPipelinePhase } from '@/composites/autopilot/types';
import type { ManagedAgent } from '@/composites/agents/types';

import { createEventBatcher } from './event-batcher';
import { toManagedAgents } from './transforms';
import type {
  AgentRecord,
  MessageRecord,
  RuntimeEventEnvelope,
  SessionMemoryResponse,
  TranscriptEvent,
} from './types';
import type {
  RuntimeLaunchContext,
  RuntimeSessionSummary,
  SessionSummary,
} from '../runtime-context';

type RuntimeRequest = <T>(path: string, init?: RequestInit) => Promise<T>;

export function useSessionStream({
  activeSession,
  runtimeSession,
  launchContext,
  request,
  setTranscriptEvents,
  setMessages,
  setStreamingMessage,
  setAgents,
  setMemory,
  setAutopilotPhase,
}: {
  activeSession: SessionSummary | null;
  runtimeSession: RuntimeSessionSummary | null;
  launchContext: RuntimeLaunchContext | null;
  request: RuntimeRequest;
  setTranscriptEvents: React.Dispatch<React.SetStateAction<TranscriptEvent[]>>;
  setMessages: React.Dispatch<React.SetStateAction<MessageRecord[]>>;
  setStreamingMessage: React.Dispatch<React.SetStateAction<string>>;
  setAgents: React.Dispatch<React.SetStateAction<ManagedAgent[]>>;
  setMemory: React.Dispatch<React.SetStateAction<SessionMemoryResponse | null>>;
  setAutopilotPhase: React.Dispatch<React.SetStateAction<AutopilotPipelinePhase | null>>;
}) {
  useEffect(() => {
    if (!activeSession || !runtimeSession || !launchContext) {
      return;
    }

    const eventSource = new EventSource(
      `${launchContext.apiBaseUrl}/api/v1/sessions/${activeSession.id}/stream?authToken=${encodeURIComponent(runtimeSession.authToken)}`,
    );

    // Batch high-frequency message.delta events to reduce render cycles.
    // Deltas are collected for 50ms then flushed as a single concatenated update.
    const deltaBatcher = createEventBatcher<string>((batch) => {
      const combined = batch.join('');
      if (combined) {
        setStreamingMessage((previous) => `${previous}${combined}`);
      }
    }, 50);

    const onEvent = (event: Event) => {
      const payload = JSON.parse((event as MessageEvent<string>).data) as RuntimeEventEnvelope;
      setTranscriptEvents((previous) => [...previous, payload]);

      switch (payload.eventType) {
        case 'message.created': {
          const created = payload.payload as MessageRecord;
          setMessages((previous) =>
            previous.some((message) => message.id === created.id)
              ? previous
              : [...previous, created],
          );
          break;
        }
        case 'message.delta': {
          deltaBatcher.push(String(payload.payload.text ?? ''));
          break;
        }
        case 'message.complete': {
          const completed = {
            id: String(payload.payload.messageId ?? `assistant-${payload.id}`),
            role: 'assistant',
            content: String(payload.payload.content ?? ''),
            attachments: [],
            createdAt: payload.occurredAt,
          } satisfies MessageRecord;
          setMessages((previous) => {
            const withoutStreamingDuplicate = previous.filter(
              (message) => !(message.role === 'assistant' && message.content === completed.content),
            );
            return [...withoutStreamingDuplicate, completed];
          });
          if (typeof payload.payload.memoryBudgetUsed === 'number') {
            setMemory((previous) =>
              previous
                ? {
                    ...previous,
                    tokenBudget: {
                      ...previous.tokenBudget,
                      l0: payload.payload.memoryBudgetUsed as number,
                    },
                  }
                : previous,
            );
          }
          setStreamingMessage('');
          break;
        }
        case 'agent.status':
        case 'agent.spawned': {
          void request<AgentRecord[]>(`/api/v1/sessions/${activeSession.id}/agents/list`).then(
            (nextAgents) => {
              setAgents(toManagedAgents(nextAgents));
            },
          );
          break;
        }
        case 'agent.mailbox': {
          setAgents((previous) =>
            previous.map((agent) => ({
              ...agent,
              children: agent.children?.map((child) =>
                child.name === payload.payload.fromAgentId
                  ? {
                      ...child,
                      mailbox: {
                        count: child.mailbox.count + 1,
                        lastMessage: String(
                          payload.payload.message ?? child.mailbox.lastMessage ?? '',
                        ),
                      },
                    }
                  : child,
              ),
            })),
          );
          break;
        }
        case 'autopilot.phase': {
          const nextPhase = payload.payload.currentPhase;
          if (typeof nextPhase === 'string') {
            setAutopilotPhase(nextPhase as AutopilotPipelinePhase);
          }
          break;
        }
        default:
          break;
      }
    };

    const eventTypes = [
      'message.created',
      'message.delta',
      'message.complete',
      'agent.status',
      'agent.spawned',
      'agent.mailbox',
      'tool.start',
      'tool.result',
      'permission.requested',
      'permission.resolved',
      'usage',
      'autopilot.phase',
    ];
    for (const eventType of eventTypes) {
      eventSource.addEventListener(eventType, onEvent as EventListener);
    }

    return () => {
      deltaBatcher.dispose();
      for (const eventType of eventTypes) {
        eventSource.removeEventListener(eventType, onEvent as EventListener);
      }
      eventSource.close();
    };
  }, [
    activeSession,
    launchContext,
    request,
    runtimeSession,
    setAgents,
    setAutopilotPhase,
    setMemory,
    setMessages,
    setStreamingMessage,
    setTranscriptEvents,
  ]);
}
