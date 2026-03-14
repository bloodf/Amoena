import { useState } from "react";
import { AlertTriangle, ChevronRight, Mail, Shield, Wrench } from "lucide-react";

import { cn } from "@/lib/utils";
import { SubAgentSwarmGrid } from "@/composites/agents/SubAgentSwarmGrid";
import type { ManagedAgent } from "@/composites/agents/types";
import { managedStatusConfig } from "@/composites/agents/config";

const mockAgents: ManagedAgent[] = [
  {
    name: "Claude 4 Sonnet",
    type: "Main",
    source: "built-in",
    provider: "Anthropic",
    model: "claude-4-sonnet",
    status: "active",
    lastActive: "now",
    role: "Main Agent",
    tools: ["file_edit", "terminal", "git"],
    permission: "Full access",
    mailbox: { count: 2, lastMessage: "Subtask complete: token validation" },
    children: [
      {
        name: "Code Reviewer",
        type: "Sub",
        source: "built-in",
        provider: "Anthropic",
        model: "claude-4-haiku",
        status: "idle",
        lastActive: "2m ago",
        role: "Review Agent",
        tools: ["file_read"],
        permission: "Read only",
        mailbox: { count: 0 },
      },
    ],
  },
];

function AgentCard({ agent, depth = 0 }: { agent: ManagedAgent; depth?: number }) {
  const [expanded, setExpanded] = useState(depth === 0);
  const sc = managedStatusConfig[agent.status];
  const hasChildren = agent.children && agent.children.length > 0;

  return (
    <div className={cn(depth > 0 && "ml-4 border-l border-border pl-2")}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full flex-col rounded px-2 py-2.5 text-left transition-colors hover:bg-surface-2"
      >
        <div className="flex w-full items-center gap-2">
          <div className={cn("h-2 w-2 flex-shrink-0 rounded-full", sc.color)} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              {agent.emoji ? <span>{agent.emoji}</span> : null}
              <span className="text-[12px] font-medium text-foreground">{agent.name}</span>
              <span className="rounded px-1.5 py-0.5 text-[9px] font-mono text-muted-foreground bg-surface-2">
                {agent.role}
              </span>
            </div>
          </div>
          {hasChildren ? (
            <ChevronRight
              size={11}
              className={cn("text-muted-foreground transition-transform", expanded && "rotate-90")}
            />
          ) : null}
        </div>

        <div className="ml-4 mt-1 flex items-center gap-2">
          <span className="truncate text-[11px] text-muted-foreground">
            {agent.mailbox.lastMessage ?? `${agent.provider} · ${agent.model}`}
          </span>
        </div>

        <div className="ml-4 mt-1.5 flex items-center gap-3">
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <Wrench size={9} />
            <span>{agent.tools.length}</span>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <Shield
              size={9}
              className={agent.permission === "Full access" ? "text-warning" : undefined}
            />
            <span>{agent.permission}</span>
          </div>
          {agent.mailbox.count > 0 ? (
            <div className="flex items-center gap-1 text-[10px] text-primary">
              <Mail size={9} />
              <span>{agent.mailbox.count}</span>
            </div>
          ) : null}
          {agent.status === "blocked" || agent.status === "error" ? (
            <AlertTriangle size={9} className="text-destructive" />
          ) : null}
        </div>
      </button>

      {expanded &&
        agent.children?.map((sub) => (
          <AgentCard key={`${sub.name}-${sub.role}`} agent={sub} depth={depth + 1} />
        ))}
    </div>
  );
}

export function AgentsTab({ agents = mockAgents }: { agents?: ManagedAgent[] }) {
  const subagents = agents.flatMap((agent) => agent.children ?? []);

  if (subagents.length >= 2) {
    return <SubAgentSwarmGrid agents={subagents} />;
  }

  return (
    <div className="h-full overflow-y-auto p-2 space-y-1">
      {agents.map((agent) => (
        <AgentCard key={`${agent.name}-${agent.role}`} agent={agent} />
      ))}

      {agents.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="text-[12px] text-muted-foreground">No agents active</div>
          <div className="mt-0.5 text-[11px] text-muted-foreground">
            Agents will appear here when a session starts
          </div>
        </div>
      ) : null}
    </div>
  );
}
