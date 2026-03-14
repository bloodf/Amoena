import { useState } from "react";
import { Circle, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { KanbanColumn } from "@/composites/tasks/KanbanColumn";
import type { KanbanColumnData } from "@/composites/tasks/types";
import { TaskBoardHeader } from "@/composites/tasks/TaskBoardHeader";

const initialColumns: KanbanColumnData[] = [
  {
    id: "backlog",
    title: "Backlog",
    icon: Circle,
    color: "text-muted-foreground",
    tasks: [
      { id: "t1", title: "Add WebSocket reconnection logic", description: "Handle connection drops gracefully", priority: "medium", createdAt: "2h ago" },
      { id: "t2", title: "Optimize database queries", description: "N+1 queries in user feed", agent: "Code Reviewer", agentColor: "tui-opencode", priority: "high", createdAt: "4h ago" },
    ],
  },
  {
    id: "todo",
    title: "To Do",
    icon: AlertCircle,
    color: "text-warning",
    tasks: [
      { id: "t3", title: "Implement rate limiting middleware", agent: "Claude 4 Sonnet", agentColor: "tui-claude", priority: "critical", tokens: "~8k", createdAt: "1h ago" },
      { id: "t4", title: "Write migration for roles table", priority: "medium", createdAt: "30m ago" },
    ],
  },
  {
    id: "in-progress",
    title: "In Progress",
    icon: Clock,
    color: "text-primary",
    tasks: [
      { id: "t5", title: "JWT auth module refactor", description: "Moving to refresh token rotation", agent: "Claude 4 Sonnet", agentColor: "tui-claude", priority: "high", tokens: "12.4k", createdAt: "15m ago" },
    ],
  },
  {
    id: "review",
    title: "Review",
    icon: AlertCircle,
    color: "text-purple",
    tasks: [
      { id: "t6", title: "API versioning headers", agent: "Code Reviewer", agentColor: "tui-opencode", priority: "low", tokens: "3.2k", createdAt: "45m ago" },
    ],
  },
  {
    id: "done",
    title: "Done",
    icon: CheckCircle2,
    color: "text-green",
    tasks: [
      { id: "t7", title: "Setup error handling middleware", agent: "Claude 4 Sonnet", agentColor: "tui-claude", priority: "medium", tokens: "5.1k", createdAt: "2h ago" },
      { id: "t8", title: "Configure logging pipeline", agent: "Docs Generator", agentColor: "tui-gemini", priority: "low", tokens: "2.8k", createdAt: "3h ago" },
    ],
  },
];

export function KanbanBoard() {
  const [columns, setColumns] = useState(initialColumns);
  const [draggedTask, setDraggedTask] = useState<{ taskId: string; fromCol: string } | null>(null);
  const [dropTarget, setDropTarget] = useState<string | null>(null);

  const handleDragStart = (taskId: string, fromCol: string) => {
    setDraggedTask({ taskId, fromCol });
  };

  const handleDragOver = (e: React.DragEvent, colId: string) => {
    e.preventDefault();
    setDropTarget(colId);
  };

  const handleDrop = (e: React.DragEvent, toCol: string) => {
    e.preventDefault();
    if (!draggedTask || draggedTask.fromCol === toCol) {
      setDraggedTask(null);
      setDropTarget(null);
      return;
    }

    setColumns(prev => {
      const next = prev.map(col => ({ ...col, tasks: [...col.tasks] }));
      const fromColIdx = next.findIndex(c => c.id === draggedTask.fromCol);
      const toColIdx = next.findIndex(c => c.id === toCol);
      const taskIdx = next[fromColIdx].tasks.findIndex(t => t.id === draggedTask.taskId);
      const [task] = next[fromColIdx].tasks.splice(taskIdx, 1);
      next[toColIdx].tasks.push(task);
      return next;
    });
    setDraggedTask(null);
    setDropTarget(null);
  };

  return (
    <div className="h-full flex flex-col">
      <TaskBoardHeader />
      <div className="flex-1 overflow-x-auto overflow-y-hidden">
        <div className="flex gap-4 p-4 h-full min-w-max">
          {columns.map((col) => {
            return (
              <KanbanColumn
                key={col.id}
                column={col}
                dropTarget={dropTarget}
                draggedTaskId={draggedTask?.taskId ?? null}
                onDragOver={handleDragOver}
                onDragLeave={() => setDropTarget(null)}
                onDrop={handleDrop}
                onTaskDragStart={handleDragStart}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
