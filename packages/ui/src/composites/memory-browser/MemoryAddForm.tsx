import { Plus } from "lucide-react";
import { Button } from '../../primitives/button.tsx';
import { Input } from '../../primitives/input.tsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../primitives/select.tsx';
import { Textarea } from '../../primitives/textarea.tsx';
import type { MemoryType } from "./types";

export function MemoryAddForm({
  keyValue,
  value,
  type,
  onKeyChange,
  onValueChange,
  onTypeChange,
  onAdd,
  onCancel,
}: {
  keyValue: string;
  value: string;
  type: MemoryType;
  onKeyChange: (value: string) => void;
  onValueChange: (value: string) => void;
  onTypeChange: (value: MemoryType) => void;
  onAdd: () => void;
  onCancel: () => void;
}) {
  const canAdd = keyValue.trim() && value.trim();

  return (
    <div className="space-y-2 border-b border-border bg-primary/5 p-3">
      <div className="flex items-center gap-2">
        <Input value={keyValue} onChange={(event) => onKeyChange(event.target.value)} placeholder="memory.key" className="flex-1 font-mono text-[12px]" />
        <Select value={type} onValueChange={(next) => onTypeChange(next as MemoryType)}>
          <SelectTrigger className="w-[160px] bg-surface-2 text-[11px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="manual">Manual</SelectItem>
            <SelectItem value="summary">Summary</SelectItem>
            <SelectItem value="code_pattern">Code Pattern</SelectItem>
            <SelectItem value="architecture">Architecture</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Textarea value={value} onChange={(event) => onValueChange(event.target.value)} placeholder="Memory content..." className="h-16 resize-none text-[12px]" />
      <div className="flex items-center gap-2">
        <Button onClick={onAdd} size="sm" className="h-7 gap-1 text-[11px]" disabled={!canAdd}>
          <Plus size={11} /> Add
        </Button>
        <Button onClick={onCancel} variant="ghost" size="sm" className="h-7 text-[11px] text-muted-foreground">
          Cancel
        </Button>
      </div>
    </div>
  );
}
