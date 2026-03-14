import { useEffect, useState } from "react";
import { AlertTriangle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

export function SettingsRow({
  label,
  description,
  children,
}: {
  label: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between border-b border-border py-3 last:border-0">
      <div className="mr-4 min-w-0 flex-1">
        <div className="text-[13px] text-foreground">{label}</div>
        {description ? <div className="mt-0.5 text-[11px] text-muted-foreground">{description}</div> : null}
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  );
}

export function SettingsToggle({
  on = false,
  onChange,
}: {
  on?: boolean;
  onChange?: (next: boolean) => void;
}) {
  const [enabled, setEnabled] = useState(on);

  useEffect(() => {
    setEnabled(on);
  }, [on]);

  return (
    <button
      onClick={() => {
        const next = !enabled;
        setEnabled(next);
        onChange?.(next);
      }}
      className={cn("relative h-5 w-10 rounded-full transition-colors", enabled ? "bg-primary" : "bg-surface-3")}
    >
      <span className={cn("absolute top-0.5 h-4 w-4 rounded-full bg-primary-foreground transition-transform", enabled ? "right-0.5" : "left-0.5")} />
    </button>
  );
}

export function SettingsSelect({
  options,
  defaultValue,
}: {
  options: string[];
  defaultValue?: string;
}) {
  return (
    <select defaultValue={defaultValue} className="rounded border border-border bg-surface-2 px-2 py-1 text-[12px] text-foreground">
      {options.map((option) => (
        <option key={option}>{option}</option>
      ))}
    </select>
  );
}

export function SettingsNumberInput({
  defaultValue,
  min,
  max,
  width = "w-16",
}: {
  defaultValue: number;
  min?: number;
  max?: number;
  width?: string;
}) {
  return (
    <input
      type="number"
      defaultValue={defaultValue}
      min={min}
      max={max}
      className={cn(width, "rounded border border-border bg-surface-2 px-2 py-1 text-right font-mono text-[12px] text-foreground")}
    />
  );
}

export function SettingsSectionTitle({ title }: { title: string }) {
  return <h3 className="mb-2 mt-6 text-[11px] font-medium uppercase tracking-wider text-muted-foreground first:mt-0">{title}</h3>;
}

export function SettingsInfoBanner({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-4 flex items-start gap-2 rounded border border-primary/20 bg-primary/5 p-3">
      <Info size={13} className="mt-0.5 flex-shrink-0 text-primary" />
      <span className="text-[11px] text-muted-foreground">{children}</span>
    </div>
  );
}

export function SettingsWarningBanner({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-4 flex items-start gap-2 rounded border border-warning/20 bg-warning/5 p-3">
      <AlertTriangle size={13} className="mt-0.5 flex-shrink-0 text-warning" />
      <span className="text-[11px] text-muted-foreground">{children}</span>
    </div>
  );
}
