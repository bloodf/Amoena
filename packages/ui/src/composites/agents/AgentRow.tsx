import { AlertTriangle, ChevronDown, ChevronRight, Mail, Settings, Shield, Wrench } from "lucide-react";
import { cn } from '../../lib/utils.ts';
import { Button } from '../../primitives/button.tsx';
import { StatusPill } from '../../components/patterns.tsx';
import type { ManagedAgent } from "./types";
import {
  divisionColors,
  divisionLabels,
  managedStatusConfig,
  managedStatusTone,
  sourceColors,
} from "./config";

interface AgentRowProps {
  agent: ManagedAgent;
  depth?: number;
  expanded: boolean;
  onToggle: () => void;
  onOpenSettings: (agent: ManagedAgent) => void;
}

export function AgentRow({ agent, depth = 0, expanded, onToggle, onOpenSettings }: AgentRowProps) {
  const status = managedStatusConfig[agent.status] ?? managedStatusConfig.idle;
  const hasChildren = Boolean(agent.children?.length);
  const divisionColor = agent.division ? divisionColors[agent.division] : undefined;
  const divisionLabel = agent.division ? divisionLabels[agent.division] : undefined;

  return (
    <div className={cn("border-b border-border", depth > 0 && "ml-6 border-l-2 border-l-surface-3")}>
      <div
        className="flex cursor-pointer items-center px-4 py-3 transition-colors hover:bg-surface-2"
        onClick={onToggle}
      >
        <div className="flex min-w-0 flex-1 items-center gap-3">
          {hasChildren ? (
            <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground">
              {expanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
            </Button>
          ) : (
            <div className="w-[13px]" />
          )}
          <div className={cn("h-2.5 w-2.5 flex-shrink-0 rounded-full", status.color)} />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              {agent.emoji && <span className="text-[13px]" title={agent.vibe}>{agent.emoji}</span>}
              <span className="text-[13px] font-medium text-foreground">{agent.name}</span>
              <StatusPill className={cn("text-[9px]", sourceColors[agent.source])} label={agent.source} />
              {agent.status === "failed" && <AlertTriangle size={11} className="text-destructive" />}
              {agent.status === "cancelled" && <AlertTriangle size={11} className="text-destructive" />}
            </div>
            <div className="mt-0.5 flex items-center gap-3">
              <span className="text-[11px] text-muted-foreground">{agent.role}</span>
              {divisionLabel && divisionColor && (
                <span
                  className="rounded px-1.5 py-0.5 text-[9px] font-medium"
                  style={{ backgroundColor: `${divisionColor}20`, color: divisionColor }}
                >
                  {divisionLabel}
                </span>
              )}
              {agent.collaborationStyle && (
                <span className="rounded bg-surface-3 px-1.5 py-0.5 text-[9px] text-muted-foreground">
                  {agent.collaborationStyle}
                </span>
              )}
              <span className="text-[10px] font-mono text-muted-foreground">
                {agent.provider} · {agent.model}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-shrink-0 items-center gap-4">
          <div className="flex items-center gap-1" title={`Tools: ${agent.tools.join(", ")}`}>
            <Wrench size={11} className="text-muted-foreground" />
            <span className="text-[10px] font-mono text-muted-foreground">{agent.tools.length}</span>
          </div>
          <div className="flex items-center gap-1">
            <Shield size={11} className={agent.permission === "Full access" ? "text-warning" : "text-muted-foreground"} />
            <span className="text-[10px] text-muted-foreground">{agent.permission}</span>
          </div>
          {agent.mailbox.count > 0 && (
            <div className="flex items-center gap-1" title={agent.mailbox.lastMessage}>
              <Mail size={11} className="text-primary" />
              <span className="text-[10px] font-mono text-primary">{agent.mailbox.count}</span>
            </div>
          )}
          {agent.session && (
            <span className="max-w-[120px] truncate text-[10px] font-mono text-muted-foreground">{agent.session}</span>
          )}
          <StatusPill
            className="text-[10px]"
            tone={managedStatusTone(agent.status)}
            label={status.label}
          />
          <span className="w-16 text-right text-[10px] text-muted-foreground">{agent.lastActive}</span>
          <Button
            onClick={(event) => {
              event.stopPropagation();
              onOpenSettings(agent);
            }}
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:bg-surface-2 hover:text-foreground"
            title="Agent Settings"
          >
            <Settings size={13} />
          </Button>
        </div>
      </div>
    </div>
  );
}
