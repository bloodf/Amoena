import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "@storybook/test";
import { FilesTab } from "./FilesTab";
import { AgentsTab } from "./AgentsTab";
import { MemoryTab } from "./MemoryTab";
import { ReviewTab } from "./ReviewTab";
import { TimelineTab } from "./TimelineTab";
import { SidePanelTabBar } from "./SidePanelTabBar";
import { defaultSidePanelTabs } from "./data";
import { useRef } from "react";

/* ───────────────────────────────────────────────────────────
   Meta – all side-panel sub-component stories
   ─────────────────────────────────────────────────────────── */

const meta = {
  title: "Composites/Session/SidePanel",
  parameters: { layout: "centered" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

function TabBarWrapper(props: { activeTab?: string; visibleCount?: number }) {
  const containerRef = useRef<HTMLDivElement>(null);
  return (
    <div style={{ width: 320 }}>
      <SidePanelTabBar
        tabs={defaultSidePanelTabs}
        activeTab={(props.activeTab as any) ?? "files"}
        visibleCount={props.visibleCount ?? defaultSidePanelTabs.length}
        dropIndex={null}
        dragIndex={null}
        containerRef={containerRef}
        onSelect={fn()}
        onDragStart={fn()}
        onDragOver={fn()}
        onDragEnd={fn()}
        onDragLeave={fn()}
      />
    </div>
  );
}

export const Default: Story = {
  render: () => <TabBarWrapper />,
};

export const AgentsActive: Story = {
  render: () => <TabBarWrapper activeTab="agents" />,
};

export const MemoryActive: Story = {
  render: () => <TabBarWrapper activeTab="memory" />,
};

export const TimelineActive: Story = {
  render: () => <TabBarWrapper activeTab="timeline" />,
};

export const WithOverflow: Story = {
  render: () => <TabBarWrapper visibleCount={2} />,
};

/* ───────────────────────────────────────────────────────────
   FilesTab
   ─────────────────────────────────────────────────────────── */

export const FilesTabDefault: Story = {
  render: () => (
    <div style={{ width: 320, height: 500 }}>
      <FilesTab onOpenFile={fn()} />
    </div>
  ),
};

/* ───────────────────────────────────────────────────────────
   AgentsTab
   ─────────────────────────────────────────────────────────── */

export const AgentsTabDefault: Story = {
  render: () => (
    <div style={{ width: 320, height: 500 }}>
      <AgentsTab />
    </div>
  ),
};

export const AgentsTabWide: Story = {
  render: () => (
    <div style={{ width: 480, height: 500 }}>
      <AgentsTab />
    </div>
  ),
};

/* ───────────────────────────────────────────────────────────
   MemoryTab
   ─────────────────────────────────────────────────────────── */

export const MemoryTabDefault: Story = {
  render: () => (
    <div style={{ width: 320, height: 500 }}>
      <MemoryTab />
    </div>
  ),
};

export const MemoryTabWide: Story = {
  render: () => (
    <div style={{ width: 480, height: 500 }}>
      <MemoryTab />
    </div>
  ),
};

/* ───────────────────────────────────────────────────────────
   ReviewTab
   ─────────────────────────────────────────────────────────── */

export const ReviewTabDefault: Story = {
  render: () => (
    <div style={{ width: 320, height: 500 }}>
      <ReviewTab />
    </div>
  ),
};

export const ReviewTabWide: Story = {
  render: () => (
    <div style={{ width: 480, height: 600 }}>
      <ReviewTab />
    </div>
  ),
};

/* ───────────────────────────────────────────────────────────
   TimelineTab
   ─────────────────────────────────────────────────────────── */

export const TimelineTabDefault: Story = {
  render: () => (
    <div style={{ width: 320, height: 600 }}>
      <TimelineTab />
    </div>
  ),
};

export const TimelineTabWide: Story = {
  render: () => (
    <div style={{ width: 480, height: 700 }}>
      <TimelineTab />
    </div>
  ),
};
