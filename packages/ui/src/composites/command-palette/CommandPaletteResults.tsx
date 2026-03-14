import { commandPaletteTypeLabels, type CommandPaletteItem } from "./data";
import { cn } from "@/lib/utils";

export function CommandPaletteResults({
  groups,
  selectedIndex,
  onHover,
  onSelect,
}: {
  groups: Record<string, CommandPaletteItem[]>;
  selectedIndex: number;
  onHover: (index: number) => void;
  onSelect: (item: CommandPaletteItem) => void;
}) {
  let flatIndex = -1;
  return (
    <div className="max-h-[340px] overflow-y-auto py-1">
      {Object.entries(groups).map(([type, items]) => (
        <div key={type}>
          <div className="px-3 pb-1 pt-2">
            <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70">{commandPaletteTypeLabels[type as keyof typeof commandPaletteTypeLabels] || type}</span>
          </div>
          {items.map((item) => {
            flatIndex++;
            const index = flatIndex;
            return (
              <button
                key={`${type}-${item.label}`}
                onClick={() => onSelect(item)}
                onMouseEnter={() => onHover(index)}
                className={cn("flex w-full items-center gap-2.5 px-3 py-1.5 transition-colors duration-100", selectedIndex === index ? "bg-accent/50" : "hover:bg-accent/30")}
              >
                <item.icon size={14} className="flex-shrink-0 text-muted-foreground" />
                <div className="min-w-0 flex-1 text-left">
                  <span className="block truncate text-[12.5px] text-foreground">{item.label}</span>
                  {item.description ? <span className="block truncate text-[11px] text-muted-foreground">{item.description}</span> : null}
                </div>
                {item.shortcut ? <kbd className="flex-shrink-0 font-mono text-[10px] text-muted-foreground/60">{item.shortcut}</kbd> : null}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
