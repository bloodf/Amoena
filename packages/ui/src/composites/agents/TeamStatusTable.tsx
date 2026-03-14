import { Circle, Clock, Loader2, Pause, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AgentTeam } from "./types";

const statusIcons: Record<string, { icon: typeof Circle; color: string; label: string }> = {
  created: { icon: Circle, color: "text-blue-500", label: "Created" },
  preparing: { icon: Loader2, color: "text-blue-500", label: "Preparing" },
  working: { icon: Zap, color: "text-primary", label: "Working" },
  idle: { icon: Clock, color: "text-muted-foreground", label: "Idle" },
  waiting: { icon: Pause, color: "text-warning", label: "Waiting" },
  paused: { icon: Pause, color: "text-amber-400", label: "Paused" },
  completed: { icon: Circle, color: "text-green", label: "Done" },
  failed: { icon: Circle, color: "text-destructive", label: "Failed" },
};

const collaborationStyleColors: Record<string, string> = {
  directive: "bg-amber-400/10 text-amber-400",
  collaborative: "bg-green-500/10 text-green-500",
  advisory: "bg-blue-400/10 text-blue-400",
  autonomous: "bg-purple-400/10 text-purple-400",
};

export function TeamStatusTable({ team }: { team: AgentTeam }) {
  return (
    <div>
      <h3 className="mb-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Agent Status</h3>
      <div className="overflow-hidden rounded-lg border border-border">
        <div className="grid grid-cols-[1fr_80px_100px_80px_80px_1fr] border-b border-border bg-surface-2 px-3 py-2 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
          <span>Agent</span>
          <span>Role</span>
          <span>Style</span>
          <span>Weight</span>
          <span>Tokens</span>
          <span>Current Task</span>
        </div>
        {team.agents.map((agent) => {
          const status = statusIcons[agent.status] ?? statusIcons.idle;
          const StatusIcon = status.icon;
          const styleClass = agent.collaborationStyle ? collaborationStyleColors[agent.collaborationStyle] : "";
          return (
            <div
              key={agent.id}
              className="grid grid-cols-[1fr_80px_100px_80px_80px_1fr] items-center border-b border-border px-3 py-2.5 transition-colors last:border-0 hover:bg-surface-2"
            >
              <div className="flex items-center gap-2">
                <Circle
                  size={7}
                  className={cn(
                    "fill-current",
                    agent.tuiColor === "tui-claude" && "text-tui-claude",
                    agent.tuiColor === "tui-opencode" && "text-tui-opencode",
                    agent.tuiColor === "tui-gemini" && "text-tui-gemini",
                  )}
                />
                <span className="text-[12px] font-medium text-foreground">{agent.name}</span>
                <StatusIcon size={10} className={status.color} />
              </div>
              <span className="text-[11px] text-muted-foreground">{agent.role}</span>
              <div>
                {agent.collaborationStyle && (
                  <span className={cn("text-[9px] px-1.5 py-0.5 rounded font-mono", styleClass)}>
                    {agent.collaborationStyle}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5">
                {agent.decisionWeight != null && (
                  <>
                    <div className="h-1 w-10 overflow-hidden rounded-full bg-surface-3">
                      <div className="h-full rounded-full bg-primary/70" style={{ width: `${agent.decisionWeight * 100}%` }} />
                    </div>
                    <span className="text-[9px] font-mono text-muted-foreground">{agent.decisionWeight.toFixed(1)}</span>
                  </>
                )}
              </div>
              <span className="text-[11px] font-mono text-muted-foreground">{agent.tokensUsed}</span>
              <div className="flex min-w-0 items-center gap-2">
                <span className="truncate text-[11px] text-muted-foreground">{agent.currentTask}</span>
                {agent.progress && (
                  <div className="flex flex-shrink-0 items-center gap-1.5">
                    <div className="h-1 w-16 overflow-hidden rounded-full bg-surface-3">
                      <div className="h-full rounded-full bg-primary" style={{ width: `${agent.progress}%` }} />
                    </div>
                    <span className="text-[9px] font-mono text-muted-foreground">{agent.progress}%</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
