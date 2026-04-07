import { Minus, TrendingDown, TrendingUp } from 'lucide-react';
import { cn } from '../lib/utils.ts';

export interface EvalScoreDimension {
  name: string;
  score: number;
}

export interface EvalScoreCardProps {
  /** Overall evaluation score from 0 to 100. */
  score: number;
  /** Previous score used to derive the trend arrow. */
  previousScore?: number;
  /** Human-readable label for this evaluation metric. */
  label: string;
  /** Optional per-dimension breakdown rendered below the headline score. */
  dimensions?: EvalScoreDimension[];
}

function scoreColor(score: number): string {
  if (score >= 80) return 'text-green-400';
  if (score >= 50) return 'text-amber-400';
  return 'text-red-400';
}

function dimensionBarColor(score: number): string {
  if (score >= 80) return 'bg-green-500';
  if (score >= 50) return 'bg-amber-400';
  return 'bg-red-500';
}

/**
 * Card that displays an agent evaluation score with a trend indicator
 * and an optional dimension-level breakdown.
 */
export function EvalScoreCard({ score, previousScore, label, dimensions }: EvalScoreCardProps) {
  const delta = previousScore !== undefined ? score - previousScore : undefined;
  const absDelta = delta !== undefined ? Math.abs(delta) : undefined;

  let TrendIcon = Minus;
  if (delta !== undefined && absDelta !== undefined) {
    if (absDelta >= 1) {
      TrendIcon = delta > 0 ? TrendingUp : TrendingDown;
    }
  }

  let trendColor = 'text-zinc-400';
  if (delta !== undefined && absDelta !== undefined) {
    if (absDelta >= 1) {
      trendColor = delta > 0 ? 'text-green-400' : 'text-red-400';
    }
  }

  return (
    <div className="rounded-lg border border-border bg-surface-1 p-4 flex flex-col gap-3">
      {/* Headline */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-[11px] text-muted-foreground uppercase tracking-wide mb-1">{label}</p>
          <span className={cn('text-4xl font-bold tabular-nums', scoreColor(score))}>
            {score.toFixed(0)}
          </span>
          <span className="text-[13px] text-muted-foreground ml-1">/100</span>
        </div>
        <div className={cn('flex items-center gap-1 mt-1', trendColor)}>
          <TrendIcon size={16} />
          {delta !== undefined && Math.abs(delta) >= 1 && (
            <span className="text-[12px] font-medium">
              {delta > 0 ? '+' : ''}
              {delta.toFixed(0)}
            </span>
          )}
        </div>
      </div>

      {/* Dimension breakdown */}
      {dimensions && dimensions.length > 0 && (
        <div className="flex flex-col gap-1.5">
          {dimensions.map((dim) => (
            <div key={dim.name} className="flex items-center gap-2">
              <span className="text-[11px] text-muted-foreground w-24 truncate flex-shrink-0">
                {dim.name}
              </span>
              <div className="flex-1 h-1.5 rounded-full bg-surface-3 overflow-hidden">
                <div
                  className={cn('h-full rounded-full transition-all', dimensionBarColor(dim.score))}
                  style={{ width: `${Math.min(100, Math.max(0, dim.score))}%` }}
                />
              </div>
              <span className="text-[11px] tabular-nums text-muted-foreground w-7 text-right">
                {dim.score.toFixed(0)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
