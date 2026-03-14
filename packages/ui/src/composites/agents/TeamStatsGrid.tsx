import { Activity, Clock, MessageSquare, Target, Users, Zap } from "lucide-react";
import type { AgentTeam } from "./types";

export function TeamStatsGrid({ team }: { team: AgentTeam }) {
  const totalMessages = team.agents.reduce((sum, a) => sum + (a.messagesExchanged ?? 0), 0);
  const workingCount = team.agents.filter(a => a.status === "working").length;
  const utilization = team.agents.length > 0 ? Math.round((workingCount / team.agents.length) * 100) : 0;

  const stats = [
    { label: "Total Tokens", value: team.totalTokens, icon: Zap },
    { label: "Agents", value: String(team.agents.length), icon: Users },
    { label: "Progress", value: `${team.completedTasks}/${team.totalTasks}`, icon: Target },
    { label: "Started", value: team.startedAt, icon: Clock },
    { label: "Messages", value: String(totalMessages), icon: MessageSquare },
    { label: "Utilization", value: `${utilization}%`, icon: Activity },
  ];

  return (
    <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
      {stats.map((stat) => (
        <div key={stat.label} className="rounded-lg border border-border bg-surface-0 p-3">
          <div className="mb-1 flex items-center gap-1.5">
            <stat.icon size={11} className="text-muted-foreground" />
            <span className="text-[10px] text-muted-foreground">{stat.label}</span>
          </div>
          <span className="font-mono text-[16px] font-semibold text-foreground">{stat.value}</span>
        </div>
      ))}
    </div>
  );
}
