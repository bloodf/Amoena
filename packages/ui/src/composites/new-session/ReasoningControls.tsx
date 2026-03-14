import { cn } from "@/lib/utils";
import type { LabeledOption } from "./types";

interface ReasoningControlsProps {
  mode: string;
  depth: string;
  depths: LabeledOption[];
  onModeChange: (value: string) => void;
  onDepthChange: (value: string) => void;
}

export function ReasoningControls({
  mode,
  depth,
  depths,
  onModeChange,
  onDepthChange,
}: ReasoningControlsProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <select
          value={mode}
          onChange={(event) => onModeChange(event.target.value)}
          className="w-full rounded border border-border bg-surface-2 px-3 py-2 text-[12px] text-foreground"
        >
          <option value="auto">Auto</option>
          <option value="always">Always On</option>
          <option value="off">Off</option>
        </select>
      </div>
      <div>
        <div className="flex gap-1">
          {depths.map((item) => (
            <button
              key={item.id}
              onClick={() => onDepthChange(item.id)}
              className={cn(
                "flex-1 rounded border py-1.5 text-[11px] font-mono transition-colors",
                depth === item.id ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/30",
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
