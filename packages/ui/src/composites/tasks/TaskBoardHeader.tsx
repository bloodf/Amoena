import { Plus } from "lucide-react";

export function TaskBoardHeader() {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-border flex-shrink-0">
      <h2 className="text-sm font-semibold text-foreground">Task Board</h2>
      <button className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-medium border border-primary text-primary rounded cursor-pointer hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring transition-colors">
        <Plus size={12} />
        New Task
      </button>
    </div>
  );
}
