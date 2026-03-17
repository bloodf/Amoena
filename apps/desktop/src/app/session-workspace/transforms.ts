import type { MemoryTabEntry } from '@/composites/side-panel/MemoryTab';
import type { ManagedAgent } from '@/composites/agents/types';
import type { FileNode } from '@/composites/file-browser/types';

import type {
  AgentRecord,
  MessageRecord,
  RuntimeFileNode,
  SessionMemoryResponse,
  TranscriptEvent,
} from './types';
import type { SessionSummary } from '../runtime-context';

const VALID_PROVIDERS = new Set(['lunaria', 'claude', 'opencode', 'codex', 'gemini', 'ollama']);
type TuiProvider = 'lunaria' | 'claude' | 'opencode' | 'codex' | 'gemini' | 'ollama';

const NATIVE_TO_TUI: Record<string, TuiProvider> = {
  anthropic: 'claude',
  openai: 'opencode',
  google: 'gemini',
};

function resolveProvider(summary: SessionSummary): TuiProvider {
  const raw = summary.providerId ?? summary.tuiType ?? '';
  const mapped = NATIVE_TO_TUI[raw] ?? raw;
  return VALID_PROVIDERS.has(mapped) ? (mapped as TuiProvider) : 'lunaria';
}

export function toWorkspaceSession(summary: SessionSummary) {
  return {
    id: summary.id,
    title: (summary.workingDir ?? '').split('/').pop() || summary.id,
    model: summary.modelId ?? summary.tuiType ?? 'unknown',
    provider: resolveProvider(summary),
    hasActivity: true,
    permission: (summary.metadata?.permission as string) ?? 'default',
    continueIn: (summary.metadata?.workTarget as 'local' | 'worktree' | 'cloud') ?? 'local',
    branch: (summary.metadata?.branch as string) ?? 'main',
    isEmpty: false,
  };
}

function normalizeAgentStatus(status: string): ManagedAgent['status'] {
  switch (status) {
    case 'preparing':
    case 'thinking':
    case 'executing':
    case 'blocked':
    case 'awaiting_review':
    case 'paused':
    case 'error':
    case 'delegating':
    case 'synthesizing':
    case 'idle':
    case 'complete':
      return status;
    case 'active':
    case 'running':
      return 'executing';
    case 'completed':
      return 'complete';
    case 'failed':
    case 'cancelled':
      return 'error';
    case 'created':
      return 'thinking';
    default:
      return 'idle';
  }
}

function divisionEmoji(division?: string | null) {
  switch (division) {
    case 'engineering':
      return '🛠';
    case 'design':
      return '🎨';
    case 'qa':
      return '🧪';
    case 'product':
      return '📋';
    case 'security':
      return '🛡️';
    case 'devops':
      return '⚙️';
    case 'ai':
      return '🤖';
    default:
      return '🧠';
  }
}

export function toManagedAgents(records: AgentRecord[]): ManagedAgent[] {
  const childrenByParent = new Map<string, ManagedAgent[]>();
  const byId = new Map<string, ManagedAgent>();

  for (const agent of records) {
    const mapped: ManagedAgent = {
      name: agent.agentType,
      type: agent.parentAgentId ? 'Sub' : 'Main',
      source: 'built-in',
      provider: 'runtime',
      model: agent.model,
      status: normalizeAgentStatus(agent.status),
      lastActive: 'just now',
      role: agent.parentAgentId ? 'Sub-agent' : 'Primary agent',
      tools: [],
      permission: 'default',
      mailbox: { count: 0 },
      division: (agent.division as ManagedAgent['division']) ?? undefined,
      emoji: divisionEmoji(agent.division),
      collaborationStyle:
        (agent.collaborationStyle as ManagedAgent['collaborationStyle']) ?? undefined,
      communicationPreference:
        (agent.communicationPreference as ManagedAgent['communicationPreference']) ?? undefined,
      decisionWeight: agent.decisionWeight ?? undefined,
    };
    byId.set(agent.id, mapped);
    if (agent.parentAgentId) {
      const bucket = childrenByParent.get(agent.parentAgentId) ?? [];
      bucket.push(mapped);
      childrenByParent.set(agent.parentAgentId, bucket);
    }
  }

  for (const [agentId, children] of childrenByParent) {
    const parent = byId.get(agentId);
    if (parent) {
      parent.children = children;
    }
  }

  return records
    .filter((agent) => !agent.parentAgentId)
    .map((agent) => byId.get(agent.id)!)
    .filter(Boolean);
}

