import { Plus } from "lucide-react";
import { Button } from "@/primitives/button";
import { Input } from "@/primitives/input";

export function OpinionAddForm({
  title,
  description,
  value,
  onTitleChange,
  onDescriptionChange,
  onValueChange,
  onAdd,
  onCancel,
}: {
  title: string;
  description: string;
  value: string;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onValueChange: (value: string) => void;
  onAdd: () => void;
  onCancel: () => void;
}) {
  const canAdd = title.trim() && value.trim();
  return (
    <div className="space-y-3 rounded border border-primary/30 bg-primary/5 p-4">
      <Input value={title} onChange={(event) => onTitleChange(event.target.value)} placeholder="Opinion title..." className="text-[13px]" autoFocus />
      <Input value={description} onChange={(event) => onDescriptionChange(event.target.value)} placeholder="Description (optional)..." className="text-[12px]" />
      <Input value={value} onChange={(event) => onValueChange(event.target.value)} placeholder="Value / preference..." className="font-mono text-[13px]" />
      <div className="flex items-center gap-2">
        <Button onClick={onAdd} size="sm" className="gap-1 text-[12px]" disabled={!canAdd}>
          <Plus size={12} /> Add
        </Button>
        <Button onClick={onCancel} variant="ghost" size="sm" className="text-[12px] text-muted-foreground">
          Cancel
        </Button>
      </div>
    </div>
  );
}
