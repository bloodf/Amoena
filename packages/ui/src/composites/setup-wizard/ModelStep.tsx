import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/primitives/select";
import { setupWizardModels } from "./data";

export function SetupWizardModelStep({
  defaultModel,
  onDefaultModelChange,
}: {
  defaultModel: string;
  onDefaultModelChange: (value: string) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="mb-6 text-center">
        <h2 className="mb-1 text-lg font-semibold text-foreground">Choose a Default Model</h2>
        <p className="text-sm text-muted-foreground">
          This becomes the starting model for new sessions. You can override it later.
        </p>
      </div>

      <div>
        <label className="mb-1.5 block text-[12px] font-medium text-muted-foreground">Default Model</label>
        <Select value={defaultModel} onValueChange={onDefaultModelChange}>
          <SelectTrigger className="w-full font-mono text-[12px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {setupWizardModels.map((model) => (
              <SelectItem key={model.value} value={model.value}>
                {model.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
