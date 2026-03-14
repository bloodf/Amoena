export function MemoryGraphLegend({ sourceColors }: { sourceColors: Record<string, string> }) {
  return (
    <div className="absolute bottom-3 left-3 flex items-center gap-4 rounded border border-border bg-surface-0/80 px-3 py-1.5 backdrop-blur-sm">
      {Object.entries(sourceColors).map(([source, color]) => (
        <div key={source} className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
          <span className="capitalize text-[10px] text-muted-foreground">{source}</span>
        </div>
      ))}
    </div>
  );
}
