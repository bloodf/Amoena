import type { ElementType, ReactNode } from "react";
import { cn } from "@/lib/utils";

type HeadingTag = "h2" | "h3" | "h4";
type PillTone = "primary" | "success" | "warning" | "danger" | "muted" | "purple" | "neutral" | "info";

const pillToneClasses: Record<PillTone, string> = {
  primary: "bg-primary/20 text-primary",
  success: "bg-green/20 text-green",
  warning: "bg-warning/20 text-warning",
  danger: "bg-destructive/20 text-destructive",
  muted: "bg-surface-3 text-muted-foreground",
  purple: "bg-purple/20 text-purple",
  neutral: "bg-surface-2 text-foreground",
  info: "bg-blue-500/20 text-blue-500",
};

export function SectionHeading({
  children,
  className,
  as: Component = "h3",
}: {
  children: ReactNode;
  className?: string;
  as?: HeadingTag;
}) {
  return (
    <Component className={cn("text-[11px] font-medium uppercase tracking-wider text-muted-foreground", className)}>
      {children}
    </Component>
  );
}

export function SurfacePanel({
  children,
  className,
  padding = "p-4",
  as: Component = "div",
}: {
  children?: ReactNode;
  className?: string;
  padding?: string;
  as?: ElementType;
}) {
  return <Component className={cn("rounded border border-border bg-surface-1", padding, className)}>{children}</Component>;
}

export function StatusPill({
  label,
  tone = "muted",
  className,
}: {
  label: ReactNode;
  tone?: PillTone;
  className?: string;
}) {
  return <span className={cn("rounded px-1.5 py-0.5 font-mono text-[9px]", pillToneClasses[tone], className)}>{label}</span>;
}

export function MetricCard({
  label,
  value,
  subtext,
  trend,
  trendUp,
  icon: Icon,
  className,
}: {
  label: string;
  value: ReactNode;
  subtext?: ReactNode;
  trend?: ReactNode;
  trendUp?: boolean;
  icon?: ElementType;
  className?: string;
}) {
  return (
    <SurfacePanel className={cn("flex flex-col gap-1", className)}>
      <div className="flex items-center justify-between">
        <SectionHeading as="h4">{label}</SectionHeading>
        {Icon ? <Icon size={13} className="text-muted-foreground" /> : null}
      </div>
      <div className="font-mono text-xl font-semibold text-foreground">{value}</div>
      {(trend || subtext) ? (
        <div className="flex items-center gap-2">
          {trend ? (
            <span className={cn("font-mono text-[10px]", trendUp === undefined ? "text-muted-foreground" : trendUp ? "text-green" : "text-destructive")}>
              {trend}
            </span>
          ) : null}
          {subtext ? <span className="text-[10px] text-muted-foreground">{subtext}</span> : null}
        </div>
      ) : null}
    </SurfacePanel>
  );
}

export function LabeledValueRow({
  label,
  value,
  className,
}: {
  label: ReactNode;
  value: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center justify-between text-[12px]", className)}>
      <span className="text-muted-foreground">{label}</span>
      <span className="text-foreground">{value}</span>
    </div>
  );
}
