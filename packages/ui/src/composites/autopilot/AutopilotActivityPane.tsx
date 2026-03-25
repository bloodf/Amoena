import { Check, Circle, ClipboardList, Clock, PlayCircle, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { autopilotStateConfig } from './config';
import { initialAutopilotSubAgents } from './data';
import type {
  AutopilotActivityItem,
  AutopilotPipelinePhase,
  AutopilotState,
  AutopilotSubAgent,
} from './types';

const pipelinePhases: { key: AutopilotPipelinePhase; label: string; short: string }[] = [
  { key: 'goal_analysis', label: 'Goal Analysis', short: 'Analyze' },
  { key: 'story_decomposition', label: 'Story Decomposition', short: 'Decompose' },
  { key: 'agent_assignment', label: 'Agent Assignment', short: 'Assign' },
  { key: 'execution', label: 'Execution', short: 'Execute' },
  { key: 'verification', label: 'Verification', short: 'Verify' },
  { key: 'report', label: 'Report', short: 'Report' },
];

const currentPipelinePhase: AutopilotPipelinePhase = 'execution';

const subAgentStatusConfig: Record<
  AutopilotSubAgent['status'],
  { color: string; bgColor: string; label: string }
> = {
  preparing: { color: 'text-blue-400', bgColor: 'bg-blue-400/10', label: 'Preparing' },
  running: { color: 'text-green-400', bgColor: 'bg-green-400/10', label: 'Running' },
  paused: { color: 'text-amber-400', bgColor: 'bg-amber-400/10', label: 'Paused' },
  completed: { color: 'text-green-500', bgColor: 'bg-green-500/10', label: 'Done' },
  failed: { color: 'text-red-400', bgColor: 'bg-red-400/10', label: 'Failed' },
};

function PipelineStepper({ currentPhase }: { currentPhase: AutopilotPipelinePhase }) {
  const currentIdx = pipelinePhases.findIndex((p) => p.key === currentPhase);

  return (
    <div className="mb-4 flex items-center gap-1">
      {pipelinePhases.map((phase, idx) => {
        const isDone = idx < currentIdx;
        const isCurrent = idx === currentIdx;
        return (
          <div key={phase.key} className="flex items-center gap-1 flex-1">
            <div
              className={cn(
                'flex items-center justify-center rounded px-2 py-1.5 text-[10px] font-medium transition-colors w-full text-center',
                isDone && 'bg-green-500/15 text-green-500',
                isCurrent && 'bg-primary/15 text-primary ring-1 ring-primary/30',
                !isDone && !isCurrent && 'bg-surface-2 text-muted-foreground',
              )}
            >
              {isDone ? <Check size={10} className="mr-1 shrink-0" /> : null}
              {phase.short}
            </div>
            {idx < pipelinePhases.length - 1 && (
              <div className={cn('h-px w-2 shrink-0', isDone ? 'bg-green-500/40' : 'bg-border')} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function SubAgentSwarmGrid({ agents }: { agents: AutopilotSubAgent[] }) {
  return (
    <div className="mb-4">
      <h3 className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-2">
        Active Agents
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {agents.map((agent) => {
          const sc = subAgentStatusConfig[agent.status];
          const progress =
            agent.stepsTotal > 0 ? (agent.stepsCompleted / agent.stepsTotal) * 100 : 0;
          return (
            <div key={agent.id} className="rounded border border-border bg-surface-2 p-3">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm">{agent.emoji}</span>
                  <span className="text-[12px] font-medium text-foreground">{agent.name}</span>
                </div>
                <span
                  className={cn('text-[9px] px-1.5 py-0.5 rounded font-mono', sc.color, sc.bgColor)}
                >
                  {sc.label}
                </span>
              </div>
              <div className="text-[10px] text-muted-foreground mb-2">{agent.role}</div>
              {agent.currentTask && (
                <div className="text-[10px] text-foreground/70 mb-2 italic truncate">
                  {agent.currentTask}
                </div>
              )}
              <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                <span className="font-mono">
                  {agent.stepsCompleted}/{agent.stepsTotal} steps
                </span>
                <span className="font-mono">{agent.tokensUsed} tokens</span>
              </div>
              <div className="mt-1.5 h-1 rounded-full bg-surface-3 overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary/60 transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function AutopilotActivityPane({
  state,
  activityLog,
  onOpenTaskBoard,
  onApprove,
  onDeny,
}: {
  state: AutopilotState;
  activityLog: AutopilotActivityItem[];
  onOpenTaskBoard: () => void;
  onApprove: (index: number) => void;
  onDeny: (index: number) => void;
}) {
  const sc = autopilotStateConfig[state];

  return (
    <div className="flex-1 overflow-y-auto p-6" aria-label="Autopilot live activity">
      <div className="flex items-center justify-between mb-3">
        <h2
          className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider"
          id="autopilot-activity-heading"
        >
          Live Activity
        </h2>
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenTaskBoard}
            aria-label="Open task board"
            className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium text-primary border border-primary/30 rounded cursor-pointer hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 transition-colors min-h-[44px]"
          >
            <ClipboardList size={12} aria-hidden="true" />
            Task Board
          </button>
          <div className="flex items-center gap-1.5">
            <Clock size={11} className="text-muted-foreground" />
            <span className="text-[10px] text-muted-foreground font-mono">4m 12s elapsed</span>
          </div>
        </div>
      </div>

      {/* MiroFish-inspired pipeline stepper */}
      <PipelineStepper currentPhase={currentPipelinePhase} />

      <div className="mb-4 p-3 rounded border border-border bg-surface-2">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[12px] font-medium text-foreground">JWT Auth Refactor</span>
          <span className={cn('text-[9px] px-1.5 py-0.5 rounded font-mono', sc.color, sc.bgColor)}>
            {sc.label}
          </span>
        </div>
        <div className="grid grid-cols-4 gap-3 mt-2">
          <div>
            <div className="text-[10px] text-muted-foreground">Steps</div>
            <div className="text-[13px] font-mono text-foreground">3/7</div>
          </div>
          <div>
            <div className="text-[10px] text-muted-foreground">Tokens</div>
            <div className="text-[13px] font-mono text-foreground">6.0k</div>
          </div>
          <div>
            <div className="text-[10px] text-muted-foreground">Files</div>
            <div className="text-[13px] font-mono text-foreground">4</div>
          </div>
          <div>
            <div className="text-[10px] text-muted-foreground">Duration</div>
            <div className="text-[13px] font-mono text-foreground">4:12</div>
          </div>
        </div>
      </div>

      {/* MiroFish-inspired sub-agent swarm grid */}
      <SubAgentSwarmGrid agents={initialAutopilotSubAgents} />

      <div className="space-y-1" role="log" aria-live="polite" aria-label="Activity log">
        {activityLog.map((item, index) => (
          <div
            key={`${item.time}-${item.target}-${index}`}
            className="flex items-center px-3 py-2 rounded hover:bg-surface-2 transition-colors"
            role="listitem"
          >
            <span className="text-[11px] font-mono text-muted-foreground w-16">{item.time}</span>
            <Circle
              size={6}
              className={cn(
                'fill-current mx-2',
                item.status === 'completed' && 'text-green',
                item.status === 'pending_approval' && 'text-warning animate-pulse',
              )}
            />
            <span className="text-[11px] font-mono text-muted-foreground w-24">{item.action}</span>
            <span className="text-[12px] font-mono text-foreground flex-1">{item.target}</span>
            {item.status === 'pending_approval' && (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => onApprove(index)}
                  aria-label={`Approve ${item.target}`}
                  className="px-2 py-0.5 text-[10px] font-medium bg-success text-success-foreground rounded cursor-pointer hover:bg-success/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 transition-colors min-h-[44px] min-w-[44px]"
                >
                  <Check size={10} aria-hidden="true" /> Approve
                </button>
                <button
                  onClick={() => onDeny(index)}
                  aria-label={`Deny ${item.target}`}
                  className="px-2 py-0.5 text-[10px] font-medium border border-destructive text-destructive rounded cursor-pointer hover:bg-destructive/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 transition-colors min-h-[44px] min-w-[44px]"
                >
                  <X size={10} aria-hidden="true" /> Deny
                </button>
              </div>
            )}
          </div>
        ))}

        {activityLog.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <PlayCircle size={32} className="text-muted-foreground mb-3" />
            <div className="text-[13px] text-muted-foreground">No activity yet</div>
            <div className="text-[11px] text-muted-foreground mt-1">
              Start an autopilot run to see activity here
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
