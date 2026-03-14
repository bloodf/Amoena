import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "@storybook/test";
import { FileQuestion, Inbox, Search } from "lucide-react";
import {
  DegradedBanner,
  EmptyState,
  ErrorState,
  SkeletonBlock,
  SkeletonCard,
  SkeletonLine,
  SkeletonList,
  SkeletonTable,
} from "./StateOverlays";
import { ProviderLogo } from "./ProviderLogo";
import { MemoryTierCard } from "./MemoryTierCard";

const meta: Meta = {
  title: "Composites/Shared",
};
export default meta;
type Story = StoryObj;

/* ------------------------------------------------------------------ */
/*  SkeletonLine                                                       */
/* ------------------------------------------------------------------ */

export const SkeletonLineDefault: Story = {
  render: () => <SkeletonLine />,
};

export const SkeletonLineNarrow: Story = {
  render: () => <SkeletonLine width="40%" />,
};

export const SkeletonLineWide: Story = {
  render: () => <SkeletonLine width="90%" />,
};

/* ------------------------------------------------------------------ */
/*  SkeletonBlock                                                      */
/* ------------------------------------------------------------------ */

export const SkeletonBlockDefault: Story = {
  render: () => <SkeletonBlock />,
};

export const SkeletonBlockFewLines: Story = {
  render: () => <SkeletonBlock lines={2} />,
};

export const SkeletonBlockManyLines: Story = {
  render: () => <SkeletonBlock lines={8} />,
};

/* ------------------------------------------------------------------ */
/*  SkeletonCard                                                       */
/* ------------------------------------------------------------------ */

export const SkeletonCardDefault: Story = {
  render: () => <SkeletonCard />,
};

export const SkeletonCardCustomClass: Story = {
  render: () => <SkeletonCard className="max-w-xs" />,
};

/* ------------------------------------------------------------------ */
/*  SkeletonTable                                                      */
/* ------------------------------------------------------------------ */

export const SkeletonTableDefault: Story = {
  render: () => <SkeletonTable />,
};

export const SkeletonTableSmall: Story = {
  render: () => <SkeletonTable rows={2} cols={2} />,
};

export const SkeletonTableLarge: Story = {
  render: () => <SkeletonTable rows={8} cols={6} />,
};

/* ------------------------------------------------------------------ */
/*  SkeletonList                                                       */
/* ------------------------------------------------------------------ */

export const SkeletonListDefault: Story = {
  render: () => <SkeletonList />,
};

export const SkeletonListShort: Story = {
  render: () => <SkeletonList items={2} />,
};

export const SkeletonListLong: Story = {
  render: () => <SkeletonList items={10} />,
};

/* ------------------------------------------------------------------ */
/*  EmptyState                                                         */
/* ------------------------------------------------------------------ */

export const EmptyStateInbox: Story = {
  render: () => (
    <EmptyState
      icon={Inbox}
      title="No messages yet"
      description="When you receive messages they will appear here."
      action="Compose message"
      onAction={fn()}
    />
  ),
};

export const EmptyStateSearch: Story = {
  render: () => (
    <EmptyState
      icon={Search}
      title="No results found"
      description="Try adjusting your search terms or filters."
    />
  ),
};

export const EmptyStateMinimal: Story = {
  render: () => <EmptyState icon={FileQuestion} title="Nothing here" />,
};

export const EmptyStateWithAction: Story = {
  render: () => (
    <EmptyState
      icon={FileQuestion}
      title="No documents"
      description="Get started by creating your first document."
      action="Create document"
      onAction={fn()}
    />
  ),
};

/* ------------------------------------------------------------------ */
/*  ErrorState                                                         */
/* ------------------------------------------------------------------ */

export const ErrorStateDefault: Story = {
  render: () => <ErrorState />,
};

export const ErrorStateCustomMessage: Story = {
  render: () => (
    <ErrorState
      title="Connection lost"
      description="Unable to reach the server. Please check your network and try again."
      onRetry={fn()}
    />
  ),
};

