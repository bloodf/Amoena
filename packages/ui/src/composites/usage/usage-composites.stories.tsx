import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "@storybook/test";

import {
  usageDailyUsage,
  usageDailyCost,
  usageSessionBreakdown,
  usageProviderQuotas,
  usageApiRequestLog,
  usagePlatformBreakdown,
  usageTabs,
} from "./data";
import { UsageSeriesTooltip, UsageCostTooltip } from "./UsageTooltips";
import { UsageOverviewPanel } from "./UsageOverviewPanel";
import { UsageApiLogPanel } from "./UsageApiLogPanel";
import { UsagePlatformsPanel } from "./UsagePlatformsPanel";
import { UsageSessionsPanel } from "./UsageSessionsPanel";
import { UsageTabs } from "./UsageTabs";

const meta: Meta = {
  title: "Composites/Usage",
};
export default meta;
type Story = StoryObj;

/* ------------------------------------------------------------------ */
/*  UsageOverviewPanel                                                 */
/* ------------------------------------------------------------------ */

export const OverviewDefault: Story = {
  render: () => (
    <UsageOverviewPanel
      totalTokens={1_284_500}
      totalCost={42.87}
      totalRequests={312}
      dailyUsage={usageDailyUsage}
      dailyCost={usageDailyCost}
      providerQuotas={usageProviderQuotas}
      customTooltip={<UsageSeriesTooltip />}
      costTooltip={<UsageCostTooltip />}
    />
  ),
};

export const OverviewLowUsage: Story = {
  render: () => (
    <UsageOverviewPanel
      totalTokens={8_200}
      totalCost={0.54}
      totalRequests={12}
      dailyUsage={usageDailyUsage.slice(0, 3)}
      dailyCost={usageDailyCost.slice(0, 3)}
      providerQuotas={usageProviderQuotas.slice(0, 1)}
      customTooltip={<UsageSeriesTooltip />}
      costTooltip={<UsageCostTooltip />}
    />
  ),
};

export const OverviewHighUsage: Story = {
  render: () => (
    <UsageOverviewPanel
      totalTokens={9_750_000}
      totalCost={328.45}
      totalRequests={4_891}
      dailyUsage={usageDailyUsage}
      dailyCost={usageDailyCost}
      providerQuotas={usageProviderQuotas}
      customTooltip={<UsageSeriesTooltip />}
      costTooltip={<UsageCostTooltip />}
    />
  ),
};

/* ------------------------------------------------------------------ */
/*  UsageApiLogPanel                                                   */
/* ------------------------------------------------------------------ */

const sessionOptions = [
  ...new Set(usageApiRequestLog.map((r) => r.session)),
];

export const ApiLogDefault: Story = {
  render: () => (
    <UsageApiLogPanel
      providerFilter="all"
      sessionFilter="all"
      filteredLog={usageApiRequestLog}
      sessionOptions={sessionOptions}
      onProviderFilterChange={fn()}
      onSessionFilterChange={fn()}
    />
  ),
};

export const ApiLogFilteredByProvider: Story = {
  render: () => (
    <UsageApiLogPanel
      providerFilter="anthropic"
      sessionFilter="all"
      filteredLog={usageApiRequestLog.filter(
        (r) => r.provider === "anthropic",
      )}
      sessionOptions={sessionOptions}
      onProviderFilterChange={fn()}
      onSessionFilterChange={fn()}
    />
  ),
};

export const ApiLogFilteredBySession: Story = {
  render: () => {
    const target = sessionOptions[0];
    return (
      <UsageApiLogPanel
        providerFilter="all"
        sessionFilter={target}
        filteredLog={usageApiRequestLog.filter((r) => r.session === target)}
        sessionOptions={sessionOptions}
        onProviderFilterChange={fn()}
        onSessionFilterChange={fn()}
      />
    );
  },
};

export const ApiLogEmpty: Story = {
  render: () => (
    <UsageApiLogPanel
      providerFilter="all"
      sessionFilter="all"
      filteredLog={[]}
      sessionOptions={sessionOptions}
      onProviderFilterChange={fn()}
      onSessionFilterChange={fn()}
    />
  ),
};

/* ------------------------------------------------------------------ */
/*  UsagePlatformsPanel                                                */
/* ------------------------------------------------------------------ */

export const PlatformsDefault: Story = {
  render: () => (
    <UsagePlatformsPanel
      platformBreakdown={usagePlatformBreakdown}
      providerQuotas={usageProviderQuotas}
    />
  ),
};

export const PlatformsSingleProvider: Story = {
  render: () => (
    <UsagePlatformsPanel
      platformBreakdown={usagePlatformBreakdown.slice(0, 1)}
      providerQuotas={usageProviderQuotas.slice(0, 1)}
    />
  ),
};

export const PlatformsTwoProviders: Story = {
  render: () => (
    <UsagePlatformsPanel
      platformBreakdown={usagePlatformBreakdown.slice(0, 2)}
      providerQuotas={usageProviderQuotas.slice(0, 2)}
    />
  ),
};

/* ------------------------------------------------------------------ */
/*  UsageSessionsPanel                                                 */
/* ------------------------------------------------------------------ */

export const SessionsDefault: Story = {
  render: () => (
    <UsageSessionsPanel
      sessions={usageSessionBreakdown}
      customTooltip={<UsageSeriesTooltip />}
    />
  ),
};

export const SessionsSingle: Story = {
  render: () => (
    <UsageSessionsPanel
      sessions={usageSessionBreakdown.slice(0, 1)}
      customTooltip={<UsageSeriesTooltip />}
    />
  ),
};

export const SessionsMany: Story = {
  render: () => (
    <UsageSessionsPanel
      sessions={[...usageSessionBreakdown, ...usageSessionBreakdown]}
      customTooltip={<UsageSeriesTooltip />}
    />
  ),
};

/* ------------------------------------------------------------------ */
/*  UsageTabs                                                          */
/* ------------------------------------------------------------------ */

export const TabsOverview: Story = {
  render: () => (
    <UsageTabs tabs={usageTabs} activeTab="overview" onChange={fn()} />
  ),
};

export const TabsSessions: Story = {
  render: () => (
    <UsageTabs tabs={usageTabs} activeTab="sessions" onChange={fn()} />
  ),
};

export const TabsApiLog: Story = {
  render: () => (
    <UsageTabs tabs={usageTabs} activeTab="api-log" onChange={fn()} />
  ),
};

export const TabsPlatforms: Story = {
  render: () => (
    <UsageTabs tabs={usageTabs} activeTab="platforms" onChange={fn()} />
  ),
};
