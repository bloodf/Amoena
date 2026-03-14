import { FileCode } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TimelineChangedFile } from "./types";

export function ChangedFilesPanel({ files }: { files: TimelineChangedFile[] }) {
  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <div className="border-b border-border bg-surface-2 px-3 py-2">
        <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Changed Files</span>
      </div>
      {files.map((file) => (
        <div key={file.path} className="flex cursor-pointer items-center border-b border-border px-3 py-2 transition-colors last:border-0 hover:bg-surface-2">
          <FileCode size={12} className={cn("mr-2 flex-shrink-0", file.status === "added" ? "text-green" : "text-warning")} />
          <span className="flex-1 font-mono text-[12px] text-foreground">{file.path}</span>
          <span className="mr-2 font-mono text-[10px] text-green">+{file.additions}</span>
          {file.deletions > 0 ? <span className="font-mono text-[10px] text-destructive">-{file.deletions}</span> : null}
        </div>
      ))}
    </div>
  );
}
