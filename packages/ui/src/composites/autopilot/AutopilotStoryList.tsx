import { cn } from '../../lib/utils.ts';
import type { AutopilotStoryStep } from './types';

export function AutopilotStoryList({ steps }: { steps: AutopilotStoryStep[] }) {
  return (
    <div className="p-4 border-b border-border flex-1">
      <h3 className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-2">
        Story Breakdown
      </h3>
      <div className="space-y-1">
        {steps.map((step, index) => (
          <div
            key={`${step.label}-${index}`}
            className="flex items-center gap-2 py-1.5 px-2 rounded hover:bg-surface-2 transition-colors"
          >
            <div
              className={cn(
                'w-2 h-2 rounded-full flex-shrink-0',
                step.status === 'done' && 'bg-green',
                step.status === 'in_progress' && 'bg-primary animate-pulse',
                step.status === 'pending' && 'bg-surface-3',
                step.status === 'blocked' && 'bg-destructive',
              )}
            />
            <span
              className={cn(
                'text-[12px] flex-1',
                (() => {
                  if (step.status === 'done') return 'text-muted-foreground line-through';
                  if (step.status === 'in_progress') return 'text-foreground font-medium';
                  return 'text-muted-foreground';
                })(),
              )}
            >
              {step.label}
            </span>
            <span className="text-[10px] font-mono text-muted-foreground">{step.tokens}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
