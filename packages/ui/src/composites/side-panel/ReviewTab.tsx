import { useState } from "react";
import { File, AlertTriangle, Check, X, GitMerge, Diff } from "lucide-react";
import { cn } from "@/lib/utils";

type DiffMode = "unified" | "split";

interface ChangedFile {
  path: string;
  added: number;
  removed: number;
  status: "pending" | "approved" | "rejected";
  hasConflict?: boolean;
}

const changedFiles: ChangedFile[] = [
  { path: "src/auth/tokens.rs", added: 42, removed: 8, status: "pending" },
  { path: "src/auth/rate_limit.rs", added: 38, removed: 0, status: "pending" },
  { path: "src/auth/middleware.rs", added: 18, removed: 22, status: "pending" },
  { path: "src/auth/session_store.rs", added: 0, removed: 45, status: "pending", hasConflict: true },
];

export function ReviewTab() {
  const [files, setFiles] = useState(changedFiles);
  const [diffMode, setDiffMode] = useState<DiffMode>("unified");

  const totalAdded = files.reduce((s, f) => s + f.added, 0);
  const totalRemoved = files.reduce((s, f) => s + f.removed, 0);
  const pendingCount = files.filter(f => f.status === "pending").length;
  const hasConflicts = files.some(f => f.hasConflict);
  const allReviewed = pendingCount === 0;

  const updateFile = (path: string, status: "approved" | "rejected") => {
    setFiles(prev => prev.map(f => f.path === path ? { ...f, status } : f));
  };

  const applyAll = () => setFiles(prev => prev.map(f => ({ ...f, status: "approved" as const })));
  const rejectAll = () => setFiles(prev => prev.map(f => ({ ...f, status: "rejected" as const })));

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="p-3 border-b border-border flex-shrink-0 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
            Pending Changes
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setDiffMode(diffMode === "unified" ? "split" : "unified")}
              className="p-1 text-muted-foreground hover:text-foreground rounded hover:bg-surface-2 transition-colors"
              title="Toggle diff mode"
            >
              <Diff size={11} />
            </button>
          </div>
        </div>

        {/* Summary */}
        <div className="flex items-center gap-3 text-[10px] font-mono">
          <span className="text-foreground">{files.length} files</span>
          <span className="text-green">+{totalAdded}</span>
          <span className="text-destructive">-{totalRemoved}</span>
          {pendingCount > 0 && <span className="text-warning">{pendingCount} pending</span>}
        </div>

        {/* Conflict banner */}
        {hasConflicts && (
          <div className="flex items-center gap-1.5 px-2 py-1.5 rounded bg-destructive/10 border border-destructive/30">
            <AlertTriangle size={11} className="text-destructive" />
            <span className="text-[10px] text-destructive">Conflicts detected — resolve before applying</span>
          </div>
        )}

        {/* Bulk actions */}
        <div className="flex gap-1">
          <button onClick={applyAll} className="flex-1 text-[10px] px-2 py-1.5 rounded bg-success/20 text-success hover:bg-success/30 transition-colors font-medium">
            <Check size={10} className="inline mr-1" />Apply All
          </button>
          <button onClick={rejectAll} className="flex-1 text-[10px] px-2 py-1.5 rounded border border-destructive/40 text-destructive hover:bg-destructive/10 transition-colors font-medium">
            <X size={10} className="inline mr-1" />Reject All
          </button>
        </div>
      </div>

      {/* File list */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {files.map((f) => (
          <div key={f.path} className={cn(
            "flex items-center justify-between py-1.5 px-2 rounded border transition-colors",
            f.status === "approved" ? "bg-success/5 border-success/30" :
            f.status === "rejected" ? "bg-destructive/5 border-destructive/30 opacity-60" :
            f.hasConflict ? "bg-destructive/5 border-destructive/30" :
            "bg-surface-1 border-border"
          )}>
            <div className="flex items-center gap-2 flex-1 min-w-0">
              {f.hasConflict ? (
                <AlertTriangle size={12} className="text-destructive flex-shrink-0" />
              ) : (
                <File size={12} className="text-muted-foreground flex-shrink-0" />
              )}
              <span className="text-[12px] font-mono text-foreground truncate">{f.path.split('/').pop()}</span>
              <span className="text-[10px] font-mono text-green">+{f.added}</span>
              <span className="text-[10px] font-mono text-destructive">-{f.removed}</span>
            </div>
            <div className="flex gap-0.5 flex-shrink-0">
              {f.status === "pending" ? (
                <>
                  <button onClick={() => updateFile(f.path, "approved")} className="p-1 text-success hover:bg-success/10 rounded transition-colors" title="Approve">
                    <Check size={11} />
                  </button>
                  <button onClick={() => updateFile(f.path, "rejected")} className="p-1 text-destructive hover:bg-destructive/10 rounded transition-colors" title="Reject">
                    <X size={11} />
                  </button>
                </>
              ) : (
                <span className={cn("text-[9px] font-mono px-1.5 py-0.5 rounded",
                  f.status === "approved" ? "text-success bg-success/20" : "text-destructive bg-destructive/20"
                )}>{f.status}</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Apply-back readiness */}
      <div className="p-3 border-t border-border flex-shrink-0">
        {hasConflicts ? (
          <button disabled className="w-full flex items-center justify-center gap-1.5 py-2 text-[12px] font-medium rounded bg-surface-3 text-muted-foreground cursor-not-allowed">
            <AlertTriangle size={12} />
            Resolve Conflicts First
          </button>
        ) : allReviewed ? (
          <button className="w-full flex items-center justify-center gap-1.5 py-2 text-[12px] font-medium rounded bg-success text-success-foreground hover:bg-success/90 transition-colors">
            <GitMerge size={12} />
            Apply Back to Branch
          </button>
        ) : (
          <button disabled className="w-full flex items-center justify-center gap-1.5 py-2 text-[12px] font-medium rounded bg-surface-3 text-muted-foreground cursor-not-allowed">
            Review {pendingCount} remaining files
          </button>
        )}
      </div>
    </div>
  );
}
