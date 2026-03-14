import { Minus, Square, X } from "lucide-react";

export function TitleBar() {
  return (
    <div className="flex h-9 items-center border-b border-border bg-surface-0 select-none flex-shrink-0" style={{ WebkitAppRegion: 'drag' } as any}>
      <div className="flex items-center gap-2 px-3 flex-1">
        <span className="text-[13px] font-medium text-foreground">lunaria-frontend</span>
        <span className="text-[13px] text-muted-foreground">on</span>
        <span className="text-[13px] font-mono text-muted-foreground">feature/redesign</span>
      </div>
      <div className="flex items-center" style={{ WebkitAppRegion: 'no-drag' } as any}>
        <button className="flex h-9 w-11 items-center justify-center text-muted-foreground hover:bg-surface-2 transition-colors">
          <Minus size={14} />
        </button>
        <button className="flex h-9 w-11 items-center justify-center text-muted-foreground hover:bg-surface-2 transition-colors">
          <Square size={12} />
        </button>
        <button className="flex h-9 w-11 items-center justify-center text-muted-foreground hover:bg-destructive hover:text-destructive-foreground transition-colors">
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
