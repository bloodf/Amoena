import type { Meta, StoryObj } from "@storybook/react-vite";
import { SurfacePanel, SectionHeading, StatusPill, MetricCard, LabeledValueRow } from "./patterns";

const meta: Meta = {
  title: "Components/Patterns",
  component: SurfacePanel,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => (
    <div className="flex flex-col gap-6 p-4">
      <SectionHeading>Section Label</SectionHeading>

      <SurfacePanel>
        <p>Surface panel content</p>
      </SurfacePanel>

      <div className="flex gap-2">
        <StatusPill label="Active" tone="success" />
        <StatusPill label="Warning" tone="warning" />
        <StatusPill label="Error" tone="danger" />
        <StatusPill label="Info" tone="primary" />
        <StatusPill label="Muted" tone="muted" />
        <StatusPill label="Purple" tone="purple" />
        <StatusPill label="Neutral" tone="neutral" />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <MetricCard label="Users" value="1,234" subtext="last 30 days" trend="+12%" trendUp />
        <MetricCard label="Revenue" value="$5.6k" trend="-3%" trendUp={false} />
        <MetricCard label="Latency" value="42ms" />
      </div>

      <SurfacePanel>
        <LabeledValueRow label="Status" value="Online" />
        <LabeledValueRow label="Uptime" value="99.9%" />
        <LabeledValueRow label="Region" value="US-East" />
      </SurfacePanel>
    </div>
  ),
};

export const AllPillTones: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2 p-4">
      <StatusPill label="Primary" tone="primary" />
      <StatusPill label="Success" tone="success" />
      <StatusPill label="Warning" tone="warning" />
      <StatusPill label="Danger" tone="danger" />
      <StatusPill label="Muted" tone="muted" />
      <StatusPill label="Purple" tone="purple" />
      <StatusPill label="Neutral" tone="neutral" />
    </div>
  ),
};

export const MetricCards: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-4 p-4">
      <MetricCard label="Requests" value="12.3k" trend="+8%" trendUp subtext="vs last week" />
      <MetricCard label="Errors" value="23" trend="+2" trendUp={false} />
    </div>
  ),
};