export function inferTypes(node: RuntimeFileNode, bucket = new Set<string>()) {
  if (node.nodeType === 'file') {
    const ext = node.name.split('.').pop();
    if (ext) {
      bucket.add(ext);
    }
    return Array.from(bucket);
  }
  for (const child of node.children) {
    inferTypes(child, bucket);
  }
  return Array.from(bucket);
}

export function findFileNodeByPath(nodes: RuntimeFileNode[], path: string): RuntimeFileNode | null {
  for (const node of nodes) {
    if (node.path === path) {
      return node;
    }
    const nested = findFileNodeByPath(node.children, path);
    if (nested) {
      return nested;
    }
  }
  return null;
}

export function countTreeItems(node: RuntimeFileNode): number {
  if (node.nodeType === 'file') {
    return 1;
  }
  return node.children.reduce((sum, child) => sum + countTreeItems(child), 0);
}

export function toFileNode(node: RuntimeFileNode): FileNode {
  return {
    name: node.name,
    path: node.path,
    type: node.nodeType,
    itemCount: node.nodeType === 'folder' ? countTreeItems(node) : undefined,
    inferredTypes: node.nodeType === 'folder' ? inferTypes(node) : undefined,
    truncated: false,
    children: node.children.map(toFileNode),
  };
}

export function interestingTranscriptEvent(event: TranscriptEvent) {
  return [
    'tool.start',
    'tool.result',
    'permission.requested',
    'permission.resolved',
    'agent.mailbox',
    'agent.spawned',
    'agent.status',
    'usage',
  ].includes(event.eventType);
}

export function toTimelineMessages(
  messages: MessageRecord[],
  transcriptEvents: TranscriptEvent[],
  streamingMessage?: string,
) {
  const permissionMessages = transcriptEvents
    .filter((event) => event.eventType === 'permission.requested')
    .map((event) => ({
      id: event.id,
      role: 'permission' as const,
      content: String(event.payload.message ?? event.payload.toolName ?? 'Permission requested'),
      timestamp: new Date(event.occurredAt).toLocaleTimeString(),
      requestId: String(event.payload.requestId ?? ''),
    }));

  const timeline = [
    ...messages.map((message) => ({
      id: message.id,
      role: (message.role === 'assistant' ? 'assistant' : message.role) as
        | 'user'
        | 'assistant'
        | 'permission'
        | 'system',
      content: message.content,
      timestamp: new Date(message.createdAt).toLocaleTimeString(),
      reasoningActive: message.role === 'assistant',
    })),
    ...permissionMessages,
  ];

  if (streamingMessage) {
    timeline.push({
      id: 'streaming-assistant',
      role: 'assistant' as const,
      content: streamingMessage,
      timestamp: 'now',
      reasoningActive: true,
    });
  }

  return timeline;
}

export function toMemoryEntries(memory: SessionMemoryResponse | null): MemoryTabEntry[] {
  if (!memory) {
    return [];
  }

  return memory.entries.map((entry) => ({
    id: entry.id,
    title: entry.title,
    type: entry.observationType,
    category: entry.category,
    timestamp: new Date(entry.createdAt).toLocaleTimeString(),
    l0Summary: entry.l0Summary,
    l1Summary: entry.l1Summary,
    l2Content: entry.l2Content,
  }));
}
