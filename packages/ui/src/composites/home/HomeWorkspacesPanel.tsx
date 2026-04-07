import { Circle } from "lucide-react";
import { cn } from '../../lib/utils.ts';
import type { HomeWorkspaceItem } from "./types";

export function HomeWorkspacesPanel({
  workspaces,
  onViewAll,
  onOpenWorkspace,
}: {
  workspaces: HomeWorkspaceItem[];
  onViewAll: () => void;
  onOpenWorkspace: (workspace: HomeWorkspaceItem) => void;
}) {
  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Active Workspaces</h2>
        <button onClick={onViewAll} className="text-[11px] text-primary cursor-pointer hover:text-primary/80 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring transition-colors">
          View all →
        </button>
      </div>
      <div className="border border-border rounded overflow-hidden">
        <div className="grid grid-cols-[1fr_160px_80px_40px] px-3 py-1.5 text-[10px] font-mono text-muted-foreground uppercase tracking-wider border-b border-border bg-surface-2">
          <span>Name</span>
          <span>Branch</span>
          <span>Disk</span>
          <span />
        </div>
        {workspaces.map((workspace, index) => (
          <button
            key={`${workspace.name}-${workspace.branch}`}
            onClick={() => onOpenWorkspace(workspace)}
            className={cn(
              "grid grid-cols-[1fr_160px_80px_40px] items-center w-full px-3 py-2 text-left cursor-pointer hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring transition-colors",
              index > 0 && "border-t border-border",
            )}
          >
            <span className="text-[13px] text-foreground">{workspace.name}</span>
            <span className="text-[12px] font-mono text-muted-foreground">{workspace.branch}</span>
            <span className="text-[12px] font-mono text-muted-foreground">{workspace.disk}</span>
            {workspace.pending && <Circle size={7} className="fill-warning text-warning" />}
          </button>
        ))}
      </div>
    </section>
  );
}
