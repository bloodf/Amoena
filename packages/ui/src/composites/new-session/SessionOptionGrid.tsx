import { cn } from "@/lib/utils";
import type { SessionOptionCard } from "./types";

interface SessionOptionGridProps<T extends string> {
  options: SessionOptionCard<T>[];
  selected: T;
  columns?: string;
  onSelect: (value: T) => void;
}

export function SessionOptionGrid<T extends string>({
  options,
  selected,
  columns = "grid-cols-3",
  onSelect,
}: SessionOptionGridProps<T>) {
  return (
    <div className={cn("grid gap-2", columns)}>
      {options.map((option) => (
        <button
          key={option.id}
          onClick={() => onSelect(option.id)}
          className={cn(
            "flex flex-col items-center gap-1.5 rounded border p-3 text-center transition-colors",
            selected === option.id
              ? "border-primary bg-primary/5 text-foreground"
              : "border-border text-muted-foreground hover:border-primary/30",
          )}
        >
          <option.icon size={18} />
          <span className="text-[12px] font-medium">{option.label}</span>
          <span className="text-[10px] text-muted-foreground">{option.desc}</span>
        </button>
      ))}
    </div>
  );
}
