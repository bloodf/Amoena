import { useCallback, useEffect, useState } from 'react';

import { AgentManagementScreen, lunariaToast, type ManagedAgent } from '@lunaria/ui';
import type { SessionAgent } from '@lunaria/runtime-client';

import { useRuntimeApi } from './runtime-api';

function deriveProvider(agent: SessionAgent): string {
  const ext = agent as Record<string, unknown>;
  if (ext.provider) return ext.provider as string;
  const model = agent.model.toLowerCase();
  if (model.includes('claude') || model.includes('anthropic')) return 'Anthropic';
  if (model.includes('gpt') || model.includes('openai')) return 'OpenAI';
  if (model.includes('gemini') || model.includes('google')) return 'Google';
  return 'Unknown';
}

function toManagedAgent(agent: SessionAgent): ManagedAgent {
  const ext = agent as Record<string, unknown>;
  return {
    name: agent.id,
    type: agent.parentAgentId ? 'Sub' : 'Main',
    source: (ext.source as ManagedAgent['source']) ?? 'built-in',
    provider: deriveProvider(agent),
    model: agent.model,
    status: agent.status as ManagedAgent['status'],
    lastActive: (ext.lastActive as string) ?? '—',
    role: agent.agentType,
    tools: (ext.tools as string[]) ?? [],
    permission: (ext.permission as string) ?? 'default',
    mailbox: { count: 0 },
    division: (agent.division as ManagedAgent['division']) ?? undefined,
    collaborationStyle:
      (agent.collaborationStyle as ManagedAgent['collaborationStyle']) ?? undefined,
    communicationPreference:
      (agent.communicationPreference as ManagedAgent['communicationPreference']) ?? undefined,
    decisionWeight: agent.decisionWeight ?? undefined,
  };
}

function nestAgents(flat: SessionAgent[]): ManagedAgent[] {
  const byId = new Map<string, ManagedAgent>(flat.map((a) => [a.id, toManagedAgent(a)]));

  const roots: ManagedAgent[] = [];

  for (const agent of flat) {
    const managed = byId.get(agent.id);
    if (!managed) continue;

    if (agent.parentAgentId) {
      const parent = byId.get(agent.parentAgentId);
      if (parent) {
        parent.children = [...(parent.children ?? []), managed];
        continue;
      }
    }
    roots.push(managed);
  }

  return roots;
}

export function RuntimeAgentManagementPage() {
  const { request } = useRuntimeApi();
  const [agents, setAgents] = useState<ManagedAgent[] | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  const loadAgents = useCallback(() => {
    setLoading(true);
    setError(undefined);
    void request<SessionAgent[]>('/api/v1/agents')
      .then((records) => {
        setAgents(records.length > 0 ? nestAgents(records) : []);
      })
      .catch((err) => {
        const message = err instanceof Error ? err.message : String(err);
        lunariaToast({
          title: 'Failed to load agents',
          description: message,
          variant: 'destructive',
        });
        setError(message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [request]);

  useEffect(() => {
    loadAgents();
  }, [loadAgents]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        Loading agents...
      </div>
    );
  }

  if (error && !agents) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3">
        <div className="text-sm text-destructive">Failed to load agents: {error}</div>
        <button
          onClick={loadAgents}
          className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90"
        >
          Retry
        </button>
      </div>
    );
  }

  return <AgentManagementScreen agents={agents} />;
}
