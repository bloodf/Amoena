export interface KanbanTask {
  id: string;
  title: string;
  description?: string;
  agent?: string;
  agentColor?: string;
  priority: "low" | "medium" | "high" | "critical";
  tokens?: string;
  createdAt: string;
}

export interface KanbanColumnData {
  id: string;
  title: string;
  icon: React.ElementType;
  color: string;
  tasks: KanbanTask[];
}
