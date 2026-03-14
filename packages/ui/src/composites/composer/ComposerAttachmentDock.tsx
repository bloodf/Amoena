import { File, Folder, X } from "lucide-react";
import type { ComposerAttachment } from "./types";

interface ComposerAttachmentDockProps {
  attachments: ComposerAttachment[];
  onRemove: (path: string) => void;
}

export function ComposerAttachmentDock({ attachments, onRemove }: ComposerAttachmentDockProps) {
  if (attachments.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 px-4 pt-2">
      {attachments.map((attachment) => (
        <div key={attachment.path} className="flex items-center gap-1.5 rounded border border-border bg-surface-2 px-2 py-1 font-mono text-[11px] text-muted-foreground">
          {attachment.type === "file" ? <File size={11} /> : <Folder size={11} />}
          <span className="text-foreground">{attachment.type === "folder" ? attachment.path : attachment.name}</span>
          {attachment.type === "folder" && attachment.itemCount ? <span className="text-muted-foreground">({attachment.itemCount} items)</span> : null}
          <button onClick={() => onRemove(attachment.path)} className="ml-0.5 text-muted-foreground hover:text-foreground">
            <X size={10} />
          </button>
        </div>
      ))}
    </div>
  );
}
