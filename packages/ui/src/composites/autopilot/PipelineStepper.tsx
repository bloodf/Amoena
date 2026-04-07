import { Check } from 'lucide-react';

import type { AutopilotPipelinePhase } from './types';

const phases: Array<{ id: AutopilotPipelinePhase; label: string }> = [
  { id: 'goal_analysis', label: 'Goal' },
  { id: 'story_decomposition', label: 'Stories' },
  { id: 'agent_assignment', label: 'Agents' },
  { id: 'execution', label: 'Execute' },
  { id: 'verification', label: 'Verify' },
  { id: 'report', label: 'Report' },
];

export function PipelineStepper({ currentPhase }: { currentPhase: AutopilotPipelinePhase }) {
  const activeIndex = phases.findIndex((phase) => phase.id === currentPhase);

  return (
    <div className="flex items-center gap-2 overflow-x-auto">
      {phases.map((phase, index) => {
        const isDone = index < activeIndex;
        const isActive = index === activeIndex;
        return (
          <div key={phase.id} className="flex items-center gap-2">
            <div
              className={`flex h-7 min-w-7 items-center justify-center rounded-full border px-2 text-[10px] font-medium ${(() => {
                if (isDone) return 'border-green-500 bg-green-500/10 text-green-500';
                if (isActive) return 'border-primary bg-primary/10 text-primary';
                return 'border-border bg-surface-2 text-muted-foreground';
              })()}`}
            >
              {isDone ? <Check size={12} /> : phase.label}
            </div>
            {index < phases.length - 1 ? (
              <div className={`h-px w-6 ${index < activeIndex ? 'bg-green-500' : 'bg-border'}`} />
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
