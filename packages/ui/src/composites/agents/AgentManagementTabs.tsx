import { UsersRound } from "lucide-react";

import { cn } from "@/lib/utils";

export function AgentManagementTabs({
  activeTab,
  onChange,
}: {
  activeTab: "agents" | "teams";
  onChange: (tab: "agents" | "teams") => void;
}) {
  return (
    <div className="flex flex-shrink-0 items-center gap-0 border-b border-border">
      <button
        onClick={() => onChange("agents")}
        className={cn(
          "border-b-2 px-4 py-2.5 text-[13px] font-medium transition-colors",
          activeTab === "agents" ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground",
        )}
      >
        Agents
      </button>
      <button
        onClick={() => onChange("teams")}
        className={cn(
          "flex items-center gap-1.5 border-b-2 px-4 py-2.5 text-[13px] font-medium transition-colors",
          activeTab === "teams" ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground",
        )}
      >
        <UsersRound size={14} />
        Teams
      </button>
    </div>
  );
}
