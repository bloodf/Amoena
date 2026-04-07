import {
  Cell,
  ChartTooltip as Tooltip,
  Pie,
  PieChart,
  RechartsResponsiveContainer as ResponsiveContainer,
} from '../../primitives/chart.tsx';
import { SectionHeading, SurfacePanel } from '../../components/patterns.tsx';

interface PlatformBreakdownItem {
  name: string;
  value: number;
  color: string;
}

interface ProviderQuotaItem {
  name: string;
  color: string;
  used: number;
  limit: number;
  costPerK: number;
  totalSpent: number;
  resetsIn: string;
}

export function UsagePlatformsPanel({
  platformBreakdown,
  providerQuotas,
}: {
  platformBreakdown: PlatformBreakdownItem[];
  providerQuotas: ProviderQuotaItem[];
}) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        <SurfacePanel>
          <SectionHeading className="mb-4">Spending by Platform</SectionHeading>
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={platformBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {platformBreakdown.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  content={({
                    active,
                    payload,
                  }: {
                    active?: boolean;
                    payload?: Array<{ payload: { name: string; value: number } }>;
                  }) => {
                    if (!active || !payload?.length) return null;
                    const data = payload[0].payload;
                    return (
                      <div className="rounded-lg border border-border bg-surface-1 px-3 py-2 text-[11px] shadow-xl">
                        <div className="font-medium text-foreground">{data.name}</div>
                        <div className="font-mono text-foreground">{data.value}%</div>
                      </div>
                    );
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 flex items-center justify-center gap-4">
            {platformBreakdown.map((provider) => (
              <div key={provider.name} className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full" style={{ backgroundColor: provider.color }} />
                <span className="text-[10px] text-muted-foreground">{provider.name}</span>
                <span className="font-mono text-[10px] text-foreground">{provider.value}%</span>
              </div>
            ))}
          </div>
        </SurfacePanel>

        <div className="space-y-3">
          {providerQuotas.map((provider) => {
            const pct = Math.round((provider.used / provider.limit) * 100);
            return (
              <div
                key={provider.name}
                className="rounded border border-border bg-surface-1 p-3 transition-colors hover:border-primary/30"
              >
                <div className="mb-1 flex items-center gap-2">
                  <div
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: `hsl(${provider.color})` }}
                  />
                  <span className="flex-1 text-[13px] font-medium text-foreground">
                    {provider.name}
                  </span>
                  <span className="font-mono text-[12px] text-foreground">
                    ${provider.totalSpent.toFixed(2)}
                  </span>
                </div>
                <div className="mt-2 grid grid-cols-3 gap-2 text-[10px]">
                  <div>
                    <span className="block text-muted-foreground">Rate</span>
                    <span className="font-mono text-foreground">${provider.costPerK}/1k</span>
                  </div>
                  <div>
                    <span className="block text-muted-foreground">Used</span>
                    <span className="font-mono text-foreground">{pct}%</span>
                  </div>
                  <div>
                    <span className="block text-muted-foreground">Resets</span>
                    <span className="font-mono text-foreground">{provider.resetsIn}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
