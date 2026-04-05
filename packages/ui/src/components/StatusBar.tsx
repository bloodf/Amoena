import { Circle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

function getSeverityLabel(percent: number): string {
  if (percent > 80) return 'high';
  if (percent > 50) return 'moderate';
  return 'normal';
}

function getProgressColor(percent: number): string {
  if (percent > 80) return 'bg-destructive';
  if (percent > 50) return 'bg-warning';
  return 'bg-primary';
}
import { cn } from '@/lib/utils';
import { contextUsage, type RuntimeLocation } from '@/composites/status-bar/data';
import { RuntimeMenu } from '@/composites/status-bar/RuntimeMenu';
import { RateLimitsMenu } from '@/composites/status-bar/RateLimitsMenu';
import { useState } from 'react';

export function StatusBar() {
  const { t } = useTranslation();
  const [showRateLimits, setShowRateLimits] = useState(false);
  const [runtimeLocation, setRuntimeLocation] = useState<RuntimeLocation>('local');
  const [showRuntimeMenu, setShowRuntimeMenu] = useState(false);

  const contextPercent = Math.round((contextUsage.used / contextUsage.limit) * 100);
  const ContextIcon = contextUsage.icon;
  const contextSeverityLabel = getSeverityLabel(contextPercent);

  return (
    <div
      role="status"
      aria-label={t('ui.applicationStatusBar')}
      className="flex h-7 flex-shrink-0 items-center gap-1 border-t border-border bg-surface-0 px-3 font-mono text-[11px] select-none"
    >
      <RuntimeMenu
        open={showRuntimeMenu}
        runtimeLocation={runtimeLocation}
        onToggle={() => {
          setShowRuntimeMenu((value) => !value);
          setShowRateLimits(false);
        }}
        onClose={() => setShowRuntimeMenu(false)}
        onSelect={(location) => {
          setRuntimeLocation(location);
          setShowRuntimeMenu(false);
        }}
      />

      <div className="h-3.5 w-px bg-border" aria-hidden="true" />

      <div
        className="flex items-center gap-1.5 px-2 py-1 text-muted-foreground"
        aria-label={`Context usage: ${(contextUsage.used / 1000).toFixed(1)}k of ${(contextUsage.limit / 1000).toFixed(0)}k tokens, ${contextSeverityLabel}`}
      >
        <ContextIcon size={11} aria-hidden="true" />
        <span>
          {(contextUsage.used / 1000).toFixed(1)}k / {(contextUsage.limit / 1000).toFixed(0)}k
        </span>
        <div
          className="h-1.5 w-12 overflow-hidden rounded-full bg-surface-3"
          role="progressbar"
          aria-valuenow={contextPercent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Context window usage"
        >
          <div
            className={cn('h-full rounded-full transition-all', getProgressColor(contextPercent))}
            style={{ width: `${contextPercent}%` }}
          />
        </div>
      </div>

      <div className="h-3.5 w-px bg-border" aria-hidden="true" />

      <RateLimitsMenu
        open={showRateLimits}
        onToggle={() => {
          setShowRateLimits((value) => !value);
          setShowRuntimeMenu(false);
        }}
        onClose={() => setShowRateLimits(false)}
      />

      <div className="flex-1" />

      <div
        className="flex items-center gap-1.5 px-2 py-1 text-muted-foreground"
        aria-label={t('ui.agentsConnected', { count: 3 })}
      >
        <Circle size={5} className="fill-green text-green" aria-hidden="true" />
        <span className="text-[10px]">{t('ui.agentsConnected', { count: 3 })}</span>
      </div>

      <div className="h-3.5 w-px bg-border" aria-hidden="true" />

      <div
        className="flex items-center gap-1.5 px-2 py-1 text-muted-foreground"
        aria-label={t('ui.devicesConnected', { count: 1 })}
      >
        <Circle size={5} className="fill-green text-green" aria-hidden="true" />
        <span className="text-[10px]">{t('ui.devicesConnected', { count: 1 })}</span>
      </div>
    </div>
  );
}
