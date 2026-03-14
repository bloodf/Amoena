import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "@storybook/test";
import { Circle, CheckCircle, Clock, Loader2 } from "lucide-react";
import { KanbanColumn } from "./KanbanColumn";
import { KanbanTaskCard } from "./KanbanTaskCard";
import { TaskBoardHeader } from "./TaskBoardHeader";
import type { KanbanTask, KanbanColumnData } from "./types";

// ---------------------------------------------------------------------------
// Shared mock data
// ---------------------------------------------------------------------------

const mockTasks: KanbanTask[] = [
  {
    id: "task-1",
    title: "Implement authentication flow",
    description: "Add OAuth2 login with GitHub and Google providers",
    agent: "Copilot",
    agentColor: "#6366f1",
    priority: "high",
    tokens: "1,240",
    createdAt: "2025-01-15T09:30:00Z",
  },
  {
    id: "task-2",
    title: "Fix sidebar overflow on mobile",
    description: "Navigation items clip on screens below 375px",
    agent: "Devin",
    agentColor: "#f59e0b",
    priority: "medium",
    tokens: "620",
    createdAt: "2025-01-16T14:00:00Z",
  },
  {
    id: "task-3",
    title: "Update dependency versions",
    priority: "low",
    createdAt: "2025-01-17T08:15:00Z",
  },
  {
    id: "task-4",
    title: "Critical: database migration failing",
    description: "Migration 042 causes data loss on rollback",
    agent: "Copilot",
    agentColor: "#6366f1",
    priority: "critical",
    tokens: "3,800",
    createdAt: "2025-01-14T11:45:00Z",
  },
];

const todoColumn: KanbanColumnData = {
  id: "todo",
  title: "To Do",
  icon: Circle,
  color: "#6b7280",
  tasks: [mockTasks[0]!, mockTasks[2]!],
};

const inProgressColumn: KanbanColumnData = {
  id: "in-progress",
  title: "In Progress",
  icon: Loader2,
  color: "#3b82f6",
  tasks: [mockTasks[1]!],
};

const doneColumn: KanbanColumnData = {
  id: "done",
  title: "Done",
  icon: CheckCircle,
  color: "#22c55e",
  tasks: [mockTasks[3]!],
};

const waitingColumn: KanbanColumnData = {
  id: "waiting",
  title: "Waiting",
  icon: Clock,
  color: "#f59e0b",
  tasks: [],
};

// ---------------------------------------------------------------------------
// KanbanColumn
// ---------------------------------------------------------------------------

const columnMeta: Meta<typeof KanbanColumn> = {
  title: "Composites/Tasks/KanbanColumn",
  component: KanbanColumn,
  args: {
    dropTarget: null,
    draggedTaskId: null,
    onDragOver: fn(),
    onDragLeave: fn(),
    onDrop: fn(),
    onTaskDragStart: fn(),
  },
};

export default columnMeta;
type ColumnStory = StoryObj<typeof columnMeta>;

export const TodoColumn: ColumnStory = {
  args: { column: todoColumn },
};

export const InProgressColumn: ColumnStory = {
  args: { column: inProgressColumn },
};

export const DoneColumn: ColumnStory = {
  args: { column: doneColumn },
};

export const EmptyColumn: ColumnStory = {
  args: { column: waitingColumn },
};

export const ColumnAsDropTarget: ColumnStory = {
  args: {
    column: todoColumn,
    dropTarget: "todo",
    draggedTaskId: "task-2",
  },
};

// ---------------------------------------------------------------------------
// KanbanTaskCard
// ---------------------------------------------------------------------------

export const TaskCardDefault: ColumnStory = {
  render: () => (
    <KanbanTaskCard
      task={mockTasks[0]!}
      isDragging={false}
      onDragStart={fn()}
    />
  ),
};

export const TaskCardDragging: ColumnStory = {
  render: () => (
    <KanbanTaskCard
      task={mockTasks[0]!}
      isDragging={true}
      onDragStart={fn()}
    />
  ),
};

export const TaskCardCritical: ColumnStory = {
  render: () => (
    <KanbanTaskCard
      task={mockTasks[3]!}
      isDragging={false}
      onDragStart={fn()}
    />
  ),
};

export const TaskCardMinimal: ColumnStory = {
  render: () => (
    <KanbanTaskCard
      task={mockTasks[2]!}
      isDragging={false}
      onDragStart={fn()}
    />
  ),
};

// ---------------------------------------------------------------------------
// TaskBoardHeader
// ---------------------------------------------------------------------------

export const BoardHeader: ColumnStory = {
  render: () => <TaskBoardHeader />,
};
