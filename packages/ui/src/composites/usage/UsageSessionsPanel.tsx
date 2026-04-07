import { Bar, BarChart, CartesianGrid, ChartTooltip as Tooltip, RechartsResponsiveContainer as ResponsiveContainer, XAxis, YAxis } from '../../primitives/chart.tsx';
import { SectionHeading, SurfacePanel } from '../../components/patterns.tsx';

interface SessionBreakdownItem {
  session: string;
  tokens: number;
  cost: number;
  model: string;
  provider: string;
  requests: number;
}

export function UsageSessionsPanel({
  sessions,
  customTooltip,
}: {
  sessions: SessionBreakdownItem[];
  customTooltip: React.ReactElement;
}) {
  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded border border-border">
        <div className="grid grid-cols-[1fr_100px_80px_120px_110px_60px] border-b border-border bg-surface-2 px-4 py-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          <span>Session</span><span>Tokens</span><span>Cost</span><span>Model</span><span>Provider</span><span>Reqs</span>
        </div>
        {sessions.map((session, index) => (
          <div key={session.session} className={index > 0 ? "grid grid-cols-[1fr_100px_80px_120px_110px_60px] items-center border-t border-border px-4 py-3 transition-colors hover:bg-surface-2" : "grid grid-cols-[1fr_100px_80px_120px_110px_60px] items-center px-4 py-3 transition-colors hover:bg-surface-2"}>
            <span className="truncate text-[13px] text-foreground">{session.session}</span>
            <span className="font-mono text-[12px] text-foreground">{(session.tokens / 1000).toFixed(1)}k</span>
            <span className="font-mono text-[12px] text-foreground">${session.cost.toFixed(2)}</span>
            <span className="truncate font-mono text-[11px] text-muted-foreground">{session.model}</span>
            <span className="text-[11px] text-muted-foreground">{session.provider}</span>
            <span className="font-mono text-[12px] text-muted-foreground">{session.requests}</span>
          </div>
        ))}
      </div>

      <SurfacePanel>
        <SectionHeading className="mb-4">Tokens by Session</SectionHeading>
        <div className="h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={sessions} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickFormatter={(value: number) => `${(value / 1000).toFixed(0)}k`} />
              <YAxis dataKey="session" type="category" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} width={140} />
              <Tooltip content={customTooltip} />
              <Bar dataKey="tokens" fill="hsl(var(--primary))" radius={[0, 3, 3, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </SurfacePanel>
    </div>
  );
}
