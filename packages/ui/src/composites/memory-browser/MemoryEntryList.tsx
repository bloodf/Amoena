import { Pin, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { memoryTypeConfig, type MemoryEntry } from "./types";

export function MemoryEntryList({
  entries,
  selectedKey,
  onSelect,
}: {
  entries: MemoryEntry[];
  selectedKey: string | null;
  onSelect: (key: string) => void;
}) {
  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Search size={24} className="mb-2 text-muted-foreground" />
        <div className="text-[12px] text-muted-foreground">No memories match filters</div>
      </div>
    );
  }

  return (
    <>
      {entries.map((entry) => (
        <button key={entry.key} onClick={() => onSelect(entry.key)} className={cn("w-full border-b border-border px-3 py-2.5 text-left transition-colors", selectedKey === entry.key ? "bg-primary/5" : "hover:bg-surface-2")}>
          <div className="mb-0.5 flex items-center justify-between">
            <div className="flex min-w-0 items-center gap-1.5">
              {entry.pinned ? <Pin size={9} className="flex-shrink-0 text-primary" /> : null}
              <span className="truncate font-mono text-[12px] font-medium text-foreground">{entry.key}</span>
            </div>
            <span className={cn("flex-shrink-0 rounded px-1.5 py-0.5 font-mono text-[9px]", memoryTypeConfig[entry.type].className)}>{memoryTypeConfig[entry.type].label}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className={cn("rounded px-1 py-0.5 text-[9px]", entry.source === "auto" ? "bg-surface-3 text-muted-foreground" : entry.source === "manual" ? "bg-green/20 text-green" : "bg-primary/20 text-primary")}>
                {entry.source}
              </span>
              <span className="text-[10px] text-muted-foreground">{entry.scope} · {entry.size}</span>
            </div>
            <span className="text-[10px] text-muted-foreground">{entry.timestamp}</span>
          </div>
        </button>
      ))}
    </>
  );
}
