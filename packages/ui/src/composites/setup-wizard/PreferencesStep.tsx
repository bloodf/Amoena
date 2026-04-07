import { Button } from '../../primitives/button.tsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../primitives/select.tsx';
import { setupWizardKeybindingPresets, setupWizardModels, setupWizardReasoningModes, setupWizardThemes } from "./data";

export function SetupWizardPreferencesStep({
  defaultModel,
  theme,
  reasoningMode,
  keybindingPreset,
  onDefaultModelChange,
  onThemeChange,
  onReasoningModeChange,
  onKeybindingPresetChange,
}: {
  defaultModel: string;
  theme: string;
  reasoningMode: string;
  keybindingPreset: string;
  onDefaultModelChange: (value: string) => void;
  onThemeChange: (value: string) => void;
  onReasoningModeChange: (value: string) => void;
  onKeybindingPresetChange: (value: string) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="mb-6 text-center">
        <h2 className="mb-1 text-lg font-semibold text-foreground">Preferences</h2>
        <p className="text-sm text-muted-foreground">Set your defaults. You can change these later.</p>
      </div>
      <div className="space-y-4">
        <div className="flex items-center justify-between py-2">
          <div>
            <div className="text-[13px] font-medium text-foreground">Default Model</div>
            <div className="text-[11px] text-muted-foreground">Used for new sessions</div>
          </div>
          <Select value={defaultModel} onValueChange={onDefaultModelChange}>
            <SelectTrigger className="w-[180px] font-mono text-[12px]">
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
        <div className="flex items-center justify-between border-t border-border py-2">
          <div>
            <div className="text-[13px] font-medium text-foreground">Theme</div>
            <div className="text-[11px] text-muted-foreground">Visual appearance</div>
          </div>
          <div className="flex gap-1.5">
            {setupWizardThemes.map((option) => (
              <Button key={option} onClick={() => onThemeChange(option)} variant={theme === option ? "default" : "secondary"} size="sm" className="h-7 px-2.5 text-[11px] capitalize">
                {option}
              </Button>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-between border-t border-border py-2">
          <div>
            <div className="text-[13px] font-medium text-foreground">Reasoning Mode</div>
            <div className="text-[11px] text-muted-foreground">Default for supported models</div>
          </div>
          <div className="flex gap-1.5">
            {setupWizardReasoningModes.map((option) => (
              <Button key={option} onClick={() => onReasoningModeChange(option)} variant={reasoningMode === option ? "default" : "secondary"} size="sm" className="h-7 px-2.5 font-mono text-[11px] uppercase">
                {option}
              </Button>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-between border-t border-border py-2">
          <div>
            <div className="text-[13px] font-medium text-foreground">Key Bindings</div>
            <div className="text-[11px] text-muted-foreground">Keyboard shortcut preset</div>
          </div>
          <Select value={keybindingPreset} onValueChange={onKeybindingPresetChange}>
            <SelectTrigger className="w-[160px] font-mono text-[12px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {setupWizardKeybindingPresets.map((preset) => (
                <SelectItem key={preset} value={preset}>
                  {preset}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
