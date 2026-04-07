import { Circle, GitBranch, Plus } from 'lucide-react';
import { Button } from '../../primitives/button.tsx';
import { ScreenNavButton, ScreenSidebar } from '../../components/screen.tsx';
import { StatusPill } from '../../components/patterns.tsx';
import { cn } from '../../lib/utils.ts';
import { workspaceHealthConfig } from './data';
import type { WorkspaceRecord } from './types';

export function WorkspaceListPane({
  workspaces,
  selected,
  onSelect,
  onCreate,
}: {
  workspaces: WorkspaceRecord[];
  selected: string;
  onSelect: (name: string) => void;
  onCreate: () => void;
}) {
  return (
    <ScreenSidebar className="w-[280px] p-0">
      <div className="flex items-center justify-between p-3">
        <span className="flex-1 px-3 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          Workspaces
        </span>
        <Button
          onClick={onCreate}
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground"
        >
          <Plus size={13} />
        </Button>
      </div>
      {workspaces.map((workspace) => {
        const health = workspaceHealthConfig[workspace.health];
        return (
          <ScreenNavButton
            key={workspace.name}
            active={selected === workspace.name}
            onClick={() => onSelect(workspace.name)}
            className="w-full rounded-none border-b border-border px-3 py-3 justify-start"
          >
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <div className="flex items-center gap-2">
                <GitBranch size={13} className="text-muted-foreground" />
                <span className="flex-1 truncate text-[13px] text-foreground">
                  {workspace.name}
                </span>
                <StatusPill
                  label={health.label}
                  className={cn('text-[9px]', health.color, health.bgColor)}
                />
              </div>
              <div className="ml-5 flex items-center gap-3">
                <span className="font-mono text-[10px] text-muted-foreground">
                  {workspace.branch}
                </span>
                <span className="text-[10px] text-muted-foreground">{workspace.disk}</span>
                {workspace.pending ? (
                  <Circle
                    size={5}
                    className={cn(
                      'fill-current',
                      workspace.conflicts ? 'text-destructive' : 'text-warning',
                    )}
                  />
                ) : null}
              </div>
            </div>
          </ScreenNavButton>
        );
      })}
    </ScreenSidebar>
  );
}
