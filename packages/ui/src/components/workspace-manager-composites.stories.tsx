import type { Meta, StoryObj } from "@storybook/react-vite";
import { WorkspaceDetailPanel } from "@/composites/workspace-manager/WorkspaceDetailPanel";
import { WorkspaceListPane } from "@/composites/workspace-manager/WorkspaceListPane";
import { initialWorkspaceRecords } from "@/composites/workspace-manager/data";

const meta = {
  title: "Components/Workspace Manager",
} satisfies Meta;

export default meta;

export const ListPane: StoryObj = {
  render: () => (
    <div className="h-[420px] w-[280px] bg-background">
      <WorkspaceListPane workspaces={initialWorkspaceRecords} selected={initialWorkspaceRecords[0].name} onSelect={() => {}} onCreate={() => {}} />
    </div>
  ),
};

export const DetailPanel: StoryObj = {
  render: () => (
    <div className="max-w-[820px] bg-background p-6">
      <WorkspaceDetailPanel
        workspace={initialWorkspaceRecords[0]}
        confirmDelete={false}
        onRecover={() => {}}
        onAskDelete={() => {}}
        onCancelDelete={() => {}}
        onConfirmDelete={() => {}}
        onOpenSession={() => {}}
        onReviewConflicts={() => {}}
        onApplyBack={() => {}}
      />
    </div>
  ),
};
