import { Check, Rocket } from "lucide-react";
import { Button } from "@/primitives/button";

export function SetupWizardReadyStep({
  selectedProviderName,
  workspacePath,
  defaultModel,
  onLaunch,
}: {
  selectedProviderName: string;
  workspacePath: string;
  defaultModel: string;
  onLaunch: () => void;
}) {
  return (
    <div className="space-y-6 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-lg border border-success/20 bg-success/10">
        <Rocket size={28} className="text-success" />
      </div>
      <div>
        <h2 className="mb-2 text-2xl font-semibold text-foreground">You&apos;re all set</h2>
        <p className="mx-auto max-w-md text-sm text-muted-foreground">
          Lunaria is configured and ready. Start a session to begin working with your AI agents.
        </p>
      </div>
      <div className="mx-auto max-w-sm space-y-2 text-left">
        {[
          { label: "Provider", value: selectedProviderName },
          { label: "Workspace", value: workspacePath },
          { label: "Model", value: defaultModel },
        ].map((row) => (
          <div key={row.label} className="flex items-center gap-3 rounded border border-border bg-surface-1 px-3 py-2">
            <Check size={14} className="flex-shrink-0 text-success" />
            <div className="text-[12px]">
              <span className="font-medium text-foreground">{row.label}: </span>
              <span className="font-mono text-muted-foreground">{row.value}</span>
            </div>
          </div>
        ))}
      </div>
      <Button onClick={onLaunch} className="px-6 py-2.5 text-sm">
        Launch Lunaria
      </Button>
    </div>
  );
}
