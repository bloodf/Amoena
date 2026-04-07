import { Layers } from "lucide-react";
import { ScreenSidebar } from '../../components/screen.tsx';
import { cn } from '../../lib/utils.ts';

export function ComponentTreePane({
  nodes,
  selectedComponent,
  onSelect,
}: {
  nodes: readonly { name: string; depth: number; children: boolean }[];
  selectedComponent: string;
  onSelect: (name: string) => void;
}) {
  return (
    <ScreenSidebar className="w-[220px] p-0">
      <div className="flex items-center justify-between border-b border-border p-3">
        <h3 className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Component Tree</h3>
        <Layers size={12} className="text-muted-foreground" />
      </div>
      <div className="flex-1 overflow-y-auto py-1">
        {nodes.map((node, index) => (
          <button
            key={`${node.name}-${index}`}
            onClick={() => onSelect(node.name)}
            className={cn(
              "flex w-full items-center px-2 py-1.5 font-mono text-[12px] transition-colors hover:bg-surface-2",
              selectedComponent === node.name ? "bg-primary/5 text-primary" : "text-muted-foreground",
            )}
            style={{ paddingLeft: 8 + node.depth * 16 }}
          >
            {node.children ? <span className="mr-1 text-muted-foreground">▸</span> : <span className="mr-1 w-2" />}
            {node.name}
          </button>
        ))}
      </div>
    </ScreenSidebar>
  );
}
