import { cn } from '../../lib/utils.ts';

interface WorkspaceResizeHandleProps {
  orientation: "horizontal" | "vertical";
  onResizeStart: (event: React.MouseEvent) => void;
}

export function WorkspaceResizeHandle({ orientation, onResizeStart }: WorkspaceResizeHandleProps) {
  return (
    <div
      className={cn(
        orientation === "horizontal"
          ? "h-[1px] bg-border hover:bg-primary cursor-row-resize transition-colors"
          : "w-[1px] bg-border hover:bg-primary cursor-col-resize transition-colors flex-shrink-0",
      )}
      onMouseDown={onResizeStart}
    />
  );
}
