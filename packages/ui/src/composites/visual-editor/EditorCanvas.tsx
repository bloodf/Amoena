import { MousePointer } from "lucide-react";

export function EditorCanvas({
  selectedComponent,
  activeTool,
  activeViewport,
  viewMode,
  code,
}: {
  selectedComponent: string;
  activeTool: string;
  activeViewport: string;
  viewMode: "preview" | "code";
  code: string;
}) {
  return (
    <div className="relative flex flex-1 items-center justify-center overflow-auto bg-surface-0">
      {viewMode === "preview" ? (
        <>
          <div className="text-center">
            <MousePointer size={24} className="mx-auto mb-3 text-muted-foreground" />
            <p className="text-[13px] text-muted-foreground">Click elements to select and edit</p>
            <p className="mt-1 text-[11px] text-muted-foreground">
              Active: <span className="font-mono text-primary">{selectedComponent}</span> · Tool: <span className="text-foreground">{activeTool}</span> · Viewport: <span className="text-foreground">{activeViewport}</span>
            </p>
          </div>
          <div className="pointer-events-none absolute bottom-20 left-20 right-20 top-20 rounded border-2 border-primary/30">
            <div className="absolute left-0 -top-5 rounded bg-primary px-2 py-0.5 text-[10px] text-primary-foreground">{selectedComponent}</div>
            <div className="absolute -left-1 -top-1 h-2 w-2 rounded-full bg-primary" />
            <div className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-primary" />
            <div className="absolute -left-1 -bottom-1 h-2 w-2 rounded-full bg-primary" />
            <div className="absolute -right-1 -bottom-1 h-2 w-2 rounded-full bg-primary" />
          </div>
        </>
      ) : (
        <div className="h-full w-full overflow-auto p-4">
          <pre className="text-[12px] leading-relaxed text-foreground">
            <code>{code}</code>
          </pre>
        </div>
      )}
    </div>
  );
}
