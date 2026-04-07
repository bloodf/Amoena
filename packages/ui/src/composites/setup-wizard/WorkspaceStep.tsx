import { Button } from '../../primitives/button.tsx';
import { Input } from '../../primitives/input.tsx';
import { SurfacePanel } from '../../components/patterns.tsx';

export function SetupWizardWorkspaceStep({
  workspacePath,
  onWorkspacePathChange,
  onBrowse,
}: {
  workspacePath: string;
  onWorkspacePathChange: (value: string) => void;
  onBrowse: () => void;
}) {
  return (
    <div className="space-y-6">
      <div className="mb-6 text-center">
        <h2 className="mb-1 text-lg font-semibold text-foreground">Select Workspace</h2>
        <p className="text-sm text-muted-foreground">Choose a directory for your first workspace.</p>
      </div>
      <div>
        <label className="mb-1.5 block text-[12px] font-medium text-muted-foreground">Workspace Path</label>
        <div className="flex gap-2">
          <Input value={workspacePath} onChange={(event) => onWorkspacePathChange(event.target.value)} className="flex-1 font-mono text-[13px]" />
          <Button onClick={onBrowse} variant="outline" className="text-[12px]">
            Browse
          </Button>
        </div>
      </div>
      <SurfacePanel className="space-y-1" padding="p-3">
        <div className="mb-1 font-mono text-[12px] text-foreground">{workspacePath}</div>
        <div className="text-[11px] text-muted-foreground">New workspace will be initialized here.</div>
      </SurfacePanel>
    </div>
  );
}
