import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "@storybook/test";
import { WorkspaceResizeHandle } from "./WorkspaceResizeHandle";
import { WorkspaceTabs } from "./WorkspaceTabs";
import { initialSessionRecords } from "./data";
import type { WorkspaceTabItem } from "./types";

/* ───────────────────────────────────────────────────────────
   Meta – all session sub-component stories
   ─────────────────────────────────────────────────────────── */

const meta = {
  title: "Composites/Session/Session",
  parameters: { layout: "centered" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Horizontal: Story = {
  name: "ResizeHandle / Horizontal",
  render: () => (
    <div style={{ width: 600 }}>
      <div className="h-16 bg-surface-1" />
      <WorkspaceResizeHandle orientation="horizontal" onResizeStart={fn()} />
      <div className="h-16 bg-surface-2" />
    </div>
  ),
};

export const Vertical: Story = {
  name: "ResizeHandle / Vertical",
  render: () => (
    <div className="flex" style={{ height: 120 }}>
      <div className="flex-1 bg-surface-1" />
      <WorkspaceResizeHandle orientation="vertical" onResizeStart={fn()} />
      <div className="flex-1 bg-surface-2" />
    </div>
  ),
};

/* ───────────────────────────────────────────────────────────
   WorkspaceTabs
   ─────────────────────────────────────────────────────────── */

const mockTabs: WorkspaceTabItem[] = [
  { type: "session", id: "1" },
  { type: "session", id: "2" },
  { type: "file", id: "f1", fileName: "tokens.rs" },
  { type: "file", id: "f2", fileName: "middleware.rs" },
];

const tabsCallbacks = {
  onTabClick: fn(),
  onTabClose: fn(),
  onTabCloseKey: fn(),
  onTabDragStart: fn(),
  onTabDragOver: fn(),
  onTabDragEnd: fn(),
  onDragLeave: fn(),
  onNewSession: fn(),
};

export const TabsDefault: Story = {
  render: () => (
    <WorkspaceTabs
      tabs={mockTabs}
      sessions={initialSessionRecords}
      activeTabId="1"
      dragIndex={null}
      dropIndex={null}
      {...tabsCallbacks}
    />
  ),
};

export const TabsFileActive: Story = {
  render: () => (
    <WorkspaceTabs
      tabs={mockTabs}
      sessions={initialSessionRecords}
      activeTabId="f1"
      dragIndex={null}
      dropIndex={null}
      {...tabsCallbacks}
    />
  ),
};

export const TabsSingleSession: Story = {
  render: () => (
    <WorkspaceTabs
      tabs={[{ type: "session", id: "1" }]}
      sessions={initialSessionRecords}
      activeTabId="1"
      dragIndex={null}
      dropIndex={null}
      {...tabsCallbacks}
    />
  ),
};

export const TabsManyTabs: Story = {
  render: () => (
    <WorkspaceTabs
      tabs={[
        { type: "session", id: "1" },
        { type: "session", id: "2" },
        { type: "session", id: "3" },
        { type: "file", id: "f1", fileName: "tokens.rs" },
        { type: "file", id: "f2", fileName: "middleware.rs" },
        { type: "file", id: "f3", fileName: "rate_limit.rs" },
        { type: "file", id: "f4", fileName: "config.ts" },
      ]}
      sessions={initialSessionRecords}
      activeTabId="2"
      dragIndex={null}
      dropIndex={null}
      {...tabsCallbacks}
    />
  ),
};

export const TabsWithDropIndicator: Story = {
  render: () => (
    <WorkspaceTabs
      tabs={mockTabs}
      sessions={initialSessionRecords}
      activeTabId="1"
      dragIndex={0}
      dropIndex={2}
      {...tabsCallbacks}
    />
  ),
};
