import { cn } from "@/lib/utils";

interface UsageTabsProps<T extends string> {
  tabs: { id: T; label: string }[];
  activeTab: T;
  onChange: (tab: T) => void;
}

export function UsageTabs<T extends string>({ tabs, activeTab, onChange }: UsageTabsProps<T>) {
  return (
    <div className="flex items-center gap-0.5 border-b border-border">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            "border-b-2 px-4 py-2 text-[12px] font-medium transition-colors",
            activeTab === tab.id ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground",
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
