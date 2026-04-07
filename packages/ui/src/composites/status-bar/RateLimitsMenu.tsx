import { ChevronDown, Zap } from 'lucide-react';
import { Button } from '../../primitives/button.tsx';
import { cn } from '../../lib/utils.ts';
import { getSeverity, providerRates } from './data';
import { StatusBarDropdown } from './StatusBarDropdown';

export function RateLimitsMenu({
  open,
  onToggle,
  onClose,
}: {
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
}) {
  const totalUsed = providerRates.reduce((sum, provider) => sum + provider.used, 0);
  const totalLimit = providerRates.reduce((sum, provider) => sum + provider.limit, 0);
  const totalPercent = Math.round((totalUsed / totalLimit) * 100);
  const totalSeverity = getSeverity(totalPercent);

  return (
    <div className="relative">
      <Button
        onClick={onToggle}
        variant="ghost"
        size="sm"
        className="h-6 gap-2 px-2 py-1 text-muted-foreground hover:text-foreground"
      >
        <Zap size={11} className="text-primary" />
        <div className="flex items-center gap-1.5">
          {providerRates.map((provider) => {
            const percent = (provider.used / provider.limit) * 100;
            const severity = getSeverity(percent);
            return (
              <div key={provider.name} className="flex items-center gap-1">
                <div
                  className="h-[3px] w-[3px] rounded-full"
                  style={{ backgroundColor: `hsl(${provider.color})` }}
                />
                <span className={severity.className}>{Math.round(100 - percent)}%</span>
              </div>
            );
          })}
        </div>
        <ChevronDown size={9} />
      </Button>

      <StatusBarDropdown open={open} onClose={onClose} className="bottom-full left-0 mb-1 w-80">
        <div className="flex items-center justify-between border-b border-border px-3 py-2">
          <span className="text-[11px] font-medium text-foreground">Rate Limits by Provider</span>
          <span className={cn('font-mono text-[10px]', totalSeverity.className)}>
            {totalPercent}% used · {totalSeverity.label}
          </span>
        </div>
        {providerRates.map((provider) => {
          const percent = (provider.used / provider.limit) * 100;
          const remaining = provider.limit - provider.used;
          const severity = getSeverity(percent);
          return (
            <div key={provider.name} className="border-b border-border px-3 py-2.5 last:border-b-0">
              <div className="mb-1 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all',
                      (() => {
                        if (percent > 80) return 'bg-destructive';
                        if (percent > 50) return 'bg-warning';
                        return '';
                      })(),
                    )}
                    style={{
                      width: `${percent}%`,
                      backgroundColor: percent <= 50 ? `hsl(${provider.color})` : undefined,
                    }}
                  />
                  <span className="text-[12px] font-medium text-foreground">{provider.name}</span>
                  <span
                    className={cn(
                      'rounded px-1.5 py-0.5 text-[9px]',
                      severity.className,
                      (() => {
                        if (percent > 80) return 'bg-destructive/10';
                        if (percent > 50) return 'bg-warning/10';
                        return 'bg-green/10';
                      })(),
                    )}
                  >
                    {severity.label}
                  </span>
                </div>
                <span className="text-[10px] text-muted-foreground">
                  resets in {provider.resetsIn}
                </span>
              </div>
              <div className="mb-1.5 flex items-center gap-2">
                <span className="text-[11px] text-muted-foreground">{provider.model}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-3">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all',
                      (() => {
                        if (percent > 80) return 'bg-destructive';
                        if (percent > 50) return 'bg-warning';
                        return '';
                      })(),
                    )}
                    style={{
                      width: `${percent}%`,
                      backgroundColor: percent <= 50 ? `hsl(${provider.color})` : undefined,
                    }}
                  />
                </div>
                <span className="w-24 text-right text-[10px] text-muted-foreground">
                  {remaining} remaining
                </span>
              </div>
              <div className="mt-1 flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground">{provider.used} used</span>
                <span className="text-[10px] text-muted-foreground">{provider.limit} limit</span>
              </div>
            </div>
          );
        })}
      </StatusBarDropdown>
    </div>
  );
}
