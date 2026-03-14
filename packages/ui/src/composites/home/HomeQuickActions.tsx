import { GitBranch, MessageSquare, PlayCircle, Settings, Wand2 } from "lucide-react";

import { Button } from "@/primitives/button";

export function HomeQuickActions({
  onContinueSession,
  onOpenWorkspace,
  onStartAutopilot,
  onProviderSetup,
  onSetupWizard,
}: {
  onContinueSession: () => void;
  onOpenWorkspace: () => void;
  onStartAutopilot: () => void;
  onProviderSetup: () => void;
  onSetupWizard: () => void;
}) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Button onClick={onContinueSession} variant="outline" size="sm" className="h-8 text-[12px]">
        <MessageSquare size={13} />
        Continue Session
      </Button>
      <Button onClick={onOpenWorkspace} variant="outline" size="sm" className="h-8 text-[12px]">
        <GitBranch size={13} />
        Open Workspace
      </Button>
      <Button onClick={onStartAutopilot} variant="outline" size="sm" className="h-8 text-[12px]">
        <PlayCircle size={13} />
        Start Autopilot
      </Button>
      <Button onClick={onProviderSetup} variant="outline" size="sm" className="h-8 text-[12px]">
        <Settings size={13} />
        Provider Setup
      </Button>
      <Button onClick={onSetupWizard} variant="outline" size="sm" className="h-8 text-[12px]">
        <Wand2 size={13} />
        Setup Wizard
      </Button>
    </div>
  );
}
