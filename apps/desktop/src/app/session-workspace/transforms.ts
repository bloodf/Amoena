import type { ManagedAgent } from '@/composites/agents/types';

export interface AgentRecord {
  id: string;
  name: string;
  type: 'Main' | 'Sub';
  source: 'built-in' | 'imported' | 'marketplace' | 'custom';
  provider: string;
  model: string;
  status: string;
  lastActive: string;
  role: string;
  tools: string[];
  permission: string;
  mailbox: { count: number; lastMessage?: string };
  children?: AgentRecord[];
}

export function toManagedAgents(records: AgentRecord[]): ManagedAgent[] {
  return records.map((record) => ({
    name: record.name,
    type: record.type,
    source: record.source,
    provider: record.provider,
    model: record.model,
    status: record.status as ManagedAgent['status'],
    lastActive: record.lastActive,
    role: record.role,
    tools: record.tools,
    permission: record.permission,
    mailbox: record.mailbox,
    children: record.children ? toManagedAgents(record.children) : undefined,
  }));
}
