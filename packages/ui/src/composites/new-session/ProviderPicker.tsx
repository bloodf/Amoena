import { cn } from "@/lib/utils";
import type { ProviderOption } from "./types";

interface ProviderPickerProps {
  providers: ProviderOption[];
  selectedProvider: string;
  onSelect: (providerId: string) => void;
}

export function ProviderPicker({ providers, selectedProvider, onSelect }: ProviderPickerProps) {
  const colorClasses: Record<string, string> = {
    primary: "text-primary border-primary/30 bg-primary/10",
    orange: "text-orange-400 border-orange-400/30 bg-orange-400/10",
    emerald: "text-emerald-400 border-emerald-400/30 bg-emerald-400/10",
    blue: "text-blue-400 border-blue-400/30 bg-blue-400/10",
    purple: "text-purple-400 border-purple-400/30 bg-purple-400/10",
    neutral: "text-muted-foreground border-border bg-surface-2",
  };

  return (
    <div className="grid grid-cols-2 gap-2">
      {providers.map((provider) => {
        const Icon = provider.icon;
        const isSelected = selectedProvider === provider.id;
        const colorClass = colorClasses[provider.color] ?? "text-muted-foreground border-border bg-surface-2";
        const parts = colorClass.split(" ");
        return (
          <button
            key={provider.id}
            onClick={() => onSelect(provider.id)}
            className={cn(
              "flex items-start gap-3 rounded-lg border p-3 text-left transition-all",
              isSelected ? cn("border-2", colorClass) : "border-border text-muted-foreground hover:border-primary/30 hover:bg-surface-2",
            )}
          >
            <div
              className={cn(
                "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg",
                isSelected ? parts[2] ?? "bg-surface-2" : "bg-surface-2",
              )}
            >
              <Icon size={18} className={isSelected ? parts[0] ?? "text-muted-foreground" : "text-muted-foreground"} />
            </div>
            <div className="min-w-0 flex-1">
              <span className={cn("block text-[12px] font-medium", isSelected ? "text-foreground" : "")}>{provider.label}</span>
              <span className="line-clamp-1 text-[10px] text-muted-foreground">{provider.desc}</span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
