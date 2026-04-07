import { Zap } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../primitives/select.tsx';
import type { ProviderModel } from "./types";

export function ProviderModelRow({
  model,
  onReasoningModeChange,
}: {
  model: ProviderModel;
  onReasoningModeChange: (modelName: string, mode: string) => void;
}) {
  return (
    <div className="flex items-center rounded border border-border bg-surface-1 px-3 py-2">
      <span className="flex-1 text-[12px] text-foreground">{model.name}</span>
      <span className="mx-3 font-mono text-[10px] text-muted-foreground">{model.ctx}</span>
      <span className="mx-3 text-[10px] text-muted-foreground">{model.tier}</span>
      {model.reasoning ? (
        <div className="ml-3 flex items-center gap-2">
          <span className="flex items-center gap-1 rounded bg-primary/10 px-1.5 py-0.5 font-mono text-[9px] text-primary">
            <Zap size={8} /> REASONING
          </span>
          <Select value={model.reasoningMode} onValueChange={(value) => onReasoningModeChange(model.name, value)}>
            <SelectTrigger className="h-6 w-[90px] bg-surface-2 px-1.5 py-0.5 text-[10px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="auto">auto</SelectItem>
              <SelectItem value="on">on</SelectItem>
              <SelectItem value="off">off</SelectItem>
            </SelectContent>
          </Select>
        </div>
      ) : null}
    </div>
  );
}
