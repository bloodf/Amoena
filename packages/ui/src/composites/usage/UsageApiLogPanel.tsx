import { useMemo } from 'react';
import { Filter } from 'lucide-react';

interface ApiRequestLogItem {
  time: string;
  model: string;
  provider: string;
  inputTokens: number;
  outputTokens: number;
  latency: string;
  cost: number;
  session: string;
}

export function UsageApiLogPanel({
  providerFilter,
  sessionFilter,
  filteredLog,
  sessionOptions,
  providerOptions,
  onProviderFilterChange,
  onSessionFilterChange,
}: {
  providerFilter: string;
  sessionFilter: string;
  filteredLog: ApiRequestLogItem[];
  sessionOptions: string[];
  providerOptions?: string[];
  onProviderFilterChange: (value: string) => void;
  onSessionFilterChange: (value: string) => void;
}) {
  const derivedProviders = useMemo(
    () => providerOptions ?? [...new Set(filteredLog.map((entry) => entry.provider))].sort(),
    [providerOptions, filteredLog],
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <Filter size={12} className="text-muted-foreground" />
          <span className="text-[11px] text-muted-foreground">Filter:</span>
        </div>
        <select
          value={providerFilter}
          onChange={(event) => onProviderFilterChange(event.target.value)}
          className="rounded border border-border bg-surface-2 px-2.5 py-1 text-[11px] text-foreground"
        >
          <option value="all">All providers</option>
          {derivedProviders.map((provider) => (
            <option key={provider} value={provider}>
              {provider}
            </option>
          ))}
        </select>
        <select
          value={sessionFilter}
          onChange={(event) => onSessionFilterChange(event.target.value)}
          className="rounded border border-border bg-surface-2 px-2.5 py-1 text-[11px] text-foreground"
        >
          <option value="all">All sessions</option>
          {sessionOptions.map((session) => (
            <option key={session} value={session}>
              {session}
            </option>
          ))}
        </select>
        <span className="ml-auto font-mono text-[10px] text-muted-foreground">
          {filteredLog.length} requests
        </span>
      </div>

      <div className="overflow-hidden rounded border border-border">
        <div className="grid grid-cols-[70px_130px_90px_80px_80px_60px_60px_1fr] border-b border-border bg-surface-2 px-3 py-2 font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
          <span>Time</span>
          <span>Model</span>
          <span>Provider</span>
          <span>Input</span>
          <span>Output</span>
          <span>Latency</span>
          <span>Cost</span>
          <span>Session</span>
        </div>
        {filteredLog.map((request, index) => (
          <div
            key={`${request.time}-${request.session}-${index}`}
            className={
              index > 0
                ? 'grid grid-cols-[70px_130px_90px_80px_80px_60px_60px_1fr] items-center border-t border-border px-3 py-2 text-[11px] transition-colors hover:bg-surface-2'
                : 'grid grid-cols-[70px_130px_90px_80px_80px_60px_60px_1fr] items-center px-3 py-2 text-[11px] transition-colors hover:bg-surface-2'
            }
          >
            <span className="font-mono text-muted-foreground">{request.time}</span>
            <span className="truncate font-mono text-foreground">{request.model}</span>
            <span className="text-muted-foreground">{request.provider}</span>
            <span className="font-mono text-foreground">
              {(request.inputTokens / 1000).toFixed(1)}k
            </span>
            <span className="font-mono text-foreground">
              {(request.outputTokens / 1000).toFixed(1)}k
            </span>
            <span className="font-mono text-muted-foreground">{request.latency}</span>
            <span className="font-mono text-foreground">${request.cost.toFixed(3)}</span>
            <span className="truncate text-muted-foreground">{request.session}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
