import { useState } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { ScreenMain, ScreenRoot, ScreenSidebarLayout } from "@/components/screen";
import { initialWorkspaceRecords } from "@/composites/workspace-manager/data";
import { WorkspaceDetailPanel } from "@/composites/workspace-manager/WorkspaceDetailPanel";
import { WorkspaceListPane } from "@/composites/workspace-manager/WorkspaceListPane";
import type { WorkspaceHealth, WorkspaceRecord } from "@/composites/workspace-manager/types";

export function WorkspaceManagerScreen() {
  const [workspaces, setWorkspaces] = useState<WorkspaceRecord[]>(initialWorkspaceRecords);
  const [selected, setSelected] = useState(workspaces[0].name);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const navigate = useNavigate();

  const ws = workspaces.find(w => w.name === selected);
  if (!ws) return null;

  const handleDelete = (name: string) => {
    const next = workspaces.filter(w => w.name !== name);
    setWorkspaces(next);
    if (selected === name && next.length > 0) setSelected(next[0].name);
    setConfirmDelete(null);
    toast.success(`${name} deleted`);
  };

  const handleRecover = (name: string) => {
    setWorkspaces(prev => prev.map(w => w.name === name ? { ...w, health: "healthy" as WorkspaceHealth } : w));
    toast.success(`${name} recovered`);
  };

  const handleApplyBack = (name: string) => {
    setWorkspaces(prev => prev.map(w => w.name === name ? { ...w, pending: false, files: [] } : w));
    toast.success("Changes applied successfully");
  };

  const handleReviewConflicts = () => {
    toast("Opening conflict resolution view...");
  };

  return (
    <ScreenRoot className="overflow-hidden">
      <ScreenSidebarLayout>
        <WorkspaceListPane
          workspaces={workspaces}
          selected={selected}
          onSelect={setSelected}
          onCreate={() => toast("Create workspace from Settings → Workspace / Git")}
        />
        <ScreenMain className="overflow-y-auto p-6">
          <WorkspaceDetailPanel
            workspace={ws}
            confirmDelete={confirmDelete === ws.name}
            onRecover={() => handleRecover(ws.name)}
            onAskDelete={() => setConfirmDelete(ws.name)}
            onCancelDelete={() => setConfirmDelete(null)}
            onConfirmDelete={() => handleDelete(ws.name)}
            onOpenSession={() => navigate("/session")}
            onReviewConflicts={handleReviewConflicts}
            onApplyBack={() => handleApplyBack(ws.name)}
          />
        </ScreenMain>
      </ScreenSidebarLayout>
    </ScreenRoot>
  );
}
