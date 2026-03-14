import { ArrowRight, Bot, Circle, Clock, Pause, Users, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AgentTeam } from "./types";

const statusIcons: Record<string, { icon: typeof Circle; color: string; label: string }> = {
  created: { icon: Circle, color: "text-blue-500", label: "Created" },
  preparing: { icon: Clock, color: "text-blue-500", label: "Preparing" },
  working: { icon: Zap, color: "text-primary", label: "Working" },
  idle: { icon: Clock, color: "text-muted-foreground", label: "Idle" },
  waiting: { icon: Pause, color: "text-warning", label: "Waiting" },
  paused: { icon: Pause, color: "text-warning", label: "Paused" },
  completed: { icon: Circle, color: "text-green", label: "Done" },
  failed: { icon: Circle, color: "text-destructive", label: "Failed" },
};

export function TeamCommunicationFlow({ team }: { team: AgentTeam }) {
  return (
    <div>
      <h3 className="mb-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        Agent Communication Flow
      </h3>
      <div className="rounded-lg border border-border bg-surface-0 p-4">
        <div className="flex flex-wrap items-center justify-center gap-4">
          {team.agents.map((agent, index) => {
            const status = statusIcons[agent.status] ?? statusIcons.idle;
            const StatusIcon = status.icon;
            return (
              <div key={agent.id} className="flex items-center gap-3">
                <div className="flex flex-col items-center gap-1.5">
                  <div
                    className={cn(
                      "flex h-14 w-14 items-center justify-center rounded-xl border-2 transition-all",
                      agent.status === "working"
                        ? "border-primary bg-primary/10 shadow-[0_0_12px_hsl(var(--primary)/0.3)]"
                        : agent.status === "waiting"
                          ? "border-warning/50 bg-warning/5"
                          : "border-border bg-surface-1",
                    )}
                  >
                    <Bot
                      size={20}
                      className={cn(
                        agent.tuiColor === "tui-claude" && "text-tui-claude",
                        agent.tuiColor === "tui-opencode" && "text-tui-opencode",
                        agent.tuiColor === "tui-gemini" && "text-tui-gemini",
                      )}
                    />
                  </div>
                  <span className="text-[11px] font-medium text-foreground">{agent.name}</span>
                  <div className="flex items-center gap-1">
                    <StatusIcon size={8} className={status.color} />
                    <span className={cn("text-[9px]", status.color)}>{status.label}</span>
                  </div>
                </div>

                {index < team.agents.length - 1 && (
                  <div className="flex flex-col items-center gap-0.5">
                    <ArrowRight size={14} className="text-muted-foreground/30" />
                    {agent.messagesExchanged && (
                      <span className="text-[8px] text-muted-foreground">{agent.messagesExchanged} msgs</span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* MiroFish-inspired consensus meter */}
        {team.agents.some(a => a.decisionWeight != null) && (
          <div className="mt-4 pt-3 border-t border-border">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Consensus Meter</span>
              <span className="text-[9px] text-muted-foreground">Weighted by decision authority</span>
            </div>
            <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-surface-3">
              {team.agents.map((agent) => {
                const totalWeight = team.agents.reduce((sum, a) => sum + (a.decisionWeight ?? 0.5), 0);
                const pct = totalWeight > 0 ? ((agent.decisionWeight ?? 0.5) / totalWeight) * 100 : 0;
                return (
                  <div
                    key={agent.id}
                    className={cn(
                      "h-full transition-all",
                      agent.tuiColor === "tui-claude" && "bg-tui-claude",
                      agent.tuiColor === "tui-opencode" && "bg-tui-opencode",
                      agent.tuiColor === "tui-gemini" && "bg-tui-gemini",
                      !["tui-claude", "tui-opencode", "tui-gemini"].includes(agent.tuiColor) && "bg-primary/60",
                    )}
                    style={{ width: `${pct}%` }}
                    title={`${agent.name}: ${(agent.decisionWeight ?? 0.5).toFixed(2)} weight`}
                  />
                );
              })}
            </div>
            <div className="flex justify-between mt-1">
              {team.agents.map((agent) => (
                <span key={agent.id} className="text-[8px] text-muted-foreground">{agent.name}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
