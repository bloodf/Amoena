import { Plus, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AgentTeam } from "./types";

interface TeamListPaneProps {
  teams: AgentTeam[];
  selectedTeamId: string;
  onSelectTeam: (teamId: string) => void;
}

export function TeamListPane({ teams, selectedTeamId, onSelectTeam }: TeamListPaneProps) {
  return (
    <div className="flex w-[300px] flex-shrink-0 flex-col border-r border-border">
      <div className="flex items-center justify-between border-b border-border p-3">
        <h2 className="text-[13px] font-semibold text-foreground">Agent Teams</h2>
        <button className="flex items-center gap-1 rounded border border-primary px-2 py-1 text-[11px] text-primary transition-colors hover:bg-primary/10">
          <Plus size={11} />
          New Team
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {teams.map((team) => (
          <button
            key={team.id}
            onClick={() => onSelectTeam(team.id)}
            className={cn(
              "w-full border-b border-border px-3 py-3 text-left transition-colors",
              selectedTeamId === team.id ? "bg-primary/5" : "hover:bg-surface-2",
            )}
          >
            <div className="mb-1 flex items-center justify-between">
              <span className="text-[13px] font-medium text-foreground">{team.name}</span>
              <span
                className={cn(
                  "rounded px-1.5 py-0.5 text-[9px] font-mono uppercase",
                  team.status === "active" || team.status === "assembling"
                    ? "bg-primary/20 text-primary"
                    : team.status === "paused"
                      ? "bg-warning/20 text-warning"
                      : team.status === "failed" || team.status === "disbanded"
                        ? "bg-destructive/20 text-destructive"
                        : team.status === "idle"
                          ? "bg-muted-foreground/20 text-muted-foreground"
                          : "bg-green/20 text-green",
                )}
              >
                {team.status}
              </span>
            </div>
            <p className="mb-1.5 line-clamp-1 text-[10px] text-muted-foreground">{team.description}</p>
            <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1">
                <Users size={10} />
                {team.agents.length} agents
              </span>
              <span className="font-mono">{team.totalTokens}</span>
              <span>
                {team.completedTasks}/{team.totalTasks} tasks
              </span>
            </div>
            <div className="mt-2 h-1 overflow-hidden rounded-full bg-surface-3">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${(team.completedTasks / team.totalTasks) * 100}%` }}
              />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
