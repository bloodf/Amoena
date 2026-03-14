import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "@storybook/test";
import { QueuePanel } from "./QueuePanel";

const meta = {
  title: "Composites/Session/QueuePanel",
  parameters: { layout: "centered" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithMessages: Story = {
  render: () => (
    <div style={{ width: 480 }}>
      <QueuePanel
        messages={[
          { id: "1", content: "Fix the login bug", queueType: "app", status: "pending", orderIndex: 0 },
          { id: "2", content: "Add unit tests", queueType: "app", status: "pending", orderIndex: 1 },
          { id: "3", content: "Deploy to staging", queueType: "app", status: "sent", orderIndex: 2 },
        ]}
        onEdit={fn()}
        onRemove={fn()}
        onReorder={fn()}
        onFlush={fn()}
      />
    </div>
  ),
};

export const Empty: Story = {
  render: () => (
    <div style={{ width: 480 }}>
      <QueuePanel
        messages={[]}
        onEdit={fn()}
        onRemove={fn()}
        onReorder={fn()}
        onFlush={fn()}
      />
    </div>
  ),
};

export const CliQueue: Story = {
  render: () => (
    <div style={{ width: 480 }}>
      <QueuePanel
        messages={[
          { id: "1", content: "CLI command", queueType: "cli", status: "pending", orderIndex: 0 },
        ]}
        onEdit={fn()}
        onRemove={fn()}
        onReorder={fn()}
        onFlush={fn()}
      />
    </div>
  ),
};
