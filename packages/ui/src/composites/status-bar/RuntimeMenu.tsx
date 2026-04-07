import { Check, ChevronDown } from 'lucide-react';
import { Button } from '../../primitives/button.tsx';
import { runtimeConfig, type RuntimeLocation } from './data';
import { StatusBarDropdown } from './StatusBarDropdown';

export function RuntimeMenu({
  open,
  runtimeLocation,
  onToggle,
  onClose,
  onSelect,
}: {
  open: boolean;
  runtimeLocation: RuntimeLocation;
  onToggle: () => void;
  onClose: () => void;
  onSelect: (location: RuntimeLocation) => void;
}) {
  const RuntimeIcon = runtimeConfig[runtimeLocation].icon;
  return (
    <div className="relative">
      <Button
        onClick={onToggle}
        variant="ghost"
        size="sm"
        className="h-6 gap-1.5 px-2 py-1 font-mono text-[11px] text-muted-foreground"
      >
        <RuntimeIcon size={11} className={runtimeConfig[runtimeLocation].className} />
        <span className={runtimeConfig[runtimeLocation].className}>
          {runtimeConfig[runtimeLocation].label}
        </span>
        <ChevronDown size={8} />
      </Button>
      <StatusBarDropdown open={open} onClose={onClose} className="bottom-full left-0 mb-1 w-44">
        <div className="border-b border-border px-3 py-1.5">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Runtime
          </span>
        </div>
        {(
          Object.entries(runtimeConfig) as [
            RuntimeLocation,
            (typeof runtimeConfig)[RuntimeLocation],
          ][]
        ).map(([key, config]) => {
          const Icon = config.icon;
          return (
            <button
              key={key}
              role="option"
              aria-selected={runtimeLocation === key}
              onClick={() => onSelect(key)}
              className={`flex w-full items-center gap-2 px-3 py-2 text-left transition-colors hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset min-h-[44px] ${runtimeLocation === key ? 'bg-surface-2' : ''}`}
            >
              <Icon size={12} className={config.className} aria-hidden="true" />
              <span className={`text-[12px] ${config.className}`}>{config.label}</span>
              {runtimeLocation === key ? (
                <Check size={13} className="ml-auto text-primary" aria-hidden="true" />
              ) : null}
            </button>
          );
        })}
      </StatusBarDropdown>
    </div>
  );
}
