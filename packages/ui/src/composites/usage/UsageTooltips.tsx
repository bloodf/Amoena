export function UsageSeriesTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-lg border border-border bg-surface-1 px-3 py-2 text-[11px] shadow-xl">
      <div className="mb-1 font-medium text-foreground">{label}</div>
      {payload.map((entry: any) => (
        <div key={entry.dataKey} className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-muted-foreground">{entry.dataKey}:</span>
          <span className="font-mono text-foreground">
            {typeof entry.value === "number" && entry.value > 100 ? `${(entry.value / 1000).toFixed(1)}k` : entry.value}
          </span>
        </div>
      ))}
    </div>
  );
}

export function UsageCostTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-lg border border-border bg-surface-1 px-3 py-2 text-[11px] shadow-xl">
      <div className="mb-1 font-medium text-foreground">{label}</div>
      <div className="font-mono text-foreground">${payload[0].value.toFixed(2)}</div>
    </div>
  );
}
