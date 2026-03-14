import { setupWizardBackends, setupWizardModes } from "./data";
import { Button } from "@/primitives/button";

export function SetupWizardBackendStep({
  mode,
  onModeChange,
}: {
  mode: string;
  onModeChange: (value: string) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="mb-6 text-center">
        <h2 className="mb-1 text-lg font-semibold text-foreground">Agent Backend</h2>
        <p className="text-sm text-muted-foreground">
          Pick native mode or wrapper mode and review detected CLI backends.
        </p>
      </div>

      <div className="flex justify-center gap-2">
        {setupWizardModes.map((option) => (
          <Button
            key={option}
            onClick={() => onModeChange(option)}
            variant={mode === option ? "default" : "secondary"}
            className="capitalize"
          >
            {option}
          </Button>
        ))}
      </div>

      <div className="space-y-2 rounded border border-border p-4">
        {setupWizardBackends.map((backend) => (
          <div key={backend.id} className="flex items-center justify-between text-sm">
            <span className="text-foreground">{backend.label}</span>
            <span className="text-muted-foreground capitalize">{backend.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
