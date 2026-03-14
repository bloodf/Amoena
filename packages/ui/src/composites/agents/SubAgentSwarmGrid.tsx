import { Clock3 } from "lucide-react";

import { StatusPill } from "@/components/patterns";
import { cn } from "@/lib/utils";

import { divisionColors, divisionLabels, managedStatusConfig, managedStatusTone } from "./config";
import type { ManagedAgent } from "./types";

interface SubAgentSwarmGridProps {
  agents: ManagedAgent[];
}

export function SubAgentSwarmGrid({ agents }: SubAgentSwarmGridProps) {
  return (
    <div
      role="group"
      aria-label="Subagent swarm grid"
      className="grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(200px,1fr))]"
    >
      {agents.map((agent) => {
        const status = managedStatusConfig[agent.status] ?? managedStatusConfig.idle;
        const divisionColor = agent.division ? divisionColors[agent.division] : undefined;
        const divisionLabel = agent.division ? divisionLabels[agent.division] : undefined;

        return (
          <article
            key={agent.name}
            className="rounded-xl border border-border bg-surface-1 p-3 transition-colors hover:border-primary/30"
          >
            <div className="mb-2 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    aria-hidden="true"
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-full bg-surface-2 text-base",
                      !agent.emoji && "text-xs",
                    )}
                  >
                    {agent.emoji ?? "🤖"}
                  </span>
                  <div className="min-w-0">
                    <div className="truncate text-[13px] font-semibold text-foreground">{agent.name}</div>
                    <div className="truncate text-[11px] text-muted-foreground">{agent.role}</div>
                  </div>
                </div>
              </div>
              <div
                data-testid={`swarm-status-${agent.status}`}
                className={cn("h-2.5 w-2.5 rounded-full", status.color)}
              />
            </div>

            <div className="mb-3 flex flex-wrap items-center gap-2">
              <StatusPill tone={managedStatusTone(agent.status)} label={status.label} />
              {divisionLabel && divisionColor ? (
                <span
                  className="rounded px-1.5 py-0.5 text-[9px] font-medium"
                  style={{ backgroundColor: `${divisionColor}20`, color: divisionColor }}
                >
                  {divisionLabel}
                </span>
              ) : null}
            </div>

            <div className="space-y-2 text-[11px] text-muted-foreground">
              <div className="truncate font-mono text-foreground">
                {agent.provider} · {agent.model}
              </div>
              {agent.mailbox.lastMessage ? (
                <div className="line-clamp-2 rounded bg-surface-2 px-2 py-1.5 text-[10px] italic">
                  {agent.mailbox.lastMessage}
                </div>
              ) : null}
              <div className="flex items-center gap-1">
                <Clock3 size={11} />
                <span>{agent.lastActive}</span>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
