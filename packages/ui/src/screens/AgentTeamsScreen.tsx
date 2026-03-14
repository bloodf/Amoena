import { useState } from "react";
import { Pause, Play } from "lucide-react";
import { TeamCommunicationFlow } from "@/composites/agents/TeamCommunicationFlow";
import { TeamConsensusMeter } from "@/composites/agents/TeamConsensusMeter";
import { TeamListPane } from "@/composites/agents/TeamListPane";
import { TeamStatsGrid } from "@/composites/agents/TeamStatsGrid";
import { TeamStatusTable } from "@/composites/agents/TeamStatusTable";
import type { AgentTeam } from "@/composites/agents/types";

const defaultTeams: AgentTeam[] = [
  {
    id: "t1",
    name: "Auth Overhaul Squad",
    description: "Complete rewrite of authentication system with JWT rotation, OAuth2, and MFA support",
    status: "active",
    totalTokens: "48.2k",
    startedAt: "25 min ago",
    completedTasks: 3,
    totalTasks: 7,
    agents: [
      { id: "a1", name: "Architect", role: "Lead", model: "Claude 4 Sonnet", tuiColor: "tui-claude", status: "working", currentTask: "Designing token rotation flow", progress: 65, tokensUsed: "18.4k", messagesExchanged: 12, collaborationStyle: "directive", communicationPreference: "structured", decisionWeight: 0.95 },
      { id: "a2", name: "Implementer", role: "Builder", model: "Claude 4 Sonnet", tuiColor: "tui-claude", status: "waiting", currentTask: "Waiting for auth schema from Architect", tokensUsed: "14.1k", messagesExchanged: 8, collaborationStyle: "collaborative", communicationPreference: "concise", decisionWeight: 0.7 },
      { id: "a3", name: "Reviewer", role: "QA", model: "GPT-5.4", tuiColor: "tui-opencode", status: "idle", currentTask: "Reviewed 2 PRs, waiting for next", tokensUsed: "8.2k", messagesExchanged: 5, collaborationStyle: "advisory", communicationPreference: "detailed", decisionWeight: 0.85 },
      { id: "a4", name: "Doc Writer", role: "Docs", model: "Gemini 2.5 Pro", tuiColor: "tui-gemini", status: "completed", currentTask: "API docs for /auth endpoints", tokensUsed: "7.5k", messagesExchanged: 3, collaborationStyle: "autonomous", communicationPreference: "detailed", decisionWeight: 0.5 },
    ],
  },
  {
    id: "t2",
    name: "Performance Sprint",
    description: "Database query optimization, caching layer, and load testing",
    status: "paused",
    totalTokens: "22.7k",
    startedAt: "2 hours ago",
    completedTasks: 5,
    totalTasks: 8,
    agents: [
      { id: "a5", name: "DB Expert", role: "Lead", model: "Claude 4 Sonnet", tuiColor: "tui-claude", status: "idle", currentTask: "Paused - query optimization", tokensUsed: "12.3k", messagesExchanged: 9, collaborationStyle: "directive", communicationPreference: "structured", decisionWeight: 0.9 },
      { id: "a6", name: "Cache Builder", role: "Builder", model: "GPT-5.4", tuiColor: "tui-opencode", status: "idle", currentTask: "Paused - Redis integration", tokensUsed: "10.4k", messagesExchanged: 6, collaborationStyle: "collaborative", communicationPreference: "concise", decisionWeight: 0.75 },
    ],
  },
];

export function AgentTeamsScreen({ teams = defaultTeams }: { teams?: AgentTeam[] }) {
  const [selectedTeam, setSelectedTeam] = useState<string>(teams[0]?.id ?? "");
  const team = teams.find(t => t.id === selectedTeam) ?? teams[0];

  if (!team) {
    return null;
  }

  return (
    <div className="flex h-full">
      <TeamListPane teams={teams} selectedTeamId={selectedTeam} onSelectTeam={setSelectedTeam} />

      <div className="flex-1 overflow-y-auto">
        <div className="p-6 space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-lg font-semibold text-foreground">{team.name}</h1>
              <p className="text-[13px] text-muted-foreground mt-0.5">{team.description}</p>
            </div>
            <div className="flex items-center gap-2">
              {team.status === "active" ? (
                <button className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] bg-warning/10 text-warning border border-warning/30 rounded cursor-pointer hover:bg-warning/20 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring transition-colors" aria-label="Pause team">
                  <Pause size={12} /> Pause
                </button>
              ) : (
                <button className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] bg-primary/10 text-primary border border-primary/30 rounded cursor-pointer hover:bg-primary/20 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring transition-colors" aria-label="Resume team">
                  <Play size={12} /> Resume
                </button>
              )}
            </div>
          </div>

          <TeamConsensusMeter team={team} />
          <TeamStatsGrid team={team} />
          <TeamCommunicationFlow team={team} />
          <TeamStatusTable team={team} />
        </div>
      </div>
    </div>
  );
}
