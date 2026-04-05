import { Circle, Diff, FileCode, GitBranch, Info, RotateCcw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import type { CheckpointRecord } from './types';

export function CheckpointTree({
  checkpoints,
  selectedCheckpoint,
  onSelect,
}: {
  checkpoints: CheckpointRecord[];
  selectedCheckpoint: string;
  onSelect: (id: string) => void;
}) {
  const { t } = useTranslation();
  const renderCheckpoint = (checkpoint: CheckpointRecord, depth = 0): React.ReactNode => {
    const isSelected = selectedCheckpoint === checkpoint.id;

    // Render compaction marker as a horizontal divider
    if (checkpoint.compaction) {
      return (
        <div key={checkpoint.id}>
          <div className={cn('flex items-start gap-3', depth > 0 && 'ml-6')}>
            <div className="flex flex-shrink-0 flex-col items-center pt-1">
              <div className="h-3 w-3 flex-shrink-0 rounded-full border-2 border-dashed border-muted-foreground/40 bg-surface-2" />
              <div className="min-h-[24px] w-px flex-1 bg-border" />
            </div>
            <div className="mb-1 flex-1 py-1.5">
              <div className="flex items-center gap-2">
                <div className="h-px flex-1 bg-border" />
                <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  <Info size={10} className="flex-shrink-0 text-muted-foreground/60" />
                  Context compacted — {checkpoint.compaction.observationCount} observations
                  summarized
                </span>
                <div className="h-px flex-1 bg-border" />
              </div>
            </div>
          </div>
          {checkpoint.children?.map((child) => renderCheckpoint(child, depth + 1))}
        </div>
      );
    }

    return (
      <div key={checkpoint.id}>
        <div className={cn('flex items-start gap-3', depth > 0 && 'ml-6')}>
          <div className="flex flex-shrink-0 flex-col items-center pt-1">
            <div
              className={cn(
                'h-3 w-3 flex-shrink-0 rounded-full border-2 transition-all',
                (() => {
                  if (checkpoint.isCurrent) {
                    return 'border-primary bg-primary shadow-[0_0_8px_hsl(var(--primary)/0.5)]';
                  }
                  if (isSelected) {
                    return 'border-primary/60 bg-primary/30';
                  }
                  if (depth > 0) {
                    return 'border-purple/60 bg-purple/20';
                  }
                  return 'border-border bg-surface-2';
                })(),
              )}
            />
            <div className="min-h-[24px] w-px flex-1 bg-border" />
          </div>

          <button
            onClick={() => onSelect(checkpoint.id)}
            className={cn(
              'mb-1 min-w-0 flex-1 rounded-lg border px-3 py-2 text-left transition-all',
              isSelected
                ? 'border-primary/30 bg-primary/5'
                : 'border-transparent hover:bg-surface-2',
            )}
          >
            <div className="mb-0.5 flex items-center justify-between">
              <div className="flex min-w-0 items-center gap-2">
                {checkpoint.branch ? (
                  <span className="flex flex-shrink-0 items-center gap-1 rounded bg-purple/20 px-1.5 py-0.5 font-mono text-[9px] text-purple">
                    <GitBranch size={8} />
                    {checkpoint.branch}
                  </span>
                ) : null}
                <span
                  className={cn(
                    'truncate text-[12px] font-medium',
                    checkpoint.isCurrent ? 'text-primary' : 'text-foreground',
                  )}
                >
                  {checkpoint.label}
                  {checkpoint.isCurrent ? (
                    <span className="ml-2 inline-flex items-center gap-0.5 text-[9px] text-primary">
                      <Circle size={5} className="fill-primary text-primary" /> current
                    </span>
                  ) : null}
                </span>
              </div>
              <span className="ml-2 flex-shrink-0 font-mono text-[10px] text-muted-foreground">
                {checkpoint.timestamp}
              </span>
            </div>
            <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
              <span className="font-mono">{checkpoint.tokensUsed} tokens</span>
              {checkpoint.filesChanged > 0 ? (
                <span className="flex items-center gap-1">
                  <FileCode size={9} />
                  {checkpoint.filesChanged} files
                </span>
              ) : null}
            </div>
          </button>

          {isSelected && !checkpoint.isCurrent ? (
            <div className="flex flex-shrink-0 items-center gap-1 pt-2">
              <button
                className="rounded p-1.5 text-muted-foreground cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring transition-colors hover:bg-primary/10 hover:text-primary"
                aria-label={t('ui.restoreCheckpoint')}
              >
                <RotateCcw size={12} />
              </button>
              <button
                className="rounded p-1.5 text-muted-foreground cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring transition-colors hover:bg-purple/10 hover:text-purple"
                aria-label={t('ui.forkFromCheckpoint')}
              >
                <GitBranch size={12} />
              </button>
              <button
                className="rounded p-1.5 text-muted-foreground cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring transition-colors hover:bg-surface-2 hover:text-foreground"
                aria-label={t('ui.viewDiff')}
              >
                <Diff size={12} />
              </button>
            </div>
          ) : null}
        </div>
        {checkpoint.children?.map((child) => renderCheckpoint(child, depth + 1))}
      </div>
    );
  };

  return <>{checkpoints.map((checkpoint) => renderCheckpoint(checkpoint))}</>;
}
