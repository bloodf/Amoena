import { Circle, Cpu } from "lucide-react";
import { cn } from '../../lib/utils.ts';
import type { HomeProviderHealth } from "./types";

export function HomeSystemHealthPanel({
  providers,
  onOpenProvider,
}: {
  providers: HomeProviderHealth[];
  onOpenProvider: (provider: HomeProviderHealth) => void;
}) {
  return (
    <section>
      <h2 className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-3">System Health</h2>
      <div className="space-y-2 border border-border rounded p-3">
        {providers.map((provider) => (
          <button
            key={provider.name}
            onClick={() => onOpenProvider(provider)}
            className="flex items-center gap-2 w-full py-1 hover:bg-surface-2 rounded px-1 transition-colors"
          >
            <Circle
              size={7}
              className={cn(
                "fill-current",
                provider.status === "connected" && "text-green",
                provider.status === "error" && "text-destructive",
                provider.status === "disconnected" && "text-muted-foreground",
              )}
            />
            <span className="text-[12px] text-foreground flex-1 text-left">{provider.name}</span>
            <span
              className={cn(
                "text-[10px] capitalize",
                provider.status === "connected" && "text-green",
                provider.status === "error" && "text-destructive",
                provider.status === "disconnected" && "text-muted-foreground",
              )}
            >
              {provider.status}
            </span>
          </button>
        ))}
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground font-mono pt-1 border-t border-border mt-1">
          <Cpu size={12} />
          <span>5.1 GB used</span>
        </div>
      </div>
    </section>
  );
}
