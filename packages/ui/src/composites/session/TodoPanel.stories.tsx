import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "@storybook/test";
import { TodoPanel } from "./TodoPanel";

const meta = {
  title: "Composites/Session/TodoPanel",
  parameters: { layout: "centered" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithTasks: Story = {
  render: () => (
    <div style={{ width: 480 }}>
      <TodoPanel
        tasks={[
          { id: "1", title: "Implement auth", status: "completed", priority: 1 },
          { id: "2", title: "Write tests", status: "in_progress", priority: 2 },
          { id: "3", title: "Deploy", status: "pending", priority: 3 },
          { id: "4", title: "Unit tests", status: "pending", priority: 1, parentTaskId: "2" },
          { id: "5", title: "E2E tests", status: "blocked", priority: 2, parentTaskId: "2" },
        ]}
        onUpdateStatus={fn()}
        onReorder={fn()}
      />
    </div>
  ),
};

export const Empty: Story = {
  render: () => (
    <div style={{ width: 480 }}>
      <TodoPanel
        tasks={[]}
        onUpdateStatus={fn()}
        onReorder={fn()}
      />
    </div>
  ),
};

export const AllCompleted: Story = {
  render: () => (
    <div style={{ width: 480 }}>
      <TodoPanel
        tasks={[
          { id: "1", title: "Design system", status: "completed", priority: 1 },
          { id: "2", title: "API integration", status: "completed", priority: 2 },
          { id: "3", title: "Code review", status: "completed", priority: 3 },
        ]}
        onUpdateStatus={fn()}
        onReorder={fn()}
      />
    </div>
  ),
};
