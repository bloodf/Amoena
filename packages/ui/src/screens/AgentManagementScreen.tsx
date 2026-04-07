import { useState } from 'react';
import { Settings } from 'lucide-react';
import { toast } from 'sonner';
import { ScreenMain, ScreenRoot } from '../components/screen.tsx';
import { AgentTeamsScreen } from './AgentTeamsScreen';
import { AgentDetailSheet } from '../composites/agents/AgentDetailSheet.tsx';
import { AgentManagementHeader } from '../composites/agents/AgentManagementHeader.tsx';
import { AgentManagementTabs } from '../composites/agents/AgentManagementTabs.tsx';
import { AgentRow } from '../composites/agents/AgentRow.tsx';
import {
  createImportedAgent,
  createManagedAgent,
  initialManagedAgents,
} from '../composites/agents/data.ts';
import type { AgentStatus, AgentTeam, ManagedAgent } from '../composites/agents/types.ts';

export function AgentManagementScreen({
  agents: initialAgents = initialManagedAgents,
  teams,
  readOnly = false,
}: {
  agents?: ManagedAgent[];
  teams?: AgentTeam[];
  readOnly?: boolean;
}) {
  const [agents, setAgents] = useState<ManagedAgent[]>(initialAgents);
  const [expandedAgents, setExpandedAgents] = useState<Set<string>>(new Set(['Claude 4 Sonnet']));
  const [filterSource, setFilterSource] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterDivision, setFilterDivision] = useState<string>('all');
  const [settingsAgent, setSettingsAgent] = useState<ManagedAgent | null>(null);
  const [activeTab, setActiveTab] = useState<'agents' | 'teams'>('agents');
  const toggleExpand = (name: string) => {
    setExpandedAgents((prev) => {
      const next = new Set(prev);
      if (next.has(name)) {
        next.delete(name);
      } else {
        next.add(name);
      }
      return next;
    });
  };

  const updateAgentStatus = (name: string, status: AgentStatus) => {
    setAgents((prev) =>
      prev.map((a) =>
        a.name === name
          ? { ...a, status }
          : {
              ...a,
              children: a.children?.map((c) => (c.name === name ? { ...c, status } : c)),
            },
      ),
    );
    setSettingsAgent((prev) => (prev && prev.name === name ? { ...prev, status } : prev));
    toast.success(`${name} status changed to ${status}`);
  };

  const updateAgentPermission = (name: string, permission: string) => {
    setAgents((prev) =>
      prev.map((a) =>
        a.name === name
          ? { ...a, permission }
          : {
              ...a,
              children: a.children?.map((c) => (c.name === name ? { ...c, permission } : c)),
            },
      ),
    );
    setSettingsAgent((prev) => (prev && prev.name === name ? { ...prev, permission } : prev));
    toast.success(`${name} permission set to ${permission}`);
  };

  const deleteAgent = (name: string) => {
    setAgents((prev) =>
      prev
        .filter((a) => a.name !== name)
        .map((a) => ({
          ...a,
          children: a.children?.filter((c) => c.name !== name),
        })),
    );
    setSettingsAgent(null);
    toast.success(`${name} removed`);
  };

  const addAgent = () => {
    setAgents((prev) => [...prev, createManagedAgent(prev.length + 1)]);
    toast.success('New agent created');
  };

  const importAgent = () => {
    setAgents((prev) => [...prev, createImportedAgent()]);
    toast.success('Agent imported successfully');
  };

  const filteredAgents = agents.filter((a) => {
    if (filterSource !== 'all' && a.source !== filterSource) return false;
    if (filterStatus !== 'all' && a.status !== filterStatus) return false;
    if (filterDivision !== 'all' && a.division !== filterDivision) return false;
    return true;
  });

  return (
    <ScreenRoot className="overflow-hidden">
      <div className="flex h-full flex-col">
        <AgentManagementTabs activeTab={activeTab} onChange={setActiveTab} />

        {activeTab === 'teams' ? (
          <AgentTeamsScreen teams={teams} />
        ) : (
          <>
            <AgentManagementHeader
              filterSource={filterSource}
              filterStatus={filterStatus}
              filterDivision={filterDivision}
              onFilterSourceChange={setFilterSource}
              onFilterStatusChange={setFilterStatus}
              onFilterDivisionChange={setFilterDivision}
              onImportAgent={readOnly ? () => {} : importAgent}
              onAddAgent={readOnly ? () => {} : addAgent}
            />

            <ScreenMain className="overflow-y-auto">
              {filteredAgents.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <Settings size={32} className="text-muted-foreground mb-3" />
                  <div className="text-[13px] text-muted-foreground">
                    No agents match the current filters
                  </div>
                </div>
              ) : (
                filteredAgents.map((agent) => (
                  <div key={agent.name}>
                    <AgentRow
                      agent={agent}
                      expanded={expandedAgents.has(agent.name)}
                      onToggle={() => toggleExpand(agent.name)}
                      onOpenSettings={(a) => setSettingsAgent(a)}
                    />
                    {expandedAgents.has(agent.name) &&
                      agent.children?.map((sub) => (
                        <AgentRow
                          key={sub.name}
                          agent={sub}
                          depth={1}
                          expanded={false}
                          onToggle={() => {}}
                          onOpenSettings={(a) => setSettingsAgent(a)}
                        />
                      ))}
                  </div>
                ))
              )}
            </ScreenMain>

            {settingsAgent && (
              <AgentDetailSheet
                agent={settingsAgent}
                onClose={() => setSettingsAgent(null)}
                onStatusChange={(status) => updateAgentStatus(settingsAgent.name, status)}
                onPermissionChange={(perm) => updateAgentPermission(settingsAgent.name, perm)}
                onDelete={() => deleteAgent(settingsAgent.name)}
              />
            )}
          </>
        )}
      </div>
    </ScreenRoot>
  );
}
