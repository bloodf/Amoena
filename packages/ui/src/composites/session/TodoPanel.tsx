import React from "react";
import { useTranslation } from "react-i18next";

interface Task {
  id: string;
  title: string;
  description?: string;
  status: "pending" | "in_progress" | "completed" | "blocked" | "cancelled";
  priority: number;
  parentTaskId?: string;
}

interface TodoPanelProps {
  tasks: Task[];
  onUpdateStatus: (taskId: string, status: string) => void;
  onReorder: (orderedIds: string[]) => void;
}

const statusColors: Record<string, string> = {
  pending: "border-yellow-500",
  in_progress: "border-blue-500",
  completed: "border-green-500",
  blocked: "border-red-500",
  cancelled: "border-muted",
};

const statusIcons: Record<string, string> = {
  pending: "○",
  in_progress: "◑",
  completed: "●",
  blocked: "✕",
  cancelled: "—",
};

export function TodoPanel({ tasks, onUpdateStatus, onReorder }: TodoPanelProps) {
  const { t } = useTranslation();
  const rootTasks = tasks.filter((t) => !t.parentTaskId);
  const childTasks = (parentId: string) => tasks.filter((t) => t.parentTaskId === parentId);

  const handleToggle = (task: Task) => {
    const nextStatus = task.status === "completed" ? "pending" : "completed";
    onUpdateStatus(task.id, nextStatus);
  };

  const renderTask = (task: Task, depth: number = 0): React.ReactNode => (
    <div key={task.id}>
      <div
        className={`flex items-center gap-2 px-3 py-2 border-l-2 ${statusColors[task.status] ?? "border-muted"}`}
        style={{ marginLeft: `${depth * 16}px` }}
      >
        <button
          onClick={() => handleToggle(task)}
          className="text-sm w-5 h-5 flex items-center justify-center rounded hover:bg-muted"
        >
          {statusIcons[task.status]}
        </button>
        <span
          className={`text-sm flex-1 ${task.status === "completed" ? "line-through text-muted-foreground" : ""}`}
        >
          {task.title}
        </span>
        {task.description && (
          <span className="text-xs text-muted-foreground truncate max-w-32">{task.description}</span>
        )}
      </div>
      {childTasks(task.id).map((child) => renderTask(child, depth + 1))}
    </div>
  );

  return (
    <div className="flex flex-col gap-1 p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold">{t("todo.title")}</h3>
        <span className="text-xs text-muted-foreground">
          {tasks.filter((task) => task.status === "completed").length}/{tasks.length} {t("todo.done")}
        </span>
      </div>
      {rootTasks.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-4">{t("todo.empty")}</p>
      )}
      {rootTasks.map((task) => renderTask(task))}
    </div>
  );
}
