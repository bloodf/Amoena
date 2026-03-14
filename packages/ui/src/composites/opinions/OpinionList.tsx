import { Check, Pencil, Plus, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/primitives/button";
import { Input } from "@/primitives/input";
import type { Opinion } from "./data";
import { OpinionAddForm } from "./OpinionAddForm";

export function OpinionList({
  opinions,
  categoryIndex,
  editingOpinion,
  editValue,
  adding,
  selectedCategory,
  newTitle,
  newDescription,
  newValue,
  onStartEdit,
  onEditValueChange,
  onSaveEdit,
  onCancelEdit,
  onDelete,
  onStartAdd,
  onNewTitleChange,
  onNewDescriptionChange,
  onNewValueChange,
  onAdd,
  onCancelAdd,
}: {
  opinions: Opinion[];
  categoryIndex: number;
  editingOpinion: { catIndex: number; opIndex: number } | null;
  editValue: string;
  adding: boolean;
  selectedCategory: number;
  newTitle: string;
  newDescription: string;
  newValue: string;
  onStartEdit: (catIndex: number, opIndex: number) => void;
  onEditValueChange: (value: string) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onDelete: (catIndex: number, opIndex: number) => void;
  onStartAdd: () => void;
  onNewTitleChange: (value: string) => void;
  onNewDescriptionChange: (value: string) => void;
  onNewValueChange: (value: string) => void;
  onAdd: () => void;
  onCancelAdd: () => void;
}) {
  return (
    <div className="space-y-2">
      {opinions.map((opinion, opinionIndex) => {
        const isEditing = editingOpinion?.catIndex === selectedCategory && editingOpinion?.opIndex === opinionIndex;
        return (
          <div key={opinion.title} className="group flex items-start justify-between rounded border border-border px-4 py-3 transition-colors hover:border-primary/30">
            <div className="mr-4 min-w-0 flex-1">
              <div className="text-[13px] font-medium text-foreground">{opinion.title}</div>
              <div className="mt-0.5 text-[11px] text-muted-foreground">{opinion.desc}</div>
              {isEditing ? (
                <div className="mt-2 flex items-center gap-2">
                  <Input
                    value={editValue}
                    onChange={(event) => onEditValueChange(event.target.value)}
                    className="flex-1 border-primary font-mono text-[12px]"
                    autoFocus
                    onKeyDown={(event) => {
                      if (event.key === "Enter") onSaveEdit();
                      if (event.key === "Escape") onCancelEdit();
                    }}
                  />
                  <Button onClick={onSaveEdit} variant="ghost" size="icon" className="h-7 w-7 text-success hover:bg-success/10">
                    <Check size={13} />
                  </Button>
                  <Button onClick={onCancelEdit} variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:bg-surface-2">
                    <X size={13} />
                  </Button>
                </div>
              ) : null}
            </div>
            <div className="flex flex-shrink-0 items-center gap-2">
              {!isEditing ? (
                <span className="max-w-[260px] truncate rounded bg-surface-2 px-2.5 py-1 font-mono text-[12px] text-foreground">{opinion.value}</span>
              ) : null}
              <span className={cn("rounded px-1.5 py-0.5 text-[9px]", opinion.scope === "global" ? "bg-primary/10 text-primary" : "bg-surface-3 text-muted-foreground")}>
                {opinion.scope}
              </span>
              <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                <Button onClick={() => onStartEdit(categoryIndex, opinionIndex)} variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground">
                  <Pencil size={11} />
                </Button>
                <Button onClick={() => onDelete(categoryIndex, opinionIndex)} variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive">
                  <Trash2 size={11} />
                </Button>
              </div>
            </div>
          </div>
        );
      })}

      {adding ? (
        <OpinionAddForm
          title={newTitle}
          description={newDescription}
          value={newValue}
          onTitleChange={onNewTitleChange}
          onDescriptionChange={onNewDescriptionChange}
          onValueChange={onNewValueChange}
          onAdd={onAdd}
          onCancel={onCancelAdd}
        />
      ) : (
        <Button onClick={onStartAdd} variant="outline" size="sm" className="gap-1.5 text-[12px] text-primary border-primary/30 hover:bg-primary/10">
          <Plus size={12} /> Add Opinion
        </Button>
      )}
    </div>
  );
}
