import type { AgentTeam, TeamAgent } from "./types";

function statusAgreement(agent: TeamAgent) {
  switch (agent.status) {
    case "completed":
      return 1;
    case "working":
      return 0.75;
    case "idle":
      return 0.6;
    case "waiting":
    case "paused":
      return 0.35;
    case "failed":
      return 0.1;
    case "preparing":
    case "created":
    default:
      return 0.5;
  }
}

export function calculateConsensus(team: AgentTeam) {
  const weighted = team.agents.reduce(
    (sum, agent) => sum + statusAgreement(agent) * (agent.decisionWeight ?? 0.5),
    0,
  );
  const weight = team.agents.reduce((sum, agent) => sum + (agent.decisionWeight ?? 0.5), 0);
  return weight === 0 ? 0 : weighted / weight;
}

function consensusColor(value: number) {
  if (value >= 0.75) return "from-green-500 to-emerald-400";
  if (value >= 0.4) return "from-amber-500 to-yellow-400";
  return "from-red-500 to-rose-400";
}

export function TeamConsensusMeter({ team }: { team: AgentTeam }) {
  const consensus = calculateConsensus(team);
  const percent = Math.round(consensus * 100);

  return (
    <div className="rounded-lg border border-border bg-surface-0 p-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Team Consensus
        </span>
        <span className="font-mono text-[12px] text-foreground">{percent}%</span>
      </div>
      <div
        aria-label={`Consensus ${percent}%`}
        className="h-2 overflow-hidden rounded-full bg-surface-3"
      >
        <div
          className={`h-full rounded-full bg-gradient-to-r ${consensusColor(consensus)}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
