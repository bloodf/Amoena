import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { ProviderLogo } from "../shared/ProviderLogo";

export function FeaturedProviderCard({
  provider,
  onSelect,
}: {
  provider: { id: string; label: string; desc: string; models: readonly string[] };
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className={cn(
        "group relative flex w-full items-center gap-5 rounded-xl border-2 bg-gradient-to-r from-primary/5 to-transparent p-6 text-left transition-all",
        "border-primary/30 hover:border-primary hover:bg-primary/5",
      )}
    >
      <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-primary/10">
        <ProviderLogo provider="lunaria" size={36} />
      </div>
      <div className="min-w-0 flex-1 space-y-1.5">
        <div className="flex items-center gap-2">
          <span className="text-[16px] font-bold text-foreground">{provider.label}</span>
          <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">Built-in</span>
        </div>
        <span className="block text-[13px] text-muted-foreground">{provider.desc}</span>
        <div className="mt-1 flex gap-2">
          {provider.models.map((model) => (
            <span key={model} className="rounded border border-border bg-surface-2 px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
              {model}
            </span>
          ))}
        </div>
      </div>
      <ChevronRight size={18} className="flex-shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
    </button>
  );
}

export function ExternalProviderCard({
  provider,
  onSelect,
}: {
  provider: { id: string; label: string; desc: string; models: readonly string[] };
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className={cn(
        "group relative flex flex-col items-start gap-4 rounded-xl border-2 p-5 text-left transition-all hover:scale-[1.01]",
        "border-border hover:border-primary/40 hover:bg-surface-1",
      )}
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-surface-2">
        <ProviderLogo provider={provider.id} size={28} />
      </div>
      <div className="space-y-1">
        <span className="block text-[15px] font-semibold text-foreground">{provider.label}</span>
        <span className="text-[12px] leading-relaxed text-muted-foreground">{provider.desc}</span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {provider.models.map((model) => (
          <span key={model} className="rounded border border-border bg-surface-2 px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
            {model}
          </span>
        ))}
      </div>
      <ChevronRight size={16} className="absolute right-5 top-5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
    </button>
  );
}
