export function UsageStackedTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-surface-1 px-3 py-2 text-[11px] shadow-xl">
      <div className="mb-1 font-medium text-foreground">{label}</div>
      {payload.map((point: any) => (
        <div key={point.dataKey} className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full" style={{ backgroundColor: point.color }} />
          <span className="text-muted-foreground">{point.dataKey}:</span>
          <span className="font-mono text-foreground">{typeof point.value === "number" && point.value > 100 ? `${(point.value / 1000).toFixed(1)}k` : point.value}</span>
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
