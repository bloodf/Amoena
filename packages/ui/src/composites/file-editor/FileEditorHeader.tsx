import { Edit, Save, X } from "lucide-react";
import { getFileIcon } from "../file-browser/utils";

export function FileEditorHeader({
  fileName,
  filePath,
  editMode,
  hasUnsaved,
  onEdit,
  onSave,
  onCancel,
}: {
  fileName: string;
  filePath: string;
  editMode: boolean;
  hasUnsaved: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="flex h-8 flex-shrink-0 items-center border-b border-border bg-surface-1 px-3">
      <div className="flex min-w-0 flex-1 items-center gap-1.5">
        {getFileIcon(fileName, 12)}
        <span className="truncate font-mono text-[11px] text-foreground">
          {fileName}
          {hasUnsaved ? " •" : ""}
        </span>
        <span className="ml-1 truncate font-mono text-[9px] text-muted-foreground">{filePath}</span>
      </div>
      <div className="flex flex-shrink-0 items-center gap-1">
        {!editMode ? (
          <button onClick={onEdit} className="flex items-center gap-1 rounded px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground">
            <Edit size={10} /> Edit
          </button>
        ) : (
          <>
            <button
              onClick={onSave}
              disabled={!hasUnsaved}
              className={`flex items-center gap-1 rounded px-1.5 py-0.5 font-mono text-[10px] transition-colors ${hasUnsaved ? "text-primary hover:bg-primary/10" : "cursor-not-allowed text-muted-foreground/50"}`}
            >
              <Save size={10} /> Save
            </button>
            <button onClick={onCancel} className="flex items-center gap-1 rounded px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground">
              <X size={10} />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
