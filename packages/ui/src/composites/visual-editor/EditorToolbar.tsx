import { Code, Eye, RotateCcw, ZoomIn, ZoomOut } from "lucide-react";
import { Button } from "@/primitives/button";
import { cn } from "@/lib/utils";

export function EditorToolbar({
  tools,
  activeTool,
  onSelectTool,
  viewports,
  activeViewport,
  onSelectViewport,
  zoom,
  onZoomOut,
  onZoomIn,
  onResetZoom,
  viewMode,
  onViewModeChange,
}: {
  tools: readonly { id: string; label: string; icon: any }[];
  activeTool: string;
  onSelectTool: (id: string) => void;
  viewports: readonly { id: string; label: string; icon: any; width: string }[];
  activeViewport: string;
  onSelectViewport: (id: string) => void;
  zoom: number;
  onZoomOut: () => void;
  onZoomIn: () => void;
  onResetZoom: () => void;
  viewMode: "preview" | "code";
  onViewModeChange: (mode: "preview" | "code") => void;
}) {
  return (
    <div className="flex h-9 flex-shrink-0 items-center gap-1 border-b border-border bg-surface-0 px-2">
      {tools.map((tool) => (
        <Button key={tool.id} onClick={() => onSelectTool(tool.id)} variant="ghost" size="icon" className={cn("h-7 w-7", activeTool === tool.id ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-surface-2 hover:text-foreground")} title={tool.label}>
          <tool.icon size={14} />
        </Button>
      ))}

      <div className="mx-1 h-5 w-px bg-border" />

      {viewports.map((viewport) => (
        <Button
          key={viewport.id}
          onClick={() => onSelectViewport(viewport.id)}
          variant="ghost"
          size="sm"
          className={cn("h-7 gap-1 px-2 font-mono text-[10px]", activeViewport === viewport.id ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-surface-2 hover:text-foreground")}
        >
          <viewport.icon size={12} />
          {viewport.width}
        </Button>
      ))}

      <div className="mx-1 h-5 w-px bg-border" />

      <Button onClick={onZoomOut} variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground">
        <ZoomOut size={13} />
      </Button>
      <span className="w-10 text-center font-mono text-[10px] text-muted-foreground">{zoom}%</span>
      <Button onClick={onZoomIn} variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground">
        <ZoomIn size={13} />
      </Button>
      <Button onClick={onResetZoom} variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" title="Reset zoom">
        <RotateCcw size={12} />
      </Button>

      <div className="flex-1" />

      <div className="flex items-center gap-0.5 rounded bg-surface-2 p-0.5">
        <Button onClick={() => onViewModeChange("preview")} variant={viewMode === "preview" ? "secondary" : "ghost"} size="sm" className="h-7 gap-1 px-2 text-[10px]">
          <Eye size={10} /> Preview
        </Button>
        <Button onClick={() => onViewModeChange("code")} variant={viewMode === "code" ? "secondary" : "ghost"} size="sm" className="h-7 gap-1 px-2 text-[10px]">
          <Code size={10} /> Code
        </Button>
      </div>
    </div>
  );
}
