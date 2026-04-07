import { AlertTriangle, RefreshCw } from 'lucide-react';
import { cn } from '../../lib/utils.ts';

// --- Loading Skeletons ---

export function SkeletonLine({
  width = 'w-full',
  className,
}: {
  width?: string;
  className?: string;
}) {
  return <div className={cn('h-3 rounded bg-surface-3 animate-pulse', width, className)} />;
}

export function SkeletonBlock({ lines = 4, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn('space-y-2.5 p-4', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonLine
          key={i}
          width={(() => {
            if (i === 0) return 'w-1/3';
            if (i === lines - 1) return 'w-2/3';
            return 'w-full';
          })()}
        />
      ))}
    </div>
  );
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn('border border-border rounded p-3 space-y-2', className)}>
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded bg-surface-3 animate-pulse flex-shrink-0" />
        <div className="flex-1 space-y-1.5">
          <SkeletonLine width="w-1/2" />
          <SkeletonLine width="w-1/3" className="h-2" />
        </div>
      </div>
      <SkeletonLine width="w-full" />
      <SkeletonLine width="w-3/4" />
    </div>
  );
}

export function SkeletonTable({
  rows = 5,
  cols = 4,
  className,
}: {
  rows?: number;
  cols?: number;
  className?: string;
}) {
  return (
    <div className={cn('border border-border rounded overflow-hidden', className)}>
      <div className="flex gap-4 px-3 py-2 bg-surface-2 border-b border-border">
        {Array.from({ length: cols }).map((_, i) => (
          <SkeletonLine key={i} width={i === 0 ? 'w-32' : 'w-16'} className="h-2" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex gap-4 px-3 py-2.5 border-b border-border last:border-0">
          {Array.from({ length: cols }).map((_, c) => (
            <SkeletonLine key={c} width={c === 0 ? 'w-32' : 'w-16'} className="h-2.5" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function SkeletonList({ items = 5, className }: { items?: number; className?: string }) {
  return (
    <div className={cn('space-y-1', className)}>
      {Array.from({ length: items }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-3 px-3 py-2.5 border-b border-border last:border-0"
        >
          <div className="w-2.5 h-2.5 rounded-full bg-surface-3 animate-pulse flex-shrink-0" />
          <SkeletonLine width={i % 2 === 0 ? 'w-2/3' : 'w-1/2'} />
          <SkeletonLine width="w-12" className="ml-auto h-2" />
        </div>
      ))}
    </div>
  );
}

// --- Empty States ---

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  onAction,
}: {
  icon: React.ElementType;
  title: string;
  description?: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="w-12 h-12 rounded-lg bg-surface-2 border border-border flex items-center justify-center mb-3">
        <Icon size={20} className="text-muted-foreground" />
      </div>
      <div className="text-[13px] font-medium text-foreground mb-1">{title}</div>
      {description && (
        <div className="text-[11px] text-muted-foreground max-w-[280px]">{description}</div>
      )}
      {action && onAction && (
        <button
          onClick={onAction}
          className="mt-3 flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium text-primary border border-primary/30 rounded hover:bg-primary/10 transition-colors"
        >
          {action}
        </button>
      )}
    </div>
  );
}

// --- Error States ---

export function ErrorState({
  title = 'Something went wrong',
  description,
  onRetry,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="w-12 h-12 rounded-lg bg-destructive/10 border border-destructive/20 flex items-center justify-center mb-3">
        <AlertTriangle size={20} className="text-destructive" />
      </div>
      <div className="text-[13px] font-medium text-foreground mb-1">{title}</div>
      {description && (
        <div className="text-[11px] text-muted-foreground max-w-[280px] mb-3">{description}</div>
      )}
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium text-foreground border border-border rounded hover:bg-surface-2 transition-colors"
        >
          <RefreshCw size={11} /> Retry
        </button>
      )}
    </div>
  );
}

// --- Degraded State ---

export function DegradedBanner({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-warning/5 border-b border-warning/20">
      <AlertTriangle size={12} className="text-warning flex-shrink-0" />
      <span className="text-[11px] text-muted-foreground">{message}</span>
    </div>
  );
}
