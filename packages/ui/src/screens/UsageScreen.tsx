import { useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import {
  ScreenActions,
  ScreenContainer,
  ScreenHeader,
  ScreenHeaderText,
  ScreenRoot,
  ScreenStack,
  ScreenSubtitle,
  ScreenTitle,
} from '@/components/screen';
import { UsageApiLogPanel } from '@/composites/usage/UsageApiLogPanel';
import { UsageOverviewPanel } from '@/composites/usage/UsageOverviewPanel';
import { UsagePlatformsPanel } from '@/composites/usage/UsagePlatformsPanel';
import { UsageSessionsPanel } from '@/composites/usage/UsageSessionsPanel';
import { UsageTabs } from '@/composites/usage/UsageTabs';
import {
  usageApiRequestLog,
  usageDailyCost,
  usageDailyUsage,
  usagePlatformBreakdown,
  usageProviderQuotas,
  usageSessionBreakdown,
  usageTabs,
  usageTimeRanges,
} from '@/composites/usage/data';
import { UsageCostTooltip, UsageStackedTooltip } from '@/composites/usage/tooltips';

type TabId = 'overview' | 'sessions' | 'api-log' | 'platforms';
type TimeRange = 'today' | '7d' | '30d' | 'all';

export function UsageScreen() {
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [timeRange, setTimeRange] = useState<TimeRange>('7d');
  const [providerFilter, setProviderFilter] = useState<string>('all');
  const [sessionFilter, setSessionFilter] = useState<string>('all');

  const totalTokens = useMemo(
    () =>
      usageDailyUsage.reduce(
        (sum, day) => sum + day.claude + day.openai + day.gemini + day.codex,
        0,
      ),
    [],
  );

  const totalCost = useMemo(() => usageDailyCost.reduce((sum, day) => sum + day.cost, 0), []);

  const totalRequests = usageApiRequestLog.length * 12;

  const filteredLog = usageApiRequestLog.filter(
    (request) =>
      (providerFilter === 'all' || request.provider === providerFilter) &&
      (sessionFilter === 'all' || request.session === sessionFilter),
  );

  return (
    <ScreenRoot>
      <ScreenContainer>
        <ScreenStack>
          <ScreenHeader>
            <ScreenHeaderText>
              <ScreenTitle>Usage & Tokens</ScreenTitle>
              <ScreenSubtitle>
                Track token consumption, spending, and API usage across sessions and providers.
              </ScreenSubtitle>
            </ScreenHeaderText>
            <ScreenActions className="gap-1 rounded bg-surface-2 p-0.5">
              {usageTimeRanges.map((range) => (
                <button
                  key={range.id}
                  onClick={() => setTimeRange(range.id)}
                  className={cn(
                    'rounded px-3 py-1 text-[11px] cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring transition-colors',
                    timeRange === range.id
                      ? 'bg-surface-1 text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  {range.label}
                </button>
              ))}
            </ScreenActions>
          </ScreenHeader>

          <UsageTabs tabs={usageTabs} activeTab={activeTab} onChange={setActiveTab} />

          {activeTab === 'overview' ? (
            <UsageOverviewPanel
              totalTokens={totalTokens}
              totalCost={totalCost}
              totalRequests={totalRequests}
              dailyUsage={usageDailyUsage}
              dailyCost={usageDailyCost}
              providerQuotas={usageProviderQuotas}
              customTooltip={<UsageStackedTooltip />}
              costTooltip={<UsageCostTooltip />}
            />
          ) : null}

          {activeTab === 'sessions' ? (
            <UsageSessionsPanel
              sessions={usageSessionBreakdown}
              customTooltip={<UsageStackedTooltip />}
            />
          ) : null}

          {activeTab === 'api-log' ? (
            <UsageApiLogPanel
              providerFilter={providerFilter}
              sessionFilter={sessionFilter}
              filteredLog={filteredLog}
              sessionOptions={[...new Set(usageApiRequestLog.map((request) => request.session))]}
              providerOptions={[
                ...new Set(usageApiRequestLog.map((request) => request.provider)),
              ].sort()}
              onProviderFilterChange={setProviderFilter}
              onSessionFilterChange={setSessionFilter}
            />
          ) : null}

          {activeTab === 'platforms' ? (
            <UsagePlatformsPanel
              platformBreakdown={usagePlatformBreakdown}
              providerQuotas={usageProviderQuotas}
            />
          ) : null}
        </ScreenStack>
      </ScreenContainer>
    </ScreenRoot>
  );
}
