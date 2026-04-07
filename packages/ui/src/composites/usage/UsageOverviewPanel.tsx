import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ChartLegend as Legend,
  ChartTooltip as Tooltip,
  RechartsResponsiveContainer as ResponsiveContainer,
  XAxis,
  YAxis,
} from '../../primitives/chart.tsx';
import { Clock, DollarSign, TrendingUp, Zap } from 'lucide-react';
import { MetricCard, SectionHeading, SurfacePanel } from '../../components/patterns.tsx';

export function UsageOverviewPanel({
  totalTokens,
  totalCost,
  totalRequests,
  dailyUsage,
  dailyCost,
  providerQuotas,
  customTooltip,
  costTooltip,
}: {
  totalTokens: number;
  totalCost: number;
  totalRequests: number;
  dailyUsage: Array<Record<string, number | string>>;
  dailyCost: Array<Record<string, number | string>>;
  providerQuotas: {
    name: string;
    color: string;
    used: number;
    limit: number;
    costPerK: number;
    totalSpent: number;
    resetsIn: string;
  }[];
  customTooltip: React.ReactElement;
  costTooltip: React.ReactElement;
}) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        <MetricCard
          label="Total Tokens"
          value={`${(totalTokens / 1000).toFixed(1)}k`}
          icon={Zap}
          trend="+12.3%"
          trendUp
          subtext="vs last period"
        />
        <MetricCard
          label="Total Spent"
          value={`$${totalCost.toFixed(2)}`}
          icon={DollarSign}
          trend="-4.1%"
          trendUp={false}
          subtext="vs last period"
        />
        <MetricCard
          label="API Requests"
          value={totalRequests.toString()}
          icon={TrendingUp}
          trend="+8.7%"
          trendUp
          subtext="across all providers"
        />
        <MetricCard
          label="Avg Latency"
          value="1.1s"
          icon={Clock}
          trend="-15%"
          trendUp={false}
          subtext="response time"
        />
      </div>

      <SurfacePanel>
        <SectionHeading className="mb-4">Token Consumption by Provider</SectionHeading>
        <div className="h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dailyUsage}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
              />
              <YAxis
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
                tickFormatter={(value: number) => `${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip content={customTooltip} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Area
                type="monotone"
                dataKey="claude"
                stackId="1"
                stroke="hsl(var(--tui-claude))"
                fill="hsl(var(--tui-claude) / 0.3)"
              />
              <Area
                type="monotone"
                dataKey="openai"
                stackId="1"
                stroke="hsl(var(--tui-opencode))"
                fill="hsl(var(--tui-opencode) / 0.3)"
              />
              <Area
                type="monotone"
                dataKey="gemini"
                stackId="1"
                stroke="hsl(var(--tui-gemini))"
                fill="hsl(var(--tui-gemini) / 0.3)"
              />
              <Area
                type="monotone"
                dataKey="codex"
                stackId="1"
                stroke="hsl(var(--tui-codex))"
                fill="hsl(var(--tui-codex) / 0.3)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </SurfacePanel>

      <SurfacePanel>
        <SectionHeading className="mb-4">Daily Cost</SectionHeading>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dailyCost}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
              />
              <YAxis
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
                tickFormatter={(value: number) => `$${value}`}
              />
              <Tooltip content={costTooltip} />
              <Bar dataKey="cost" fill="hsl(var(--primary))" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </SurfacePanel>

      <SurfacePanel>
        <SectionHeading className="mb-4">Rate Limits & Quotas</SectionHeading>
        <div className="grid grid-cols-2 gap-4">
          {providerQuotas.map((provider) => {
            const pct = (provider.used / provider.limit) * 100;
            const remaining = provider.limit - provider.used;
            return (
              <div key={provider.name} className="rounded border border-border bg-surface-0 p-3">
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: `hsl(${provider.color})` }}
                    />
                    <span className="text-[13px] font-medium text-foreground">{provider.name}</span>
                  </div>
                  <span className="font-mono text-[10px] text-muted-foreground">
                    resets in {provider.resetsIn}
                  </span>
                </div>
                <div className="mb-2 h-2 w-full overflow-hidden rounded-full bg-surface-3">
                  <div
                    className={(() => {
                      if (pct > 80) return 'h-full rounded-full bg-destructive transition-all';
                      if (pct > 50) return 'h-full rounded-full bg-warning transition-all';
                      return 'h-full rounded-full transition-all';
                    })()}
                    style={{
                      width: `${pct}%`,
                      backgroundColor: pct <= 50 ? `hsl(${provider.color})` : undefined,
                    }}
                  />
                </div>
                <div className="flex items-center justify-between font-mono text-[10px] text-muted-foreground">
                  <span>
                    {provider.used} / {provider.limit} requests
                  </span>
                  <span>{remaining} remaining</span>
                </div>
                <div className="mt-1 flex items-center justify-between text-[10px]">
                  <span className="text-muted-foreground">${provider.costPerK}/1k tokens</span>
                  <span className="font-mono text-foreground">
                    ${provider.totalSpent.toFixed(2)} spent
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </SurfacePanel>
    </div>
  );
}
