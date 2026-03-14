import { Search, X } from "lucide-react";

import { cn } from "@/lib/utils";

import { Input } from "@/primitives/input";

export function SearchField({
  value,
  onChange,
  placeholder = "Search…",
  onClear,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onClear?: () => void;
  className?: string;
}) {
  return (
    <div className={cn("relative", className)}>
      <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="pl-9 pr-9 text-[13px]"
      />
      {value ? (
        <button
          type="button"
          onClick={onClear ?? (() => onChange(""))}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
          aria-label="Clear search"
        >
          <X size={13} />
        </button>
      ) : null}
    </div>
  );
}
