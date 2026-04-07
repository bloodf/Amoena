import type { ReactNode } from "react";
import { Search, X } from "lucide-react";
import { cn } from '../lib/utils.ts';
import { Button } from '../primitives/button.tsx';
import { Input } from '../primitives/input.tsx';

export function SearchField({
  value,
  onChange,
  placeholder,
  onClear,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  onClear?: () => void;
  className?: string;
}) {
  return (
    <div className={cn("relative flex-1", className)}>
      <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
      <Input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="pl-9 pr-9" />
      {value && onClear ? (
        <button onClick={onClear} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground">
          <X size={13} />
        </button>
      ) : null}
    </div>
  );
}

export function ToolbarGroup({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("flex items-center gap-3", className)}>{children}</div>;
}

export function FilterGroup({ label, children, className }: { label: ReactNode; children: ReactNode; className?: string }) {
  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <span className="text-[11px] text-muted-foreground">{label}</span>
      {children}
    </div>
  );
}

export function CompactSelect({
  value,
  onChange,
  children,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
  className?: string;
}) {
  return (
    <select value={value} onChange={(event) => onChange(event.target.value)} className={cn("rounded border border-border bg-surface-2 px-2 py-1 text-[11px] text-foreground", className)}>
      {children}
    </select>
  );
}

export function ViewModeToggle({
  options,
  value,
  onChange,
  className,
}: {
  options: { id: string; icon: ReactNode; label: string }[];
  value: string;
  onChange: (id: string) => void;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-1 rounded-lg border border-border bg-surface-2 p-0.5", className)}>
      {options.map((option) => (
        <Button
          key={option.id}
          variant={value === option.id ? "secondary" : "ghost"}
          size="icon"
          className={cn("h-8 w-8", value === option.id ? "shadow-sm" : "text-muted-foreground hover:text-foreground")}
          onClick={() => onChange(option.id)}
          title={option.label}
        >
          {option.icon}
        </Button>
      ))}
    </div>
  );
}
