import { SettingsRow, SettingsToggle } from "@/components/settings-controls";

export function SetupWizardMemoryStep({
  memoryEnabled,
  onMemoryEnabledChange,
}: {
  memoryEnabled: boolean;
  onMemoryEnabledChange: (value: boolean) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="mb-6 text-center">
        <h2 className="mb-1 text-lg font-semibold text-foreground">Memory System</h2>
        <p className="text-sm text-muted-foreground">
          Configure how Amoena captures and injects memory into future sessions.
        </p>
      </div>

      <div className="rounded border border-border p-4">
        <SettingsRow
          label="Enable memory"
          description="Persist observations and summaries for future retrieval."
        >
          <SettingsToggle on={memoryEnabled} onChange={onMemoryEnabledChange} />
        </SettingsRow>
      </div>
    </div>
  );
}
