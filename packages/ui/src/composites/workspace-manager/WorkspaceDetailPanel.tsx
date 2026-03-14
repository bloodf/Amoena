import { AlertTriangle, Check, GitBranch, GitMerge, Link2, RefreshCw, Trash2 } from "lucide-react";
import { Button } from "@/primitives/button";
import { LabeledValueRow, SectionHeading, SurfacePanel } from "@/components/patterns";
import { ScreenActions, ScreenHeader, ScreenHeaderCopy, ScreenTitle } from "@/components/screen";
import { StatusPill } from "@/components/patterns";
import { workspaceHealthConfig } from "./data";
import type { WorkspaceRecord } from "./types";

export function WorkspaceDetailPanel({
  workspace,
  confirmDelete,
  onRecover,
  onAskDelete,
  onCancelDelete,
  onConfirmDelete,
  onOpenSession,
  onReviewConflicts,
  onApplyBack,
}: {
  workspace: WorkspaceRecord;
  confirmDelete: boolean;
  onRecover: () => void;
  onAskDelete: () => void;
  onCancelDelete: () => void;
  onConfirmDelete: () => void;
  onOpenSession: (session: string) => void;
  onReviewConflicts: () => void;
  onApplyBack: () => void;
}) {
  const health = workspaceHealthConfig[workspace.health];
  const totalAdded = workspace.files.reduce((sum, file) => sum + file.added, 0);
  const totalRemoved = workspace.files.reduce((sum, file) => sum + file.removed, 0);

  return (
    <div className="space-y-6">
      <ScreenHeader>
        <ScreenHeaderCopy>
          <ScreenTitle>{workspace.name}</ScreenTitle>
          <StatusPill label={health.label} className={`mt-1 inline-flex text-[10px] ${health.color} ${health.bgColor}`} />
        </ScreenHeaderCopy>
        <ScreenActions>
          {workspace.health === "orphaned" ? (
            <Button onClick={onRecover} variant="outline" size="sm" className="h-8 gap-1.5 text-[11px] text-warning">
              <RefreshCw size={12} /> Recover
            </Button>
          ) : null}
          {confirmDelete ? (
            <>
              <Button onClick={onConfirmDelete} variant="destructive" size="sm" className="h-8 gap-1 text-[11px]">
                <Check size={10} /> Confirm Delete
              </Button>
              <Button onClick={onCancelDelete} variant="ghost" size="sm" className="h-8 text-[11px] text-muted-foreground">
                Cancel
              </Button>
            </>
          ) : (
            <Button onClick={onAskDelete} variant="outline" size="sm" className="h-8 gap-1.5 border-destructive/40 text-[11px] text-destructive">
              <Trash2 size={12} /> Delete
            </Button>
          )}
        </ScreenActions>
      </ScreenHeader>

      <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-[12px]">
        <LabeledValueRow label="Source Branch" value={<span className="font-mono">{workspace.source}</span>} />
        <LabeledValueRow label="Target Branch" value={<span className="font-mono">{workspace.branch}</span>} />
        <LabeledValueRow label="Created" value={workspace.created} />
        <LabeledValueRow label="Disk" value={<span className="font-mono">{workspace.disk}</span>} />
      </div>

      {workspace.linkedSessions.length ? (
        <div>
          <SectionHeading className="mb-2">Linked Sessions</SectionHeading>
          <div className="flex flex-wrap gap-2">
            {workspace.linkedSessions.map((session) => (
              <Button key={session} onClick={() => onOpenSession(session)} variant="outline" size="sm" className="h-7 gap-1 text-[11px] font-mono">
                <Link2 size={10} className="text-muted-foreground" />
                {session}
              </Button>
            ))}
          </div>
        </div>
      ) : null}

      {workspace.pending ? (
        <SurfacePanel className={workspace.conflicts ? "border-destructive/40 bg-destructive/5" : "border-success/40 bg-success/5"} padding="p-4">
          <div className="mb-2 flex items-center gap-2">
            <GitMerge size={14} className={workspace.conflicts ? "text-destructive" : "text-success"} />
            <span className="text-[13px] font-medium text-foreground">Merge Review</span>
          </div>
          <div className="mb-3 flex items-center gap-4 text-[12px]">
            <span className="font-mono text-muted-foreground">{workspace.branch}</span>
            <span className="text-muted-foreground">→</span>
            <span className="font-mono text-muted-foreground">{workspace.source}</span>
            <span className="font-mono text-green">+{totalAdded}</span>
            <span className="font-mono text-destructive">-{totalRemoved}</span>
            <span className="text-muted-foreground">{workspace.files.length} files</span>
          </div>
          {workspace.conflicts ? (
            <div>
              <div className="mb-2 flex items-center gap-2 text-destructive">
                <AlertTriangle size={14} />
                <span className="text-[13px] font-medium">Conflicts Detected</span>
              </div>
              <p className="mb-3 text-[11px] text-muted-foreground">Resolve conflicts before applying changes back.</p>
              <Button onClick={onReviewConflicts} variant="outline" size="sm" className="h-8 border-destructive text-[12px] text-destructive">
                Review Conflicts
              </Button>
            </div>
          ) : (
            <Button onClick={onApplyBack} size="sm" className="h-8 gap-2 bg-success text-[12px] text-success-foreground hover:bg-success/90">
              <Check size={14} /> Review & Apply Back
            </Button>
          )}
        </SurfacePanel>
      ) : null}

      {workspace.files.length ? (
        <div>
          <SectionHeading className="mb-2">Changed Files ({workspace.files.length})</SectionHeading>
          <div className="overflow-hidden rounded border border-border">
            {workspace.files.map((file, index) => (
              <div key={file.name} className={`flex items-center px-3 py-2 transition-colors hover:bg-surface-2 ${index > 0 ? "border-t border-border" : ""}`}>
                <span className="flex-1 font-mono text-[12px] text-foreground">{file.name}</span>
                <span className="mr-2 font-mono text-[10px] text-green">+{file.added}</span>
                <span className="font-mono text-[10px] text-destructive">-{file.removed}</span>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {!workspace.pending && workspace.files.length === 0 ? (
        <SurfacePanel className="flex flex-col items-center justify-center py-12 text-center">
          <GitBranch size={24} className="mb-2 text-muted-foreground" />
          <div className="text-[13px] text-muted-foreground">No pending changes</div>
          <div className="mt-1 text-[11px] text-muted-foreground">This workspace is up to date with {workspace.source}</div>
        </SurfacePanel>
      ) : null}
    </div>
  );
}