export const ErrorStateNoRetry: Story = {
  render: () => (
    <ErrorState
      title="Permission denied"
      description="You do not have access to this resource. Contact your administrator."
    />
  ),
};

/* ------------------------------------------------------------------ */
/*  DegradedBanner                                                     */
/* ------------------------------------------------------------------ */

export const DegradedBannerDefault: Story = {
  render: () => (
    <DegradedBanner message="Some features are temporarily unavailable due to upstream service issues." />
  ),
};

export const DegradedBannerShort: Story = {
  render: () => <DegradedBanner message="Running in degraded mode." />,
};

/* ------------------------------------------------------------------ */
/*  ProviderLogo                                                       */
/* ------------------------------------------------------------------ */

export const ProviderLogoOpenAI: Story = {
  render: () => <ProviderLogo provider="openai" size={32} />,
};

export const ProviderLogoAnthropic: Story = {
  render: () => <ProviderLogo provider="anthropic" size={32} />,
};

export const ProviderLogoSmall: Story = {
  render: () => <ProviderLogo provider="openai" size={16} />,
};

export const ProviderLogoDarkVariant: Story = {
  render: () => <ProviderLogo provider="anthropic" size={48} variant="dark" />,
};

/* ------------------------------------------------------------------ */
/*  MemoryTierCard                                                     */
/* ------------------------------------------------------------------ */

export const MemoryTierCardL0: Story = {
  render: () => (
    <div style={{ width: 360 }} className="p-4 space-y-2">
      <MemoryTierCard
        id="mem-1"
        title="Prefers functional components"
        type="react"
        category="preference"
        timestamp="2 min ago"
        l0Summary="Observed across 12 sessions"
        l1Summary="User consistently writes functional components with hooks. Never uses class components. Prefers custom hooks for shared logic."
        l2Content="Sources:\n- Session #42: Refactored UserProfile from class to FC\n- Session #38: Created useAuth custom hook\n- Session #35: Rejected class-based suggestion\n\nConfidence: 0.94"
      />
    </div>
  ),
};

export const MemoryTierCardAllCategories: Story = {
  render: () => (
    <div style={{ width: 360 }} className="p-4 space-y-2">
      <MemoryTierCard id="m1" title="User name: Alice" type="identity" category="profile" timestamp="1h ago" l0Summary="Core profile fact" />
      <MemoryTierCard id="m2" title="Dark mode always" type="ui" category="preference" timestamp="3h ago" l0Summary="UI preference" l1Summary="User switches to dark mode in every new session." />
      <MemoryTierCard id="m3" title="Project: lunaria" type="project" category="entity" timestamp="5h ago" l0Summary="Active workspace entity" />
      <MemoryTierCard id="m4" title="Error-first callbacks" type="node" category="pattern" timestamp="1d ago" l0Summary="Coding pattern" l1Summary="Uses error-first callback pattern in all Node.js code." />
      <MemoryTierCard id="m5" title="Uses ripgrep for search" type="cli" category="tool_usage" timestamp="2d ago" l0Summary="Tool preference" />
      <MemoryTierCard id="m6" title="Expert in Rust async" type="lang" category="skill" timestamp="3d ago" l0Summary="Skill assessment" l1Summary="Demonstrates advanced understanding of Rust async/await, pinning, and futures." />
    </div>
  ),
};

export const MemoryTierCardDuplicate: Story = {
  render: () => (
    <div style={{ width: 360 }} className="p-4 space-y-2">
      <MemoryTierCard
        id="mem-dup"
        title="JWT refresh rotation"
        type="auth"
        category="pattern"
        timestamp="5 min ago"
        l0Summary="Observed in current session"
        l1Summary="Access tokens expire in 15 minutes, refresh tokens in 7 days with rotation."
        isDuplicate
        onMerge={fn()}
        onDismiss={fn()}
      />
    </div>
  ),
};
