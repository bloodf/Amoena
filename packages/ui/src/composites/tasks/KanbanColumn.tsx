import { cn } from "@/lib/utils";
import type { KanbanColumnData } from "./types";
import { KanbanTaskCard } from "./KanbanTaskCard";

export function KanbanColumn({
  column,
  dropTarget,
  draggedTaskId,
  onDragOver,
  onDragLeave,
  onDrop,
  onTaskDragStart,
}: {
  column: KanbanColumnData;
  dropTarget: string | null;
  draggedTaskId: string | null;
  onDragOver: (event: React.DragEvent, columnId: string) => void;
  onDragLeave: () => void;
  onDrop: (event: React.DragEvent, columnId: string) => void;
  onTaskDragStart: (taskId: string, fromColumnId: string) => void;
}) {
  const Icon = column.icon;

  return (
    <div
      className={cn(
        "flex flex-col w-[280px] rounded-lg border border-border bg-surface-0 flex-shrink-0 transition-colors",
        dropTarget === column.id && "border-primary/50 bg-primary/5",
      )}
      onDragOver={(event) => onDragOver(event, column.id)}
      onDragLeave={onDragLeave}
      onDrop={(event) => onDrop(event, column.id)}
    >
      <div className="flex items-center gap-2 px-3 py-2.5 border-b border-border">
        <Icon size={14} className={column.color} />
        <span className="text-[12px] font-semibold text-foreground">{column.title}</span>
        <span className="text-[10px] font-mono text-muted-foreground bg-surface-2 px-1.5 py-0.5 rounded">{column.tasks.length}</span>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {column.tasks.map((task) => (
          <KanbanTaskCard
            key={task.id}
            task={task}
            isDragging={draggedTaskId === task.id}
            onDragStart={() => onTaskDragStart(task.id, column.id)}
          />
        ))}
      </div>
    </div>
  );
}
